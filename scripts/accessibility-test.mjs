import assert from 'node:assert/strict'
import { localRuntime } from './local-test-runtime.mjs'

const runtime = await localRuntime({ browser: true })
try {
  for (const path of ['/', '/research/new', '/help', '/accessibility', '/methodology', '/glossary']) {
    await runtime.navigate(path)
    const audit = await runtime.evaluate(`(() => {
      const refs = ['aria-labelledby', 'aria-describedby', 'aria-controls']
      const broken = []
      for (const element of document.querySelectorAll(refs.map(name => '[' + name + ']').join(','))) {
        for (const name of refs) for (const id of (element.getAttribute(name) || '').split(/\\s+/).filter(Boolean)) if (!document.getElementById(id)) broken.push(name + ':' + id)
      }
      const navs = [...document.querySelectorAll('nav')].filter(nav => !nav.getAttribute('aria-label') && !nav.getAttribute('aria-labelledby'))
      const duplicateIds = [...document.querySelectorAll('[id]')].map(node => node.id).filter((id, index, ids) => ids.indexOf(id) !== index)
      return { mains: document.querySelectorAll('main').length, broken, unnamedNavs: navs.length, duplicateIds, overflow: document.documentElement.scrollWidth > innerWidth }
    })()`)
    assert.equal(audit.mains, 1, `${path}: expected one main`)
    assert.deepEqual(audit.broken, [], `${path}: broken ARIA references`)
    assert.equal(audit.unnamedNavs, 0, `${path}: unnamed navigation`)
    assert.deepEqual(audit.duplicateIds, [], `${path}: duplicate ids`)
    assert.equal(audit.overflow, false, `${path}: horizontal overflow`)
  }
  await runtime.navigate('/research/new')
  assert.equal(await runtime.evaluate(`document.activeElement === document.querySelector('#main-content')`), true)
  console.log('LOCAL accessibility: landmarks, ARIA references, unique IDs, route focus, and mobile-width overflow checks passed.')
} finally { await runtime.close() }
