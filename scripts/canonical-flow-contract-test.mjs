import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const api = readFileSync(new URL('../src/services/researchApi.ts', import.meta.url), 'utf8')
const createView = readFileSync(new URL('../src/views/NewResearchView.vue', import.meta.url), 'utf8')
const sessionView = readFileSync(new URL('../src/views/ResearchSessionView.vue', import.meta.url), 'utf8')
const store = readFileSync(new URL('../src/stores/researchStore.ts', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const runtime = `${api}\n${createView}\n${sessionView}\n${store}\n${app}`

assert.match(api, /headers: \{ 'If-Match': String\(revision\) \}/)
assert.match(createView, /brief: \{[\s\S]*candidateCount: candidateCount\.value/)
assert.match(sessionView, /getResearchSessionFull\(id\)/)
assert.match(api, /cancelResearchSession[\s\S]*'If-Match': String\(revision\)/)
assert.match(api, /retryResearchSession[\s\S]*'If-Match': String\(revision\)/)
assert.match(store, /apiGetResearchSessionFull\(id\)\.then\(hydrateFromBackendSession\)/)
assert.doesNotMatch(store, /evt\.type ===/)
assert.match(store, /activeStatuses\.has\(session\.status\)/)
assert.match(app, /route\.name !== 'research-session'/)
assert.match(api, /getResearchSessions[\s\S]*\/research-sessions`\)/)
assert.match(api, /deleteResearchSession[\s\S]*method: 'DELETE'[\s\S]*'If-Match': String\(revision\)/)
assert.match(store, /sessions\.value = await apiGetResearchSessions\(\)/)
assert.match(store, /await refreshSessions\(\)[\s\S]*return false/)
assert.doesNotMatch(runtime, /\/steps\/|\/execute\b|executeResearchSession|runResearchStep/)

console.log('Canonical create/start/refetch contract verified')
