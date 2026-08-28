import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const directory = new URL('../arsitektural/diagrams/', import.meta.url)
const specsDirectory = new URL('../arsitektural/specs/', import.meta.url)
const oldStart = '    /* Voyager node interaction: idle by default, active on pointer only. */'
const oldEnd = '    /* End Voyager node interaction. */'
const markerStart = '    /* Voyager narrative flow: activate nodes and edges in step order. */'
const markerEnd = '    /* End Voyager narrative flow. */'
const scriptStart = '  <!-- Voyager narrative flow controller. -->'
const scriptEnd = '  <!-- End Voyager narrative flow controller. -->'
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const styles = `${markerStart}
    svg[data-animation="trace"] [data-animate] {
      animation: none;
    }
    svg[data-animation="trace"] [data-animate="edge"] {
      stroke-dasharray: 11 9;
      stroke-linecap: round;
      stroke-linejoin: round;
      animation: voyager-edge-stream 2.8s linear infinite;
      opacity: .48;
      transition: opacity 420ms ease, filter 420ms ease, stroke-width 420ms ease;
      will-change: stroke-dashoffset, opacity, filter;
    }
    svg[data-animation="trace"] [data-animate="node"] {
      transform-box: fill-box;
      transform-origin: center;
      opacity: .8;
      transition: filter 520ms cubic-bezier(.22, .8, .24, 1), stroke-width 520ms cubic-bezier(.22, .8, .24, 1), opacity 520ms ease;
      will-change: filter, stroke-width, opacity;
    }
    svg[data-animation="trace"] [data-animate="node"].voyager-source-active {
      filter: drop-shadow(0 0 9px var(--frontend-stroke));
      stroke-width: 2.25;
      opacity: 1;
    }
    svg[data-animation="trace"] [data-animate="edge"].voyager-edge-active {
      filter: drop-shadow(0 0 7px currentColor);
      stroke-width: 2.6;
      opacity: 1;
    }
    svg[data-animation="trace"] [data-animate="node"].voyager-target-active {
      filter: drop-shadow(0 0 12px var(--arrow-emphasis));
      stroke-width: 2.7;
      opacity: 1;
    }
    @keyframes voyager-edge-stream {
      0% { stroke-dashoffset: 60; opacity: .64; }
      50% { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: .64; }
    }
    @media (prefers-reduced-motion: reduce) {
      svg[data-animation="trace"] [data-animate] {
        animation: none !important;
        transition: none !important;
        filter: none;
        opacity: 1;
        stroke-dashoffset: 0;
      }
    }
    @media (max-width: 720px) {
      .diagram-container svg {
        min-width: 900px;
      }
    }
${markerEnd}`

const controller = `${scriptStart}
  <script>
    (function () {
      var svg = document.querySelector('svg[data-animation="trace"]');
      if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var nodes = Array.from(svg.querySelectorAll('[data-animate="node"]'));
      var edges = Array.from(svg.querySelectorAll('[data-animate="edge"]'));
      var steps = Array.from(new Set(edges.map(function (edge) {
        return Number.parseInt(edge.style.getPropertyValue('--step'), 10);
      }).filter(Number.isFinite))).sort(function (a, b) { return a - b; });
      var timers = [];
      var cursor = 0;
      function clearTimers() {
        timers.forEach(window.clearTimeout);
        timers = [];
      }
      function clearActive() {
        nodes.forEach(function (node) { node.classList.remove('voyager-source-active', 'voyager-target-active'); });
        edges.forEach(function (edge) { edge.classList.remove('voyager-edge-active'); });
      }
      function nodesById(ids) {
        return nodes.filter(function (node) { return ids.has(node.dataset.nodeId); });
      }
      function playStep() {
        clearTimers();
        clearActive();
        var step = steps[cursor];
        var activeEdges = edges.filter(function (edge) {
          return Number.parseInt(edge.style.getPropertyValue('--step'), 10) === step;
        });
        var sourceIds = new Set(activeEdges.map(function (edge) { return edge.dataset.from; }));
        var targetIds = new Set(activeEdges.map(function (edge) { return edge.dataset.to; }));
        nodesById(sourceIds).forEach(function (node) { node.classList.add('voyager-source-active'); });
        timers.push(window.setTimeout(function () {
          activeEdges.forEach(function (edge) { edge.classList.add('voyager-edge-active'); });
        }, 280));
        timers.push(window.setTimeout(function () {
          nodesById(targetIds).forEach(function (node) { node.classList.add('voyager-target-active'); });
        }, 760));
        timers.push(window.setTimeout(function () {
          cursor = (cursor + 1) % steps.length;
          if (cursor === 0) timers.push(window.setTimeout(playStep, 1100));
          else playStep();
        }, 1550));
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { clearTimers(); clearActive(); }
        else { cursor = 0; playStep(); }
      });
      document.addEventListener('voyager-flow-restart', function () {
        cursor = 0;
        playStep();
      });
      svg.classList.add('voyager-flow-playing');
      playStep();
    })();
  </script>
${scriptEnd}`

