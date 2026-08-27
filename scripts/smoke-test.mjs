import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const baseUrl = 'http://127.0.0.1:4174'
const sessionId = 'RES-2026-IDX-0941'
const routes = [
  '/',
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
  '/does-not-exist'
]

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4174'], {
  stdio: 'ignore'
})

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

  console.log(`Smoke test passed: ${routes.length} routes`)
} finally {
  preview.kill('SIGTERM')
}
