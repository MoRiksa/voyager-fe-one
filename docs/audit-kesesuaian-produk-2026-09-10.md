# Audit Kesesuaian Produk Voyager One

Tanggal: 2026-09-10

Status: hasil audit; rekomendasi belum diimplementasikan melalui dokumen ini.

Baseline yang diperiksa:
- Frontend: `705e7b0`.
- Backend: `6226bdd`.
- Frontend production: https://voyager-fe-one.vercel.app
- Backend production: https://voyager.pascalyx.web.id

## 1. Kesimpulan

**Voyager One belum memenuhi harapan utama sebagai market intelligence yang dapat dipercaya pengguna nonteknis untuk menentukan saham yang layak diteliti sebelum membeli.**

Navigasi sudah lebih sederhana dan eksekusi backend sudah berjalan. Namun tujuan pengguna belum konsisten menjadi aturan seleksi. Scoring, periode data, provenance, fallback, dan kesimpulan laporan masih memiliki ketidaksesuaian material.

Produk saat ini lebih tepat disebut prototipe riset fundamental dengan eksekusi backend dan sebagian data provider nyata. Kelulusan build, tests, serta deployment tidak membuktikan validitas analisis atau kesesuaian produk secara menyeluruh.

Prioritas berikutnya adalah kebenaran hasil dan kejujuran respons saat gagal, sebelum polish visual tambahan.

## 2. Tujuan dan cakupan audit

Kebutuhan pengguna:

> Saya ingin membeli saham, tetapi beli yang mana?

Voyager One perlu menerjemahkan kebutuhan tersebut menjadi shortlist yang relevan, alasan prioritas, risiko, keterbatasan bukti, dan langkah riset berikutnya. Dokumen produk membatasi keluaran sebagai dukungan riset/due diligence, bukan instruksi transaksi, sizing, atau timing.

Audit mencakup:
- Dokumen utama frontend dan tujuan awal produk.
- Frontend, backend, dan integrasi authoritative state.
- Discovery, kelengkapan data, screening, ranking, dan sintesis akhir.
- Formula scoring, confidence, periode, dan provenance.
- Fallback provider, LLM, adapter frontend, dan ekspor.
- UI, UX, CX, struktur, hierarki, serta pengalaman pemula non-IT.
- Production melalui browser desktop 1440 × 900 dan mobile 390 × 844.

Audit tidak mengubah kode maupun membuat, menjalankan ulang, atau menghapus sesi production. Pemeriksaan live menggunakan navigasi dan GET. Reproduksi tertentu dilakukan terkontrol di memory tanpa provider production.

Referensi kode menggunakan path relatif terhadap repository frontend atau backend sebagaimana disebutkan. Nomor baris merujuk baseline audit dan dapat bergeser setelah perubahan.

### Dokumen acuan

- [Visi autonomous research agent](autonomous-research-agent-sectors-hackathon-final.md)
- [Arah UI/UX](ui-ux-evolution.md)
- [Jurnal delivery kanonik](jurnal-one-v1.md)
- [Backend handoff](backend-handoff.md)
- [Rekomendasi integrasi Sectors](sectors-api-integration-recommendations.md)

## 3. Alur yang dijanjikan versus aktual

Dokumen menjanjikan:

```text
Tujuan pengguna
→ strategi riset
→ screening
→ pendalaman kandidat
→ perbandingan
→ validasi bukti
→ laporan
```

Implementasi aktual lebih dekat ke:

```text
Tujuan pengguna
→ narasi rencana
→ pemeriksaan ticker terbatas
→ filter dan skor tetap
→ narasi laporan
```

**Kesenjangan utama: tujuan pengguna belum menjadi kontrak executable yang mengendalikan seleksi.**

### Bukti production

Sesi berjudul **“Bank berkualitas dengan ROE unggul”** menghasilkan:
- AADI: Energy.
- ACES: Consumer Cyclicals.

Laporan tetap menyatakan kandidat memenuhi tujuan. Informasi kriterianya juga berbeda:

| Permukaan | Informasi |
| --- | --- |
| Form bank | ROE >15% |
| Screening aktual | ROE ≥12%, D/E ≤1,8 |
| Laporan | D/E <1,5 |
| Minimum kapitalisasi dalam laporan | >Rp10 triliun |
| Kapitalisasi ACES yang ditampilkan | Rp6,1 triliun |

Respons yang semestinya:

> Tujuan mencari bank belum terjawab. Kandidat yang ditemukan berasal dari sektor energi dan retail, sehingga tidak dapat digunakan sebagai shortlist bank.

