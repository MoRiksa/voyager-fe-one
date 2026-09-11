import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { localRuntime } from './local-test-runtime.mjs'
const runtime = await localRuntime()
try {
  const { request, payload } = runtime
  assert.equal((await request('/research-capabilities')).data.capabilities.features.scheduler, false)
  for (const [path, body] of [['/research-schedules', undefined], ['/research-schedules', { name: 'Fake schedule' }], ['/research-schedules/old/toggle', { enabled: true }], ['/research-schedules/old/run-now', {}]]) {
    const result = await request(path, body)
    assert.equal(result.response.status, 501)
    assert.equal(result.data.code, 'SCHEDULER_UNAVAILABLE')
    assert.ok(!('tasks' in result.data))
  }
  const invalid = await request('/research-preview', { brief: payload.brief })
  assert.equal(invalid.response.status, 422)
  const preview = (await request('/research-preview', payload)).data.preview
  assert.equal(preview.contract.status, 'supported')
  assert.equal(preview.estimatedUniverseCount, null)
  assert.equal(preview.estimatedDurationSeconds, null)
  assert.equal(preview.estimatedCredits, null)
  const presets = (await request('/research-presets')).data.presets
  assert.deepEqual(presets.filter(p => p.supported).map(p => p.id), ['obj-three-factor-screening', 'obj-banking-moat'])
  for (const objective of ['Cari bank Indonesia yang sehat', 'Cari dividen berkelanjutan']) {
    const body = { ...payload, objective, presetId: 'custom' }
    assert.equal((await request('/research-preview', body)).data.preview.contract.status, 'unsupported')
    const session = await runtime.create(body)
    const start = await request(`/research-sessions/${session.id}/start`, {}, session.revision)
    assert.equal(start.response.status, 422)
    assert.equal((await request(`/research-sessions/${session.id}`)).data.session.attempts.length, 0)
  }
  const created = await runtime.create()
  await runtime.start(created)
  const completed = await runtime.finish(created.id)
  assert.equal(completed.status, 'COMPLETED')
  assert.equal(completed.report.objectiveStatus, 'answered')
  assert.deepEqual(completed.plan.contract, completed.report.contract)
  assert.deepEqual(completed.report.contract.criteria, preview.contract.criteria)
  assert.deepEqual(completed.candidates.map(c => c.symbol).sort(), ['NEXT', 'TEST'])
  const candidate = completed.candidates[0]
  assert.equal(candidate.formulaVersion, 'quality-3f-v2')
  assert.equal(candidate.qualityScore, 100)
  assert.equal(candidate.freeCashFlowYieldPercent, -0.1)
  assert.equal(candidate.debtToEquity, 0)
  assert.equal(candidate.evidenceStatus, 'single-source-unverified')
  assert.equal(candidate.narrativeStatus, 'unavailable')
  assert.ok(!('confidenceLevel' in candidate))
  assert.equal(candidate.financialPeriod, 'FY2025')
  assert.equal(candidate.priceAsOf, '2026-09-09')
  assert.ok(candidate.providerSource.sourceRef.startsWith(runtime.providerUrl))
  const bankPreset = presets.find(p => p.id === 'obj-banking-moat')
  assert.equal(bankPreset.title, 'Bank dengan ROE kuat untuk diteliti')
  assert.equal(bankPreset.objective, 'Screening bank IDX berkapitalisasi pasar terbesar dengan subsektor Banks, latest common FY, ROE >= 15%, dan P/BV > 0.')
  const bankPayload = { ...payload, objective: bankPreset.objective, presetId: bankPreset.id, brief: { ...payload.brief, sectorScope: 'Perbankan' } }
  const bankPreview = (await request('/research-preview', bankPayload)).data.preview
  assert.equal(bankPreview.contract.status, 'supported')
  assert.equal(bankPreview.contract.version, 'bank-screen-contract-v1')
  assert.equal(bankPreview.contract.objectiveType, 'bank-screen')
  assert.equal(bankPreview.contract.supportedObjective, bankPreset.objective)
  assert.deepEqual(bankPreview.contract.criteria, [
    'Bank berkapitalisasi pasar terbesar pada cakupan provider', 'Subsektor aktual = Banks',
    'ROE terhitung >= 15%', 'P/BV > 0', 'Periode FY keuangan dan valuasi terbaru yang sama'
  ])
  assert.equal(bankPreview.contract.discoveryLimit, 8)
  assert.match(bankPreview.contract.coveragePolicy, /delapan bank berkapitalisasi pasar terbesar/)
  const bankSession = await runtime.create(bankPayload); await runtime.start(bankSession)
  const bankCompleted = await runtime.finish(bankSession.id)
  assert.equal(bankCompleted.report.objective, bankPreset.objective)
  assert.deepEqual(bankCompleted.plan.contract, bankCompleted.report.contract)
  assert.deepEqual(bankCompleted.screeningFunnel[0].retainedSymbols, Array.from({ length: 8 }, (_, index) => `BANK${index + 1}`))
  assert.ok(bankCompleted.screeningFunnel[0].reasons.some(reason => reason.code === 'COVERAGE_LIMIT'))
  for (const bank of bankCompleted.candidates) {
    assert.equal(bank.formulaVersion, 'bank-screen-2f-v1')
    assert.equal(bank.financialPeriod, 'FY2025')
    assert.deepEqual(bank.bankMetrics, { pbPeerAverage: 3, pbScoringBasis: 'peer-relative' })
    assert.ok(Math.abs(bank.scoreBreakdown.profitability - 100 / 3) < 1e-12)
    assert.equal(bank.scoreBreakdown.valuation, 100)
    assert.equal(bank.qualityScore, 60)
    for (const field of ['debtToEquity', 'freeCashFlowYieldPercent', 'peRatio', 'dupontAnalysis']) assert.ok(!(field in bank), `${field} leaked into bank candidate`)
  }
  assert.doesNotMatch(JSON.stringify(bankCompleted.candidates), /capital|risk.weighted|\bRWA\b|\bCAR\b|NPL|NIM|bank (?:sehat|healthy)|kesehatan bank (?:kuat|baik)/i)
  const md = await fetch(`${runtime.apiUrl}/api/v1/research-sessions/${created.id}/report/export?format=markdown`)
  assert.equal(md.status, 200)
  assert.ok((await md.text()).includes('quality-3f-v2'))
  const json = await fetch(`${runtime.apiUrl}/api/v1/research-sessions/${created.id}/report/export?format=json`)
  assert.equal(json.status, 200)
  assert.deepEqual(await json.json(), completed)
  // Preserve mutation/revision coverage removed from the old source contract test.
  for (const action of ['start', 'cancel', 'retry', 'duplicate', 'clarifications/unknown/answer', 'follow-ups']) {
    const body = action === 'follow-ups' ? { question: 'Apa risiko utamanya?' } : action.includes('clarifications') ? { answer: 'Jawaban pengujian' } : {}
    assert.equal((await request(`/research-sessions/${created.id}/${action}`, body)).response.status, 428, action)
    assert.equal((await request(`/research-sessions/${created.id}/${action}`, body, completed.revision - 1)).response.status, 409, action)
  }
  const duplicate = await request(`/research-sessions/${created.id}/duplicate`, {}, completed.revision)
  assert.equal(duplicate.response.status, 201)
  assert.notEqual(duplicate.data.session.id, created.id)
  assert.deepEqual(duplicate.data.session.objective, completed.objective)
  for (const [revision, status] of [[undefined, 428], [duplicate.data.session.revision - 1, 409], [duplicate.data.session.revision, 200]]) {
    const deleted = await fetch(`${runtime.apiUrl}/api/v1/research-sessions/${duplicate.data.session.id}`, { method: 'DELETE', headers: revision === undefined ? {} : { 'If-Match': String(revision) } })
    assert.equal(deleted.status, status)
  }
  await runtime.setMode('incomplete')
  const incomplete = await runtime.create(); await runtime.start(incomplete)
  const unavailable = await runtime.finish(incomplete.id)
  assert.equal(unavailable.report.objectiveStatus, 'cannot_assess')
  assert.equal(unavailable.candidates.length, 0)
  assert.ok(unavailable.screeningFunnel.flatMap(s => s.reasons).some(r => r.code === 'DATA_INCOMPLETE'))
  await runtime.setMode('none')
  const none = await runtime.create(); await runtime.start(none)
  assert.equal((await runtime.finish(none.id)).report.objectiveStatus, 'not_answered')
  await runtime.setMode('outage')
  const outage = await runtime.create(); await runtime.start(outage)
  const failed = await runtime.finish(outage.id)
  assert.equal(failed.status, 'FAILED')
  assert.equal(failed.activeAttemptId, null)
  assert.equal(failed.report, null)
  assert.ok(failed.attempts.at(-1).failureReason)
  assert.equal((await fetch(`${runtime.apiUrl}/api/v1/research-sessions/${outage.id}/report/export?format=markdown`)).status, 409)
  assert.equal((await request('/companies/UNSEEN')).response.status, 503)
  const store = readFileSync(new URL('../src/stores/researchStore.ts', import.meta.url), 'utf8')
  const api = readFileSync(new URL('../src/services/researchApi.ts', import.meta.url), 'utf8')
  for (const name of ['startResearchSession', 'cancelResearchSession', 'retryResearchSession', 'duplicateResearchSession', 'answerClarification', 'sendFollowUp', 'deleteResearchSession']) {
    const implementation = api.split(`export const ${name} =`)[1]?.split('export const ')[0]
    assert.ok(implementation, name)
    assert.match(implementation, /'If-Match': String\(revision\)/, name)
  }
  assert.doesNotMatch(api, /\/steps\/|\/execute\b|executeResearchSession|runResearchStep/)
  assert.doesNotMatch(store, /ALL_COMPANIES_DATABASE|deriveSessionResults|runAutonomousResearch|confidenceLevel:|localStorage/)
  console.log('LOCAL contract: generic quality-3f-v2 and bank-screen-2f-v1 preview/plan/report parity, top-8 of 48 bank coverage, common FY, two-factor metrics, unsupported objectives, missing data, outage and export refusal passed.')
} finally { await runtime.close() }
