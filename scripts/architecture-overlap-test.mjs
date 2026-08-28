import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'

const chrome = ['google-chrome', 'chromium', 'chromium-browser'].find(command => spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0)
if (!chrome) {
  console.log('Architecture overlap test skipped: Chrome or Chromium is not installed')
  process.exit(0)
}

const diagrams = ['activity', 'decision', 'data-flow', 'system-flow', 'class', 'use-case', 'sequence', 'timing', 'interaction-overview']
const baseUrl = 'http://127.0.0.1:4177'
const debugUrl = 'http://127.0.0.1:9227'
const profile = mkdtempSync(join(tmpdir(), 'voyager-architecture-cdp-'))
const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4177'], { stdio: 'ignore' })
const browser = spawn(chrome, [
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9227',
  `--user-data-dir=${profile}`,
  `${baseUrl}/arsitektural/diagrams/activity.html`
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
    try { return (await fetch(baseUrl)).ok } catch { return false }
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

  await send('Page.enable')
  await send('Runtime.enable')

  const failures = []
  for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
    await send('Emulation.setDeviceMetricsOverride', { width: viewport.width, height: viewport.height, deviceScaleFactor: 1, mobile: viewport.name === 'mobile' })
    for (const diagram of diagrams) {
      await send('Page.navigate', { url: `${baseUrl}/arsitektural/diagrams/${diagram}.html` })
      await waitFor(() => evaluate('document.readyState === "complete" && Boolean(document.querySelector("svg"))'), `${diagram} did not render`)
      await evaluate('document.fonts?.ready')
      const motion = await evaluate(`(() => {
        const node = document.querySelector('[data-animate="node"]')
        const edge = document.querySelector('[data-animate="edge"]')
        return {
          nodeAnimation: getComputedStyle(node).animationName,
          nodeDelay: getComputedStyle(node).animationDelay,
          edgeAnimation: getComputedStyle(edge).animationName,
          playing: document.querySelector('svg').classList.contains('voyager-flow-playing')
        }
      })()`)
      if (motion.nodeAnimation !== 'voyager-node-flow' || motion.edgeAnimation !== 'voyager-edge-flow' || !motion.playing) {
        failures.push(`${diagram} (${viewport.name}): node/edge motion policy invalid: ${JSON.stringify(motion)}`)
      }
      const problems = await evaluate(`(() => {
        const overlap = (a, b, inset = 1) => a.x + inset < b.x + b.width && a.x + a.width - inset > b.x && a.y + inset < b.y + b.height && a.y + a.height - inset > b.y
        const texts = Array.from(document.querySelectorAll('svg text')).map((element, index) => ({
          element, index, label: element.textContent.trim(), box: element.getBoundingClientRect()
        })).filter(item => item.label)
        const collisions = []
        for (let i = 0; i < texts.length; i += 1) {
          for (let j = i + 1; j < texts.length; j += 1) {
            if (overlap(texts[i].box, texts[j].box)) collisions.push('text overlap: "' + texts[i].label + '" / "' + texts[j].label + '"')
          }
        }

        const nodeRects = Array.from(document.querySelectorAll('svg rect[class^="c-"], svg rect[class*=" c-"]')).filter(rect => {
          const classes = rect.getAttribute('class') || ''
          return !/c-(mask|lane|region|security-group|grid)/.test(classes) && Number(rect.getAttribute('width')) >= 32 && Number(rect.getAttribute('height')) >= 32
        })
        const overflow = []
        for (const text of texts) {
          const container = nodeRects.find(rect => {
            const box = rect.getBoundingClientRect()
            const centerX = text.box.x + text.box.width / 2
            const centerY = text.box.y + text.box.height / 2
            return centerX >= box.x && centerX <= box.x + box.width && centerY >= box.y && centerY <= box.y + box.height
          })
          if (!container) continue
          const box = container.getBoundingClientRect()
          if (text.box.x < box.x + 1 || text.box.x + text.box.width > box.x + box.width - 1 || text.box.y < box.y + 1 || text.box.y + text.box.height > box.y + box.height - 1) {
            overflow.push('node overflow: "' + text.label + '"')
          }
        }

        const toolbar = document.querySelector('.toolbar')?.getBoundingClientRect()
        const heading = document.querySelector('.header h1')?.getBoundingClientRect()
        const subtitle = document.querySelector('.subtitle')?.getBoundingClientRect()
        const chromeCollision = toolbar && [heading, subtitle].filter(Boolean).some(box => overlap(toolbar, box, 0)) ? ['toolbar/header text overlap'] : []
        return [...new Set([...collisions, ...overflow, ...chromeCollision])]
      })()`)
      if (problems.length) failures.push(`${diagram} (${viewport.name}):\n- ${problems.join('\n- ')}`)
    }
  }
  if (failures.length) throw new Error(failures.join('\n\n'))
  console.log(`Architecture overlap test passed: ${diagrams.length} diagrams x 2 viewports`)
} finally {
  socket?.close()
  browser.kill('SIGTERM')
  preview.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => browser.once('exit', resolve)),
    delay(1000)
  ])
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
