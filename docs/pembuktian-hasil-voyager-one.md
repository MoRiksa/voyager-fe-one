# Pembuktian Hasil Voyager One

## 1. Status dan tujuan

| Field | Nilai |
| --- | --- |
| Dibuat | 2026-09-10 |
| Terakhir diperbarui | 2026-09-11 |
| Status | P0 diimplementasikan dan lulus LOCAL pada kontrak terbatas; validitas pasar nyata, uji pengguna, production, dan public readiness belum lulus. |
| Baseline audit frontend | `705e7b0` |
| Baseline audit backend | `6226bdd` |

Dokumen ini mencatat pembuktian perbaikan sepanjang pengerjaan, bukan hanya laporan di akhir. Kode selesai, tests hijau, dan deployment sukses tidak otomatis membuktikan akurasi finansial, kesesuaian tujuan, atau kemudahan penggunaan.

### Hubungan dokumen

- [Audit kesesuaian produk](audit-kesesuaian-produk-2026-09-10.md): masalah, bukti awal, dampak, dan prioritas.
- [Rekomendasi layout/redesign](rekomendasi-layout-redesign-2026-09-10.md): target pengalaman pengguna dan kriteria penerimaan.
- **Dokumen ini:** perubahan, skenario pemeriksaan, hasil aktual, bukti, dan kekurangan yang tersisa.
- [Jurnal utama](jurnal-one-v1.md): ringkasan status proyek dan keputusan; menautkan bukti terperinci tanpa menyalinnya berulang.

## 2. Aturan pembuktian

1. Pilih ID pekerjaan dari register dan tentukan hasil yang diharapkan sebelum mengubah kode.
2. Catat perubahan serta commit frontend/backend yang relevan.
3. Jalankan skenario normal, data tidak lengkap, dan kegagalan sesuai dampak perubahan.
4. Catat hasil aktual beserta bukti, tanggal, lingkungan, serta batas pengujian.
5. Setelah deploy, tambahkan verifikasi production untuk perilaku yang bergantung deployment atau integrasi.
6. Perbarui status register, riwayat verifikasi, dan ringkasan jurnal utama.

Ketentuan:
- Temuan audit adalah bukti masalah awal, bukan bukti perbaikan.
- Pengujian lokal tidak dinyatakan sebagai bukti production.
- Mock/fixture boleh dipakai sebagai input pengujian terisolasi dan diberi label. Itu tidak membenarkan fallback dummy pada mode produk normal.
- Build/typecheck membuktikan aspek teknis tertentu; akurasi angka memerlukan rekonsiliasi sumber, sedangkan UX memerlukan pengujian pengguna.
- Simpan bukti yang dapat diperiksa ulang: path test, perintah, output relevan, perhitungan pembanding, atau screenshot dengan konteks. Jangan hanya mencatat “sudah dites”.
- Jangan masukkan credentials, token, data pribadi, atau isi riset privat yang tidak diperlukan ke bukti.
- Perubahan formula, kontrak data, atau alur terkait setelah kelulusan memerlukan penilaian ulang atas bukti yang terdampak.
- Jangan menimpa hasil gagal dengan hasil lulus. Tambahkan putaran verifikasi agar riwayat perbaikan dapat ditelusuri.

### Status pekerjaan

| Status | Arti |
| --- | --- |
| Belum dikerjakan | Belum ada perbaikan pasca-audit yang dicatat untuk ID ini |
| Dalam pengerjaan | Implementasi atau investigasi lanjutan sedang dilakukan |
| Diimplementasikan, belum diverifikasi | Perubahan tersedia, tetapi bukti penerimaan belum lengkap |
| Lulus verifikasi | Seluruh kriteria pada lingkup yang dinyatakan terpenuhi dan memiliki bukti |
| Gagal verifikasi | Setidaknya satu kriteria yang diuji tidak terpenuhi |
| Terhambat | Pemeriksaan atau implementasi tidak dapat dilanjutkan; alasan dan keputusan yang diperlukan dicatat |

Kelulusan harus menyebut lingkupnya. Jika baru lokal, tandai hasil lokal lulus pada catatan pemeriksaan; jangan menyatakan penerimaan production selesai. Pekerjaan yang ditunda tetap terbuka dengan referensi keputusan, bukan diberi status lulus.

## 3. Register pembuktian

Status berikut merujuk pada lingkup pembuktian pasca-audit, bukan keberadaan fitur sebelum audit.

