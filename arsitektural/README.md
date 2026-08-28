# Voyager One Architecture Atlas

Dokumentasi visual mandiri untuk arsitektur frontend dan kontrak backend Voyager One.

## Menjalankan

Dari root repository:

```bash
npx vite arsitektural
```

Build aplikasi utama otomatis menyalin atlas ke `dist/arsitektural`, sehingga entry point deployment tersedia di `/arsitektural/`.

Buka URL yang dicetak, lalu gunakan sidebar untuk berpindah di antara sembilan diagram. Navigasi memakai hash route sehingga dapat dibuka langsung, misalnya `#/sequence` atau `#/data-flow`.

Setiap file di `diagrams/` adalah output Archify mandiri dengan:

- tema gelap/terang, tersimpan di `localStorage`;
- animasi trace yang menghormati `prefers-reduced-motion`;
- ekspor PNG, JPEG, WebP, dan SVG;
- shortcut `T` untuk tema dan `E` untuk ekspor.

Audit overlap seluruh diagram pada viewport desktop dan mobile:

```bash
npm run test:architecture
```

Source diagram tersedia di `specs/`. Render ulang dari folder skill Archify:

```bash
node bin/archify.mjs render <type> <input.json> <output.html>
node bin/archify.mjs check <output.html>
```

Setelah render ulang, terapkan interaction polish agar node diam saat idle dan hanya menyala ketika ditunjuk:

```bash
npm run architecture:polish
```

## Diagram

| Route | Perspektif | Renderer Archify |
| --- | --- | --- |
| `#/activity` | Activity Diagram | workflow |
| `#/decision` | Decision Diagram | lifecycle |
| `#/data-flow` | Data Flow Diagram | dataflow |
| `#/system-flow` | Sistem Flow Diagram | architecture |
| `#/class` | Class Diagram | architecture |
| `#/use-case` | Use Case Diagram | architecture |
| `#/sequence` | Sequence Diagram | sequence |
| `#/timing` | Timing Diagram | sequence |
| `#/interaction-overview` | Interaction Overview Diagram | workflow |

Kontrak produksi yang menjadi sumber utama: [`../docs/backend-handoff.md`](../docs/backend-handoff.md).
