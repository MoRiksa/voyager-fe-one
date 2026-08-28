# Voyager One

Voyager One adalah workspace riset finansial Vue untuk mendemonstrasikan alur riset IDX secara end-to-end di frontend. Implementasi saat ini siap digunakan untuk pengujian alur produk dengan data fixture lokal, bukan untuk analisis pasar produksi.

## Status saat ini

- Alur frontend lengkap: membuat brief, menjalankan simulasi, memantau sesi, meninjau funnel, membandingkan kandidat, membuka analisis perusahaan, memeriksa aktivitas dan audit, serta mengekspor laporan.
- Dataset `prototype-fixture-v1` berisi delapan perusahaan: BBCA, BMRI, ICBP, UNTR, AMRT, BBRI, TLKM, dan ASII.
- Penyaringan deterministik hanya memakai field yang tersedia pada fixture. Keanggotaan simbol pada setiap tahap menjadi sumber yang sama untuk kandidat, perbandingan, audit, dan laporan.
- `ResearchBrief`, status, artefak, klarifikasi, dan maksimum lima sesi terakhir disimpan di `localStorage` dengan kontrak penyimpanan versi 2.
- Skor kualitas dan breakdown faktor adalah nilai yang tersimpan pada fixture. Frontend tidak menghitung skor pasar langsung, tidak memanggil Sectors API, dan tidak mengukur kuota, kredit, atau latensi nyata.

## Alur dan pemulihan

Kontrak status mencakup `IDLE`, tahap eksekusi simulasi, `NEEDS_INPUT`, `PARTIAL`, `CANCELLED`, `COMPLETED`, dan `FAILED`. Kandidat, funnel akhir, dan laporan baru terlihat setelah sesi selesai; hasil parsial hanya ditampilkan bila artefaknya memang tersedia.

Sesi yang dibatalkan, parsial, atau gagal dapat dijalankan ulang. Klarifikasi, brief, dan hasil yang sudah tersimpan dipulihkan setelah refresh. Berpindah sesi saat simulasi berjalan menghentikan eksekusi lama dan mempertahankannya sebagai hasil parsial.

## Rute dan fitur

| Rute | Fungsi |
| --- | --- |
| `/` | Ringkasan dan titik masuk riset |
| `/research` | Pustaka sesi: cari, filter, buka, duplikasi, dan hapus |
| `/research/new` | Brief, template aturan, universe aktual, dan validasi tujuan |
| `/research/:id` | Status, progress, brief tersimpan, pemulihan, dan langkah berikutnya |
| `/research/:id/screener` | Tahap, simbol lolos/tidak lolos, alasan, dan pengurutan |
| `/research/:id/peers` | Pilihan kandidat, kelompok metrik, pengurutan, dan tampilan relatif bila valid |
| `/research/:id/company/:symbol` | Dossier, DuPont fixture, bukti, serta data opsional atau empty state |
| `/research/:id/activity` | Aktivitas sesi dalam bahasa pengguna |
| `/research/:id/trace` | Payload audit fixture dan metadata teknis |
| `/research/:id/report` | Bagian laporan dan ekspor print, Markdown, atau JSON |
| `/methodology` dan `/glossary` | Interpretasi metode dan istilah finansial |

Rute global kompatibel juga tersedia untuk screener, peers, company, activity, trace, dan report. Rute tidak dikenal menampilkan halaman 404.

## Provenance dan data opsional

Komponen data menampilkan sumber, periode finansial, tanggal harga, dan waktu laporan bila tersedia. Audit fixture mencatat input, kriteria, dan simbol yang dipertahankan dengan `durationMs: 0` dan `creditCost: 0`; event tersebut bukan invocation Sectors API.

Data lanjutan seperti performa harga, estimasi forward, segmen, ESG, kepemilikan, dividen, dan tren bersifat kondisional per perusahaan. UI menampilkan empty state dan keterbatasan saat field tidak tersedia. Ekspor JSON menyatukan laporan, funnel, audit, dan identitas dataset untuk penelusuran.

## Aksesibilitas

- Navigasi desktop dan mobile, skip link, landmark utama, `aria-current`, status live, label form, serta error terasosiasi.
- Dialog mengelola penamaan, isolasi background, focus trap, Escape, dan focus return.
- Tabel memakai caption dan header scope; toggle dan bagian expandable mengekspos state yang sesuai.
- Target sentuh utama minimal 44 piksel, tampilan hasil responsif, dan `prefers-reduced-motion` dihormati.

Target produk adalah WCAG 2.2 AA. Audit screen reader formal dan validasi visual produksi pada seluruh kombinasi perangkat masih berada di luar cakupan fixture frontend saat ini.

## Menjalankan proyek

Prasyarat: Node.js yang kompatibel dengan Vite 8 dan npm.

```bash
npm install
npm run dev
```

Perintah verifikasi:

```bash
npm run build
npm run test:smoke
npm run test:interaction
```

`test:smoke` memeriksa 19 rute dan render utama bila Chrome atau Chromium tersedia. `test:interaction` mencakup brief dan persistence, gating hasil, pembatalan dan retry, pemulihan klarifikasi, funnel, provenance, peer controls, dialog keyboard, navigasi mobile, ekspor, pustaka, dan penghapusan; tes ini dilewati bila Chrome atau Chromium tidak terpasang.

Preview build lokal:

```bash
npm run preview
```

## Batas produksi

Frontend fixture tidak mencakup universe 900+ emiten, data live, normalisasi sektor terverifikasi, perhitungan skor dari laporan keuangan, invocation audit Sectors API, latensi terukur, autentikasi, database server, atau kuota nyata. Integrasi backend/API harus mengganti sumber fixture dan simulasi eksekusi sambil mempertahankan kontrak `ResearchBrief`, status, provenance, hasil atomik, serta state error dan pemulihan yang sudah digunakan UI.
