import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const api = readFileSync(`${root}/src/services/researchApi.ts`, 'utf8')
const view = readFileSync(`${root}/src/views/CompanyView.vue`, 'utf8')

assert.match(api, /export const requestOfficialCheck/)
assert.match(api, /official-check`[\s\S]*method: 'POST', headers: getHeaders\(\)/)
assert.match(api, /if \(!response\.ok\) throw await responseError/)
assert.doesNotMatch(api.match(/export const requestOfficialCheck[\s\S]*?^}/m)?.[0] || '', /body:/)

assert.match(view, /if \(officialCheckState\.value === 'loading'/)
assert.match(view, /const current = \+\+officialCheckToken/)
assert.match(view, /if \(current !== officialCheckToken\) return/)
assert.match(view, /watch\(\(\) => route\.fullPath, load/)
assert.equal((view.match(/requestOfficialCheck\(/g) || []).length, 1, 'Official check must only be invoked by its click handler')
assert.match(view, /role="status" aria-live="polite"/)
assert.match(view, /role="alert"/)
assert.match(view, /target="_blank" rel="noopener noreferrer"/)
assert.match(view, /v-if="sourceHref\(officialCheck\.source\.url\)"/)
assert.match(view, /<summary[^>]*>Detail sumber<\/summary>/)
assert.match(view, /data-testid="official-check-button"/)

console.log('Official check source contract passed: click-only POST, auth/error conventions, duplicate and stale-response guards, accessible states, and safe source link.')