Status proses selesai harus dibedakan dari status pemenuhan tujuan.

## 4. Screening dan sintesis

| Fase | Aktual | Kesenjangan |
| --- | --- | --- |
| Discovery | Maksimal delapan ticker dengan prioritas hardcoded | Tidak mewakili pencarian pasar yang dijanjikan |
| Kelengkapan data | Memeriksa angka wajib | Validasi periode, unit, dan kesetaraan belum memadai |
| Financial screening | Filter tetap ROE dan D/E | Sektor, FCF positif, market cap, dan banyak kriteria preset tidak diterapkan |
| Ranking | Tiga faktor dengan threshold ≥80 | Belum sector-relative atau menilai kecocokan tujuan |
| Sintesis akhir | Menggunakan metrik yang sama untuk narasi | Deep research, peer benchmark, dan validasi belum sekuat labelnya |

### Temuan

1. Discovery dapat memasukkan ticker yang tidak ada pada hasil provider ketika hasilnya sedikit. Hasil kemudian dipangkas tanpa penjelasan cakupan yang memadai.
2. Objective diterima oleh fungsi screening tetapi tidak menentukan filter aktual.
3. Preset menjanjikan pemeriksaan seperti kualitas kredit, margin, dividend yield, dan FCF yang belum menjadi input seleksi.
4. Preview memuat cakupan dan estimasi tetap, bukan hasil perhitungan rencana aktual.
5. Peer benchmark pada dasarnya memproyeksikan kandidat final; belum memiliki cohort sektor dan benchmark yang setara.
6. Semua action/pillar dapat ditandai selesai tanpa validation gate substantif untuk klaim laporan.

Bukti utama backend:
- `src/features/research/services/darwin.engine.ts:118–208`
- `src/features/research/services/darwin.engine.ts:252–455`
- `src/features/research/services/research.service.ts:249–366,643–660`
- `src/features/research/index.ts:45–107`

### Yang sudah benar

- Filter dapat menggugurkan kandidat; kandidat gagal tidak dimasukkan kembali.
- Threshold kualitas ≥80 diterapkan.
- Screening membership dan alasan tersimpan.
- Funnel report menggunakan artefak aktual.
- Dua sesi production yang diperiksa menunjukkan funnel **8 → 7 → 2 → 2 → 2**.

Funnel nyata membuktikan filter berjalan, tetapi belum membuktikan seleksi sesuai tujuan.

## 5. Scoring dan penilaian

Formula aktif:

```text
Profitability = clamp(round(ROE × 4,2), 40, 100)
Solvency      = clamp(round((2,5 − min(2,5, D/E)) × 40), 30, 100)
Valuation     = clamp(round((35 − min(35, P/E)) × 3,5), 30, 100)

Quality = round((0,25 × Profitability
               + 0,20 × Solvency
               + 0,20 × Valuation) / 0,65)
```

Bobot efektif setelah normalisasi:
- Profitabilitas: sekitar 38,46%.
- Solvabilitas: sekitar 30,77%.
- Valuasi: sekitar 30,77%.

### Masalah validitas

- P/E negatif dapat memperoleh skor valuasi maksimum.
- FCF negatif tidak menurunkan skor, meskipun sebagian tujuan menjanjikan FCF positif.
- Transformasi yang sama dipakai lintas sektor.
- Periode valuasi dan finansial dapat berbeda tanpa penolakan yang memadai.
- Confidence diturunkan dari quality score, padahal kualitas perusahaan dan kekuatan bukti adalah hal berbeda.
- Komponen DuPont dibulatkan sebelum perkalian, bukan hanya pada tampilan.
- Perkalian komponen dari laporan yang sama merupakan identitas aljabar, bukan pemeriksaan silang independen.

Reproduksi terkontrol menghasilkan **100/100 dan HIGH** untuk input dengan P/E negatif, FCF negatif, serta periode berbeda. Ini membuktikan kelemahan validasi, bukan bahwa seluruh skor production salah.

**Skor 98/100 tidak boleh ditafsirkan sebagai peluang untung, akurasi, atau confidence 98%.**

### Ketidakkonsistenan frontend

- Methodology menjelaskan tiga faktor aktif.
- Glossary dan peers masih menjelaskan lima faktor.
- Kondisi rendering faktor pada laporan salah: profitabilitas bergantung pada consistency, consistency bergantung pada growth, dan growth dapat tampil kosong.

