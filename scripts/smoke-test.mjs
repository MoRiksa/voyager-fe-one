import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const baseUrl = 'http://127.0.0.1:4174'
const debugUrl = 'http://127.0.0.1:9224'
const sessionId = 'RES-2026-IDX-0941'
const routes = [
  '/',
  '/research',
  '/research/new',
  `/research/${sessionId}`,
  `/research/${sessionId}/screener`,
  `/research/${sessionId}/peers`,
  `/research/${sessionId}/activity`,
  `/research/${sessionId}/trace`,
  `/research/${sessionId}/report`,
  `/research/${sessionId}/company/BBCA`,
  '/company/BBCA',
  '/methodology',
  '/glossary',
  '/screener',
  '/peers',
  '/activity',
  '/trace',
  '/report',
  '/does-not-exist'
]
const renderedChecks = [
  { route: '/', text: 'Apa yang ingin Anda teliti hari ini?' },
  { route: '/research', text: 'Temukan dan lanjutkan riset Anda' },
  { route: '/research/new', text: 'Aturan yang benar-benar diterapkan' },
  { route: '/glossary', text: 'Kamus Istilah Finansial' },
  { route: '/research/UNKNOWN/report', expectedPath: '/not-found', text: 'Halaman tidak ditemukan' }
]

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const preview = spawn(npmCmd, ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4174'], {
  stdio: 'ignore',
  detached: process.platform !== 'win32'
})
const stopPreview = () => {
  if (preview.exitCode !== null) return
  if (process.platform === 'win32') preview.kill('SIGTERM')
  else process.kill(-preview.pid, 'SIGTERM')
}
let browser
let profile
let socket
let commandId = 0
const pending = new Map()

const waitFor = async (check, message) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if (await check()) return
    } catch {}
    await delay(100)
  }
  throw new Error(message)
}

try {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(baseUrl)
      if (response.ok) break
    } catch {
      await delay(100)
    }
  }

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`)
    const html = await response.text()
    if (response.status !== 200 || !html.includes('id="app"') || !html.includes('/assets/')) {
      throw new Error(`${route} failed: HTTP ${response.status}`)
    }
  }

  const chrome = ['google-chrome', 'chromium', 'chromium-browser'].find(command => spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0)
  if (chrome) {
    profile = mkdtempSync(join(tmpdir(), 'voyager-smoke-'))
    browser = spawn(chrome, [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-background-networking',
      '--remote-debugging-port=9224',
      `--user-data-dir=${profile}`,
      'about:blank'
    ], { stdio: 'ignore' })
    let target
    await waitFor(async () => {
      const targets = await fetch(`${debugUrl}/json`).then(response => response.json())
      target = targets.find(item => item.type === 'page')
      return Boolean(target)
    }, 'Chrome DevTools target did not start')
    socket = new WebSocket(target.webSocketDebuggerUrl)
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data)
      if (!message.id || !pending.has(message.id)) return
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      message.error ? reject(new Error(message.error.message)) : resolve(message.result)
    })
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true })
      socket.addEventListener('error', reject, { once: true })
    })
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++commandId
      pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
    })
    const evaluate = async expression => {
      const result = await send('Runtime.evaluate', { expression, returnByValue: true })
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
      return result.result.value
    }
    await send('Page.enable')
    await send('Runtime.enable')
    for (const check of renderedChecks) {
      await send('Page.navigate', { url: `${baseUrl}${check.route}` })
      await waitFor(() => evaluate(`location.pathname === ${JSON.stringify(check.expectedPath || check.route)} && document.readyState !== 'loading' && Boolean(document.querySelector('#app > *')) && document.body.textContent.includes(${JSON.stringify(check.text)})`), `${check.route} did not render expected text: ${check.text}`)
    }
    console.log(`Browser render passed: ${renderedChecks.length} routes`)
  }

  console.log(`Smoke test passed: ${routes.length} routes`)
} finally {
  socket?.close()
  if (browser?.exitCode === null) {
    browser.kill('SIGTERM')
    await Promise.race([
      new Promise(resolve => browser.once('exit', resolve)),
      delay(1000)
    ])
  }
  stopPreview()
  if (profile) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        rmSync(profile, { recursive: true, force: true })
        break
      } catch {
        await delay(100)
      }
    }
  }
}
