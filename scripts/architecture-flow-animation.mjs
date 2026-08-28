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
      will-change: stroke-dashoffset, opacity;
    }
    svg[data-animation="trace"].voyager-flow-playing [data-animate="node"] {
      transform-box: fill-box;
      transform-origin: center;
      animation: voyager-node-flow 1.65s cubic-bezier(.22, .8, .24, 1) 1 both;
      animation-delay: calc(var(--step, 0) * 820ms);
      will-change: filter, stroke-width, opacity;
    }
    @keyframes voyager-node-flow {
      0% { filter: none; stroke-width: 1.5; opacity: .82; }
      20%, 72% {
        filter: drop-shadow(0 0 11px var(--arrow-emphasis));
        stroke-width: 2.5;
        opacity: 1;
      }
      100% { filter: none; stroke-width: 1.5; opacity: .9; }
    }
    @keyframes voyager-edge-stream {
      0% { stroke-dashoffset: 60; opacity: .64; }
      50% { opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: .64; }
    }
    @media (prefers-reduced-motion: reduce) {
      svg[data-animation="trace"] [data-animate] {
        animation: none !important;
        filter: none;
        opacity: 1;
        stroke-dashoffset: 0;
      }
    }
${markerEnd}`

const controller = `${scriptStart}
  <script>
    (function () {
      var svg = document.querySelector('svg[data-animation="trace"]');
      if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      var items = Array.from(svg.querySelectorAll('[data-animate]'));
      var maxStep = items.reduce(function (max, item) {
        var value = Number.parseInt(item.style.getPropertyValue('--step'), 10);
        return Number.isFinite(value) ? Math.max(max, value) : max;
      }, 0);
      var cycleMs = maxStep * 820 + 3600;
      var timer;
      function play() {
        window.clearTimeout(timer);
        svg.classList.remove('voyager-flow-playing');
        void svg.getBoundingClientRect();
        svg.classList.add('voyager-flow-playing');
        timer = window.setTimeout(play, cycleMs);
      }
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) window.clearTimeout(timer);
        else play();
      });
      play();
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
      output = output.replace(/data-animate="edge" style="--step:\d+"/g, match => match.replace(/--step:\d+/, `--step:${edgeSteps[edgeIndex++]}`))
      output = output.replace(/data-animate="node" style="--step:\d+"/g, match => match.replace(/--step:\d+/, `--step:${nodeSteps[nodeIndex++]}`))
    }
  }
  const source = readFileSync(path, 'utf8')
  if (output !== source) {
    writeFileSync(path, output)
    updated += 1
  }
}

console.log(`Architecture narrative flow ready: ${updated} file(s) updated`)
