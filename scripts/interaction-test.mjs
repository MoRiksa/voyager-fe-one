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
  for (let attempt = 0; attempt < 50; attempt += 1) {
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
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
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

  await navigate(`/research/${sessionResult.id}/screener`)
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

  await navigate(`/research/${sessionResult.id}/peers`)
  await evaluate(`Array.from(document.querySelectorAll('[data-testid^="peer-"]')).slice(0, 2).forEach(input => input.click())`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=peers-empty]"))'), 'Peer comparison empty state was not shown')

  await navigate('/')
  await evaluate(`Array.from(document.querySelectorAll('[data-testid="delete-session"]')).find(button => !button.disabled).click()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=confirm-delete-session]"))'), 'Delete confirmation was not shown')
  await evaluate(`document.querySelector('[data-testid="confirm-delete-session"]').click()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=toast]")?.textContent.includes("dihapus")'), 'Session deletion toast was not shown')

  console.log('Interaction test passed: screening and audit invariants, persistence, dialog focus, peer empty state, and session deletion')
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
