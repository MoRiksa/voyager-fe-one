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
          edgeAnimation: getComputedStyle(edge).animationName,
          playing: document.querySelector('svg').classList.contains('voyager-flow-playing'),
          edgeFrom: edge.dataset.from,
          edgeTo: edge.dataset.to,
          nodeId: node.dataset.nodeId,
          sourceActive: Boolean(document.querySelector('.voyager-source-active'))
        }
      })()`)
      if (motion.nodeAnimation !== 'none' || motion.edgeAnimation !== 'voyager-edge-stream' || !motion.playing || !motion.edgeFrom || !motion.edgeTo || !motion.nodeId || !motion.sourceActive) {
        failures.push(`${diagram} (${viewport.name}): node/edge motion policy invalid: ${JSON.stringify(motion)}`)
      }
      if (viewport.name === 'mobile') {
        const mobileScale = await evaluate(`(() => {
          const container = document.querySelector('.diagram-container')
          const svg = document.querySelector('svg')
          return {
            svgWidth: svg.getBoundingClientRect().width,
            scrollable: container.scrollWidth > container.clientWidth
          }
        })()`)
        if (mobileScale.svgWidth < 850 || !mobileScale.scrollable) failures.push(`${diagram} (mobile): diagram was compressed below a readable scale: ${JSON.stringify(mobileScale)}`)
      }
      if (viewport.name === 'desktop') {
        await evaluate('document.dispatchEvent(new Event("voyager-flow-restart"))')
        const initialBeat = await evaluate(`(() => {
          const source = document.querySelector('.voyager-source-active')
          const sourceId = source?.dataset.nodeId
          const activeEdges = Array.from(document.querySelectorAll('.voyager-edge-active'))
          return { sourceId, activeEdges: activeEdges.length }
        })()`)
        if (!initialBeat.sourceId || initialBeat.activeEdges !== 0) failures.push(`${diagram}: source beat invalid: ${JSON.stringify(initialBeat)}`)
        await delay(360)
        const edgeBeat = await evaluate(`(() => {
          const sourceId = document.querySelector('.voyager-source-active')?.dataset.nodeId
          const activeEdges = Array.from(document.querySelectorAll('.voyager-edge-active'))
          return { sourceId, count: activeEdges.length, aligned: activeEdges.every(edge => edge.dataset.from === sourceId) }
        })()`)
        if (!edgeBeat.count || !edgeBeat.aligned) failures.push(`${diagram}: edge beat is not aligned to source: ${JSON.stringify(edgeBeat)}`)
        await delay(500)
        const targetBeat = await evaluate(`(() => {
          const activeEdges = Array.from(document.querySelectorAll('.voyager-edge-active'))
          const expected = new Set(activeEdges.map(edge => edge.dataset.to))
          const actual = new Set(Array.from(document.querySelectorAll('.voyager-target-active')).map(node => node.dataset.nodeId))
          return { expected: Array.from(expected), actual: Array.from(actual), aligned: expected.size === actual.size && Array.from(expected).every(id => actual.has(id)) }
        })()`)
        if (!targetBeat.aligned) failures.push(`${diagram}: target beat is not aligned to edge: ${JSON.stringify(targetBeat)}`)
      }
      if (diagram === 'activity') {
        const branchTiming = await evaluate(`(() => {
          const edges = Array.from(document.querySelectorAll('[data-animate="edge"]'))
          const nodes = Array.from(document.querySelectorAll('[data-animate="node"]'))
          return {
            mainAfterPlan: edges[3]?.style.getPropertyValue('--step'),
            branchAfterPlan: edges[7]?.style.getPropertyValue('--step'),
            needsInput: nodes[8]?.style.getPropertyValue('--step'),
            mainAfterResearch: edges[5]?.style.getPropertyValue('--step'),
            branchAfterResearch: edges[8]?.style.getPropertyValue('--step'),
            retry: nodes[9]?.style.getPropertyValue('--step')
          }
        })()`)
        if (branchTiming.mainAfterPlan !== branchTiming.branchAfterPlan || branchTiming.needsInput !== '4' || branchTiming.mainAfterResearch !== branchTiming.branchAfterResearch || branchTiming.retry !== '6') {
          failures.push(`${diagram} (${viewport.name}): branch timing is not parallel: ${JSON.stringify(branchTiming)}`)
        }
        const laneSpacing = await evaluate(`(() => {
          const laneLeft = 40
          const laneRight = 680
          const boxes = Array.from(document.querySelectorAll('[data-node-id]')).map(node => node.getBBox())
          return {
            left: Math.min(...boxes.map(box => box.x)) - laneLeft,
            right: laneRight - Math.max(...boxes.map(box => box.x + box.width))
          }
        })()`)
        if (Math.min(laneSpacing.left, laneSpacing.right) < 100 || Math.abs(laneSpacing.left - laneSpacing.right) > 16) failures.push(`${diagram} (${viewport.name}): lane content is not centered: ${JSON.stringify(laneSpacing)}`)
      }
      if (diagram === 'interaction-overview') {
        const outerSpacing = await evaluate(`(() => {
          const laneLeft = 40
          const laneRight = 680
          const left = document.querySelector('[data-node-id="home"]').getBBox()
          const rightIds = ['library', 'company', 'report']
          return {
            left: left.x - laneLeft,
            right: Math.min(...rightIds.map(id => {
              const box = document.querySelector('[data-node-id="' + id + '"]').getBBox()
              return laneRight - box.x - box.width
            }))
          }
        })()`)
        if (Math.min(outerSpacing.left, outerSpacing.right) < 100 || Math.abs(outerSpacing.left - outerSpacing.right) > 16) failures.push(`${diagram} (${viewport.name}): lane content is not centered: ${JSON.stringify(outerSpacing)}`)
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
        const svgElement = document.querySelector('svg')
        const viewBox = svgElement.viewBox.baseVal
        const tightEdges = nodeRects.flatMap(rect => {
          const box = rect.getBBox()
          const gaps = { left: box.x - viewBox.x, right: viewBox.x + viewBox.width - box.x - box.width, top: box.y - viewBox.y, bottom: viewBox.y + viewBox.height - box.y - box.height }
          return Object.entries(gaps).filter(([, gap]) => gap < 16).map(([side]) => 'node too close to svg ' + side + ' edge')
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
        return [...new Set([...collisions, ...overflow, ...tightEdges, ...chromeCollision])]
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
