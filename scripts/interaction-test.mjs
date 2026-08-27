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
  const visualTokens = await evaluate(`(() => {
    const button = document.querySelector('[data-testid="research-form"] button[type="submit"]')
    button.focus()
    const style = getComputedStyle(button)
    return { background: style.backgroundColor, outlineColor: style.outlineColor, outlineWidth: style.outlineWidth }
  })()`)
  if (visualTokens.background !== 'rgb(47, 100, 168)' || visualTokens.outlineColor !== 'rgb(47, 100, 168)' || visualTokens.outlineWidth !== '3px') {
    throw new Error(`Accessible action tokens were not applied: ${JSON.stringify(visualTokens)}`)
  }
  await evaluate(`(() => {
    const field = document.querySelector('[data-testid="research-objective"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    setter.call(field, 'pendek')
    field.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector('[data-testid="research-form"]').requestSubmit()
  })()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=objective-error]"))'), 'Research validation error was not shown')

  await evaluate(`document.querySelector('[data-testid="preset-obj-banking-moat"]').click()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=screening-rule-contract]").textContent.includes("ROE > 15%")'), 'Banking rule preview was not shown')
  await evaluate(`(() => {
    const field = document.querySelector('[data-testid="research-objective"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
    setter.call(field, 'Temukan bank Indonesia dengan ROE di atas 25% dan pertumbuhan laba yang konsisten.')
    field.dispatchEvent(new Event('input', { bubbles: true }))
  })()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=custom-rule-notice]"))'), 'Edited objective did not switch to explicit custom rules')
  const customRuleState = await evaluate(`({
    bankingPressed: document.querySelector('[data-testid="preset-obj-banking-moat"]').getAttribute('aria-pressed'),
    rules: document.querySelector('[data-testid="screening-rule-contract"]').textContent
  })`)
  if (customRuleState.bankingPressed !== 'false' || !customRuleState.rules.includes('ROE > 12%') || !customRuleState.rules.includes('Debt/Equity < 1.5x') || customRuleState.rules.includes('ROE > 25%')) {
    throw new Error(`Custom rule contract is misleading: ${JSON.stringify(customRuleState)}`)
  }

  await evaluate(`document.querySelector('[data-testid="preset-obj-banking-moat"]').click()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=screening-rule-contract]").textContent.includes("ROE > 15%")'), 'Banking rules did not return after reselecting template')
  await evaluate(`(() => {
    const controlFor = label => Array.from(document.querySelectorAll('label')).find(element => element.textContent.includes(label))?.querySelector('select, input')
    const setValue = (control, value) => {
      const prototype = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(control, value)
      control.dispatchEvent(new Event('change', { bubbles: true }))
    }
    setValue(controlFor('Cakupan sektor'), 'Financials')
    setValue(controlFor('Indeks / likuiditas'), 'LQ45')
    setValue(controlFor('Jumlah kandidat yang diinginkan'), '3')
    setValue(controlFor('Kedalaman riset'), 'Mendalam')
    const sectorMetrics = controlFor('Gunakan metrik spesifik sektor')
    if (sectorMetrics.checked) sectorMetrics.click()
  })()`)
  await evaluate(`document.querySelector('[data-testid="brief-dimension-dividend"]:not(:checked)')?.click()`)
  await waitFor(() => evaluate(`document.querySelector('[data-testid="brief-dimension-dividend"]')?.checked`), 'Dividend dimension did not update')
  await evaluate(`document.querySelector('[data-testid="brief-dimension-esg"]:not(:checked)')?.click()`)
  await waitFor(() => evaluate(`document.querySelector('[data-testid="brief-dimension-esg"]')?.checked`), 'ESG dimension did not update')
  await waitFor(() => evaluate(`document.querySelector('[data-testid="brief-summary"]')?.textContent.includes('Financials') && document.querySelector('[data-testid="brief-summary"]')?.textContent.includes('LQ45') && document.querySelector('[data-testid="brief-summary"]')?.textContent.includes('target 3 kandidat') && document.querySelector('[data-testid="brief-summary"]')?.textContent.includes('mendalam')`), 'Research brief summary did not react to controls')
  const researchBrief = await evaluate(`(() => {
    const controlFor = label => Array.from(document.querySelectorAll('label')).find(element => element.textContent.includes(label))?.querySelector('select, input')
    return {
      summary: document.querySelector('[data-testid="brief-summary"]')?.textContent || '',
      sectorMetrics: controlFor('Gunakan metrik spesifik sektor').checked,
      selectedDimensions: ['dividend', 'esg'].filter(id => document.querySelector('[data-testid="brief-dimension-' + id + '"]').checked)
    }
  })()`)
  if (!researchBrief.summary.includes('Financials') || !researchBrief.summary.includes('LQ45') || !researchBrief.summary.includes('target 3 kandidat') || !researchBrief.summary.includes('mendalam') || researchBrief.sectorMetrics || researchBrief.selectedDimensions.length !== 2) {
    throw new Error(`Research brief controls did not update the submitted summary: ${JSON.stringify(researchBrief)}`)
  }
  const bankingDisclosure = await evaluate(`({
    pressed: document.querySelector('[data-testid="preset-obj-banking-moat"]').getAttribute('aria-pressed'),
    universe: document.querySelector('[data-testid="actual-universe"]').textContent,
    rules: document.querySelector('[data-testid="screening-rule-contract"]').textContent
  })`)
  if (bankingDisclosure.pressed !== 'true' || !bankingDisclosure.universe.includes('3 perusahaan') || !bankingDisclosure.rules.includes('ROE > 15%')) {
    throw new Error(`Banking disclosure does not match execution: ${JSON.stringify(bankingDisclosure)}`)
  }
  await evaluate(`document.querySelector('[data-testid="research-form"]').requestSubmit()`)
  await waitFor(() => evaluate('location.pathname.startsWith("/research/RES-")'), 'Valid research form did not create a session')
  const runningSession = await evaluate(`(() => {
    const payload = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1'))
    const session = payload.sessions.find(item => item.id === location.pathname.split('/')[2])
    return { id: session.id, status: session.status, candidates: session.candidates.length, stages: session.screeningFunnel.length, reportCandidates: session.report.topCandidates.length }
  })()`)
  if (runningSession.status === 'COMPLETED' || runningSession.candidates || runningSession.stages || runningSession.reportCandidates) {
    throw new Error(`Running session exposed final results: ${JSON.stringify(runningSession)}`)
  }
  const persistedBrief = await evaluate(`(() => {
    const payload = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1'))
    const session = payload.sessions.find(item => item.id === '${runningSession.id}')
    const entries = []
    const visit = (value, path = '') => {
      if (!value || typeof value !== 'object') return
      for (const [key, child] of Object.entries(value)) {
        const nextPath = path ? path + '.' + key : key
        if (/brief|preference/i.test(key)) entries.push([nextPath, child])
        if (child && typeof child === 'object') visit(child, nextPath)
      }
    }
    visit(session)
    return { supported: entries.length > 0, paths: entries.map(([path]) => path), serialized: JSON.stringify(entries) }
  })()`)
  if (persistedBrief.supported && !['Financials', 'LQ45', '3', 'Mendalam', 'dividend', 'esg'].every(value => persistedBrief.serialized.includes(value))) {
    throw new Error(`Submitted research brief was not persisted completely: ${JSON.stringify(persistedBrief)}`)
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

  await navigate('/research/new')
  await evaluate(`document.querySelector('[data-testid="preset-obj-banking-moat"]').click()`)
  await evaluate(`document.querySelector('[data-testid="research-form"]').requestSubmit()`)
  await waitFor(() => evaluate(`location.pathname.startsWith('/research/RES-') && location.pathname !== '/research/${sessionResult.id}' && Boolean(document.querySelector('[data-testid="session-cancel"]'))`), 'Fresh research session did not begin execution')
  const cancelledSessionId = await evaluate(`location.pathname.split('/')[2]`)
  await evaluate(`document.querySelector('[data-testid="session-cancel"]').click()`)
  await waitFor(() => evaluate(`JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${cancelledSessionId}')?.status === 'CANCELLED' && Boolean(document.querySelector('[data-testid="session-retry"]'))`), 'Fresh research session did not enter a recoverable cancelled state')
  await delay(5000)
  const cancelledAfterExecutionWindow = await evaluate(`(() => {
    const session = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${cancelledSessionId}')
    return { status: session?.status, retryVisible: Boolean(document.querySelector('[data-testid="session-retry"]')), cancelVisible: Boolean(document.querySelector('[data-testid="session-cancel"]')) }
  })()`)
  if (cancelledAfterExecutionWindow.status !== 'CANCELLED' || !cancelledAfterExecutionWindow.retryVisible || cancelledAfterExecutionWindow.cancelVisible) {
    throw new Error(`Cancelled execution resumed after its original completion window: ${JSON.stringify(cancelledAfterExecutionWindow)}`)
  }
  await evaluate(`document.querySelector('[data-testid="session-retry"]').click()`)
  await waitFor(() => evaluate(`JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${cancelledSessionId}')?.status === 'COMPLETED' && Boolean(document.querySelector('[data-testid="session-next"]'))`), 'Retry did not complete the cancelled fresh session')

  await navigate(`/research/${sessionResult.id}`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=session-next]"))'), 'Session next action did not render')
  const briefOnSession = await evaluate(`document.querySelector('[data-testid="persisted-brief"]')?.textContent || ''`)
  if (!briefOnSession.includes('Financials') || !briefOnSession.includes('LQ45') || !briefOnSession.includes('target 3 kandidat') || !briefOnSession.includes('mendalam')) throw new Error(`Persisted brief is not visible on session: ${briefOnSession}`)
  await evaluate(`document.querySelector('[data-testid="session-request-clarification"]').click()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=clarification-form]"))'), 'Clarification action did not enter needs-input state')
  await navigate(`/research/${sessionResult.id}`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=clarification-form]"))'), 'Clarification state did not recover after reload')
  await evaluate(`(() => { const input = document.querySelector('[data-testid="clarification-answer"]'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Prioritaskan kualitas laba dan valuasi.'); input.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('[data-testid="clarification-form"]').requestSubmit() })()`)
  await waitFor(() => evaluate(`(() => {
    const session = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${sessionResult.id}')
    return session?.status === 'COMPLETED' && !document.querySelector('[data-testid="clarification-form"]') && ['session-mark-partial', 'session-request-clarification', 'session-next'].every(testId => document.querySelector('[data-testid="' + testId + '"]'))
  })()`), 'Clarification answer did not restore completed status and actions after reload')
  await evaluate(`document.querySelector('[data-testid="session-mark-partial"]').click()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=session-retry]")) && document.body.textContent.includes("Hasil parsial tersedia")'), 'Partial state action did not preserve a recoverable session')
  await evaluate(`document.querySelector('[data-testid="session-retry"]').click()`)
  await waitFor(() => evaluate(`JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${sessionResult.id}')?.status === 'COMPLETED'`), 'Retry action did not complete the partial session')
  await evaluate(`document.querySelector('[data-testid="session-next"]').click()`)
  await waitFor(() => evaluate(`location.pathname === '/research/${sessionResult.id}/screener'`), 'Session did not guide to screener')
  const sidebarSession = await evaluate(`({
    href: document.querySelector('[data-testid="sidebar-active-session"]')?.getAttribute('href'),
    relatedLinks: Array.from(document.querySelectorAll('nav[aria-label="Navigasi sesi aktif"] a')).map(link => link.getAttribute('href'))
  })`)
  if (sidebarSession.href !== `/research/${sessionResult.id}` || !sidebarSession.relatedLinks.includes(`/research/${sessionResult.id}/report`)) {
    throw new Error(`Sidebar session navigation is not scoped to the active session: ${JSON.stringify(sidebarSession)}`)
  }
  await waitFor(() => evaluate('document.querySelector("[data-testid=screener-metric-guide]")?.textContent.includes("Skor 80/100 adalah ambang")'), 'Screener did not explain financial metrics')
  const desktopNavigation = await evaluate(`({
    summaryHref: Array.from(document.querySelectorAll('a')).find(link => link.textContent.trim() === 'Ringkasan')?.getAttribute('href'),
    activeLabel: Array.from(document.querySelectorAll('nav[aria-label="Navigasi sesi aktif"] a')).find(link => link.classList.contains('bg-[#2F64A8]'))?.textContent.trim(),
    hasSessionPanel: Boolean(document.querySelector('[data-testid="sidebar-active-session"]'))
  })`)
  if (desktopNavigation.summaryHref !== `/research/${sessionResult.id}` || desktopNavigation.activeLabel !== 'Seleksi' || !desktopNavigation.hasSessionPanel) {
    throw new Error(`Session navigation hierarchy failed: ${JSON.stringify(desktopNavigation)}`)
  }
  const persistedSymbols = await evaluate(`JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1')).sessions.find(item => item.id === '${sessionResult.id}').candidates.map(company => company.symbol)`)
  if (JSON.stringify(persistedSymbols) !== JSON.stringify(sessionResult.symbols)) throw new Error('Candidate results changed after reload')

  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.querySelector('h3')?.textContent.trim() === 'Penyaringan finansial').click()`)
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Tidak lolos')).click()`)
  await waitFor(() => evaluate('document.body.textContent.includes("ROE tidak di atas 15%") || document.body.textContent.includes("Tidak ada sampel pada kategori ini")'), 'Screener did not explain or explicitly empty financial-stage exclusions')
  if (await evaluate('document.body.textContent.includes("Tidak ada sampel pada kategori ini")')) {
    await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Lolos ·')).click()`)
    await waitFor(() => evaluate('Boolean(document.querySelector("table tbody tr"))'), 'Screener retained table did not return after empty exclusions')
  }
  await evaluate(`(() => {
    const select = Array.from(document.querySelectorAll('label')).find(label => label.textContent.includes('Urutkan'))?.querySelector('select')
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, 'symbol')
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  const screenerDetails = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'))
    const symbols = rows.map(row => row.querySelector('[data-testid^="candidate-"]')?.textContent.trim()).filter(Boolean)
    const provenance = document.querySelector('aside[aria-label="Asal dan periode data"]')?.textContent || ''
    return { symbols, provenance, caption: document.querySelector('table caption')?.textContent || '' }
  })()`)
  if (JSON.stringify(screenerDetails.symbols) !== JSON.stringify([...screenerDetails.symbols].sort()) || !screenerDetails.caption.includes('ticker A-Z') || !screenerDetails.provenance.includes('prototype-fixture-v1') || !screenerDetails.provenance.includes('Laporan dibuat')) {
    throw new Error(`Screener exclusion sorting or provenance failed: ${JSON.stringify(screenerDetails)}`)
  }
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Lolos ·')).click()`)
  await evaluate(`Array.from(document.querySelectorAll('button')).find(button => button.querySelector('h3')?.textContent.trim() === 'Seleksi akhir').click()`)

  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true })
  const mobileStatus = await evaluate(`({ text: document.querySelector('[role="status"]')?.textContent.trim(), width: document.querySelector('[role="status"]')?.getBoundingClientRect().width })`)
  if (!mobileStatus.text || mobileStatus.width < 44) throw new Error(`Mobile status lost its visible label: ${JSON.stringify(mobileStatus)}`)
  await evaluate(`(() => {
    const trigger = Array.from(document.querySelectorAll('[data-testid^="candidate-"]')).find(element => element.offsetParent !== null)
    trigger.focus()
    trigger.click()
  })()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=candidate-dialog]"))'), 'Candidate dialog did not open')
  const modalBounds = await evaluate(`(() => { const box = document.querySelector('[data-testid="candidate-dialog"]').getBoundingClientRect(); return { left: box.left, right: box.right, viewport: innerWidth } })()`)
  if (modalBounds.left < 0 || modalBounds.right > modalBounds.viewport) throw new Error(`Candidate dialog overflowed mobile viewport: ${JSON.stringify(modalBounds)}`)
  const modalAccessibility = await evaluate(`(() => {
    const dialog = document.querySelector('[data-testid="candidate-dialog"]')
    const trigger = Array.from(document.querySelectorAll('[data-testid^="candidate-"]')).find(element => element.offsetParent !== null)
    const effectivelyInert = element => {
      for (let current = element; current; current = current.parentElement) if (current.inert) return true
      return false
    }
    const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    return { backgroundInert: effectivelyInert(trigger), focusInside: dialog.contains(document.activeElement), focusableCount: focusable.length }
  })()`)
  if (!modalAccessibility.backgroundInert || !modalAccessibility.focusInside || modalAccessibility.focusableCount < 2) throw new Error(`Candidate dialog did not isolate its background or establish focus containment: ${JSON.stringify(modalAccessibility)}`)
  await evaluate(`(() => { const dialog = document.querySelector('[data-testid="candidate-dialog"]'); const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')); focusable.at(-1).focus() })()`)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' })
  if (!await evaluate(`(() => { const dialog = document.querySelector('[data-testid="candidate-dialog"]'); const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')); return document.activeElement === focusable[0] })()`)) throw new Error('Candidate dialog did not wrap focus forward')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', modifiers: 8 })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', modifiers: 8 })
  if (!await evaluate(`(() => { const dialog = document.querySelector('[data-testid="candidate-dialog"]'); const focusable = Array.from(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')); return document.activeElement === focusable.at(-1) })()`)) throw new Error('Candidate dialog did not wrap focus backward')
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' })
  await waitFor(() => evaluate('!document.querySelector("[data-testid=candidate-dialog]")'), 'Candidate dialog did not close with Escape')
  await waitFor(() => evaluate('document.activeElement?.dataset?.testid?.startsWith("candidate-")'), 'Focus did not return to the candidate trigger')

  await send('Emulation.setDeviceMetricsOverride', { width: 740, height: 360, deviceScaleFactor: 1, mobile: true })
  await evaluate(`Array.from(document.querySelectorAll('nav[aria-label="Navigasi utama mobile"] button')).find(button => button.textContent.includes('Lainnya')).click()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("#mobile-more-menu"))'), 'Mobile More menu did not open in landscape')
  const landscapeMenu = await evaluate(`(() => {
    const panel = document.querySelector('#mobile-more-menu')
    const close = panel.querySelector('button[aria-label="Tutup menu"]')
    const panelBox = panel.getBoundingClientRect()
    const closeBox = close.getBoundingClientRect()
    const initialScroll = panel.scrollTop
    panel.scrollTop = panel.scrollHeight
    return {
      panel: { top: panelBox.top, right: panelBox.right, bottom: panelBox.bottom, left: panelBox.left },
      close: { top: closeBox.top, right: closeBox.right, bottom: closeBox.bottom, left: closeBox.left, width: closeBox.width, height: closeBox.height },
      viewport: { width: innerWidth, height: innerHeight },
      overflowY: getComputedStyle(panel).overflowY,
      scrollHeight: panel.scrollHeight,
      clientHeight: panel.clientHeight,
      scrolled: panel.scrollTop > initialScroll
    }
  })()`)
  const panelInsideViewport = landscapeMenu.panel.top >= 0 && landscapeMenu.panel.left >= 0 && landscapeMenu.panel.right <= landscapeMenu.viewport.width && landscapeMenu.panel.bottom <= landscapeMenu.viewport.height
  const closeInsidePanel = landscapeMenu.close.top >= landscapeMenu.panel.top && landscapeMenu.close.left >= landscapeMenu.panel.left && landscapeMenu.close.right <= landscapeMenu.panel.right && landscapeMenu.close.bottom <= landscapeMenu.panel.bottom
  const closeUsable = landscapeMenu.close.width >= 44 && landscapeMenu.close.height >= 44
  const internallyScrollable = ['auto', 'scroll'].includes(landscapeMenu.overflowY) && landscapeMenu.scrollHeight > landscapeMenu.clientHeight && landscapeMenu.scrolled
  if (!panelInsideViewport || !closeInsidePanel || !closeUsable || !internallyScrollable) throw new Error(`Mobile More landscape panel bounds, close control, or internal scroll failed: ${JSON.stringify(landscapeMenu)}`)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' })
  await waitFor(() => evaluate('!document.querySelector("#mobile-more-menu")'), 'Mobile More menu did not close with Escape')
  await waitFor(() => evaluate(`document.activeElement === Array.from(document.querySelectorAll('nav[aria-label="Navigasi utama mobile"] button')).find(button => button.textContent.includes('Lainnya'))`), 'Focus did not return to the mobile More trigger')
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 1, mobile: true })

  await evaluate(`document.querySelector('[data-testid="screener-primary-next"]').click()`)
  await waitFor(() => evaluate(`location.pathname === '/research/${sessionResult.id}/peers'`), 'Screener did not guide to comparison')
  await waitFor(() => evaluate(`document.querySelectorAll('[data-testid^="comparison-row-"]').length === ${sessionResult.symbols.length}`), 'Peer comparison rows did not render')
  await waitFor(() => evaluate('document.querySelector("[data-testid=metric-explanation]")?.textContent.includes("ambang shortlist")'), 'Peer comparison did not explain quality metrics')
  const comparisonState = await evaluate(`({
    rows: Array.from(document.querySelectorAll('[data-testid^="comparison-row-"]')).map(row => row.dataset.testid.replace('comparison-row-', '')),
    hasCandidateFilter: Boolean(document.querySelector('[data-testid^="peer-"]'))
  })`)
  if (comparisonState.hasCandidateFilter || JSON.stringify(comparisonState.rows) !== JSON.stringify(sessionResult.symbols)) {
    throw new Error(`Peer comparison did not follow screening results: ${JSON.stringify(comparisonState)}`)
  }
  await evaluate(`(() => {
    const candidates = Array.from(document.querySelectorAll('[data-testid^="candidate-select-"]'))
    if (candidates.length > 2 && candidates.at(-1).checked) candidates.at(-1).click()
    const setSelect = (testId, value) => {
      const select = document.querySelector('[data-testid="' + testId + '"]')
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
      setter.call(select, value)
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }
    setSelect('metric-view', 'profitability')
  })()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=sort-metric]")?.querySelector("option[value=roePercent]")'), 'Peer profitability metrics did not render')
  await evaluate(`(() => {
    const setSelect = (testId, value) => {
      const select = document.querySelector('[data-testid="' + testId + '"]')
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
      setter.call(select, value)
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }
    setSelect('sort-metric', 'roePercent')
    setSelect('sort-direction', 'asc')
    const relative = Array.from(document.querySelectorAll('input[type="radio"]')).find(input => input.value === 'relative')
    if (!relative.disabled) relative.click()
  })()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=sort-metric]")?.value === "roePercent"'), 'Peer sort metric did not update')
  const peerControls = await evaluate(`(() => {
    const payload = JSON.parse(localStorage.getItem('voyager-one-research-sessions-v1'))
    const session = payload.sessions.find(item => item.id === '${sessionResult.id}')
    const selected = Array.from(document.querySelectorAll('[data-testid^="candidate-select-"]:checked')).map(input => input.dataset.testid.replace('candidate-select-', ''))
    const expected = session.candidates.filter(candidate => selected.includes(candidate.symbol)).sort((a, b) => a.roePercent - b.roePercent || a.rank - b.rank)
    const values = expected.map(candidate => candidate.roePercent).sort((a, b) => a - b)
    const middle = Math.floor(values.length / 2)
    const median = values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2
    const format = value => String(Number(value.toFixed(2)))
    const rows = Array.from(document.querySelectorAll('[data-testid^="comparison-row-"]')).map(row => ({ symbol: row.dataset.testid.replace('comparison-row-', ''), text: row.textContent }))
    const relative = Array.from(document.querySelectorAll('input[type="radio"]')).find(input => input.value === 'relative')
    return {
      selected,
      expected: expected.map(candidate => candidate.symbol),
      expectedDeltas: Object.fromEntries(expected.map(candidate => [candidate.symbol, (candidate.roePercent - median > 0 ? '+' : '') + format(candidate.roePercent - median) + '%'])),
      rows,
      median,
      medianText: document.querySelector('[data-testid="comparison-median"]')?.textContent || '',
      relativeDisabled: relative.disabled,
      relativeChecked: relative.checked,
      warning: Boolean(document.querySelector('[data-testid="relative-warning"]')),
      provenance: document.querySelector('[data-testid="data-provenance"]')?.textContent || ''
    }
  })()`)
  const peerDeltasMatch = peerControls.rows.every(row => row.text.includes(peerControls.expectedDeltas[row.symbol]))
  if (peerControls.selected.length !== 2 || JSON.stringify(peerControls.rows.map(row => row.symbol)) !== JSON.stringify(peerControls.expected) || peerControls.relativeDisabled !== peerControls.warning || (!peerControls.relativeDisabled && (!peerControls.relativeChecked || !peerControls.medianText.includes('0%') || !peerDeltasMatch)) || !peerControls.provenance.includes('Asal dan periode data')) {
    throw new Error(`Peer selection, sorting, relative mode, median, warning, or provenance failed: ${JSON.stringify(peerControls)}`)
  }
  await evaluate(`(() => {
    const select = document.querySelector('[data-testid="metric-view"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, 'valuation')
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })()`)
  await waitFor(() => evaluate('Array.from(document.querySelectorAll("th")).some(cell => cell.textContent.includes("P/BV"))'), 'Metric view did not change comparison columns')
  await waitFor(() => evaluate('document.querySelector("[data-testid=metric-explanation]")?.textContent.includes("mencerminkan risiko")'), 'Valuation view did not explain tradeoffs')

  await evaluate(`document.querySelector('[data-testid="peers-primary-next"]').click()`)
  await waitFor(() => evaluate(`location.pathname === '/research/${sessionResult.id}/report'`), 'Comparison did not guide to report')
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=report-next]"))'), 'Report continuation actions did not render')
  const reportSections = await evaluate(`(async () => {
    const ids = ['summary', 'scope', 'ranking', 'candidates', 'peers', 'evidence', 'uncertainty']
    const visited = []
    for (const id of ids) {
      document.querySelector('#report-tab-' + id).click()
      await new Promise(resolve => requestAnimationFrame(resolve))
      const panels = Array.from(document.querySelectorAll('[id^="report-panel-"]'))
      visited.push({ id, selected: document.querySelector('#report-tab-' + id).getAttribute('aria-selected'), panels: panels.map(panel => panel.id), text: panels[0]?.textContent || '' })
    }
    return visited
  })()`)
  if (reportSections.some(section => section.selected !== 'true' || section.panels.length !== 1 || section.panels[0] !== `report-panel-${section.id}`) || !reportSections.find(section => section.id === 'evidence').text.includes('Asal dan periode data')) {
    throw new Error(`Report section navigation or provenance failed: ${JSON.stringify(reportSections)}`)
  }
  const exportControls = await evaluate(`(async () => {
    window.__voyagerPrintCalled = false
    window.print = () => { window.__voyagerPrintCalled = true }
    window.__voyagerDownloads = []
    const originalClick = HTMLAnchorElement.prototype.click
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) window.__voyagerDownloads.push(this.download)
      else originalClick.call(this)
    }
    const byText = (selector, text) => Array.from(document.querySelectorAll(selector)).find(element => element.textContent.trim().includes(text))
    byText('button', 'Unduh laporan').click()
    await new Promise(resolve => requestAnimationFrame(resolve))
    byText('button', 'Interaktif').click()
    const formats = byText('summary', 'Format lain').parentElement
    formats.open = true
    byText('button', 'Markdown').click()
    await new Promise(resolve => setTimeout(resolve, 0))
    formats.open = true
    byText('button', 'JSON').click()
    await new Promise(resolve => setTimeout(resolve, 0))
    HTMLAnchorElement.prototype.click = originalClick
    return { printed: window.__voyagerPrintCalled, downloads: window.__voyagerDownloads, interactive: byText('button', 'Interaktif').getAttribute('aria-pressed') }
  })()`)
  if (!exportControls.printed || exportControls.interactive !== 'true' || !exportControls.downloads.includes(`VoyagerOne-ExecutiveReport-${sessionResult.id}.md`) || !exportControls.downloads.includes(`VoyagerOne-Report-${sessionResult.id}.json`)) {
    throw new Error(`Report export controls failed: ${JSON.stringify(exportControls)}`)
  }
  await evaluate(`document.querySelector('#report-tab-ranking').click()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=report-metric-guide]")?.textContent.includes("ROE = laba terhadap modal")'), 'Report did not explain financial metrics')
  const mobileRanking = await evaluate(`({ cards: document.querySelectorAll('#report-panel-ranking article').length, desktopTableVisible: getComputedStyle(document.querySelector('#report-panel-ranking table').parentElement).display !== 'none' })`)
  if (mobileRanking.cards !== sessionResult.symbols.length || mobileRanking.desktopTableVisible) throw new Error(`Report mobile ranking is not responsive: ${JSON.stringify(mobileRanking)}`)
  if (await evaluate('Boolean(document.querySelector("#report-panel-summary"))')) throw new Error('Report rendered more than the selected section')
  await evaluate(`document.querySelector('#report-tab-candidates').click()`)
  if (!await evaluate('document.body.textContent.includes("Konsistensi laba dan dividen · bobot 10%")')) throw new Error('Report omitted consistency score factor')
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
  await waitFor(() => evaluate(`(() => { const cards = Array.from(document.querySelectorAll('[data-testid^="library-session-"]')); return cards.length > 0 && cards.every(card => card.textContent.toLowerCase().includes('bank')) })()`), 'Library search did not filter sessions')
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

  await navigate('/glossary')
  const glossarySearch = await evaluate(`(async () => {
    const field = document.querySelector('input[placeholder^="Cari istilah"]')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(field, 'free cash flow')
    field.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise(resolve => requestAnimationFrame(resolve))
    const matches = Array.from(document.querySelectorAll('article h3')).map(heading => heading.textContent.trim())
    setter.call(field, 'istilah-yang-tidak-ada')
    field.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise(resolve => requestAnimationFrame(resolve))
    return { matches, noResults: document.body.textContent.includes('Tidak ditemukan') && document.body.textContent.includes('istilah-yang-tidak-ada') }
  })()`)
  if (JSON.stringify(glossarySearch.matches) !== JSON.stringify(['FCF Yield']) || !glossarySearch.noResults) throw new Error(`Glossary search failed: ${JSON.stringify(glossarySearch)}`)

  await navigate('/research')
  const persistedLibraryCount = await evaluate('document.querySelectorAll("[data-testid^=library-session-]").length')
  if (persistedLibraryCount < 2) throw new Error('Research library did not persist after reload')
  await evaluate(`Array.from(document.querySelectorAll('button[aria-label^="Hapus"]')).find(button => !button.disabled).click()`)
  await waitFor(() => evaluate('Boolean(document.querySelector("[data-testid=library-confirm-delete]"))'), 'Library delete confirmation was not shown')
  await evaluate(`document.querySelector('[data-testid="library-confirm-delete"]').click()`)
  await waitFor(() => evaluate('document.querySelector("[data-testid=toast]")?.textContent.includes("dihapus")'), 'Session deletion toast was not shown')

  console.log('Interaction test passed: research brief, clarification reload recovery, cancellation and retry, modal isolation and focus containment, mobile More landscape behavior, screening exclusions, provenance, peer controls, glossary, report sections and exports, library, persistence, and deletion')
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