Bukti:
- Backend `src/features/research/services/darwin.engine.ts:93–109,458–528`
- Frontend `src/views/MethodologyView.vue:83`
- Frontend `src/views/GlossaryView.vue:147–152`
- Frontend `src/components/PeerComparisonWorkbench.vue:29`
- Frontend `src/components/ReportCandidateAnalysis.vue:125–165`

## 6. Fallback: dummy masih dapat muncul pada mode normal

**Ketentuan pengguna: kegagalan harus menghasilkan status dan pesan yang jelas, bukan data atau narasi buatan yang terlihat berhasil.**

### Backend

- File fixture lokal dapat digunakan meskipun mode demo dinonaktifkan.
- Origin fixture dapat berubah menjadi `cache` pada pembacaan berikutnya.
- Discovery gagal dapat diganti daftar ticker hardcoded.
- LLM gagal dapat menghasilkan narasi fallback positif.
- Provider gagal dapat berakhir sebagai laporan kosong berstatus `COMPLETED`.

Reproduksi origin dengan mode demo dinonaktifkan:

```text
Pembacaan pertama: demo-fixture
Pembacaan kedua: cache
Referensi kedua: endpoint company report provider
```

### Frontend

- Bootstrap tanpa sesi lokal membuat sesi fixture berstatus selesai.
- Field kosong dapat diisi sektor Financials, subsektor Banks, confidence HIGH, dan narasi positif.
- Cakupan kosong dapat menjadi 914 emiten.
- Timestamp kosong dapat diganti waktu saat ini.
- Ekspor gagal dapat beralih ke dokumen lokal dengan provenance hardcoded.

Bukti:
- Backend `src/features/research/services/sectors.client.ts:202–238,252–349,373–397,471–476`
- Backend `src/features/research/services/llm.client.ts:47–56`
- Backend `src/features/research/services/research.service.ts:868–888`
- Frontend `src/stores/researchStore.ts:415–478,634–685`
- Frontend `src/views/ReportView.vue:133–148,232–248`

Cabang fallback terbukti dari kode; perubahan origin direproduksi terkontrol. Audit tidak membuktikan semua cabang sedang terpicu pada production atau bahwa file fallback lokal tersedia di server.

### Respons yang diwajibkan

| Kondisi | Respons yang diharapkan |
| --- | --- |
| Provider gagal | Data belum dapat diambil; screening belum selesai |
| Tidak ada kandidat lolos | Tidak ada perusahaan memenuhi kriteria, dengan alasan seleksi |
| Metrik tidak tersedia | Belum dapat dinilai karena data tertentu tidak tersedia |
| LLM gagal | Ringkasan AI belum tersedia; hasil perhitungan tetap dapat dibaca |
| Cache nyata dipakai | Tampilkan sumber, waktu snapshot, dan batas kesegaran |
| Ekspor gagal | Jelaskan kegagalan tanpa mengganti hasil diam-diam |

Cache data nyata berbeda dari dummy. Cache boleh dipakai dengan provenance dan tanggal yang jelas. Perusahaan, angka, confidence, dan narasi pengganti tidak boleh diciptakan untuk menutupi kegagalan.

## 7. Integrasi dan keandalan

### Yang berjalan

- Backend menjalankan proses melalui worker.
- Frontend membaca snapshot authoritative.
- Health dan endpoint production yang diperiksa menghasilkan HTTP 200.
- Candidate formula version dan freshness metadata tersedia.
- Cache provider live memakai temporary file dan rename.

### Blocker dan risiko

| Prioritas | Temuan | Bukti |
| --- | --- | --- |
| Tinggi | Memilih template mengunci tombol mulai karena `isSubmitting` diaktifkan sebelum submit | Frontend `src/views/NewResearchView.vue:47–53` dan reproduksi browser |
| Tinggi | Laporan valid menjadi 404 pada browser baru karena bergantung cache lokal | Frontend `src/App.vue:17–19`, `src/main.ts:13–15` dan reproduksi browser |
| Tinggi | Job failed belum selalu mengubah sesi menjadi FAILED/PARTIAL | Backend `src/features/research/services/queue.service.ts:81–99` |
| Tinggi | Kegagalan tulis disk dapat hanya dicatat setelah state memory berubah | Backend `src/features/research/repositories/research.repository.ts:60–85` |
| Tinggi | Queue memory-only; pemulihan pekerjaan setelah restart belum memadai | Backend `src/features/research/services/queue.service.ts:17–20` |
| Tinggi | Snapshot retry dapat mempertahankan report lama bersama screening attempt baru | Backend `src/features/research/services/research.service.ts:757–765` |
| Kritis untuk penggunaan publik | Identitas dan ownership belum ditegakkan; daftar sesi dapat dibaca tanpa Authorization | Backend `src/middleware/auth.guard.ts:25–78`, `src/features/research/controllers/research.controller.ts:37–53` |

