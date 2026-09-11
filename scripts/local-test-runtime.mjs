import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

export const waitFor = async (check, message) => {
  for (let attempt = 0; attempt < 150; attempt++) { if (await check()) return; await delay(100) }
  throw new Error(message)
}

// All input is synthetic. The actual sibling backend performs contract validation,
// screening, publication and exports. No production provider or session store is used.
export async function localRuntime({ browser = false } = {}) {
  const root = mkdtempSync('/tmp/opencode/voyager-audit-')
  const cwd = join(root, 'runtime')
  mkdirSync(cwd)
  mkdirSync(join(root, 'data'))
  let mode = 'normal'
  const provider = createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json')
    if (mode === 'outage') { res.writeHead(503); res.end(JSON.stringify({ message: 'LOCAL controlled provider outage' })); return }
    const url = new URL(req.url, 'http://local.test')
    const bankQuery = url.pathname === '/v2/companies/' && url.searchParams.get('where') === "sub_sector = 'Banks' and market_cap IS NOT NULL"
    if (bankQuery) {
      const banks = Array.from({ length: 10 }, (_, index) => ({ symbol: `BANK${index + 1}`, company_name: `BANK${index + 1} synthetic test input`, sub_sector: 'Banks', market_cap: 1_000_000 - index }))
      res.end(JSON.stringify({ results: banks, pagination: { count: 48, next: null } })); return
    }
    if (url.pathname === '/v2/companies/') {
      const symbols = mode === 'incomplete' ? ['MISS'] : mode === 'none' ? ['FAIL'] : ['TEST', 'NEXT']
      res.end(JSON.stringify(symbols.map(symbol => ({ symbol, company_name: `${symbol} synthetic test input` })))); return
    }
    const symbol = url.pathname.match(/\/company\/report\/([A-Z0-9]+)\//)?.[1]
    if (!symbol) { res.writeHead(404); res.end('{}'); return }
    if (symbol.startsWith('BANK')) {
      res.end(JSON.stringify({ symbol, company_name: `${symbol} synthetic test input`,
        overview: { sector: 'Financials', sub_sector: 'Banks', market_cap: 10_000_000_000_000, last_close_price: 1000, latest_close_date: '2026-09-09' },
        valuation: { historical_valuation: [2022, 2023, 2024, 2025, 2026].map(year => ({ year, pb: 2, pb_peer_avg: 3 })) },
        financials: { historical_financials: Array.from({ length: 8 }, (_, index) => ({ year: 2018 + index, earnings: 20, total_assets: 1200, total_equity: 100 })) }
      })); return
    }
    res.end(JSON.stringify({ symbol, company_name: `${symbol} synthetic test input`,
      overview: { market_cap: 100000, last_close_price: 1000, latest_close_date: '2026-09-09' },
      valuation: { historical_valuation: [{ year: 2025, pe: 5, pb: 2 }] },
      financials: { historical_financials: [{ year: 2025, revenue: 789, earnings: symbol === 'FAIL' ? 1 : 123, total_assets: 2345, total_equity: 456, total_debt: 0, ...(symbol === 'MISS' ? {} : { free_cash_flow: -100 }) }] }
    }))
  })
  await new Promise(resolve => provider.listen(0, '127.0.0.1', resolve))
  const providerUrl = `http://127.0.0.1:${provider.address().port}/v2`
  const backendDirectory = fileURLToPath(new URL('../../voyager-be-one/', import.meta.url))
  const frontendDirectory = fileURLToPath(new URL('../', import.meta.url))
  const apiUrl = 'http://127.0.0.1:4311'
  const appUrl = 'http://127.0.0.1:4312'
  const children = []
  let backendLog = ''
  const backend = spawn(process.execPath, [join(backendDirectory, 'node_modules/tsx/dist/cli.mjs'), join(backendDirectory, 'src/server.ts')], {
    cwd, env: { ...process.env, NODE_ENV: 'test', HOST: '127.0.0.1', PORT: '4311', CORS_ORIGIN: appUrl, SECTORS_API_BASE_URL: providerUrl, SECTORS_API_KEY: 'local-test-only', SECTORS_DEMO_FIXTURES: 'false', SECTORS_CACHE_DIR: join(root, 'cache'), SECTORS_COMPANIES_CACHE_TTL_SECONDS: '1', SECTORS_COMPANY_REPORT_CACHE_TTL_SECONDS: '1', SECTORS_CACHE_STALE_IF_ERROR_SECONDS: '1', LLM_BASE_URL: 'http://127.0.0.1:1/v1', LLM_API_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe']
  })
  backend.stdout.on('data', chunk => { backendLog += chunk })
  backend.stderr.on('data', chunk => { backendLog += chunk })
  children.push(backend)
  let socket
  const close = async () => {
    socket?.close()
    await Promise.all(children.map(async child => {
      if (child.exitCode !== null) return
      child.kill('SIGTERM')
      await Promise.race([new Promise(resolve => child.once('exit', resolve)), delay(1500)])
      if (child.exitCode === null) child.kill('SIGKILL')
    }))
    provider.closeAllConnections()
    await new Promise(resolve => provider.close(resolve))
    rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
  const request = async (path, body, revision) => {
    const response = await fetch(`${apiUrl}/api/v1${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', ...(revision === undefined ? {} : { 'If-Match': String(revision) }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
    return { response, data: await response.json() }
  }
  try {
    await waitFor(async () => { try { return (await fetch(`${apiUrl}/health`)).ok } catch { return false } }, `Backend failed to start: ${backendLog}`)
    const { data: capabilities } = await request('/research-capabilities')
    const objective = capabilities.capabilities.objectiveContract.supportedObjective
    const payload = { objective, presetId: 'obj-three-factor-screening', brief: { market: 'IDX', sectorScope: 'Semua Sektor', indexScope: 'Semua Indeks', candidateCount: 5, researchDepth: 'Standar', useSectorMetrics: false, optionalDimensions: [], clarificationNotes: [] } }
    const create = async (body = payload) => {
      const { response, data } = await request('/research-sessions', body)
      assert.equal(response.status, 201, JSON.stringify(data))
      return data.session
    }
    const start = async session => {
      const { response, data } = await request(`/research-sessions/${session.id}/start`, {}, session.revision)
      assert.equal(response.status, 202, JSON.stringify(data))
      return data.session
    }
    const finish = async id => {
      let session
      await waitFor(async () => { session = (await request(`/research-sessions/${id}`)).data.session; return ['COMPLETED', 'FAILED'].includes(session.status) }, 'Pipeline did not terminate')
      return session
    }
    const setMode = async value => { mode = value; await delay(2200) }
    const runtime = { apiUrl, appUrl, providerUrl, payload, request, create, start, finish, setMode, close }
    if (!browser) return runtime
    const chrome = ['google-chrome', 'chromium', 'chromium-browser'].find(command => spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0)
    assert.ok(chrome, 'Chrome/Chromium is required; browser verification cannot be skipped')
    const vite = spawn(process.execPath, [join(frontendDirectory, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '4312', '--strictPort'], { cwd: frontendDirectory, env: { ...process.env, VITE_BACKEND_URL: apiUrl }, stdio: 'ignore' })
    children.push(vite)
    await waitFor(async () => { try { return (await fetch(appUrl)).ok } catch { return false } }, 'Vite failed to start')
    const chromeProcess = spawn(chrome, ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=9312', `--user-data-dir=${join(root, 'browser')}`, 'about:blank'], { stdio: 'ignore' })
    children.push(chromeProcess)
    let target
    await waitFor(async () => { try { target = (await fetch('http://127.0.0.1:9312/json').then(r => r.json())).find(t => t.type === 'page'); return Boolean(target) } catch { return false } }, 'Chrome failed to start')
    socket = new WebSocket(target.webSocketDebuggerUrl)
    let commandId = 0
    const pending = new Map()
    const exceptions = []
    const listeners = new Map()
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails)
      listeners.get(message.method)?.(message.params)
      if (!message.id || !pending.has(message.id)) return
      const { resolve, reject } = pending.get(message.id); pending.delete(message.id)
      message.error ? reject(new Error(message.error.message)) : resolve(message.result)
    })
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
    const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++commandId; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })) })
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
      return result.result.value
    }
    await send('Page.enable'); await send('Runtime.enable')
    const navigate = async path => {
      await send('Page.navigate', { url: `${appUrl}${path}` })
      await waitFor(() => evaluate(`document.readyState !== 'loading' && Boolean(document.querySelector('#app > *'))`), `No app at ${path}`)
    }
    const text = async value => waitFor(() => evaluate(`document.body.innerText.includes(${JSON.stringify(value)})`), `Missing text: ${value}`)
    return { ...runtime, send, evaluate, navigate, text, exceptions, on: (event, listener) => listeners.set(event, listener) }
  } catch (error) { await close(); throw new Error(`${error.message}\n${backendLog.slice(-3000)}`) }
}
