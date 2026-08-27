import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const chrome = ['google-chrome', 'chromium', 'chromium-browser'].find(command => spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0)
if (!chrome) {
  console.log('Interaction test skipped: Chrome or Chromium is not installed')
  process.exit(0)
}

const appUrl = 'http://127.0.0.1:4175'
const debugUrl = 'http://127.0.0.1:9225'
const profile = mkdtempSync(join(tmpdir(), 'voyager-cdp-'))
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4175'], { stdio: 'ignore' })
const browser = spawn(chrome, [
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9225',
  `--user-data-dir=${profile}`,
  `${appUrl}/research/new`
], { stdio: 'ignore' })

let socket
let commandId = 0
const pending = new Map()

const waitFor = async (check, message) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await check()) return
    await delay(100)
  }
  throw new Error(message)
}

try {
  await waitFor(async () => {
    try { return (await fetch(appUrl)).ok } catch { return false }
  }, 'Preview server did not start')

  let target
  await waitFor(async () => {
    try {
      const targets = await fetch(`${debugUrl}/json`).then(response => response.json())
      target = targets.find(item => item.type === 'page')
      return Boolean(target)
    } catch { return false }
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
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
    return result.result.value
  }
  const navigate = async path => {
    await send('Page.navigate', { url: `${appUrl}${path}` })
    await waitFor(() => evaluate('document.readyState === "complete" && Boolean(document.querySelector("#app > *"))'), `${path} did not render`)
  }

  await send('Page.enable')
  await send('Runtime.enable')

  await navigate('/research/new')
  await evaluate(`(() => {
    const field = document.querySelector('[data-testid="research-objective"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    setter.call(field, 'pendek')
    field.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector('[data-testid="research-form"]').requestSubmit()
  })()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=objective-error]"))'), 'Research validation error was not shown')

  await evaluate(`(() => {
    document.querySelector('[data-testid="preset-obj-banking-moat"]').click()
    document.querySelector('[data-testid="research-form"]').requestSubmit()
  })()`)
  await waitFor(() => evaluate('location.pathname.startsWith("/research/RES-")'), 'Valid research form did not create a session')
  const runningSession = await evaluate(`(() => {
    const payload = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1'))
    const session = payload.sessions.find(item => item.id === location.pathname.split('/')[2])
    return { id: session.id, status: session.status, candidates: session.candidates.length, stages: session.screeningFunnel.length, reportCandidates: session.report.topCandidates.length }
  })()`)
  if (runningSession.status === 'COMPLETED' || runningSession.candidates || runningSession.stages || runningSession.reportCandidates) {
    throw new Error(`Running session exposed final results: ${JSON.stringify(runningSession)}`)
  }
  for (const resultPath of ['screener', 'peers', 'report']) {
    await evaluate(`Array.from(document.querySelectorAll('a')).find(link => link.getAttribute('href') === '/research/${runningSession.id}/${resultPath}').click()`)
    await waitFor(() => evaluate(`location.pathname === '/research/${runningSession.id}/${resultPath}'`), `${resultPath} route did not open`)
    await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=results-pending]"))'), `${resultPath} did not gate running results`)
    await evaluate(`document.querySelector('[data-testid="results-pending"] a').click()`)
    await waitFor(() => evaluate(`location.pathname === '/research/${runningSession.id}'`), `${resultPath} did not return to progress`)
  }
  await waitFor(() => evaluate(`(() => {
    const payload = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1'))
    return payload.sessions.find(item => item.id === '${runningSession.id}')?.status === 'COMPLETED'
  })()`), 'Research session did not complete')
  const sessionResult = await evaluate(`(() => {
    const payload = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1'))
    const session = payload.sessions.find(item => item.id === location.pathname.split('/')[2])
    const stagesAreSubsets = session.screeningFunnel.every((stage, index, stages) => index === 0 || stage.retainedSymbols.every(symbol => stages[index - 1].retainedSymbols.includes(symbol)))
    const countsMatch = session.screeningFunnel.every(stage => stage.count === stage.retainedSymbols.length)
    const candidateSymbols = session.candidates.map(company => company.symbol)
    const finalSymbols = session.screeningFunnel.at(-1).retainedSymbols
    const reportSymbols = session.report.topCandidates.map(company => company.symbol)
    const auditMatches = session.toolCalls.length === session.screeningFunnel.length && session.toolCalls.every((event, index) =>
      event.sourceKind === 'prototype-fixture' &&
      event.category !== 'Sectors API' &&
      event.durationMs === 0 &&
      event.creditCost === 0 &&
      event.outputSummary.includes(session.screeningFunnel[index].retainedSymbols.join(', '))
    )
    return {
      version: payload.version,
      id: session.id,
      symbols: candidateSymbols,
      valid: countsMatch && stagesAreSubsets && auditMatches && JSON.stringify(candidateSymbols) === JSON.stringify(finalSymbols) && JSON.stringify(candidateSymbols) === JSON.stringify(reportSymbols)
    }
  })()`)
  if (sessionResult.version !== 2 || !sessionResult.valid || sessionResult.symbols.length !== 3 || sessionResult.symbols.some(symbol => !['BBCA', 'BMRI', 'BBRI'].includes(symbol))) {
    throw new Error(`Session screening invariants failed: ${JSON.stringify(sessionResult)}`)
  }

  await navigate(`/research/${sessionResult.id}`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=session-next]"))'), 'Session next action did not render')
  await evaluate(`document.querySelector('[data-testid="session-next"]').click()`)
  await waitFor(() => evaluate(`location.pathname === '/research/${sessionResult.id}/screener'`), 'Session did not guide to screener')
  const desktopNavigation = await evaluate(`({
    summaryHref: Array.from(document.querySelectorAll('a')).find(link => link.textContent.trim() === 'Ringkasan')?.getAttribute('href'),
    activeLabel: document.querySelector('nav a[aria-current="page"]')?.textContent.trim(),
    hasSessionGroup: Array.from(document.querySelectorAll('nav')).some(nav => nav.textContent.includes('SESI AKTIF'))
  })`)
  if (desktopNavigation.summaryHref !== `/research/${sessionResult.id}` || desktopNavigation.activeLabel !== 'Cara kandidat dipilih' || !desktopNavigation.hasSessionGroup) {
    throw new Error(`Session navigation hierarchy failed: ${JSON.stringify(desktopNavigation)}`)
  }
  const persistedSymbols = await evaluate(`JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${sessionResult.id}').candidates.map(company => company.symbol)`)
  if (JSON.stringify(persistedSymbols) !== JSON.stringify(sessionResult.symbols)) throw new Error('Candidate results changed after reload')

  await evaluate(`(() => {
    const trigger = Array.from(document.querySelectorAll('[data-testid^="candidate-"]')).find(element => element.offsetParent !== null)
    trigger.focus()
    trigger.click()
  })()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=candidate-dialog]"))'), 'Candidate dialog did not open')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' })
  await waitFor(() => evaluate('!document.querySelector("[data-testid=candidate-dialog]")'), 'Candidate dialog did not close with Escape')
  await waitFor(() => evaluate('document.activeElement?.dataset?.testid?.startsWith("candidate-")'), 'Focus did not return to the candidate trigger')

  await evaluate(`document.querySelector('[data-testid="screener-primary-next"]').click()`)
  await waitFor(() => evaluate(`location.pathname === '/research/${sessionResult.id}/peers'`), 'Screener did not guide to comparison')
  await waitFor(() => evaluate(`document.querySelectorAll('[data-testid^="comparison-row-"]').length === ${sessionResult.symbols.length}`), 'Peer comparison rows did not render')
  const comparisonState = await evaluate(`({
    rows: Array.from(document.querySelectorAll('[data-testid^="comparison-row-"]')).map(row => row.dataset.testid.replace('comparison-row-', '')),
    hasCandidateFilter: Boolean(document.querySelector('[data-testid^="peer-"]'))
  })`)
  if (comparisonState.hasCandidateFilter || JSON.stringify(comparisonState.rows) !== JSON.stringify(sessionResult.symbols)) {
    throw new Error(`Peer comparison did not follow screening results: ${JSON.stringify(comparisonState)}`)
  }
  await evaluate(`(() => {
    const select = document.querySelector('[data-testid="metric-view"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, 'valuation')
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  await waitFor(() => evaluate('Array.from(document.querySelectorAll("th")).some(cell => cell.textContent.includes("P/BV"))'), 'Metric view did not change comparison columns')

  await evaluate(`document.querySelector('[data-testid="peers-primary-next"]').click()`)
  await waitFor(() => evaluate(`location.pathname === '/research/${sessionResult.id}/report'`), 'Comparison did not guide to report')
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=report-next]"))'), 'Report continuation actions did not render')
  await evaluate(`document.querySelector('[data-testid="report-next"] a[href="/research"]').click()`)
  await waitFor(() => evaluate('location.pathname === "/research"'), 'Report did not return to research library')

  const libraryNavigation = await evaluate(`({
    cards: document.querySelectorAll('[data-testid^="library-session-"]').length,
    desktopHref: Array.from(document.querySelectorAll('a')).find(link => link.textContent.trim() === 'Pustaka riset')?.getAttribute('href')
  })`)
  if (libraryNavigation.cards < 2 || libraryNavigation.desktopHref !== '/research') throw new Error(`Research library navigation failed: ${JSON.stringify(libraryNavigation)}`)

  await evaluate(`(() => {
    const field = document.querySelector('[data-testid="library-search"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(field, 'Bank berkualitas')
    field.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await waitFor(() => evaluate('document.querySelectorAll("[data-testid^=library-session-]").length === 1'), 'Library search did not filter sessions')
  await evaluate(`(() => {
    const field = document.querySelector('[data-testid="library-search"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(field, '')
    field.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector('[data-testid="library-filter-completed"]').click()
  })()`)
  await waitFor(() => evaluate('document.querySelectorAll("[data-testid^=library-session-]").length >= 1'), 'Library status filter did not show completed sessions')

  await evaluate(`document.querySelector('[data-testid="library-filter-all"]').click()`)
  await waitFor(() => evaluate(`Boolean(document.querySelector('[data-testid="library-duplicate-${sessionResult.id}"]'))`), 'Banking session did not return after clearing library filter')
  await evaluate(`document.querySelector('[data-testid="library-duplicate-${sessionResult.id}"]').click()`)
  await waitFor(() => evaluate('location.pathname === "/research/new"'), 'Duplicate action did not open new research')
  const duplicateDraft = await evaluate(`({ objective: document.querySelector('[data-testid="research-objective"]').value, presetPressed: document.querySelector('[data-testid="preset-obj-banking-moat"]').getAttribute('aria-pressed') })`)
  if (!duplicateDraft.objective.includes('bank Indonesia') || duplicateDraft.presetPressed !== 'true') throw new Error(`Duplicate draft was not prefilled: ${JSON.stringify(duplicateDraft)}`)

  await navigate('/research')
  const persistedLibraryCount = await evaluate('document.querySelectorAll("[data-testid^=library-session-]").length')
  if (persistedLibraryCount < 2) throw new Error('Research library did not persist after reload')
  await evaluate(`Array.from(document.querySelectorAll('button[aria-label^="Hapus"]')).find(button => !button.disabled).click()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=library-confirm-delete]"))'), 'Library delete confirmation was not shown')
  await evaluate(`document.querySelector('[data-testid="library-confirm-delete"]').click()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=toast]")?.textContent.includes("dihapus")'), 'Session deletion toast was not shown')

  console.log('Interaction test passed: screening, audit, comparison, research library, duplication, persistence, and deletion')
} finally {
  socket?.close()
  browser.kill('SIGTERM')
  preview.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => browser.once('exit', resolve)),
    delay(1000)
  ])
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      rmSync(profile, { recursive: true, force: true })
      break
    } catch {
      await delay(100)
    }
  }
}