| ID | Prioritas | Cakupan dan referensi | Status aktual |
| --- | --- | --- | --- |
| V-01 | P0 | Fallback tanpa dummy; audit §6, redesign §6 dan §7.7 | Lulus LOCAL pada skenario terisolasi; production belum diuji |
| V-02 | P0 | Form dan tautan langsung; audit §7, redesign §7.3 dan §7.7 | Lulus LOCAL |
| V-03 | P0 | Kesesuaian tujuan sampai laporan; audit §3–4, redesign §7.5 | Lulus LOCAL untuk objective kanonik generic dan bank; objective lain tetap unsupported |
| V-04 | P1 | Akurasi sumber, satuan, periode, dan perhitungan; audit §5 dan §8 | Dalam pengerjaan; input sintetis lulus, emiten nyata belum direkonsiliasi |
| V-05 | P1 | Validitas scoring dan pembanding; audit §5, redesign §7.6 | Dalam pengerjaan; formula konsisten, validitas finansial belum dibuktikan |
| V-06 | P1 | Kualitas narasi dan kekuatan bukti; audit §4–6 dan §8 | Diimplementasikan, belum diverifikasi dengan provider nyata |
| V-07 | P1 | Provenance dan ekspor konsisten; audit §8, redesign §6 | Lulus sebagian LOCAL; race revision dan lintas browser belum diuji |
| V-08 | P1 | Kegagalan, pemulihan, dan durability end-to-end; audit §7 | Lulus sebagian LOCAL; durability production belum diuji |
| V-09 | P1 | Alur nonteknis dan pemisahan operasional; redesign §3–7 | Lulus sebagian LOCAL; uji pengguna belum dilakukan |
| V-10 | P1 | Pemahaman pengguna, mobile, dan aksesibilitas; redesign §9 | Dalam pengerjaan; keyboard/mobile otomatis lulus, uji manusia belum |
| V-11 | P1 | Kesiapan penggunaan publik; audit §7 | Terhambat keputusan auth/ownership dan pengujian restore |

P0: kegagalan mendasar yang membuat alur tidak berjalan atau hasil menyesatkan. P1: diperlukan untuk keandalan analisis, pengalaman, atau penggunaan yang ditargetkan. Prioritas pengerjaan tidak mengurangi tingkat risiko temuan akses publik.

## 4. Kriteria dan skenario per ID

### V-01 — Fallback tanpa dummy

**Hasil yang diharapkan:** mode normal tidak membuat perusahaan, angka, confidence, atau narasi positif pengganti ketika sumber gagal.

Skenario:
- Provider timeout, HTTP error/rate limit, respons kosong, dan payload parsial.
- LLM tidak tersedia atau mengembalikan struktur tidak valid.
- Browser baru saat backend tidak tersedia.
- Cache nyata tersedia, kedaluwarsa, atau tidak tersedia.
- Ekspor backend gagal.

Kriteria lulus:
- Tidak ada fixture otomatis atau universe hardcoded pengganti pada alur normal.
- Origin tidak berubah dari fixture menjadi live/cache provider pada pembacaan berulang.
- Data yang tidak tersedia tetap tidak tersedia, bukan nol atau nilai sehat.
- Pesan membedakan kegagalan sumber, narasi belum tersedia, dan nol kandidat yang benar-benar lolos filter.
- Cache nyata mempertahankan asal, waktu snapshot, dan batas kesegaran.

### V-02 — Form dan tautan langsung

**Hasil yang diharapkan:** jalur awal dan pembukaan kembali laporan tidak bergantung pada state browser sebelumnya.

Skenario:
- Pilih setiap template, ubah tujuan, kemudian mulai riset.
- Klik mulai berulang dan ulangi setelah request gagal.
- Buka URL laporan valid pada browser context baru.
- Buka ID tidak ditemukan dan simulasi koneksi gagal pada URL valid.

Kriteria lulus:
- Pemilihan template tidak mengaktifkan busy state submit.
- Busy state berakhir dengan hasil atau pesan kegagalan yang sesuai.
- Tautan valid memuat sesi berdasarkan ID sesuai model akses produk.
- Loading, gangguan koneksi, dan 404 dibedakan.
- Draft tidak hilang dan pengiriman tindakan yang sama tidak membuat duplikasi.

### V-03 — Kesesuaian tujuan sampai laporan

**Hasil yang diharapkan:** objective, preview, plan, filter, dan kesimpulan memakai kontrak kriteria yang sama.

Kasus minimum:
- Bank dengan keuangan sehat.
- Perusahaan dengan dividen berkelanjutan.
- Perbandingan dua saham tertentu.
- Tujuan umum dari pemula yang memerlukan klarifikasi.
- Tujuan atau metrik yang belum didukung.
- Tidak ada kandidat lolos dan discovery hanya memiliki sedikit anggota.

Kriteria lulus:
- Setiap klaim “memenuhi tujuan” memiliki bukti pemeriksaan kriteria.
- Riset bank tidak dinyatakan terpenuhi oleh kandidat non-bank.
- Kriteria unsupported dijelaskan sebelum dijanjikan sebagai pemeriksaan.
- Cakupan mengikuti membership sumber; pembatasan jumlah dan alasannya dinyatakan.
- Alasan retained/excluded tersedia dan count funnel dapat direkonsiliasi.
- Status proses selesai terpisah dari pemenuhan tujuan.

### V-04 — Akurasi data dan perhitungan

**Hasil yang diharapkan:** angka dapat ditelusuri dan dihitung ulang berdasarkan definisi yang dinyatakan.

