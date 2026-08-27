import { spawn, spawnSync } from 'node:child_process'
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
  '/screener',
  '/peers',
  '/activity',
  '/trace',
  '/report',
  '/does-not-exist'
]
const renderedChecks = [
  { route: '/', text: 'Apa yang ingin Anda teliti hari ini?' },
  { route: `/research/${sessionId}/screener`, text: 'Proses penyaringan' },
  { route: `/research/${sessionId}/peers`, text: 'Bandingkan kekuatan dan tradeoff kandidat' },
  { route: `/research/${sessionId}/company/BBCA`, text: 'Lima faktor penilaian' },
  { route: `/research/${sessionId}/report`, text: 'Laporan riset' },
  { route: '/research/UNKNOWN/report', text: 'Halaman tidak ditemukan' }
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

  const chrome = ['google-chrome', 'chromium', 'chromium-browser'].find(command => spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0)
  if (chrome) {
    for (const check of renderedChecks) {
      const result = spawnSync(chrome, [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--virtual-time-budget=2000',
        '--dump-dom',
        `${baseUrl}${check.route}`
      ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
      if (result.status !== 0 || !result.stdout.includes(check.text)) {
        throw new Error(`${check.route} did not render expected text: ${check.text}`)
      }
    }
    console.log(`Browser render passed: ${renderedChecks.length} routes`)
  }

  console.log(`Smoke test passed: ${routes.length} routes`)
} finally {
  preview.kill('SIGTERM')
}
