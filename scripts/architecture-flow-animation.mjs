import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const directory = new URL('../arsitektural/diagrams/', import.meta.url)
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
    svg[data-animation="trace"].voyager-flow-playing [data-animate="node"] {
      transform-box: fill-box;
      transform-origin: center;
      animation: voyager-node-flow 900ms ease-in-out 1 both;
      animation-delay: calc(var(--step, 0) * 650ms);
    }
    svg[data-animation="trace"].voyager-flow-playing [data-animate="edge"] {
      stroke-dasharray: 10 8;
      animation: voyager-edge-flow 900ms ease-in-out 1 both;
      animation-delay: calc(var(--step, 0) * 650ms);
    }
    @keyframes voyager-node-flow {
      0%, 100% { filter: none; stroke-width: 1.5; opacity: 1; }
      28%, 68% {
        filter: drop-shadow(0 0 10px var(--arrow-emphasis));
        stroke-width: 2.6;
        opacity: 1;
      }
    }
    @keyframes voyager-edge-flow {
      0% { stroke-dashoffset: 54; opacity: .38; }
      35%, 72% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: 0; opacity: .72; }
    }
    @media (prefers-reduced-motion: reduce) {
      svg[data-animation="trace"].voyager-flow-playing [data-animate] {
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
      var cycleMs = maxStep * 650 + 2700;
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
  const source = readFileSync(path, 'utf8')
  if (output !== source) {
    writeFileSync(path, output)
    updated += 1
  }
}

console.log(`Architecture narrative flow ready: ${updated} file(s) updated`)