Skenario:
- Rekonsiliasi sampel perusahaan dari sektor berbeda terhadap sumber keuangan yang dapat diperiksa.
- Periksa currency, skala ribuan/jutaan, persen, tanggal harga, FY, kuartal, dan TTM.
- Hitung ulang ROE, D/E, P/E, FCF, dan DuPont sesuai definisi produk.
- Periksa laba negatif, ekuitas negatif/nol, zero debt, missing, dan periode tidak sebanding.

Kriteria lulus:
- Tabel rekonsiliasi memuat field sumber, periode, satuan, rumus, nilai aplikasi, selisih, dan penjelasan.
- Toleransi numerik ditentukan sebelum evaluasi dan sesuai pembulatan tampilan.
- Precision penuh digunakan dalam perhitungan; pembulatan tampilan tidak mengubah seleksi tanpa penjelasan.
- Periode tidak sebanding tidak dicampur diam-diam.
- Waktu pengambilan tidak disamakan dengan periode finansial atau tanggal harga.

### V-05 — Scoring dan perbandingan

**Hasil yang diharapkan:** skor memiliki makna terbatas yang jelas, dapat direproduksi, dan tidak menjadi confidence atau peluang untung.

Skenario:
- Input tepat di sekitar threshold dan perubahan kecil pada input.
- P/E negatif/nol, FCF negatif, metrik hilang, dan ekuitas tidak bermakna untuk rasio.
- Kandidat lintas sektor/periode dan cohort yang relevan bila didukung.
- Cocokkan formula backend dengan methodology, glossary, kartu, dossier, peers, dan ekspor.

Kriteria lulus:
- Faktor, alasan bobot, normalisasi, batas, dan `formulaVersion` didokumentasikan.
- Rasio tidak bermakna tidak diberi nilai terbaik otomatis.
- Missing tidak diam-diam meningkatkan skor atau confidence.
- Faktor yang tampil sesuai faktor aktif dan nilainya sendiri.
- Quality score, kelengkapan bukti, dan confidence dibedakan.
- Label perbandingan menyatakan cakupannya; keterbandingan yang tidak valid dijelaskan.

Jika kelak ada klaim prediksi return, diperlukan evaluasi historis terpisah yang mengendalikan bias pemilihan dan penggunaan informasi masa depan. Kelulusan ID ini tidak membuktikan daya prediksi investasi.

### V-06 — Narasi dan bukti

**Hasil yang diharapkan:** klaim finansial berasal dari bukti yang memadai dan tidak melampaui pekerjaan aktual.

Skenario:
- Telusuri klaim arus kas sehat, valuasi menarik, bisnis unggul, dan risiko rendah.
- Hilangkan data pendukung dalam pengujian terisolasi.
- Uji angka yang bertentangan dengan narasi dan periode sumber yang berbeda.
- Periksa klaim deep research, peer benchmark, dan validasi terhadap artefak eksekusi.

Kriteria lulus:
- Bedakan fakta sumber, perhitungan, dan interpretasi.
- Klaim material memiliki rujukan bukti serta periode yang sesuai.
- Narasi positif tidak dibuat ketika bukti hilang atau LLM gagal.
- Risiko spesifik tidak diganti disclaimer generik.
- Pemeriksaan yang tidak dilakukan tidak diberi label selesai/tervalidasi.

### V-07 — Provenance dan ekspor

**Hasil yang diharapkan:** hasil yang dibaca dan dibagikan menggunakan snapshot serta asal data yang konsisten.

Skenario:
- Bandingkan sesi, kandidat, dossier, laporan, PDF, Markdown, dan JSON.
- Periksa sumber live, cache nyata, asal tidak tersedia, serta demo terisolasi bila masih didukung.
- Ekspor saat jaringan gagal atau snapshot telah berubah.

Kriteria lulus:
- Tidak ada dataset atau label fixture hardcoded untuk hasil provider.
- Sumber, periode finansial, tanggal harga, dan waktu pengambilan konsisten.
- Formula dan snapshot yang diekspor dapat diidentifikasi.
- Kegagalan ekspor tidak menghasilkan dokumen pengganti yang menyesatkan.
- Jika salinan lokal didukung, pengguna diberi status dan waktu snapshot yang benar.

### V-08 — Kegagalan dan pemulihan end-to-end

**Hasil yang diharapkan:** tidak ada keberhasilan palsu, sesi menggantung, kehilangan data diam-diam, atau duplikasi tindakan.

Skenario di lingkungan terisolasi:
- Provider/LLM gagal di tengah proses.
- Restart backend saat pekerjaan aktif.
- Penyimpanan gagal sebelum publikasi.
- Koneksi browser putus dan tersambung kembali.
- Submit/retry berulang serta pembacaan saat retry berlangsung.

Kriteria lulus:
- Status job, attempt, sesi, dan laporan konsisten.
- Pekerjaan yang gagal memiliki status serta tindakan pemulihan yang tepat.
- Publikasi tidak diakui tersimpan bila penulisan gagal.
- Report lama dan screening attempt baru tidak tercampur sebagai satu hasil baru.
- Tindakan berulang yang sama tidak membuat pekerjaan ganda.
- Snapshot dapat dimuat kembali setelah restart sesuai kontrak durability.

