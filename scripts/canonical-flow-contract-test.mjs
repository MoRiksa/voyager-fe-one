import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const api = readFileSync(new URL('../src/services/researchApi.ts', import.meta.url), 'utf8')
const createView = readFileSync(new URL('../src/views/NewResearchView.vue', import.meta.url), 'utf8')
const sessionView = readFileSync(new URL('../src/views/ResearchSessionView.vue', import.meta.url), 'utf8')
const runtime = `${api}\n${createView}\n${sessionView}`

assert.match(api, /headers: \{ 'If-Match': String\(revision\) \}/)
assert.match(createView, /brief: \{[\s\S]*candidateCount: candidateCount\.value/)
assert.match(sessionView, /getResearchSessionFull\(id\)/)
assert.doesNotMatch(runtime, /\/steps\/|\/execute\b|executeResearchSession|runResearchStep/)

console.log('Canonical create/start/refetch contract verified')