Auth ditunda dalam keputusan produk sebelumnya. Temuan ini mencatat batas kelayakan deployment publik, bukan persetujuan untuk memperluas implementasi auth melalui audit ini.

## 8. Provenance, periode, dan ekspor

### Bukti production

- AADI memakai FY2023, ACES FY2019.
- Waktu pengambilan ditampilkan pada September 2026.
- Narasi menyebut laporan provider terbaru.
- Tanggal harga tidak terlihat meskipun harga terakhir ditampilkan.
- Label Data contoh, Sectors API, Prototype fixture, dan Voyager derived saling bertentangan antarhalaman.
- Tool-call trace kosong pada sesi selesai yang diperiksa.

### Dampak

Fetch baru dapat terlihat seperti fundamental baru. Label derived menjelaskan perhitungan, bukan membuktikan asal data mentah. Trace kosong tidak membuktikan tidak ada kegagalan.

### Perbaikan

- Pisahkan periode keuangan, harga per tanggal, dan waktu pengambilan.
- Tampilkan perbedaan periode dekat ranking.
- Render sumber dari metadata artefak, bukan string hardcoded.
- Gunakan status asal tidak tersedia bila metadata hilang.
- Ekspor harus memakai snapshot, formula, dan provenance yang sama dengan UI.
- Nyatakan jejak eksekusi tidak tersedia ketika memang tidak diterbitkan.

Bukti frontend:
- `src/components/DataProvenance.vue:8–20,52–79`
- `src/components/AppSidebar.vue:108–109`
- `src/components/CandidateCard.vue:78–80`
- `src/views/CompanyView.vue:121–128`
- `src/views/ReportView.vue:362,648`
- `src/views/TraceView.vue:11–12,26–27,58–82`

## 9. UI, UX, CX, dan desain

### Yang dipertahankan

- Navigasi utama yang lebih sederhana.
- Empat bagian laporan.
- Preferensi lanjutan yang dilipat.
- Penjelasan rasio dalam bahasa sederhana.
- Layout mobile yang diperiksa tidak mengalami overflow halaman.
- Fondasi semantic HTML, skip link, tombol native, dan keyboard tab laporan.

### Kesenjangan untuk pengguna nonteknis

1. Skor dan rasio mendahului jawaban mengapa kandidat relevan.
2. Label TERBAIK/TERBURUK dipakai untuk kandidat berbeda sektor dan periode.
3. Warning keterbandingan dan sumber menghilang pada peers mobile karena berada dalam container desktop-only.
4. Beranda mengulang konteks sesi terakhir, aktif, laporan, kandidat, dan riset terbaru.
5. Dossier sangat panjang dengan banyak section kosong; pada pengukuran mobile sekitar 7.646 px.
6. Informasi teknis masih muncul tanpa membantu tugas pengguna.
7. Route perusahaan global bergantung pada kandidat sesi aktif sehingga pesan perusahaan tidak ditemukan dapat menyesatkan.
8. Scheduler masih menampilkan istilah jadwal berikutnya meskipun timer otomatis belum aktif.

Bukti frontend:
- `src/components/PeerComparisonWorkbench.vue:127–136,193–267`
- `src/views/HomeView.vue:110–137`
- `src/views/CompanyView.vue:29,93–96,123–161`
- `src/views/ReportView.vue:372–397`
- `src/views/SchedulesView.vue:43–45`

### Arah desain

Pertahankan identitas biru/slate dan struktur workspace. Redesign visual total belum diperlukan.

Ubah hierarki menjadi:
1. Kecocokan kandidat terhadap tujuan.
2. Alasan utama diprioritaskan.
3. Risiko yang dapat menggugurkan kesimpulan.
4. Informasi yang belum diketahui.
5. Metrik pendukung.
6. Bukti dan metode lanjutan.

Gunakan “tertinggi dalam pilihan ini” sebagai pengganti “terbaik” bila hanya membandingkan ekstrem numerik. Ringkas kelompok data tambahan yang kosong dalam disclosure. Informasi material tentang periode, kualitas data, dan keterbandingan harus tetap terlihat pada mobile.

Audit layout didasarkan pada DOM, ukuran, dan CSS. Ini bukan audit pixel-perfect atau sertifikasi WCAG 2.2 AA; screen reader formal dan contrast audit lengkap belum dilakukan.