Pengujian gangguan yang merusak dilakukan di lingkungan terisolasi; verifikasi production memakai pemeriksaan yang sesuai tanpa merusak data pengguna.

### V-09 — Alur nonteknis dan area operasional

**Hasil yang diharapkan:** pengguna menyelesaikan tugas tanpa memahami infrastruktur, tetapi tetap mengetahui bukti dan keterbatasan analisis.

Kriteria lulus:
- Navigasi berpusat pada mulai riset, riset tersimpan, dan bantuan.
- Log, trace, revision, queue, serta error mentah tidak muncul dalam alur pengguna biasa.
- Area operasional, jika tersedia, memiliki akses terpisah; bukan hanya tautan tersembunyi.
- Pilihan form yang ditawarkan benar-benar memengaruhi pemeriksaan atau keluaran.
- Kemajuan memakai informasi aktual tanpa persentase/estimasi buatan.
- Ringkasan menjelaskan pemenuhan tujuan, alasan, risiko, dan keterbatasan sebelum skor.
- Scheduler manual tidak menjanjikan eksekusi otomatis atau waktu berikutnya yang tidak nyata.

### V-10 — Pemahaman pengguna dan aksesibilitas

**Hasil yang diharapkan:** pemula memahami makna hasil dengan benar dan dapat menggunakan alur utama tanpa bantuan teknis.

Prosedur:
- Catat profil peserta secara anonim: pengalaman keuangan, pengalaman aplikasi, dan perangkat.
- Berikan tugas mulai riset, membaca hasil, membandingkan kandidat, membuka kembali laporan, serta memahami satu kegagalan.
- Catat keberhasilan tugas, bantuan yang diperlukan, salah tafsir, dan hambatan.
- Periksa keyboard, urutan fokus, dialog, screen reader, kontras, zoom, dan mobile.

Kriteria lulus:
- Peserta dapat menjelaskan relevansi kandidat, risiko, kemutakhiran, hal yang belum diketahui, dan langkah berikutnya.
- Tidak ada salah tafsir kritis yang belum ditangani, seperti menganggap skor sebagai jaminan untung.
- Informasi material tidak hilang pada mobile atau saat zoom.
- Alur utama dapat digunakan dengan keyboard; fokus dan pesan status dapat dipahami teknologi bantu.
- Jumlah peserta, kondisi pengujian, serta batas generalisasi dicatat. Audit DOM saja tidak dinyatakan sebagai hasil uji pengguna atau sertifikasi aksesibilitas.

### V-11 — Kesiapan penggunaan publik

**Hasil yang diharapkan:** batas akses, privasi, pemulihan, serta pemakaian layanan sesuai model deployment yang disepakati.

Periksa:
- Identitas dan kepemilikan sesi, laporan, serta ekspor.
- Akses lintas pengguna dan akses tanpa autentikasi sesuai kebijakan produk.
- Backup/restore, retensi, dan penghapusan data.
- Batas request, konkurensi, biaya per riset, dan penanganan penyalahgunaan.
- Pemisahan area operasional dan perlindungan credentials dalam bukti/log.

Kriteria lulus:
- Ada model akses eksplisit dan bukti pengujiannya.
- Data pengguna tidak terbuka di luar model tersebut.
- Restore diuji pada lingkungan yang sesuai.
- Batas penggunaan dan perilaku saat batas tercapai dapat dijelaskan.
- Risiko yang belum ditangani tetap dicatat sebagai batas rilis.

Auth sebelumnya ditunda dalam keputusan proyek. ID ini tidak otomatis mengubah keputusan tersebut. Jika implementasi menunggu persetujuan scope, catat sebagai terhambat/ditunda dengan referensi keputusan, bukan lulus.

## 5. Catatan verifikasi per putaran

### Putaran LOCAL 2026-09-11 — koreksi bank screen setelah rekonsiliasi resmi

Frontend membaca kontrak/types/OpenAPI backend sibling tanpa mengubah arsitektur terpisah.
Preset `obj-banking-moat` kini supported sebagai renderer kontrak kanonik berikut:

`Screening bank IDX berkapitalisasi pasar terbesar dengan subsektor Banks, latest common FY, ROE >= 15%, dan P/BV > 0.`

- Preview menampilkan lima kriteria backend secara utuh dan coverage maksimal delapan bank
  berkapitalisasi pasar terbesar dari structured screener provider (`limit=50`).
- Candidate/report/screener/comparison/methodology/glossary mengenali contract
  `bank-screen-contract-v1`, objectiveType `bank-screen`, formula `bank-screen-2f-v1`,
  ROE 60%, P/BV 40%, dan `bankMetrics` yang hanya menjelaskan basis scoring P/BV.
- Field/claim capital, RWA, CAR, NPL, NIM, D/E, FCF, P/E, dan DuPont tidak dirender
  untuk formula bank. Jalur
  `quality-3f-v2` generic tetap diuji dan dipertahankan.