let updated = 0
for (const file of readdirSync(directory).filter(file => file.endsWith('.html'))) {
  const path = join(directory.pathname, file)
  let output = readFileSync(path, 'utf8')
  const oldBlock = new RegExp(`${escapePattern(oldStart)}[\\s\\S]*?${escapePattern(oldEnd)}\\n?`)
  const styleBlock = new RegExp(`${escapePattern(markerStart)}[\\s\\S]*?${escapePattern(markerEnd)}`)
  const scriptBlock = new RegExp(`${escapePattern(scriptStart)}[\\s\\S]*?${escapePattern(scriptEnd)}`)
  output = output.replace(oldBlock, '')
  output = styleBlock.test(output)
    ? output.replace(styleBlock, styles)
    : output.replace('  </style>', `${styles}\n  </style>`)
  output = scriptBlock.test(output)
    ? output.replace(scriptBlock, controller)
    : output.replace('</body>', `${controller}\n</body>`)

  const specFile = readdirSync(specsDirectory).find(candidate => candidate.startsWith(`${file.slice(0, -5)}.`) && candidate.endsWith('.json'))
  if (specFile) {
    const spec = JSON.parse(readFileSync(join(specsDirectory.pathname, specFile), 'utf8'))
    const nodes = spec.nodes || spec.components || spec.participants || spec.states || []
    const edges = spec.edges || spec.connections || spec.flows || spec.messages || spec.transitions || []
    let relationIndex = 0
    let identityIndex = 0
    output = output.replace(/data-animate="edge" style="--step:\d+"/g, match => {
      const edge = edges[relationIndex++]
      return edge ? match.replace('data-animate="edge"', `data-animate="edge" data-from="${edge.from}" data-to="${edge.to}"`) : match
    })
    output = output.replace(/data-animate="node" style="--step:\d+"/g, match => {
      const node = nodes[identityIndex++]
      return node ? match.replace('data-animate="node"', `data-animate="node" data-node-id="${node.id}"`) : match
    })
    if (spec.diagram_type === 'workflow' && Array.isArray(spec.mainPath)) {
      const mainSteps = new Map(spec.mainPath.map((id, index) => [id, index]))
      const edgeSteps = spec.edges.map((edge, index) => {
        const fromStep = mainSteps.get(edge.from)
        const toStep = mainSteps.get(edge.to)
        if (Number.isInteger(fromStep) && toStep === fromStep + 1) return fromStep
        if (['branch', 'async', 'error'].includes(edge.role) && Number.isInteger(fromStep)) return fromStep
        return spec.mainPath.length + index
      })
      const branchTargets = new Map(spec.edges
        .filter(edge => ['branch', 'async', 'error'].includes(edge.role) && mainSteps.has(edge.from))
        .map(edge => [edge.to, mainSteps.get(edge.from) + 1]))
      const nodeSteps = spec.nodes.map((node, index) => mainSteps.get(node.id) ?? branchTargets.get(node.id) ?? spec.mainPath.length + index)
      let edgeIndex = 0
      let nodeIndex = 0
      output = output.replace(/data-animate="edge" data-from="[^"]+" data-to="[^"]+" style="--step:\d+"/g, match => match.replace(/--step:\d+/, `--step:${edgeSteps[edgeIndex++]}`))
      output = output.replace(/data-animate="node" data-node-id="[^"]+" style="--step:\d+"/g, match => match.replace(/--step:\d+/, `--step:${nodeSteps[nodeIndex++]}`))
    }
  }
  const source = readFileSync(path, 'utf8')
  if (output !== source) {
    writeFileSync(path, output)
    updated += 1
  }
}

console.log(`Architecture narrative flow ready: ${updated} file(s) updated`)