## 10. Alur produk yang direkomendasikan

### Langkah 1 — Mulai dari kebutuhan

> Temukan saham yang layak Anda teliti lebih lanjut.

Sediakan pilihan tujuan yang benar-benar didukung dan input bahasa biasa. Satu CTA utama: Susun riset.

### Langkah 2 — Konfirmasi pemahaman

Tampilkan:
- Yang akan dicari.
- Kriteria yang benar-benar dapat diperiksa.
- Kriteria yang belum didukung.
- Cakupan aktual perusahaan.

Jangan menjanjikan pemeriksaan hanya karena tertulis dalam preset.

### Langkah 3 — Screening yang setia pada kriteria

Gunakan kontrak aturan yang sama untuk preview, plan, eksekusi, dan laporan. Simpan alasan retained/excluded. Bedakan tidak lolos dari tidak dapat dinilai.

### Langkah 4 — Jawab tujuan terlebih dahulu

Tampilkan status pemenuhan tujuan: terjawab, belum terjawab, atau tidak dapat dinilai. Status ini terpisah dari selesainya proses komputasi.

### Langkah 5 — Kandidat dan tradeoff

Untuk setiap kandidat, jelaskan relevansi, alasan menarik, risiko utama, periode data, dan hal yang belum tersedia. Skor menjadi pendukung, bukan kesimpulan tunggal.

### Langkah 6 — Dossier dan bukti

Urutan dossier: bisnis, relevansi, risiko, valuasi/asumsi, metrik, sumber. P/E rendah belum cukup untuk menyatakan murah tanpa basis pembanding dan konteks risiko.

### Langkah 7 — Laporan keputusan riset

Halaman pertama harus menjelaskan pertanyaan, jawaban beserta batasnya, kandidat prioritas, risiko material, kebutuhan pembaruan data, dan langkah riset berikutnya. Ekspor harus identik secara substansi dengan snapshot UI.

## 11. Prioritas dan acceptance criteria

| Urutan | Pekerjaan | Bukti selesai |
| --- | --- | --- |
| 1 | Hilangkan dummy dan narasi positif buatan pada mode normal | Outage dan payload tidak lengkap menghasilkan unavailable/error; tidak ada fixture otomatis atau origin berubah menjadi provider |
| 2 | Perbaiki template lock dan deep link | Setiap template tetap memungkinkan submit; laporan valid terbuka pada browser baru; koneksi gagal tidak menjadi 404 |
| 3 | Satukan objective, preview, screening, dan laporan | Seluruh permukaan memakai aturan sama; tujuan unsupported dijelaskan; riset bank tidak dinyatakan terpenuhi oleh non-bank |
| 4 | Validasi formula dan periode | P/E tidak bermakna ditangani; periode mismatch dijelaskan; quality score dipisahkan dari evidence confidence; formula konsisten di semua tampilan |
| 5 | Satukan provenance, kegagalan, dan ekspor | Sumber serta tanggal konsisten; failed job menghasilkan state sesi yang dapat dipulihkan; ekspor tidak mengganti provenance |
| 6 | Susun ulang ringkasan keputusan | Pemula dapat menjelaskan relevansi, risiko, kemutakhiran data, dan hal yang belum diketahui tanpa membuka audit teknis |

Durability publikasi serta akses publik perlu ditangani sesuai keputusan scope sebelum penggunaan lebih luas.

## 12. Batas bukti dan status verifikasi

- Backend typecheck dijalankan dan lulus dalam audit.
- Full backend test suite tidak dijalankan ulang dalam audit ini. Catatan 49 tests lulus berasal dari batch implementasi sebelumnya.
- Test hijau sebelumnya membuktikan bagian lifecycle dan filter, bukan validitas investasi, objective fidelity, atau akurasi prediksi.
- Audit live tidak memaksa outage, membuat sesi, atau memanggil LLM production.
- Sebagian fallback terbukti dari kode dan reproduksi memory, bukan kejadian outage production.
- Label live/cache pada artefak tidak menjadi verifikasi independen kebenaran data provider.
- README dan sebagian tabel baseline jurnal masih memuat status lama; perlu diselaraskan dengan status implementasi dan keputusan terbaru.

**Ukuran keberhasilan produk:** setelah membaca ringkasan, pengguna pemula dapat menjawab dengan benar: mengapa kandidat relevan, apa risikonya, seberapa mutakhir datanya, dan apa yang belum diketahui.
