import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const directory = new URL('../arsitektural/diagrams/', import.meta.url)
const markerStart = '    /* Voyager node interaction: idle by default, active on pointer only. */'
const markerEnd = '    /* End Voyager node interaction. */'
const styles = `${markerStart}
    svg[data-animation="trace"] [data-animate="node"] {
      animation: none;
      cursor: pointer;
      transition: filter 180ms ease, stroke-width 180ms ease, opacity 180ms ease;
    }
    svg[data-animation="trace"] [data-animate="node"]:hover {
      filter: drop-shadow(0 0 9px var(--arrow-emphasis));
      stroke-width: 2.4;
    }
    svg[data-animation="trace"] text {
      pointer-events: none;
    }
    @media (prefers-reduced-motion: reduce) {
      svg[data-animation="trace"] [data-animate="node"] {
        transition: none;
      }
    }
${markerEnd}`

let updated = 0
for (const file of readdirSync(directory).filter(file => file.endsWith('.html'))) {
  const path = join(directory.pathname, file)
  const source = readFileSync(path, 'utf8')
  const existing = new RegExp(`${markerStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${markerEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
  const output = existing.test(source)
    ? source.replace(existing, styles)
    : source.replace('  </style>', `${styles}\n  </style>`)
  if (output !== source) {
    writeFileSync(path, output)
    updated += 1
  }
}

console.log(`Architecture node hover styles ready: ${updated} file(s) updated`)