- Preset bank memakai copy backend exact `Bank dengan ROE kuat untuk diteliti` dan bukan
  klaim bank sehat. Preset lain tetap disabled dengan alasan dari backend.

Runtime test memakai backend sibling aktual dan provider HTTP lokal sintetis. Query bank
mengembalikan 10 simbol berurutan dengan pagination `count=48`; discovery mempertahankan
delapan teratas dan mencatat `COVERAGE_LIMIT`. Report sintetis memakai array financial
FY 2018..2025 dan valuation FY 2022..2026; latest common FY yang dihasilkan adalah 2025.
Label `live` hanya berarti transport lokal melalui boundary provider backend, bukan data pasar nyata.

Rekonsiliasi independen memakai [BCA Annual Report 2025](https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf)
dan [Bank Mandiri Annual Report 2025](https://www.bankmandiri.co.id/documents/38265486/0/%5BFINAL+-+2904%5D+ANNUAL+REPORT+BMRI+2025+%281%29.pdf/da87ca86-a02b-f394-b2e4-1ff3f268c0ee?t=1777514285182).
BBCA FY2025 cocok pada empat field provider: earnings 57.537.287 juta, equity
281.687.555 juta, capital 284.351.775 juta, dan RWA 936.368.457 juta pada basis
konsolidasian. BMRI mengungkap cacat basis: earnings 56.293.950 juta dan equity
327.401.998 juta konsolidasian, tetapi capital 253.294.877 juta dan RWA 1.308.455.053
juta bank-only; angka konsolidasian resmi adalah capital 322.895.630 juta dan RWA
1.580.301.328 juta. Faktor modal karena itu dihapus dari requirement, eligibility,
scoring, output, dan klaim. Rekonsiliasi dua perusahaan ini tidak memvalidasi luas
screen ROE/PBV provider-only dan tidak melengkapi market intelligence produk.

| Perintah | Hasil aktual |
| --- | --- |
| `npm run test:canonical-flow` | LULUS: exact title/objective/contract, preview-plan-report parity, top-8 dari 48, common FY 2025, dua faktor, dan regresi generic. |
| `npm run test:interaction` | LULUS: copy backend exact, render ROE 60% dan P/BV 40%, serta larangan metrik/klaim bank yang dihapus. |
| `npx vue-tsc -b` | LULUS. |
| `npm run test:smoke` | LULUS: 21 route dirender di Chromium terhadap backend lokal tanpa runtime exception. |
| `VITE_BACKEND_URL=http://127.0.0.1:3000 npm run build` | LULUS, termasuk architecture polish tanpa perubahan, typecheck, 1859 modul, dan build 4,28s. |
| `git diff --check` | LULUS. |
| `npm run test:architecture` | GAGAL terpisah pada atlas lama: `Error: activity (desktop):`. Atlas tidak diubah; full repository suite tetap tidak diklaim hijau. |

Status: corrected bank screen **lulus seluruh gate produk LOCAL**. Kontrak bank telah
dikoreksi setelah rekonsiliasi resmi dua perusahaan. Screen ROE/PBV provider-only belum
tervalidasi independen secara luas dan market intelligence belum lengkap. Gate arsitektur
terpisah tetap gagal pada atlas lama. Tidak ada commit, push, atau deploy.

### Putaran LOCAL 2026-09-11 — frontend dengan backend baru

Frontend working tree, tanpa commit/push/deploy. Backend sibling `../voyager-be-one`
dibaca dan dijalankan tanpa perubahan kode. Acuan aktual: backend
`docs/perbaikan-audit-2026-09-10.md` dan `research-contract.ts`.

#### Perubahan minimum dan status

| ID | Implementasi dan bukti LOCAL | Batas penerimaan |
| --- | --- | --- |
| V-01 | Store tanpa bootstrap fixture, migrasi localStorage, simulasi, angka/narasi/confidence pengganti. Missing dan outage diperiksa di browser. | Belum menguji semua timeout/rate-limit/cache production. |
| V-02 | Pemilihan preset tidak mengunci submit; guard double-submit; retry start memakai sesi yang sudah dibuat dan idempotency key yang sama untuk payload yang sama. App mengambil ID dari backend sebelum render; 503 berbeda dari 404. | Idempotency lintas restart mengikuti batas backend; draft lintas reload belum durable. |
| V-03 | Preview mengirim objective, brief, presetId. Hanya preset kanonik supported. Preview/plan/report dibandingkan pada backend nyata lokal. | Bank/dividen tetap unsupported, bukan kemampuan yang telah diselesaikan. |
| V-05 | quality-3f-v2; tiga faktor dengan nilai sendiri dan bobot efektif 38,46:30,77:30,77; tanpa confidence; FCF negatif dan evidence/narrative status terlihat. Peer hanya nilai absolut, tanpa label terbaik/terburuk atau median sektor buatan. | Belum validasi empiris atau rekonsiliasi emiten nyata. |
| V-07 | Sumber, FY, tanggal harga, retrievedAt dibaca dari snapshot. Markdown/JSON hanya dari backend. Ekspor 503 menghasilkan error dan nol pemanggilan createObjectURL. | PDF memakai print browser; pagination/hasil PDF lintas browser belum diuji. Ekspor saat snapshot berubah bersamaan belum dikunci ke revision. |
| V-09 | Beranda ringkas, hasil berurutan alasan–risiko–periode/bukti–skor. Modal native. Log/trace/provenance digest tidak dirender; route operasional dialihkan ke sesi/pustaka. Scheduler tidak ditawarkan karena belum executable sesuai kontrol kanonik. | Bukan implementasi area operasional berautentikasi. Tidak ada klaim uji pemahaman pengguna. |
| V-08/V-10 | Provider gagal terlihat, snapshot retry tidak mempertahankan laporan lama; keyboard tab, Escape/focus restore dan overflow mobile diuji. | Restart/persist failure backend tidak diuji ulang; screen reader, zoom/contrast lengkap, uji pengguna belum dilakukan. |

Path utama: `src/stores/researchStore.ts`, `src/services/researchApi.ts`, `src/App.vue`,
`src/views/{NewResearchView,ResearchSessionView,ReportView,CompanyView,HomeView}.vue`,
`src/components/{CandidateCard,ReportCandidateAnalysis,DataProvenance,PeerComparisonWorkbench}.vue`.
Identitas biru/slate, Vue/Pinia/router, skip link, focus ring, dan navigasi workspace dipertahankan.

#### Lingkungan dan input

- Node v24.18.0, Chromium headless, Vite lokal. Browser desktop default dan mobile 390×844.
- `scripts/local-test-runtime.mjs` menjalankan **backend baru sesungguhnya**, provider HTTP sintetis,
  dan Vite. `SECTORS_DEMO_FIXTURES=false`; tidak ada panggilan provider/LLM production.
- Penyimpanan sesi/cache/browser di direktori temporer unik `/tmp/opencode/voyager-audit-*`;
  cwd backend terisolasi. Direktori dihapus setelah tests. Tidak memakai sesi pengguna.
- Input TEST/NEXT sintetis: earnings=123, equity=456, debt=0, P/E=5, P/BV=2,
  FCF=-100, market cap=100000, FY2025, harga 2026-09-09. Hasil Q=100,
  FCF yield=-0,1%, D/E=0, evidence single-source-unverified, tanpa confidence.
- Label backend `live/cache` dalam tests berarti transport provider HTTP lokal, **bukan data pasar nyata**.
- Incomplete memakai MISS tanpa FCF; zero-result memakai FAIL dengan earnings=1;
  outage provider mengembalikan HTTP 503 setelah cache kedaluwarsa.
- Intersepsi browser hanya untuk failure export/start/read, field hilang, dan snapshot retry.
  Jalur normal create/start/screening/report/Markdown memakai backend nyata.

#### Riwayat checks (termasuk gagal)

1. Typecheck awal gagal pada index kosong label objectiveStatus; diperbaiki.
2. Contract test pertama mengharapkan start HTTP 200; backend aktual mengembalikan **202 queued**.
   Assertion diperbaiki sesuai kontrak nyata; bukan mengubah backend.
3. Browser test awal gagal simulasi Escape/focus: CDP perlu virtual key 27 dan fokus trigger
   sebelum click programatis. Native dialog kemudian lulus Escape dan restore focus.
4. Simulasi start-error pertama memblokir OPTIONS sehingga menghasilkan network error.
   Intersepsi kini melewatkan preflight dan memaksa hanya POST 503; pesan HTTP dan retry diuji.
5. `npm run test:architecture` **GAGAL**: activity node `saved return state` overflow;
   sequence `02 / ASYNC EXECUTION & DATA INTAKE` bertumpuk dengan `POST /start`;
   interaction-overview margin 64/68 tidak simetris; sembilan SVG mobile terkompresi
   menjadi 332px tanpa scroll. File `arsitektural/` tidak diubah dalam pekerjaan ini.
   Test tidak dilonggarkan. Ini remaining frontend, sehingga full suite bukan lulus.
6. Putaran akhir checks produk:

| Perintah | Hasil aktual |
| --- | --- |
| `npm run test:interaction` | LULUS: create/start/report, preset lock, unsupported, double-submit/start retry tanpa sesi ganda, fresh deep link setelah clear storage, three-factor rendering, dialog/tab keyboard, no fake export/adapter, retry snapshot, incomplete/empty, provider/read error, 404, trace redirect, mobile provenance/overflow. Tidak ada runtime exception. |
| `npm run test:smoke` | LULUS: 13 route rendered Chromium melawan backend lokal, nol runtime exception. |
| `npm run test:canonical-flow` | LULUS: preview brief-only 422; supported/unsupported; contract parity; formula v2/negative FCF; incomplete/zero-result; outage FAILED; export 409; company provider 503. |
| `VITE_BACKEND_URL=http://127.0.0.1:3000 npm run build` | LULUS, termasuk vue-tsc; Vite build 757ms pada putaran akhir; architecture:polish mengubah 0 file. |
| `git diff --check` | LULUS pada putaran kode akhir. |
| `npm run test:architecture` | GAGAL, rincian di atas; tidak diklaim selesai. |

Tests lama yang mengharuskan preset bank, aturan umum fallback, dan fixture bootstrap diganti
assertions perilaku kontrak nyata. Browser tidak lagi boleh skip diam-diam bila Chromium tidak ada.

#### Remaining berprioritas

1. Uji provider nyata dan rekonsiliasi satuan/angka/periode lintas emiten sebelum klaim validitas finansial.
2. Pilih dan implementasikan vertical slice objective pengguna pertama (bank atau dividen) dengan data serta kriteria executable; saat ini hanya screening tiga faktor didukung.
3. Uji pengguna pemula dan screen reader/zoom/contrast lengkap; hierarki DOM bukan bukti pemahaman.
4. Verifikasi konsistensi export saat revision berubah; backend historical report belum dimigrasi.
5. Auth/public readiness dan durability lintas restart tetap mengikuti pekerjaan backend terpisah.
6. Perbaiki diagram statis internal secara terpisah; kegagalannya tidak membatalkan gate alur produk, tetapi full repository suite belum hijau.
7. Beberapa teks/helper legacy pada screener dan file route lama yang tidak terjangkau masih perlu cleanup;
   ini tidak menjadi bukti bahwa seluruh dokumen/prototipe lama sudah selaras kontrak baru.

### Putaran review akhir LOCAL 2026-09-11

Review diff frontend/backend dan bukti agen sebelumnya menemukan regresi nyata:

- `ReportView.vue`: aturan A4 hilang; CSS global menyembunyikan header laporan;
  print langsung hanya mencetak tab aktif dan analisis satu kandidat. Diperbaiki dengan
  A4/margin 15mm, semua panel dan kandidat saat print, detail terbuka, serta pemulihan
  tampilan setelah print. Salin ringkasan dipulihkan dengan status sukses/error clipboard.
- `ResearchLibraryView.vue`: elemen DataProvenance tanpa registrasi masih memakai
  atribut fixture dan berisiko mengambil metadata sesi aktif untuk sesi lain. Diganti
  timestamp publikasi milik setiap sesi dan petunjuk sumber di laporan; klaim
  “sangat kuat dalam model” dihapus.
- `ScreenerView.vue`: fallback alasan gagal finansial tanpa bukti dihapus. Copy tidak
  lagi menjanjikan pertumbuhan atau ambang seleksi yang bisa diubah.
- Backend `/research-schedules` masih mengekspos seed bank/consumer dan nextRunAt
  buatan tanpa timer. Seluruh subtree kini HTTP 501 `SCHEDULER_UNAVAILABLE`, capabilities
  `scheduler:false`. Route frontend `/schedules` tetap redirect ke pustaka.

#### Coverage dan hasil aktual

| Check | Hasil putaran review |
| --- | --- |
| `npm run test:canonical-flow` | LULUS. Ditambah scheduler GET/create/toggle/run-now 501; mutasi start/cancel/retry/duplicate/clarification/follow-up tanpa revision 428 dan stale revision 409; duplicate nyata; delete missing/stale/current; JSON deep-equal seluruh snapshot sesi; guard If-Match pada tujuh fungsi frontend. Kasus kontrak baru sebelumnya tetap dipertahankan. |
| `npm run test:interaction` | LULUS. Tambahan clipboard sukses/ditolak; beforeprint semua empat panel, dua kandidat, detail terbuka, header terlihat; PDF Chromium valid dengan MediaBox A4 setiap halaman; afterprint kembali interaktif; scheduler redirect dan larangan copy fixture/model kuat. Keyboard/Escape/mobile/error tests sebelumnya tetap berjalan. |
| `npm run test:smoke` | LULUS **21 route**, termasuk alias global, activity/trace dan schedules yang sempat tidak dicakup. Nol runtime exception. |
| `npx vue-tsc -b` | LULUS. |
| `VITE_BACKEND_URL=http://127.0.0.1:3000 npx vite build` | LULUS, 1859 modul, 775ms putaran akhir. Build aplikasi dijalankan langsung agar tidak menjalankan generator diagram. |
| Backend `npm test -- --silent` | LULUS **74/74**, 14 files; typecheck dan build backend LULUS. |
| `git diff --check` | LULUS kedua repository setelah perubahan kode. |
| `npm run test:architecture` | GAGAL ulang: `TypeError: Failed to execute 'getComputedStyle' on 'Window': parameter 1 is not of type 'Element'.` Putaran ini tidak mencapai seluruh assertion geometri; temuan diagram putaran sebelumnya tetap terbuka. |

Runner kemudian diperbaiki agar elemen SVG opsional yang hilang dicatat sebagai temuan,
bukan menghentikan audit dengan `TypeError`. Hasil berikutnya gagal secara terkontrol pada
`activity (desktop)`: marker `[data-animate="node"]` dan `[data-animate="edge"]` tidak ada.
Temuan geometri putaran sebelumnya tetap terbuka sampai diagram internal diperbaiki.

Riwayat kegagalan tambahan: test JSON awal membandingkan export dengan report saja,
padahal kontrak export mengirim seluruh snapshot sesi; assertion diperkuat menjadi
deep-equal seluruh sesi. Duplicate objective adalah objek, sehingga strictEqual
diganti deepEqual. Smoke alias `/peers` mengharapkan teks yang salah; diperbaiki ke
teks aktual “Menunggu kandidat akhir”, tanpa menghapus route atau assertion.

Audit coverage menemukan penghapusan penjagaan revision dan alias route pada tests
sebelumnya. Penjagaan tersebut dipulihkan sebagai HTTP assertions dan smoke rendered;
bukan mengembalikan ekspektasi fixture bank sebagai hasil nyata. Suite backend lama
tidak dilonggarkan dalam review ini. Test scheduler service lama menguji kode internal
legacy, **bukan bukti automation tersedia**; gate HTTP 501 diuji lewat backend nyata.

#### Scope tetap belum selesai

- PDF terbukti terbentuk dan berukuran A4 di Chromium lokal; pagination visual semua
  panjang laporan/lintas browser, screen reader, zoom/kontras dan uji pengguna belum selesai.
- Race revision saat export, historical reports, rekonsiliasi emiten nyata, durability
  production dan kesiapan publik tetap terbuka.
- `src/data/sectorsUniverse.ts`, `ActivityView.vue`, `TraceView.vue` dan scheduler
  internal backend masih menyimpan artefak legacy. Pencarian import frontend tidak
  menemukan pemakaian ketiganya; bukan fixture aktif pada bundle rute produk.
  Scheduler internal tidak terjangkau melalui HTTP. Cleanup total belum dilakukan.
- Diagram arsitektur tidak diubah. Full suite belum hijau. Tidak ada commit/push/deploy.

### Format catatan

| Field | Isi |
| --- | --- |
| ID dan putaran | Belum dicatat |
| Referensi temuan/kriteria | Belum dicatat |
| Hasil yang diharapkan | Belum dicatat |
| Perubahan dan path terkait | Belum dicatat |
| Commit frontend/backend | Belum dicatat |
| Tanggal dan pemeriksa | Belum dicatat |
| Lingkungan dan versi deployment | Belum dicatat |
| Sumber/input pengujian | Belum dicatat |
| Prasyarat dan langkah reproduksi | Belum dicatat |
| Hasil aktual | Belum dicatat |
| Bukti: path test/output/perhitungan/screenshot | Belum dicatat |
| Hasil lokal | Belum diuji |
| Hasil staging/production yang relevan | Belum diuji |
| Kriteria yang belum terpenuhi | Belum dicatat |
| Status pekerjaan | Belum dikerjakan |
| Tindakan berikutnya | Belum dicatat |

## 6. Ringkasan penerimaan

| Dimensi | Status |
| --- | --- |
| Kesesuaian tujuan dan hasil | LOCAL kanonik generic dan bank lulus; objective lainnya unsupported |
| Akurasi finansial dan validitas scoring | Formula/input sintetis dan UI tiga faktor diuji; validitas pasar nyata belum dibuktikan |
| Fallback tanpa dummy dan pemulihan | Minimum frontend LOCAL lulus; durability/restart production belum dibuktikan |
| Provenance serta ekspor | LOCAL metadata dan error ekspor lulus; PDF/race revision belum lengkap |
| Pengalaman nonteknis dan aksesibilitas | Keyboard/mobile sebagian lulus; uji pengguna belum; diagram architecture gagal |
| Kesiapan penggunaan publik | Belum dibuktikan; keputusan scope terkait tetap berlaku |

Kesimpulan penerimaan tidak dirata-ratakan dari jumlah test yang lulus. Satu kegagalan material seperti kandidat tidak sesuai tujuan atau data dummy yang terlihat nyata tetap menghalangi klaim bahwa produk dapat dipercaya untuk kebutuhan tersebut.

## 7. Riwayat pembaruan

| Tanggal | Perubahan | Bukti baru |
| --- | --- | --- |
| 2026-09-10 | Membuat register, kriteria, dan format pembuktian berdasarkan audit serta rekomendasi redesign | Tidak ada; dokumen persiapan, bukan verifikasi implementasi |
| 2026-09-11 | Implementasi minimum frontend + integrasi backend baru, tanpa commit/deploy | Contract/browser/smoke/build lulus LOCAL; architecture gagal dan batas penerimaan dicatat §5 |
| 2026-09-11 | Menyelaraskan register dengan bukti aktual dan menetapkan urutan delivery | P0 LOCAL terbatas; provider nyata, objective vertikal, uji pengguna, production, dan public readiness tetap terbuka |
| 2026-09-11 | Mengoreksi frontend ke bank-screen-2f-v1 setelah rekonsiliasi BBCA/BMRI, tanpa deploy | Faktor modal dihapus karena BMRI mencampur basis; screen ROE/PBV belum tervalidasi luas dan market intelligence belum lengkap |
