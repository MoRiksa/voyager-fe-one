# Jurnal One V1 - Acuan End-to-End Voyager One

## 1. Status Dokumen

| Field | Value |
| --- | --- |
| Dokumen | Acuan tunggal delivery end-to-end Voyager One V1 |
| Status | P0 dan corrected bank screen deployed; compatibility smoke production lulus; validitas luas dan uji pengguna belum lulus |
| Last updated | 2026-09-11 |
| Product scope | Seluruh delivery fundamental Voyager One V1 |
| Scope setelah Voyager One | Technical analysis, khusus Voyager Two V1 |
| Frontend repository | `https://github.com/MoRiksa/voyager-fe-one` |
| Backend repository kerja | `https://github.com/MoRiksa/voyager-be-one` |
| Backend upstream | `https://github.com/voyager-team-hackthon/voyager-be-one` |
| Frontend production | `https://voyager-fe-one.vercel.app` |
| Backend production | `https://voyager.pascalyx.web.id` |

Dokumen ini adalah sumber status, prioritas, keputusan, dan definisi selesai untuk
delivery Voyager One V1. Gunakan dokumen berikut sebagai referensi detail, bukan
sebagai status implementasi terbaru:

- [`backend-handoff.md`](backend-handoff.md): usulan kontrak backend produksi.
- [`ui-ux-evolution.md`](ui-ux-evolution.md): prinsip dan target pengalaman frontend.
- [`autonomous-research-agent-sectors-hackathon-final.md`](autonomous-research-agent-sectors-hackathon-final.md): visi autonomous research agent.
- [`sectors-api-integration-recommendations.md`](sectors-api-integration-recommendations.md): rekomendasi provider Sectors.
- [`screen-reader-audit.md`](screen-reader-audit.md): prosedur audit assistive technology.
- [`voyager-two-v1.md`](voyager-two-v1.md): discovery dan delivery track technical analysis.
- [`audit-kesesuaian-produk-2026-09-10.md`](audit-kesesuaian-produk-2026-09-10.md): temuan dan bukti awal kesenjangan terhadap tujuan produk.
- [`rekomendasi-layout-redesign-2026-09-10.md`](rekomendasi-layout-redesign-2026-09-10.md): arah pengalaman pengguna nonteknis dan kriteria penerimaan.
- [`pembuktian-hasil-voyager-one.md`](pembuktian-hasil-voyager-one.md): register perbaikan dan bukti verifikasi yang diperbarui selama pengerjaan; pembuatan dokumen tidak menandakan perbaikan telah lulus.

Jika implementasi berubah, perbarui kolom **Actual**, checklist fase, bukti
verifikasi, keputusan, risiko, dan tanggal dokumen ini dalam commit yang sama.
Jangan menandai checklist selesai hanya karena kode sudah ditulis; checklist baru
selesai setelah acceptance criteria dan verifikasi terkait lulus.

## 2. North Star Produk

### Catatan delivery 2026-09-11 — minimum audit frontend

### Uji persona nonteknis 2026-09-12

Dua perjalanan production dilakukan sebagai pengguna pertama kali: pemula yang ingin
memahami produk dan calon pembeli yang cenderung membaca hasil sebagai rekomendasi. Keduanya
menolak memakai produk untuk keputusan beli karena laporan lama dengan pertanyaan bank masih
menampilkan AADI/ACES, skor 98/100, dan bahasa kandidat unggul. Data ACES FY2019 juga tampil
bersama harga 2026. Ini simulasi perilaku pengguna oleh evaluator, bukan observasi manusia
eksternal; klaim usability final belum dibuat.

Perbaikan mengarantina semua sesi selain kontrak/formula aktif `bank-evidence-v1`, termasuk
hasil `cannot_assess`. Arsip tetap dapat dibaca, tetapi kartu, sesi, dan laporan menampilkan
larangan penggunaan sebelum hasil. Copy, print/PDF, export, duplicate, dan template
dinonaktifkan; backend juga menolak duplicate/export direct API dengan `REPORT_RESTRICTED`.
Alur baru mengunci objective preset serta menjelaskan bahwa Voyager tidak mengenakan kredit
saat ini dan waktu selesai bergantung respons penyedia data, tanpa mengarang estimasi.

Gate LOCAL: backend 95/95, typecheck, build; frontend canonical, interaction, 21-route smoke,
typecheck, build, dan `git diff --check` lulus. Deployment dan production persona recheck
dicatat setelah commit terkait. Backend `fa85e76` dan frontend `3cd7bef` mengaktifkan
karantina. Source evidence-first yang sebelumnya belum masuk commit ditemukan saat archive
deploy sempat memunculkan preset filter lama; source tersebut dipublikasikan sebagai backend
`320c693`, dideploy ulang, dan PM2 restart diverifikasi. Production kembali memuat
`bank-evidence-contract-v1`. Direct export/duplicate arsip menghasilkan 409, warning muncul
sebelum AADI/ACES pada desktop/mobile, action penyebaran tidak tersedia, dan sesi duplicate
probe telah dihapus dengan GET akhir 404.

**Status aktif terbaru:** kontrak bank adalah `bank-evidence-contract-v1` dengan
`formulaVersion=bank-evidence-v1`. Produk menampilkan hingga delapan bank dinamis menurut
urutan kapitalisasi provider bila data tersedia. Tidak ada threshold ROE/PBV, skor, ranking
kualitas, atau label lolos. ROE dan P/BV ditampilkan sebagai bukti provider yang belum
terverifikasi basisnya. Missing pada anggota top-eight menghasilkan `cannot_assess`.

Frontend `911e28a` dan source backend `628dcf2` telah disinkronkan ke production; backup
backend tersedia di `/home/ubuntu/voyager-be-one-backups/20260911T094000Z/app-before-deploy.tgz`.
Health dan contract production lulus. Entri bank-screen/bank-filter di bawah adalah riwayat
koreksi yang telah superseded, bukan kontrak aktif.

Export Markdown/JSON sekarang memakai `If-Match` revision snapshot. Gate LOCAL membuktikan
missing/stale/current revision menghasilkan 428/409/200, JSON identik dengan snapshot, dan
browser tidak membuat fallback file ketika terjadi konflik. Backend `a37c06b` dan frontend
`b16f33c` telah dideploy. GET production pada sesi completed existing menghasilkan
428/409/200 tanpa mutasi. Backup backend tersedia di
`/home/ubuntu/voyager-be-one-backups/20260911T095000Z/app-before-deploy.tgz`.

Riwayat koreksi berikut telah superseded oleh status aktif di atas. Frontend
sekarang memakai preset exact `Filter bank besar dengan ROE dan P/BV`, objective exact
`Filter bank besar IDX dari universe terstruktur provider berdasarkan urutan kapitalisasi pasar, subsektor Banks, latest common FY, provider-derived simple ROE >= 15%, dan P/BV > 0.`,
contract `bank-filter-contract-v1`, objectiveType `bank-filter`, dan formulaVersion
`bank-filter-v1`. Bank adalah filter kelayakan tanpa `qualityScore`, `scoreBreakdown`,
`bankMetrics`, `/100`, formula ranking, atau bobot 60/40. Kandidat mempertahankan urutan
market cap provider dan ditandai “lolos filter ROE/PBV”. Generic tetap kompatibel dengan
score pada level API.

UI candidate/report/peers/screener/methodology/glossary/library menampilkan ROE
`provider-derived-unverified`, P/BV historis provider, common FY, dan warning bahwa basis
earnings, equity, serta tanggal dapat tidak cocok. Uji tuntas independen diperlukan.

Temuan resmi exact dari dokumentasi backend: BBRI FY2025 memiliki provider `earnings`
Rp56.652.384 juta yang cocok dengan laba pemilik entitas induk, tetapi `total_equity`
Rp330.941.434 juta adalah total ekuitas termasuk kepentingan nonpengendali; pembagiannya
mencampur parent earnings dan total equity. BBNI FY2025 memiliki provider `earnings`
Rp20.040.703 juta mengikuti angka publikasi, sedangkan laporan tahunan final menyajikan
laba pemilik entitas induk Rp19.562.342 juta dan total ekuitas Rp176.339.368 juta; ini
mismatch publication/final dan bukan ROE terverifikasi. Sumber resmi:
[BRI Annual Report 2025](https://ir-bri.com/misc/AR/AR2025-EN.pdf) dan
[BNI Annual Report 2025](https://www.bni.co.id/Portals/1/BNI/Perusahaan/HubunganInvestor/Docs/BNI-AR-2025-IND.pdf).
Rekonsiliasi hanya dua perusahaan dan tidak membuktikan validasi penuh provider atau filter.
Verifikasi LOCAL: contract, browser interaction, 21-route smoke, `vue-tsc`, build, dan
`git diff --check` lulus. Gate arsitektur terpisah tetap gagal pada atlas lama dengan
`Error: activity (desktop):`; arsitektur tidak diubah dan full validation tidak diklaim.

Update bank screen: preset backend terintegrasi end-to-end dengan judul exact
`Bank dengan ROE kuat untuk diteliti`, objective kanonik, exact preview criteria,
top-8 dari 48 coverage, contract `bank-screen-contract-v1`, objectiveType
`bank-screen`, dan formula `bank-screen-2f-v1`. UI hanya menampilkan ROE 60%, P/BV
40%, dan skor ranking; generic tetap `quality-3f-v2`. Tidak ada faktor atau klaim
modal, RWA, CAR, NPL, NIM, atau kesehatan bank. Preset lain tetap disabled/dijelaskan.

Evidence LOCAL: contract dan browser tests memakai backend sibling aktual dengan provider
HTTP sintetis, financial FY 2018..2025, valuation FY 2022..2026, dan common FY 2025.
Rekonsiliasi independen terhadap sumber resmi menemukan empat field BBCA FY2025 cocok,
tetapi BMRI mencampur earnings/equity konsolidasian dengan capital/RWA bank-only. Karena
basis campuran tersebut, faktor modal dihapus seluruhnya. Sumber resmi:
[BCA Annual Report 2025](https://www.bca.co.id/-/media/Feature/Report/File/S8/Laporan-Tahunan/2026/20260212-BCA-AR-2025-EN.pdf) dan
[Bank Mandiri Annual Report 2025](https://www.bankmandiri.co.id/documents/38265486/0/%5BFINAL+-+2904%5D+ANNUAL+REPORT+BMRI+2025+%281%29.pdf/da87ca86-a02b-f394-b2e4-1ff3f268c0ee?t=1777514285182).
Screen ROE/PBV provider-only belum direkonsiliasi independen secara luas. Market
intelligence belum lengkap; uji pengguna/a11y dan production tetap terbuka.

Deployment production 2026-09-11:
- Backend `24126fe` aktif pada PM2; frontend `f1b7f1e` aktif melalui Vercel.
- Backup backend: `/home/ubuntu/voyager-be-one-backups/20260911T041913Z/app-before-deploy.tgz`.
- Health public HTTP 200; dua objective contract tersedia; scheduler HTTP 501 dengan pesan
  tidak tersedia; dua sesi lama tetap terbaca.
- Browser production menampilkan preset bank corrected tanpa console warning/error.
- Verifikasi bersifat read-only. Ranking bank live end-to-end, outage, export, pekerjaan
  aktif saat restart, dan validitas luas belum dinyatakan lulus.

Probe production live berikutnya menjalankan create → start → worker → report → delete
untuk bank screen. Hasil terminal memuat BMRI, BBCA, dan BBRI, seluruhnya subsektor Banks,
FY2025, formula `bank-screen-2f-v1`, tanpa narasi AI dan dengan evidence single-source
unverified. Sesi probe dihapus memakai revision terbaru dan endpoint kemudian 404; jumlah
sesi kembali ke baseline dua. Probe membuktikan integrasi, bukan validitas ranking investasi.

Objective generic tiga faktor tetap didukung untuk kompatibilitas, tetapi tidak lagi
ditawarkan pada riset baru karena hanya memakai delapan simbol pertama provider. Capability
preset membedakan dukungan kontrak dari ketersediaan untuk pengguna baru. Bank screen menjadi
satu-satunya objective baru yang dapat dipilih sampai discovery generic representatif tersedia.
Perubahan ini aktif melalui backend `7eb3b72` dan frontend `39f9b30`; backup backend
tersedia di `/home/ubuntu/voyager-be-one-backups/20260911T045000Z/app-before-deploy.tgz`.

Rekonsiliasi BBRI/BBNI kemudian membuktikan ROE/PBV provider belum memiliki basis yang
cukup konsisten untuk skor gabungan. Backend `628dcf2` dan frontend `cc6b592` mengganti
screen bank menjadi `bank-filter-v1` tanpa `qualityScore`/`scoreBreakdown`; urutan kandidat
mengikuti kapitalisasi pasar provider, bukan ranking kualitas. Probe production menghasilkan
BBCA, BBRI, BMRI pada FY2025 tanpa field skor, lalu sesi probe dihapus dan endpoint 404.
Backup backend tersedia di
`/home/ubuntu/voyager-be-one-backups/20260911T083500Z/app-before-deploy.tgz`.

- Integrasi kontrak backend baru di sibling `voyager-be-one`, tanpa mengubah backend.
  Hanya screening IDX tiga faktor executable. Bank/dividen/pendalaman/peer sektor unsupported.
- V-01/V-02/V-07/V-09 dan UI V-05: bootstrap/simulasi/fallback sintetis dihapus;
  preview objective+brief+presetId; template lock/deep link diperbaiki; objectiveStatus dan
  evidence/narrativeStatus ditampilkan; hasil mengutamakan alasan, risiko, periode lalu skor.
  Trace/log operasional dikeluarkan dari UI pengguna; ekspor hanya backend.
- LOCAL: `test:interaction`, `test:smoke` (21 route), `test:canonical-flow`, build/typecheck,
  dan diff check lulus. Backend nyata dijalankan dengan provider sintetis dan storage temporer,
  demo fixture nonaktif. Start error/retry tidak membuat sesi ganda; export error tidak membuat file palsu.
- `test:architecture` dijalankan terpisah dan gagal pada atlas lama: `Error: activity
  (desktop):`. Full repository suite tidak diklaim hijau. Rekonsiliasi luas screen ROE/PBV,
  uji pengguna/screen reader,
  PDF lengkap, production, auth dan durability tetap terbuka.
- Tidak ada commit, push, deploy, atau delegasi. Detail putaran gagal/lulus dan batas bukti:
  [`pembuktian-hasil-voyager-one.md`, §5](pembuktian-hasil-voyager-one.md#5-catatan-verifikasi-per-putaran).

### Urutan delivery berikutnya

1. Rekonsiliasi data provider nyata untuk sampel lintas sektor: satuan, currency, FY,
   tanggal harga, rasio, dan provenance. Ini adalah syarat sebelum menilai model.
2. Perluas rekonsiliasi independen screen ROE/PBV ke sampel bank yang lebih luas.
   Objective lain tetap ditandai unsupported.
3. Setelah akurasi data lulus, evaluasi dan kalibrasi formula scoring secara sektoral;
   quality score tetap bukan peluang untung atau confidence.
4. Jalankan uji pengguna pemula, screen reader, zoom/kontras, dan verifikasi export
   revision race. Perbaiki hierarki berdasarkan salah tafsir aktual.
5. Putuskan auth/ownership sebelum klaim kesiapan publik, lalu uji durability restart,
   backup, dan restore.
6. Commit/deploy hanya setelah gate lokal terkait lulus. Verifikasi production dicatat
   terpisah; deployment tidak mengubah status validitas finansial atau uji pengguna.

Architecture Atlas adalah dokumentasi internal dan bukan bagian alur pengguna. Gate
diagram tetap diperbaiki serta dicatat terpisah, tetapi tidak boleh menggantikan atau
menyamarkan acceptance gate produk di atas.

Visi di bawah merupakan arah produk; bukan seluruh kemampuan backend yang tersedia saat ini.

Voyager One menerima tujuan riset, menyusun strategi, memilih data dan tools,
menjalankan screening dan deep research, memvalidasi bukti, lalu menerbitkan
laporan yang dapat ditelusuri. Produk adalah alat riset/informasi, bukan chatbot
saham biasa, dashboard raw data, automated trading, atau pemberi instruksi beli
dan jual.

```text
User objective
  -> structured research brief
  -> autonomous research plan
  -> provider-backed screening
  -> candidate ranking
  -> deep fundamental research
  -> peer comparison
  -> evidence validation
  -> atomic research report
```

Prinsip tetap:

- User menyatakan tujuan, bukan merakit workflow internal.
- Sectors adalah core market-data provider; browser tidak pernah memanggilnya.
- Backend Voyager adalah system of record untuk sesi dan artefak.
- Setiap angka harus berasal dari source atau derivation yang dapat ditelusuri.
- Missing bukan nol. Data yang tidak tersedia tetap `null` atau `UNAVAILABLE`.
- Fixture hanya boleh muncul dalam mode demo yang eksplisit dan berlabel.
- Kompleksitas dibuka bertahap: conclusion, reason, metrics, evidence,
  methodology, lalu raw technical details.
- Setiap konteks memiliki satu primary action.

## 3. Batas Scope V1

**Voyager One V1** mencakup seluruh pekerjaan selain technical analysis yang
tercatat dalam jurnal ini: fundamental research, integrasi frontend/backend,
security, backend authoritative, data fidelity, UI/UX/CX, durability, testing,
deployment, dan production hardening. Tidak ada pekerjaan tersebut yang
dipindahkan ke Voyager Two.

### 3.1 In scope sekarang

- IDX fundamental research.
- Structured objective dan research brief.
- Capabilities, presets, dan preview.
- Session library dan session lifecycle.
- Backend-owned autonomous execution.
- Screening funnel dan alasan retained/excluded.
- Candidate ranking, dossier, peer comparison, evidence, provenance, dan report.
- Clarification, cancel, retry, duplicate, follow-up, activity, trace, dan export.
- Secure multi-user ownership bila produk dibuka untuk lebih dari satu user.
- Responsive web, WCAG 2.2 AA baseline, dan progressive disclosure.

### 3.2 Belum menjadi scope implementasi saat ini

- Technical analysis dan chart intelligence.
- Trading signal atau rekomendasi transaksi.
- Order execution atau broker integration.
- Portfolio management.
- SGX production support.
- Multi-replica scaling sebelum shared state tersedia.

### 3.3 Posisi technical analysis

Ya, kapabilitas yang sudah dibangun sekarang dominan sisi **fundamental**:
financial statements, valuation, quality score, DuPont, solvency, cash flow,
screening, ranking, peer comparison, dan research report.

Technical analysis adalah scope eksklusif **Voyager Two V1** dan akan dibahas
setelah model informasi fundamental dan migrasi backend authoritative stabil.
Technical analysis tidak boleh langsung ditambah
sebagai kumpulan menu, indikator, dan chart baru. Pembahasan lanjutan wajib
menentukan:

- keputusan user yang dibantu;
- horizon waktu dan konteks penggunaan;
- data harga/volume dan freshness contract;
- indikator minimum yang dapat dijelaskan;
- hubungan fundamental thesis dengan technical context;
- cara menghindari sinyal palsu dan information overload;
- batas research information versus trading advice;
- disclosure, warning, provenance, dan formula version;
- progressive disclosure di mobile dan desktop.

## 4. Baseline Terverifikasi

Baseline ini merekam kondisi pada 2026-09-07. Secret, token, key, dan password
tidak boleh dimasukkan ke dokumen.

### 4.1 Deployment dan repository

- [x] Frontend production dapat diakses melalui Vercel.
- [x] Backend production dapat diakses melalui Cloudflare proxied domain.
- [x] Caddy memiliki origin TLS valid dan reverse proxy ke backend.
- [x] Backend berjalan melalui PM2 sebagai satu fork process.
- [x] Backend hanya listen pada `127.0.0.1:3003` di host deployment.
- [x] PM2 process list sudah disimpan.
- [x] Backend `.env` server memiliki permission `600`.
- [x] Frontend menggunakan build-time `VITE_BACKEND_URL`; tidak ada URL backend
  production atau localhost yang di-hardcode sebagai fallback.
- [x] Frontend `main` sinkron dengan `origin/main` pada baseline audit.
- [x] Backend `main` sinkron dengan repository kerja `origin/main` pada baseline
  audit.
- [x] Repository organisasi tetap tersedia sebagai remote `upstream`.
- [ ] Tentukan mekanisme sinkronisasi rutin `upstream/main` ke repository kerja.
- [ ] Check in atau dokumentasikan Caddy deployment secara reproducible tanpa
  memasukkan secret.
- [ ] Tambahkan runbook deploy, rollback, backup, dan restore.

### 4.2 Connectivity

- [x] `GET /health` public menghasilkan HTTP 200.
- [x] Origin TLS langsung dan request melalui Cloudflare menghasilkan HTTP 200.
- [x] CORS preflight dari `https://voyager-fe-one.vercel.app` menghasilkan 204.
- [x] Origin yang tidak berada di allowlist ditolak.
- [x] Sectors API dapat diakses server-side dengan raw `Authorization` key.
- [x] LLM gateway dapat diakses dari environment deployment.
- [x] Frontend live memanggil `https://voyager.pascalyx.web.id`, bukan localhost.
- [x] Public API create, read, dan delete smoke test lulus.
- [ ] Preview deployment Vercel memiliki strategi origin/auth yang eksplisit.
- [ ] SSE diuji end-to-end melalui Cloudflare dan Caddy untuk reconnect, idle,
  buffering, dan completion.

### 4.3 Tests

- [x] Frontend build lulus dengan `VITE_BACKEND_URL` eksplisit.
- [x] Frontend smoke test lulus untuk 19 routes.
- [x] Full frontend interaction test lulus terhadap backend test instance.
- [x] Backend typecheck dan build lulus.
- [x] Backend unit test lulus: 12 files, 33 tests.
- [x] Focused browser contract smoke lulus terhadap backend lokal untuk create,
  start, `If-Match`, dan authoritative snapshot.
- [ ] Backend tests membuktikan provider success, bukan hanya fallback saat LLM
  atau Sectors gagal.
- [ ] Cross-repository contract test tersedia di CI.

Catatan: interaction harness kini menjalankan backend dan Vite lokal dengan
`VITE_BACKEND_URL` terisolasi, memakai Chrome CDP, dan memverifikasi flow
authoritative tanpa memutasi production. Lifecycle cancel/retry/clarification
tetap diuji pada service backend karena worker fixture lokal selesai terlalu cepat
untuk interaksi manual yang deterministik.

## 5. Actual vs Expected

| Area | Actual 2026-09-07 | Expected V1 | Status |
| --- | --- | --- | --- |
| Network | Vercel -> HTTPS Cloudflare -> Caddy -> PM2 bekerja | Jalur yang sama, terdokumentasi dan diuji | Partial |
| Runtime config | Frontend env-only; backend secret hanya di server | Env tervalidasi, deploy reproducible, tanpa secret di Git | Partial |
| API base | Frontend memakai `/api/v1` pada backend domain | Tetap `/api/v1` saja | On track |
| Sectors boundary | Backend memanggil Sectors server-side | Tetap server-side, schema validated, raw snapshots/provenance | Partial |
| Auth | Missing atau arbitrary token mendapat scope penuh | Real identity verification; missing/invalid token 401 | Blocked |
| Browser token | Static `voyager-dev-token` ada dalam bundle | Tidak ada static secret/token; auth berasal dari session/user | Blocked |
| Ownership | `ownerId`/`tenantId` disimpan tetapi tidak diperiksa | Semua query/mutation scoped owner dan tenant | Blocked |
| CORS | Production origin allowlist aktif | Exact allowlist sesuai auth strategy; preview diputuskan | Partial |
| Create payload | Frontend mengirim objective, preset, dan full `brief` IDX | Objective, preset, dan seluruh brief dikirim | Verified |
| Candidate count | Backend dan frontend memakai `brief.candidateCount` sebagai field tunggal | Request 2 menghasilkan maksimum 2 | Verified |
| Source of truth | Backend dan `localStorage` sama-sama menyimpan artifact | Backend database authoritative; localStorage preference only | Blocked |
| Execution ownership | Frontend memakai create -> start; backend worker menjalankan pipeline dan frontend refetch snapshot | Satu flow: create -> start -> worker -> SSE signal -> snapshot | Verified untuk create/start/polling |
| Lifecycle | Backend completion membersihkan active attempt; halaman sesi menghidrasi status dan artefak dari snapshot backend | Backend menjalankan lifecycle dan clear active attempt atomik | Partial; command lain belum authoritative |
| Attempt fence | Worker memverifikasi attempt sebelum dan sesudah setiap provider await | Old/cancelled attempt tidak dapat menulis/publish | Backend verified for current worker |
| Revision guard | Frontend mengirim `If-Match` saat start/cancel/retry/delete/duplicate/clarification/follow-up dan refetch saat conflict | Seluruh mutasi rawan race memakai revision guard dan recovery | Verified untuk command saat ini |
| Idempotency | Timestamp key; backend key global tanpa principal/path/body digest | Stable action key, scoped identity+method+route+body | Blocked |
| SSE auth | Native EventSource tanpa auth header; bekerja karena guest full-access | Auth-compatible SSE strategy diputuskan | Blocked |
| SSE contract | Event hanya memicu authoritative refetch; polling menjadi fallback; durable replay/dedupe belum ada | Contract event registry, replay, dedupe, revision gap refetch | Partial |
| Session list | Frontend memuat full list backend; pagination/filter server dan ownership belum ada | Paginated, filtered, owner-scoped library | Partial |
| Screening | Frontend dapat derive exclusion; backend mengembalikan symbol aggregate | Persisted paginated membership dan reasons authoritative | Blocked |
| Filter truth | Backend dapat memasukkan kembali emiten gagal agar pool >= 5 | Threshold diterapkan apa adanya; zero candidate valid | Blocked |
| Quality threshold | Label menyebut >=80 tetapi tidak memfilter | Formula/version/missing policy diterapkan dan diuji | Blocked |
| Candidate data | Unavailable/incomplete report dikeluarkan sebelum scoring; zero/negative numerator dipertahankan; fixture hanya lewat flag demo eksplisit | Missing tidak menjadi angka; kandidat final hanya dari data lengkap tervalidasi | Partial; presentation estimates masih ada |
| Money | Number/float legacy | Decimal string + currency pada contract canonical | Blocked |
| Dossier root | Backend/client memakai `candidate` | Root canonical `dossier` atau kontrak dibekukan konsisten | Decision |
| Peer root | Backend/client memakai `benchmarks` | Root canonical `peerBenchmarks` atau kontrak dibekukan konsisten | Decision |
| Activity root | Backend/client memakai `activities` | Root canonical `activity` atau kontrak dibekukan konsisten | Decision |
| Errors | Backend menambahkan UUID request ID pada header dan JSON; beberapa controller masih memakai legacy shape | Structured envelope, request ID, violations, warnings, recovery | Partial |
| Clarification | Frontend hanya menjawab request ID dari snapshot backend; endpoint pembuat clarification entity belum tersedia | Backend-issued clarification entity dan persisted return status | Partial |
| Mutations | Cancel/retry/delete/duplicate/clarification answer/follow-up authoritative dan revision-guarded; tidak ada fallback mutation frontend | Semua command authoritative di backend | Partial; command pembuat clarification belum ada |
| Persistence | Session JSON files; writes non-atomic; queue/events/idempotency/schedule memory-only | Transactional durable store dan durable jobs/events | Blocked |
| Scheduler | Registry + manual run-now; cron tidak berjalan | Persistent schedules dan real trigger owner | Blocked |
| Scaling | PM2 single instance wajib untuk konsistensi saat ini | Scale setelah queue/event/idempotency shared | Deferred |
| SGX | Schema menerima SGX, engine tetap IDX; capabilities bilang disabled | Reject SGX sampai contract/data/formula siap | Blocked |
| Global company | Route ada tetapi keputusan produk belum dibekukan | Implementasikan penuh atau hapus dari IA/API | Decision |
| UI complexity | Fundamental workflow luas, route terduplikasi, dan istilah internal terlalu menonjol | Library sebagai pusat kerja; session sebagai induk hasil; audit melalui progressive disclosure | Reviewed; implementation pending |
| Technical analysis | Belum menjadi domain produk | Dirancang setelah fundamental E2E stabil | Deferred |

## 6. Bukti Runtime Yang Wajib Dipertahankan

Probe production baseline menunjukkan:

- Health, capabilities, presets, dan preview merespons sukses.
- Sectors discovery berstatus available.
- Create -> start -> execute dapat menyelesaikan sesi.
- Request dengan `brief.candidateCount: 2` menghasilkan lima kandidat. Ini bug,
  bukan acceptance behavior.
- Session `COMPLETED` masih menyimpan `activeAttemptId`. Ini bug lifecycle.
- Stage baseline tetap `8 -> 8 -> 8 -> 8 -> 5`; angka tersebut belum membuktikan
  seluruh filter benar-benar diterapkan.
- Backend unit tests dapat lulus ketika LLM request gagal dan fallback digunakan.
  Karena itu test hijau belum membuktikan kualitas integrasi provider.
- Session persistence deployment berada di
  `/home/ubuntu/voyager-be-one/data/sessions` pada baseline.

Jangan menulis ID sesi probe, secret, token, atau payload sensitif ke jurnal.

## 7. Arsitektur Target V1

```text
Vue/Vercel
  -> Voyager API /api/v1
     -> authenticated principal + tenant scope
     -> transactional session/attempt store
     -> durable job queue + worker
     -> provider adapters + cache + raw snapshot reference
     -> atomic artifact publication
     -> durable event stream
  -> SSE change signal
  -> GET authoritative snapshot/artifact

Voyager backend
  -> Sectors API using raw server-side API key
  -> LLM gateway using server-side credential
```

Canonical execution flow:

```text
POST create
  -> IDLE session
POST start with stable Idempotency-Key + If-Match
  -> active attempt + 202
worker executes autonomous pipeline
  -> events signal revision/artifact changes
frontend refetches authoritative snapshot
worker atomically publishes report set
  -> publishedAttemptId updated
  -> activeAttemptId cleared
  -> COMPLETED / PARTIAL / FAILED
```

Larangan target:

- Frontend tidak menjalankan research steps.
- Frontend tidak menetapkan status authoritative.
- Frontend tidak membuat angka, thesis, reasons, evidence, atau provenance.
- SSE tidak menjadi source of truth artifact.
- Retry tidak mengubah published set sampai attempt baru berhasil commit.
- Request lama tidak boleh menimpa attempt baru atau cancelled session.

## 8. Fase Delivery

Status fase:

| Fase | Nama | Status | Estimasi awal satu engineer |
| --- | --- | --- | --- |
| 1 | Contract Gate | Not started | 1-2 hari kerja |
| 2 | Backend Authoritative Core | Not started | 3-5 hari kerja |
| 3 | Data Fidelity and Artifact Contract | Not started | 5-8 hari kerja |
| 4 | Frontend Server-State Migration | Not started | 4-7 hari kerja |
| 5 | Durable Worker, SSE, and Scheduler | Not started | 7-12 hari kerja |
| 6 | Auth, Security, Contract Tests, and Production Hardening | Not started | 6-11 hari kerja |

Total awal:

- Development preview satu-user tanpa data palsu: fase 1-4 versi minimal,
  sekitar 9-14 hari kerja. Ini bukan Demo Ready selama auth ditunda.
- Production multi-user aman dan durable: seluruh fase, sekitar 25-43 hari kerja.
- Dua engineer frontend/backend paralel: sekitar 15-25 hari kerja, tergantung
  keputusan auth, database, queue, dan scope artifact.

### Fase 1 - Contract Gate

Tujuan: tidak ada implementasi baru di atas kontrak ambigu. Auth dan ownership
ditunda berdasarkan D-013 agar tidak memblokir development, tetapi tetap menjadi
P0 release gate pada Fase 6.

- [x] Nyatakan kontrak normatif: jurnal + OpenAPI `/api/v1`.
- [x] Pilih satu execution flow dan tandai `/execute`, `/steps`, atau
  `/async-execute` sebagai internal/deprecated/removed.
- [x] Bekukan request create full brief; preview alignment tetap Slice 2.
- [ ] Bekukan named roots seluruh response.
- [ ] Bekukan error envelope dan recovery action.
- [ ] Bekukan status lifecycle dan allowed transitions.
- [ ] Bekukan SSE event registry dan envelope.
- [ ] Tambahkan rate limit dan quota untuk operasi mahal.
- [ ] Putuskan global company route.
- [ ] Reject SGX sampai capability benar-benar aktif.

Acceptance:

- [x] OpenAPI tervalidasi dan menjadi fixture contract tests.
- [x] Development flow create -> start -> worker -> snapshot terdokumentasi dan
  tidak bergantung pada auth palsu sebagai bukti production readiness.

### Fase 2 - Backend Authoritative Core

Tujuan: session, lifecycle, revision, attempt, dan command dimiliki backend.

- [ ] Canonical create schema menerima objective, presetId, dan full brief.
- [ ] Hilangkan precedence ganda `requestedCandidates` vs `brief.candidateCount`.
- [ ] Candidate count request dipatuhi.
- [ ] Implementasikan owner-scoped paginated session list.
- [ ] Implementasikan search, status filter, sort, page, dan pageSize.
- [ ] Stable `Idempotency-Key` untuk create/start/retry/duplicate/answer.
- [x] `If-Match` diwajibkan pada start, cancel, dan retry.
- [x] Missing precondition menghasilkan 428; malformed 400; stale revision 409.
- [ ] Start/retry membuat tepat satu active attempt.
- [ ] Hanya satu active attempt per session.
- [ ] Worker commit memverifikasi active attempt setelah setiap async boundary.
- [ ] Cancel mem-fence late completion.
- [ ] Completion mengisi published attempt dan membersihkan active attempt.
- [ ] Retry mempertahankan published artifact sebelumnya sampai commit baru.
- [ ] Clarification entity dan return status dipersist atomik.
- [ ] Delete semantics diputuskan: soft delete untuk production.
- [ ] Request ID dibuat/dikembalikan dan masuk structured logs.
- [ ] Error response distandardisasi.
- [ ] Alias `/api/research` memiliki deprecation/removal plan.

Acceptance:

- [ ] Request candidate count 2 menghasilkan maksimum 2 kandidat.
- [ ] Double-click start menghasilkan satu attempt.
- [ ] Cancel saat provider call berjalan tidak dapat dipublikasi terlambat.
- [x] Retry lama tidak dapat menimpa attempt baru pada current single-process worker.
- [ ] Completed session memiliki `activeAttemptId: null`.
- [ ] Semua successful mutation menaikkan revision tepat sekali.

### Fase 3 - Data Fidelity and Artifact Contract

Tujuan: setiap nilai dapat dipertanggungjawabkan; tidak ada fabricated success.

- [ ] Hapus financial defaults sintetis dari production backend.
- [ ] Hapus candidate/report defaults sintetis dari production frontend.
- [ ] Gunakan null untuk unavailable; pertahankan nilai nol valid.
- [ ] Pisahkan explicit demo fixture mode dari production mode.
- [ ] Label fixture, cache, stale cache, derived, dan live source.
- [ ] Terapkan screening criteria dari brief/preset secara aktual.
- [ ] Jangan memasukkan kembali emiten yang gagal untuk memenuhi kuota.
- [ ] Terapkan quality threshold yang tertulis.
- [ ] Izinkan zero valid candidates menjadi completed result yang sah.
- [ ] Versioning formula, score factors, cohort, tie-break, dan missing policy.
- [ ] Money canonical memakai decimal string + currency.
- [ ] Normalisasi metrics dan unit.
- [x] Persist stage membership retained/excluded beserta reason.
- [ ] Membership endpoint paginated dan authoritative.
- [ ] Candidate shape canonical tersedia.
- [ ] Dossier mencakup evidence, DuPont, benchmark, optional artifact status,
  warning, source refs, revision, dan attempt.
- [ ] Peer benchmark memakai cohort attempt yang sama.
- [ ] Report memakai published revision/attempt/formula/source refs yang sama.
- [ ] Required failure dibedakan dari optional unavailable.
- [ ] Provider schema divalidasi; raw payload direferensikan, bukan diekspos.
- [ ] LLM fallback tidak boleh terlihat sebagai generated success.

Acceptance:

- [ ] Golden tests membuktikan score/rank/tie deterministik.
- [ ] Missing, null, dan zero lulus round-trip contract tests.
- [x] Funnel count sama dengan persisted membership.
- [ ] Filter yang gagal tidak muncul sebagai retained.
- [ ] Semua angka report dapat ditelusuri ke sourceRef atau derivation.

### Fase 4 - Frontend Server-State Migration

Tujuan: frontend menjadi renderer dan command client, bukan orchestration engine.

- [ ] Buat satu API client/envelope parser.
- [ ] Buat typed structured API error termasuk recovery metadata.
- [ ] Buat satu adapter canonical API ke UI model.
- [ ] Kirim full brief dari New Research.
- [ ] Muat capabilities dan presets dari backend.
- [ ] Hubungkan preview backend ke form tanpa mengubah interaksi inti.
- [ ] Hapus `executeResearchSession()` dari submit flow.
- [ ] Hapus `runStepPipeline()` dari session page.
- [ ] Hapus/isolasi `runAutonomousResearch()` dari production mode.
- [ ] Backend session list menjadi source Research Library.
- [ ] Page session selalu refetch authoritative snapshot.
- [ ] LocalStorage hanya menyimpan preference/draft non-authoritative.
- [ ] Hapus auto-created completed fixture session pada production.
- [ ] Hubungkan cancel, retry, duplicate, clarification, delete, dan follow-up ke
  backend tanpa local-success fallback.
- [ ] Hapus prefix check `startsWith('RES-')`; ID diperlakukan opaque.
- [ ] Ganti funnel local diff dengan membership endpoint.
- [ ] Hubungkan candidates, dossier, peer, report, activity, trace, provenance,
  dan export melalui adapter.
- [ ] UI memproses 401/403/404/409/422/429/503 sesuai recovery contract.
- [ ] Hapus label fixture dari production.

Acceptance:

- [ ] Refresh tidak mengubah status atau artifact.
- [ ] Dua device untuk user sama melihat session authoritative yang sama.
- [ ] Frontend tidak pernah menetapkan `COMPLETED` atau `FAILED` sendiri.
- [ ] Backend outage tidak menghasilkan local synthetic success.
- [ ] Session deletion konsisten pada backend dan UI.
- [ ] Interaction test berjalan terhadap backend test instance dan lulus.

### Fase 5 - Durable Worker, SSE, and Scheduler

Tujuan: restart, reconnect, dan scaling tidak merusak state.

- [ ] Pilih dan implementasikan transactional datastore.
- [ ] Persist sessions, attempts, artifacts, ownership, revision, clarification,
  schedules, idempotency, dan audit.
- [ ] Gunakan atomic writes/transactions dan migrations.
- [ ] Ganti in-process queue dengan durable queue.
- [ ] Queue memiliki lease, retry, timeout, dedupe, visibility, dan DLQ.
- [ ] Persist event stream dengan retention policy.
- [ ] SSE event ID monoton per session dan resumable.
- [ ] Client dedupe event ID.
- [ ] Client guard attempt ID.
- [ ] Revision gap memicu GET authoritative snapshot.
- [ ] Expired cursor menghasilkan explicit refetch recovery.
- [ ] SSE hanya menjadi change signal.
- [ ] Real cron scheduler tersedia dan schedules dipersist.
- [ ] `run-now` mengikuti state job aktual.
- [ ] Tambahkan graceful shutdown untuk HTTP, SSE, dan worker.
- [ ] Pisahkan liveness dan readiness.
- [ ] PM2 tetap satu instance sampai seluruh shared state siap.
- [ ] Setelah shared state siap, uji dua replica/rolling deploy.

Acceptance:

- [ ] PM2 restart tidak kehilangan session, schedule, atau accepted job.
- [ ] Job yang sedang berjalan pulih/retry sesuai semantics.
- [ ] SSE reconnect setelah restart mendapatkan snapshot/event yang konsisten.
- [ ] Dua instance tidak menggandakan publication.
- [ ] Schedule benar-benar berjalan sesuai cron dan owner timezone.

### Fase 6 - Auth, Security, Contract Tests, and Production Hardening

Tujuan: CI dan operasi membuktikan sistem aman, benar, dan dapat dipulihkan.

- [ ] Pilih dan implementasikan auth browser/API.
- [ ] Pilih dan implementasikan SSE auth yang kompatibel dengan browser.
- [ ] Hapus static `voyager-dev-token` dan `X-Voyager-Token` dari frontend.
- [ ] Backend menolak missing, malformed, expired, dan forged credentials.
- [ ] Terapkan owner/tenant authorization pada semua session, job, schedule,
  event, report, export, trace, dan knowledge operation.
- [ ] Pindahkan idempotency setelah authentication dan scope dengan principal,
  method, route, key, serta body digest.
- [ ] Terapkan exact production CORS policy sesuai auth strategy.
- [ ] Generate/validate OpenAPI dalam CI.
- [ ] Cross-repo contract tests berjalan pada setiap perubahan API.
- [ ] E2E create/start/progress/completion test.
- [ ] Auth, scope, IDOR, dan tenant-isolation tests.
- [ ] Idempotency replay/conflict tests.
- [ ] Concurrent cancel-vs-complete dan retry fencing tests.
- [ ] SSE reconnect, duplicate, expiry, auth, dan gap tests.
- [ ] Provider schema drift dan stale-cache tests.
- [ ] Missing/null/zero/currency/unit tests.
- [ ] Persistence restart dan migration tests.
- [ ] Backup/restore drill.
- [ ] Load test session list, job throughput, upstream concurrency, dan SSE fanout.
- [ ] Structured metrics dan alerts untuk queue, upstream, cache, warnings,
  reconnect, publication lag, dan late-write rejection.
- [ ] Log redaction, retention, dan sensitive export boundaries.
- [ ] Dependency/security audit.
- [ ] Keyboard, responsive, reduced-motion, NVDA, dan VoiceOver audit.
- [ ] Production smoke test melalui Cloudflare/Caddy/Vercel.
- [ ] Rollback runbook diuji.

Acceptance:

- [ ] Anonymous protected request menghasilkan 401.
- [ ] Invalid/expired credential menghasilkan 401.
- [ ] Missing permission menghasilkan 403.
- [ ] User A tidak dapat membaca atau mengubah resource User B.
- [ ] Idempotency response tidak dapat direplay lintas user/path/body.
- [ ] Seluruh required CI gate hijau.
- [ ] Tidak ada P0/P1 security finding terbuka.
- [ ] Tidak ada synthetic financial value pada production.
- [ ] Failure provider memiliki explicit degraded/recovery state.
- [ ] Deploy/rollback tidak merusak session aktif atau published artifact.

## 9. Keputusan UI/UX/CX Voyager One

Review pada 2026-09-08 mengaudit route, navigasi desktop/mobile, beban kognitif,
copy lifecycle, trust, dan accessibility. Keputusan ini mempertahankan visual
identity yang ada, tetapi menyederhanakan model mental menjadi dua tingkat:
**Pustaka Riset** sebagai pusat kerja dan **Sesi Riset** sebagai induk seluruh
hasil. URL kontekstual boleh dipertahankan untuk deep-link dan browser history,
tetapi bukan berarti setiap URL menjadi destinasi navigasi global.

### 9.1 Primary persona dan jobs-to-be-done

Primary persona V1 adalah analis fundamental atau investor mandiri Indonesia yang
menilai perusahaan IDX untuk menentukan kandidat mana yang layak masuk tahap due
diligence lebih lanjut. Voyager membantu menyusun shortlist yang dapat dijelaskan;
Voyager tidak memberi instruksi beli, jual, sizing, atau timing transaksi.

Jobs-to-be-done utama:

1. Menyatakan tujuan, cakupan, batas risiko, dan kriteria riset tanpa merakit
   pipeline internal.
2. Mengetahui progres dan apakah tindakan diperlukan tanpa memahami queue,
   attempt, revision, endpoint, atau batch.
3. Memahami perusahaan yang lolos dan gugur beserta alasan yang konsisten.
4. Membandingkan kandidat dengan metrik, unit, periode, dan cohort yang setara.
5. Membaca kesimpulan dahulu, lalu memeriksa bukti, sumber, formula, dan
   keterbatasan bila diperlukan.
6. Membuka kembali atau membagikan hasil yang sama tanpa perubahan state lokal
   atau perbedaan antar-device.

### 9.2 Information architecture target

```text
Pustaka Riset
  -> Buat Riset
  -> Sesi Riset
     -> Ringkasan dan status
     -> Hasil seleksi
        -> Analisis perusahaan
     -> Perbandingan kandidat
     -> Laporan final
     -> Detail pendukung
        -> Aktivitas
        -> Metodologi dan istilah
        -> Sumber, keterbatasan, dan audit teknis
```

Aturan navigasi:

- Navigasi global desktop dan mobile hanya memuat Pustaka Riset, Riset Baru, dan
  bantuan kontekstual bila dibutuhkan.
- Sesi Riset menyediakan navigasi lokal Ringkasan, Seleksi, Perbandingan, dan
  Laporan. Company selalu berada dalam konteks session/revision.
- Activity, Trace, Methodology, dan Glossary dibuka dari konteks hasil sebagai
  drawer, disclosure, atau halaman bantuan sekunder; tidak menjadi menu utama.
- Schedules disembunyikan sampai scheduler durable benar-benar tersedia.
- Beranda tidak menjadi dashboard kedua. `/` mengarahkan atau menyatu dengan
  Pustaka Riset.
- Navbar tidak menampilkan klaim implementasi seperti `SSE Realtime`,
  `Idempotent & Bearer Auth`, revision, atau batch. Tampilkan status berguna bagi
  user; detail koneksi dan revision hanya pada diagnostics/audit.

### 9.3 Route decision matrix

| Route | Keputusan | Peran target |
| --- | --- | --- |
| `/` | Merge | Redirect atau render Pustaka Riset; jangan menjadi pusat kerja kedua. |
| `/research` | Keep | Landing utama: cari, filter, lanjutkan, dan buat riset. |
| `/research/new` | Keep | Form brief dengan satu aksi utama: mulai riset. |
| `/research/:id` | Keep | Induk session: status, ringkasan, next action, dan hasil terbit terakhir. |
| `/research/:id/screener` | Keep contextual | Funnel authoritative dan alasan retained/excluded. |
| `/research/:id/peers` | Keep contextual | Perbandingan kandidat dalam cohort/revision yang sama. |
| `/research/:id/report` | Keep contextual | Artefak final yang fokus pada keputusan dan siap diekspor. |
| `/research/:id/company/:symbol` | Keep contextual | Due diligence kandidat dalam konteks session. |
| `/research/:id/activity` | Move | Detail pendukung dari status session; bukan navigasi global. |
| `/research/:id/trace` | Hide | Audit teknis privileged melalui progressive disclosure. |
| `/company/:symbol` | Remove | Tanpa session/revision, data dan provenance menjadi ambigu. |
| `/screener` | Remove | Alias tanpa session dan source of truth yang jelas. |
| `/peers` | Remove | Alias tanpa cohort/session. |
| `/activity` | Remove | Alias global menduplikasi aktivitas session. |
| `/trace` | Remove | Alias global membuka detail internal tanpa konteks. |
| `/report` | Remove | Alias global menduplikasi laporan session. |
| `/methodology` | Move | Bantuan kontekstual dari score, filter, dan report. |
| `/glossary` | Move | Definisi inline; halaman bantuan sekunder bila masih diperlukan. |
| `/schedules` | Hide | Tunggu persistence, trigger, timezone, dan recovery terverifikasi. |
| Catch-all | Keep | Not-found yang menawarkan kembali ke Pustaka Riset. |

Removal berarti route tidak tampil dan akhirnya dihapus setelah internal links,
bookmarks yang didukung, analytics, dan redirect policy diperiksa. Tidak perlu
mempertahankan alias yang belum pernah menjadi kontrak publik.

### 9.4 Journey end-to-end dan primary action

| Context | Informasi utama | Primary action |
| --- | --- | --- |
| Pustaka Riset | Session terbaru, status, freshness, pencarian | `Buat riset` |
| Riset Baru | Objective, universe, horizon, kriteria, jumlah kandidat, preview | `Mulai riset` |
| Needs input | Pertanyaan, alasan, dampak bila tidak dijawab | `Kirim jawaban` |
| Session aktif | Pekerjaan berjalan, progres, hasil aman yang tersedia | `Batalkan riset` |
| Session partial/failed | Hasil valid, bagian gagal, alasan, recovery | `Coba lagi` |
| Session selesai | Kesimpulan, shortlist, warning, waktu, sumber | `Buka laporan` |
| Seleksi | Funnel, kriteria, retained/excluded, alasan | `Bandingkan kandidat` |
| Perusahaan | Thesis, risiko, metrik, evidence, limitation | `Kembali ke perbandingan` |
| Perbandingan | Tabel setara, differentiator, missing data, ranking | `Buka laporan` |
| Laporan | Keputusan, kandidat, risks, evidence, disclosure | `Ekspor laporan` |
| Diagnostics/audit | Request ID, revision, attempt, events, raw refs | `Salin referensi` |

Duplicate, delete, dan pengaturan bukan primary action. Tempatkan sebagai menu
sekunder dengan confirmation sesuai dampaknya. Jangan tampilkan CTA menuju hasil
yang belum tersedia; jelaskan status dan tindakan yang valid.

### 9.5 Lifecycle state dan copy

| State backend | Copy utama | Apa yang aman dilihat | Recovery/action |
| --- | --- | --- | --- |
| `IDLE` | `Siap memulai riset` | Brief dan preview | `Mulai riset` |
| `NEEDS_INPUT` | `Riset memerlukan jawaban Anda` | Brief, progres sebelum jeda, pertanyaan | `Kirim jawaban` |
| Active states | `Riset sedang berjalan` + tahap berbahasa user | Published result lama dan progres baru | `Batalkan riset` |
| `PARTIAL` | `Riset selesai dengan data terbatas` | Bagian valid, missing data, warnings | `Coba lagi` atau `Buka laporan` |
| `FAILED` | `Riset belum dapat diselesaikan` | Published result lama bila ada, alasan aman | `Coba lagi` |
| `CANCELLED` | `Riset dibatalkan` | Published result lama dan progres sebelum batal | `Mulai ulang` |
| `COMPLETED` | `Riset selesai` | Seluruh published artifact satu revision | `Buka laporan` |

Copy error wajib menjawab: apa yang terjadi, apakah data lama tetap aman, apakah
user perlu bertindak, dan tindakan berikutnya. Kode HTTP, provider exception,
queue, endpoint, attempt, dan stack trace tidak menjadi copy utama. `401` meminta
login ulang, `403` menjelaskan akses, `404` menawarkan kembali ke library, `409`
memuat ulang snapshot, `422` menandai field, `429` memberi waktu retry, dan `503`
menjaga hasil lama serta menawarkan retry.

### 9.6 Progressive disclosure

| Tingkat baca | Konten | Bentuk |
| --- | --- | --- |
| First read | Status, conclusion, shortlist, alasan utama, warning material, next action | Heading, concise summary, table/list; bukan kumpulan cards seragam. |
| Second read | Metrik, peer comparison, screening reasons, confidence, missing data, freshness | Tabel responsif, expandable sections, definitions inline. |
| Third read | Evidence, source refs, formula/version, methodology, limitations | Disclosure atau detail pane yang tetap dapat di-link. |
| Audit view | Request ID, revision, attempt, events, provider/raw snapshot refs | Privileged diagnostics; bukan alur keputusan utama. |

Istilah `pillar`, `batch`, `endpoint`, `queue`, `trace`, `revision`, dan `attempt`
hanya tampil di audit view. Istilah finansial yang diperlukan diberi definisi
inline; glossary tidak menjadi prasyarat memahami halaman.

### 9.7 Trust model

| Elemen | Aturan presentasi |
| --- | --- |
| Source | Nama provider/dokumen dan source period; jangan menyetarakan `Sectors`, `local gateway`, dan fixture. |
| Freshness | `As of` dan fetched/generated time dipisahkan; stale diberi label sebelum conclusion. |
| Confidence | Hanya tampil bila definisi dan derivation tersedia; bukan pengganti evidence. |
| Missing | Tampilkan `Tidak tersedia`, bukan nol, estimasi tersembunyi, atau narasi sukses. |
| Derived | Tampilkan formula/version, input refs, currency, unit, dan rounding policy. |
| Warning | Dekat dengan angka atau conclusion yang terdampak, bukan hanya banner global. |
| Limitation | Jelaskan cakupan yang tidak dianalisis dan dampaknya pada conclusion. |
| Provenance | Report, dossier, peer, dan screening memakai session, attempt, revision, dan source refs yang sama. |
| Demo | Seluruh session berlabel `Data contoh`; fixture dan live data tidak dicampur. |

Trust strip ringkas pada first/second read memuat source, `as of`, freshness, dan
warning count. Detail provenance dibuka saat diminta. Label transport seperti SSE
atau bearer auth tidak menambah kepercayaan user dan harus dihapus dari navbar.

### 9.8 Mobile dan accessibility

Strategi mobile:

- Bottom navigation maksimum tiga tujuan stabil: Pustaka, Riset Baru, dan Sesi
  aktif bila ada. Navigasi tahap berada di dalam session.
- Jangan membuat link ke session fixture ketika belum ada session aktif.
- Tabel perbandingan mempertahankan label baris dan identitas kandidat saat
  horizontal scroll; sediakan mode daftar per kandidat untuk layar sempit.
- Sticky controls tidak boleh menutup content, focus target, keyboard virtual,
  atau safe-area. Touch target minimum 44 x 44 CSS pixels.
- Status, source, warning, dan primary action tampil sebelum detail teknis.

Acceptance accessibility:

- [ ] Setelah client-side navigation, fokus pindah ke heading utama dan perubahan
  judul halaman diumumkan secara dapat diprediksi.
- [ ] Semua workflow dapat diselesaikan dengan keyboard tanpa focus trap atau
  urutan fokus yang berubah tak terduga.
- [ ] Dialog/drawer memiliki label, initial focus, Escape, focus containment, dan
  focus return; background inert saat terbuka.
- [ ] Perubahan lifecycle penting diumumkan melalui satu live region yang tidak
  mengulang setiap polling/SSE event.
- [ ] Status dan chart tidak bergantung pada warna; visualisasi memiliki ringkasan
  atau data table ekuivalen.
- [ ] Loading, error, empty, partial, stale, dan offline/reconnecting state dapat
  dibedakan oleh screen reader.
- [ ] Text zoom 200%, viewport 320 CSS pixels, landscape mobile, reduced motion,
  dan high contrast tidak kehilangan content atau action.
- [ ] NVDA/Firefox dan VoiceOver/Safari melewati create, clarification, progress,
  comparison, report, error recovery, dan reconnect journey.

### 9.9 Milestone dan vertical slices

| Milestone | Exit criteria | Status |
| --- | --- | --- |
| Development Preview | Satu-user backend-authoritative; no fabricated data; canonical IA; create sampai report lulus; non-public dan tanpa data sensitif. | Not started |
| Demo Ready | Development Preview lulus dan auth/ownership minimum terverifikasi. | Blocked by D-013 |
| Beta Ready | Real auth/ownership; durable state; responsive dan keyboard audit lulus; provider/reconnect/retry teruji. | Not started |
| Production Ready | Security, concurrency, load, backup/restore, screen reader, observability, deploy, dan rollback lulus; no P0/P1. | Not started |

| Slice | Owner | Dependency | Status | Evidence commit/PR | Deployment |
| --- | --- | --- | --- | --- | --- |
| 1. Canonical execution contract dan OpenAPI | Backend + Product | D-003 | Backend verified; frontend pending | `2a11f73` | Not deployed |
| 2. Full brief, lifecycle, candidate count, attempt fence | Backend | Slice 1 | In progress | `2a11f73`, `6b8593d` | Not deployed |
| 3. No synthetic data, source refs, screening truth | Backend + Data | Slice 2 | Planned | - | Not deployed |
| 4. Frontend server-state migration dan error recovery | Frontend | Slices 1-3 | Planned | - | Not deployed |
| 5. Simplified IA, lifecycle copy, trust, mobile/a11y | Frontend + Product | Slice 4 | Planned | - | Not deployed |
| 6. Durable store, worker, event stream, scheduler | Backend + Ops | D-004 sampai D-006 | Planned | - | Not deployed |
| 7. Auth, ownership, dan authenticated SSE | Backend + Frontend | D-001, D-002, Slice 6 | Deferred by D-013 | - | Not deployed |
| 8. E2E, security, accessibility, operations | FE + BE + Ops | Slices 1-7 | Planned | - | Not deployed |

### 9.10 Review deliverables dan acceptance

- [x] Primary persona dan jobs-to-be-done.
- [x] Journey map fundamental research end-to-end.
- [x] Inventory route dan feature; keep, merge, move, hide, atau remove.
- [x] Revised information architecture.
- [x] State/copy matrix untuk lifecycle dan errors.
- [x] Progressive disclosure matrix per context.
- [x] Mobile navigation dan data-presentation strategy.
- [x] Accessibility risks dan remediation priority.
- [x] CX trust model: freshness, source, confidence, warning, limitation.
- [x] Technical-analysis integration principles dan boundaries.
- [x] Usability acceptance criteria sebelum implementasi visual.

UI/UX/CX dianggap terimplementasi hanya bila usability test membuktikan user
dapat membuat riset, memahami status, menemukan shortlist, menjelaskan alasan
retained/excluded, membandingkan kandidat, menemukan source/limitation, dan pulih
dari error tanpa bantuan serta tanpa istilah arsitektur internal.

## 10. Voyager Two V1 - Technical Analysis

Technical analysis dipisahkan menjadi delivery track eksklusif **Voyager Two V1** agar
scope fundamental Voyager One tidak melebar dan UI tidak menjadi kumpulan fitur.
North star, keputusan produk, data contract, UX boundaries, checklist discovery,
dan definition of ready berada di [`voyager-two-v1.md`](voyager-two-v1.md).

- [x] Tetapkan Voyager One untuk seluruh delivery fundamental dan pekerjaan
  end-to-end selain technical analysis.
- [x] Tetapkan Voyager Two khusus technical analysis.
- [x] Selesaikan review UI/UX/CX Voyager One sebelum menetapkan IA Voyager Two.
- [ ] Stabilkan fundamental end-to-end sebelum implementasi Voyager Two dimulai.
- [ ] Tutup definition of ready di `voyager-two-v1.md`.

## 11. Decision Log

| ID | Keputusan | Opsi | Status |
| --- | --- | --- | --- |
| D-001 | Auth browser/API | OIDC bearer; BFF secure cookie | Open |
| D-002 | SSE auth | Fetch stream bearer; same-origin cookie/BFF; signed short-lived stream token | Open |
| D-003 | Canonical execution endpoint | Start auto-enqueues; explicit execute command; internal worker route | Accepted 2026-09-08: start auto-enqueues |
| D-004 | Database | PostgreSQL; managed alternative | Open |
| D-005 | Durable queue | Redis/BullMQ; managed queue; DB jobs | Open |
| D-006 | Event retention | DB table; Redis stream; managed event stream | Open |
| D-007 | Global company route | Remove route; company wajib session-scoped | Accepted 2026-09-08, Product |
| D-008 | Credits | Billing ledger; estimate only; remove | Open |
| D-009 | SGX | Defer; release with explicit formula/currency support | Deferred |
| D-010 | Report exports | User report only; separate privileged audit export | Open |
| D-011 | Preview deployments | Stable preview domain; allowlist automation; same-origin proxy | Open |
| D-012 | Technical analysis role | Context layer; ranking input; separate workflow | Discovery pending |
| D-013 | Auth delivery order | Implement first; defer until final hardening | Accepted 2026-09-08, deferred to Fase 6 |

Setiap keputusan yang ditutup harus mencatat:

- tanggal;
- decision owner;
- pilihan;
- alasan dan tradeoff;
- dampak frontend/backend/data/UX;
- migration atau rollback path.

### D-003 - Canonical execution endpoint

- Date: 2026-09-08.
- Decision owner: Product + Backend.
- Choice: `POST /research-sessions/:id/start` membuat satu active attempt dan
  langsung enqueue pipeline; response `202` memuat `session` dan `job`.
- Reason/tradeoff: satu command mencegah frontend, synchronous endpoint, step
  endpoint, dan worker menjalankan pipeline yang sama. Job masih process-local
  sampai Slice 6, sehingga flow ini belum durable terhadap restart.
- Impact: `/steps/:step`, `/execute`, dan `/async-execute` tidak lagi terdaftar
  sebagai route publik; frontend harus berhenti memanggil endpoint tersebut dan
  menggunakan SSE hanya sebagai signal untuk authoritative GET.
- Migration/rollback: frontend berpindah ke create -> start -> snapshot. Internal
  service methods dipertahankan untuk worker sampai pipeline direfaktor; route
  alternatif hanya dapat dipulihkan melalui keputusan kontrak baru.

### D-007 - Global company route

- Date: 2026-09-08.
- Decision owner: Product.
- Choice: hapus `/company/:symbol`; company wajib dibuka melalui
  `/research/:id/company/:symbol`.
- Reason/tradeoff: company data membutuhkan session, cohort, revision, dan
  provenance yang jelas. Global browsing ditunda daripada menampilkan analisis
  ambigu; konsekuensinya, Voyager One belum menjadi standalone company explorer.
- Impact: frontend menghapus global link/route; backend tidak perlu menambah
  global company contract; data dan UX tetap terikat published session artifact.
- Migration/rollback: audit internal links dan analytics, lalu hapus route. Tambah
  redirect ke Pustaka Riset hanya bila bookmark usage terbukti; route dapat
  dipulihkan melalui keputusan baru bila global company contract dirancang.

### D-013 - Defer auth during development

- Date: 2026-09-08.
- Decision owner: Product.
- Choice: lanjutkan contract, backend-authoritative flow, data fidelity, frontend
  migration, dan durability lebih dahulu; implementasikan auth/ownership pada
  Fase 6 sebelum Demo Ready atau release apa pun.
- Reason/tradeoff: pemilihan identity strategy menghambat development inti saat
  user masih admin-created dan model account expiry belum final. Kecepatan
  development diterima dengan risiko bahwa environment tanpa auth tidak aman.
- Impact: D-001 dan D-002 tetap open; auth palsu/guest tidak boleh dianggap
  production-ready; test development menggunakan data non-sensitif; Demo Ready,
  Beta Ready, dan Production Ready diblokir sampai security acceptance lulus.
- Guardrails: jangan menambah user eksternal, data sensitif, atau akses publik
  yang dipromosikan; jangan membangun fitur baru yang bergantung pada token stub;
  seluruh repository/service API tetap menerima principal boundary agar ownership
  dapat dipasang tanpa redesign.
- Migration/rollback: tutup D-001 dan D-002, implementasikan Slice 7, jalankan
  auth/IDOR/tenant/SSE tests, lalu buka release gate. Auth dapat diprioritaskan
  kembali kapan saja tanpa membatalkan slices kontrak dan data.

## 12. Definition of Done End-to-End

Voyager One V1 belum selesai sampai seluruh pernyataan berikut benar:

- [ ] User dapat login dan hanya melihat resource miliknya.
- [x] User dapat membuat full research brief tanpa field hilang.
- [x] Backend menyusun dan menjalankan plan tanpa orchestration frontend.
- [ ] Session dapat dipantau, direfresh, dan dibuka dari dua device.
- [ ] Clarification, cancel, retry, dan failure recovery konsisten.
- [ ] Screening retained/excluded dan reasons authoritative.
- [ ] Candidate, dossier, peer, evidence, provenance, dan report satu revision.
- [ ] Tidak ada nilai finansial fabricated di production.
- [ ] Missing, stale, optional, confidence, dan limitation terlihat jelas.
- [ ] Report dipublikasi atomik dan old attempt tidak dapat menimpa hasil.
- [ ] SSE reconnect dan revision gap pulih melalui authoritative refetch.
- [ ] Restart/deploy tidak kehilangan accepted work.
- [ ] Scheduler yang ditampilkan benar-benar menjalankan schedule.
- [ ] UI memiliki satu primary action per context dan tidak memaksa user memahami
  arsitektur internal.
- [ ] Mobile, keyboard, screen reader, contrast, dan reduced motion lulus audit.
- [ ] CI contract, integration, concurrency, security, restart, dan provider tests
  lulus.
- [ ] Runbook deploy, rollback, provider outage, stuck attempt, backup, dan restore
  tersedia dan diuji.
- [ ] Technical analysis belum masuk sebelum boundaries produk dan UX disetujui.

## 13. Cara Memperbarui Jurnal

Pada setiap batch pekerjaan:

1. Pilih checklist terkecil yang menghasilkan vertical slice terverifikasi.
2. Catat keputusan terbuka yang harus ditutup sebelum coding.
3. Implementasikan frontend/backend/test tanpa memperluas scope diam-diam.
4. Jalankan acceptance criteria fase terkait.
5. Perbarui Actual vs Expected dan bukti runtime.
6. Centang item hanya jika bukti tersedia.
7. Catat blocker dan residual risk.
8. Commit jurnal bersama perubahan yang membuat statusnya berubah.

Untuk mencegah proses terlihat freeze:

- Batasi command verifikasi normal maksimal 30 detik; hentikan dan pecah per file
  bila melewati batas.
- Jalankan typecheck dan test fokus setelah setiap perubahan inti sebelum full
  suite.
- Berikan status antar-tahap saat discovery, edit, focused verification, full
  verification, dan push selesai.
- Hindari subagent atau audit luas ketika file dan akar masalah sudah diketahui.

Format catatan perubahan:

```text
YYYY-MM-DD - Phase N - Judul batch
Status: planned | in progress | blocked | verified
Actual before:
Expected after:
Changes:
Evidence:
Open risks:
Next smallest slice:
```

## 14. Log

### 2026-09-07 - Baseline audit dan deployment connectivity

Status: verified untuk connectivity; blocked untuk production correctness.

Actual before:

- Frontend adalah prototype fixture/localStorage.
- Backend baru tersedia di repository terpisah.
- Frontend production masih mengarah ke localhost sebelum endpoint env diperbaiki.

Changes already delivered:

- Backend di-deploy melalui PM2, Caddy, TLS, dan Cloudflare.
- Production CORS dibatasi ke frontend Vercel.
- Sectors dan LLM credentials disimpan server-side.
- Frontend beralih ke required `VITE_BACKEND_URL` tanpa hardcoded fallback.
- Backend deployment config disimpan di repository kerja.

Evidence:

- Public health HTTP 200.
- Origin TLS HTTP 200.
- CORS preflight HTTP 204.
- Public create/read/delete lulus.
- Backend 28 unit tests lulus.
- Frontend 19-route smoke test lulus.
- Production pipeline probe selesai tetapi menemukan candidate-count dan active
  attempt bug.

Open risks:

- Auth dan tenant isolation belum aman.
- Frontend/backend sama-sama menjadi source of truth.
- Synthetic financial fallbacks masih aktif.
- Queue, SSE history, idempotency, dan schedules belum durable.
- Frontend interaction test belum menjadi backend integration test.

Next smallest slice:

- Tutup keputusan Fase 1: auth, execution flow, canonical response roots, dan SSE
  auth. Setelah itu implementasikan security gate sebelum migrasi state frontend.

### 2026-09-08 - Review UI/UX/CX Voyager One

Status: verified untuk keputusan pengalaman; implementasi pending.

Actual before:

- Route global dan route session menduplikasi Screener, Peers, Activity, Trace,
  Report, dan Company.
- Navbar menonjolkan revision, SSE, idempotency, auth, dan istilah implementasi.
- Session dan Report mengulang terlalu banyak hasil dan detail audit.
- Trust labels, lifecycle copy, mobile hierarchy, dan focus navigation belum
  konsisten.

Changes:

- Menetapkan analis fundamental/investor mandiri Indonesia sebagai primary
  persona dan due-diligence shortlist sebagai keputusan utama.
- Menetapkan Pustaka Riset sebagai pusat kerja dan Sesi Riset sebagai induk hasil.
- Membekukan route disposition, primary actions, lifecycle copy, progressive
  disclosure, trust model, mobile strategy, dan accessibility gates.
- Menetapkan milestone Demo Ready, Beta Ready, Production Ready, dan tujuh
  vertical slices dengan dependency serta evidence field.

Evidence:

- Source audit terhadap router, desktop/mobile navigation, seluruh view,
  provenance component, status handling, dan accessibility behavior.
- Keputusan dan acceptance criteria tercatat pada Bagian 9 jurnal ini.

Open risks:

- Keputusan auth, SSE auth, datastore, queue, dan event retention masih terbuka.
- Native NVDA/VoiceOver dan visual device audit belum dijalankan.
- Route simplification belum diimplementasikan dan masih memerlukan redirect/link
  inventory sebelum removal.

Next smallest slice:

- Tutup D-003 dan implementasikan Slice 1 sebagai canonical execution contract
  serta OpenAPI. D-001 dan D-002 tetap menjadi release blocker pada Slice 7.

### 2026-09-08 - Auth ditunda sampai final hardening

Status: accepted untuk urutan delivery; security tetap blocked.

Actual before:

- Slice 1 mengharuskan keputusan auth sebelum contract dan lifecycle development.
- Identity strategy belum final karena kebutuhan admin-created account, account
  expiry, resource server, dan topology masih dievaluasi.

Changes:

- Memindahkan implementasi auth, ownership, authenticated SSE, dan auth-scoped
  idempotency ke Fase 6/Slice 7.
- Menambahkan Development Preview sebagai milestone non-public dan non-sensitive.
- Mempertahankan Demo Ready, Beta Ready, dan Production Ready sebagai blocked
  sampai auth serta ownership terverifikasi.

Evidence:

- D-013 dan guardrails tercatat pada Decision Log.

Open risks:

- Backend production saat ini masih menerima guest/arbitrary token dan tidak
  menegakkan owner/tenant. Endpoint tersebut tidak aman untuk penggunaan publik.

Next smallest slice:

- Tutup D-003, bekukan OpenAPI dan execution flow, lalu implementasikan Slice 1.

### 2026-09-08 - Canonical start execution backend

Status: backend verified; frontend migration pending.

Actual before:

- Start hanya membuat attempt; `/execute`, `/steps`, dan `/async-execute` dapat
  menjalankan pipeline secara terpisah.
- Worker tidak menegakkan queued attempt ID dan completion menyisakan active
  attempt.
- Create menerima payload legacy sehingga candidate count memiliki dua sumber.

Changes:

- Start membuat satu attempt dan enqueue satu job, serta mengembalikan HTTP 202.
- Repeated start pada active attempt mengembalikan job yang sama.
- Worker memverifikasi attempt sebelum dan setelah provider await.
- Completion memindahkan attempt ke published dan membersihkan active attempt.
- Full brief menjadi create contract dan `brief.candidateCount` menjadi sumber
  tunggal.
- Menambahkan `GET /openapi.json`; menghapus route publik step/execute/async.
- Job lookup sekarang harus cocok dengan session ID pada URL.

Evidence:

- Backend commit `2a11f73`.
- `npm run typecheck`, `npm run build`, dan 29 tests lulus.
- Regression test membuktikan candidate count 2 menghasilkan dua kandidat,
  completion memiliki `activeAttemptId: null`, repeated start tidak membuat job
  kedua, dan job tidak dapat dibaca melalui session ID lain.

Open risks:

- Frontend production masih memakai payload/endpoint lama dan belum kompatibel
  dengan contract baru sampai Slice 4 dimigrasikan.
- Queue, events, dan idempotency masih process-local.
- Auth dan ownership tetap ditunda dan memblokir release berdasarkan D-013.

Next smallest slice:

- Mulai Slice 2: lifecycle transition, revision guard, retry/cancel fence, dan
  canonical error envelope sebelum frontend server-state migration.

### 2026-09-08 - Lifecycle revision guards

Status: backend verified; Slice 2 in progress.

Changes:

- Start, cancel, dan retry mewajibkan `If-Match`.
- Missing, malformed, dan stale revision menghasilkan 428, 400, dan 409.
- Cancel hanya berlaku pada session dengan active attempt dan active lifecycle.
- Retry hanya berlaku dari failed, partial, atau cancelled dan langsung enqueue
  attempt baru.
- Stale worker memeriksa attempt setelah provider await sebelum memutasi status.
- CORS, README, dan OpenAPI diselaraskan dengan revision precondition.

Evidence:

- Backend commit `6b8593d`.
- Typecheck, build, 29 tests, dan focused OpenAPI/lifecycle tests lulus.
- Full suite selesai 4,85 detik dengan timeout 30 detik.

Open risks:

- Repository file masih mengembalikan mutable object references dan belum
  transactional; CAS belum aman lintas process sampai durable store tersedia.
- Error envelope lain di luar start/cancel/retry belum distandardisasi.
- Frontend belum mengirim `If-Match`; backend commit belum dideploy agar UI live
  tidak terputus.

Next smallest slice:

- Standarkan error envelope/request ID dan allowed transition registry, lalu
  migrasikan frontend create/start agar backend dapat dideploy tanpa regresi.

### 2026-09-08 - Request ID dan canonical frontend execution

Status: verified untuk create/start/refetch; deployment pending.

Actual before:

- Response backend belum memiliki request ID konsisten.
- Frontend mengirim payload create legacy, memanggil `/execute` dan `/steps`, serta
  tidak mengirim revision saat start.
- Halaman sesi mengorkestrasi lima step dan menulis status hasil sendiri.

Changes:

- Backend membuat satu UUID per request, mengekspos `X-Request-ID`, dan
  menambahkannya ke JSON envelope termasuk validation/global errors.
- OpenAPI mendokumentasikan request ID sebagai bagian wajib response envelope.
- Frontend mengirim full brief IDX dan `If-Match` dari revision create ketika
  memanggil canonical start.
- Halaman sesi menghapus orchestration `/steps` dan polling snapshot backend
  sampai terminal; empty candidates dan nullable attempt IDs diperlakukan sebagai
  state authoritative.
- UI menghapus label endpoint step dan response JSON sintetis.

Evidence:

- Backend commit `18d3d44`; typecheck, build, 12 files/30 tests lulus.
- Frontend commit `db1902e`; build dan 19-route smoke lulus.
- `npm run test:canonical-flow` lulus dan mencegah referensi `/steps`, `/execute`,
  `runResearchStep`, atau `executeResearchSession` kembali ke flow runtime.
- Browser smoke terhadap backend lokal membuktikan create HTTP 201 dengan full
  brief, start HTTP 202 dengan `If-Match: 1`, lalu GET snapshot terminal revision
  7 dengan lima kandidat.

Open risks:

- Backend baru dan frontend baru belum dideploy bersama; production tetap memakai
  kontrak lama sampai deployment terkoordinasi.
- Cancel/retry, SSE refetch, session library, dan localStorage masih belum
  sepenuhnya backend-authoritative.
- Sebagian controller backend masih mengembalikan legacy `{ error }`; request ID
  konsisten tetapi seluruh error envelope belum selesai.
- Auth, ownership, static browser token, dan durable persistence tetap release
  blocker berdasarkan D-013.

Next smallest slice:

- Migrasikan cancel/retry ke `If-Match` dan authoritative refetch, lalu ubah SSE
  menjadi change signal yang selalu memicu snapshot refresh sebelum deployment
  frontend/backend terkoordinasi.

### 2026-09-08 - Authoritative lifecycle commands dan SSE refetch

Status: verified untuk cancel/retry/SSE client; deployment pending.

Actual before:

- Cancel dan retry hanya mengubah localStorage serta menjalankan simulasi frontend.
- SSE callback menulis status, revision, dan attempt langsung dari event payload.
- Session backend yang belum ada di localStorage dialihkan ke not-found sebelum
  halaman sempat mengambil snapshot.
- Hydrator menganggap `IDLE`, `PARTIAL`, dan `NEEDS_INPUT` sebagai active execution.

Changes:

- Cancel dan retry mengirim `If-Match` dari revision snapshot lalu menghidrasi
  response backend; conflict memicu GET recovery tanpa optimistic overwrite.
- SSE hanya menjadi change signal yang memicu GET snapshot; polling 750 ms tetap
  menjadi fallback dan berhenti pada terminal state.
- Snapshot dengan revision lebih rendah tidak dapat menimpa sesi aktif.
- Active execution memakai allowlist lifecycle; `IDLE`, `PARTIAL`, dan
  `NEEDS_INPUT` tidak lagi menampilkan tombol cancel.
- Direct link `/research/:id` dapat mengambil sesi backend yang belum tersimpan
  lokal; route hasil lain tetap memakai guard existing session.

Evidence:

- Frontend commit `f1b080e`.
- `npm run test:canonical-flow`, production-env build, dan 19-route smoke lulus.
- Backend focused OpenAPI/lifecycle suite lulus: 2 files, 3 tests.
- Browser local membuktikan backend-only `IDLE` session revision 1 dapat dibuka
  langsung, full brief tampil, dan tombol cancel/retry tidak muncul.
- Browser race membuktikan cancel terhadap worker yang sudah selesai ditolak HTTP
  409; client recovery tidak mengganti snapshot terminal secara lokal.

Open risks:

- Worker fixture lokal dapat selesai sebelum user sempat cancel; ini expected
  lifecycle conflict, tetapi UX production perlu mempertahankan pesan recovery.
- Native EventSource belum memiliki auth strategy, dedupe cursor, atau durable
  replay; polling saat ini adalah reliability fallback, bukan pengganti durability.
- Delete, clarification, partial simulation, library, dan result routes belum
  seluruhnya backend-authoritative.
- Production deployment tetap ditunda sampai compatibility gate berikutnya.

Next smallest slice:

- Migrasikan library/list/delete dan hapus mutation simulasi production, lalu
  jalankan full interaction suite terhadap backend test instance sebelum deploy.

### 2026-09-08 - Backend-authoritative library dan delete

Status: verified untuk list/delete; deployment pending.

Actual before:

- Pustaka dan riwayat dashboard hanya membaca maksimum lima sesi localStorage.
- Delete hanya menghapus cache browser dan menolak penghapusan sesi terakhir.
- Backend delete tidak memiliki revision guard dan dapat dipanggil pada active
  lifecycle.

Changes:

- Frontend memuat daftar sesi backend saat bootstrap dan saat Pustaka dibuka;
  cache localStorage hanya dipertahankan jika network gagal.
- Adapter list menormalkan objective object, nullable report, brief, dan array
  artifact tanpa menciptakan kandidat atau angka finansial.
- Delete frontend mengirim `If-Match` revision, baru menghapus cache setelah HTTP
  sukses, dan merefresh list ketika command stale/gagal.
- Backend delete mewajibkan revision terbaru dan menolak active attempt/lifecycle;
  user harus cancel sebelum delete.
- UI Pustaka dan dashboard tidak lagi menyebut browser sebagai source of truth,
  dan tombol delete dinonaktifkan untuk sesi aktif.

Evidence:

- Backend commit `979825f`; build dan full suite 12 files/31 tests lulus.
- Frontend commit `6eb8919`; build, 19-route smoke, dan canonical contract check
  lulus.
- Browser local membuktikan sesi backend-only revision 1 muncul di Pustaka, DELETE
  mengirim `If-Match: 1`, mendapat HTTP 200, lalu sesi hilang dari UI dan GET list.
- Regression test backend membuktikan stale revision ditolak, active session tidak
  dapat dihapus, dan cancelled session dapat dihapus.

Open risks:

- List backend belum paginated, filtered, atau owner-scoped; seluruh sesi process
  masih terlihat karena auth ditunda.
- Adapter list masih berada di service frontend; canonical generated client/schema
  belum tersedia.
- Home tetap memakai cache saat initial render sebelum background GET selesai.
- Mutation simulasi clarification/partial dan duplicate fallback masih tersedia.

Next smallest slice:

- Hapus mutation simulasi dari production path dan migrasikan duplicate serta
  clarification ke response backend authoritative, lalu buat interaction harness
  yang memulai backend test instance sendiri.

### 2026-09-08 - Duplicate dan clarification authoritative

Status: verified untuk duplicate dan clarification answer; harness pending.

Actual before:

- Duplicate frontend jatuh ke clone localStorage ketika backend gagal.
- Clarification frontend membuat `clarification-1`, menulis note/status lokal, dan
  mengabaikan kegagalan backend.
- Tombol production dapat mensimulasikan `PARTIAL` dan `NEEDS_INPUT` tanpa event
  backend.
- Duplicate backend menyebarkan field objective legacy ke strict create schema.

Changes:

- Duplicate dan clarification answer mewajibkan `If-Match` dan memulihkan snapshot
  backend ketika stale/gagal.
- Duplicate backend membangun ulang payload hanya dari objective, preset, dan full
  brief canonical.
- Clarification answer hanya valid dari `NEEDS_INPUT`, hanya untuk request ID yang
  tersimpan dalam tool call session, dan mengembalikan persisted return status.
- Frontend membaca clarification ID dari snapshot backend dan menghidrasi response
  tanpa fallback mutation lokal.
- Tombol `Simulasikan parsial` dan client-created clarification dihapus dari UI;
  local duplicate fallback juga dihapus.

Evidence:

- Backend commit `dea1385`; build dan full suite 12 files/32 tests lulus sebelum
  validasi clarification request ID ditambahkan; focused 2 files/5 tests dan
  typecheck lulus setelah validasi tersebut.
- Frontend commit `48817d0`; build, typecheck, dan canonical contract check lulus.
- Browser local membuktikan duplicate HTTP 201 dengan `If-Match: 1`, ID baru,
  status `IDLE`, dan brief yang sama.
- Source scan membuktikan tidak ada `markPartial`, `requestClarification`,
  `Simulasikan parsial`, atau local clone fallback pada runtime frontend.

Open risks:

- Backend belum memiliki command/domain entity untuk meminta clarification; UI
  hanya dapat menjawab request yang kelak diterbitkan backend.
- Full frontend smoke harness hang dua kali pada batas 30 detik tanpa assertion
  failure setelah browser/build checks; harness process lifecycle perlu diperbaiki.
- Follow-up masih memiliki narasi fallback frontend dan belum revision-guarded.
- Production deployment tetap pending.

Next smallest slice:

- Perbaiki interaction/smoke harness agar mengelola backend, preview, Chrome, dan
  cleanup deterministik; lalu migrasikan follow-up agar tidak menghasilkan narasi
  fallback frontend sebelum deployment compatibility gate.

### 2026-09-08 - Revision-guarded follow-up dan compatibility gate

Status: verified lokal; deployment pending.

Actual before:

- Follow-up frontend dapat menghasilkan jawaban sintetis dan tool call lokal saat
  backend gagal.
- Endpoint follow-up tidak memiliki revision precondition, sehingga response dari
  snapshot stale dapat ditulis ke sesi yang lebih baru.
- Smoke memakai satu proses Chrome `--dump-dom` per route dan dapat hang saat app
  membuka polling/SSE.
- Interaction harness tidak menjalankan backend dan masih menguji lifecycle serta
  duplicate berbasis simulasi localStorage.

Changes:

- Follow-up mewajibkan `If-Match`; stale revision ditolak HTTP 409 dan mutation
  sukses menaikkan revision sesi.
- Frontend menghidrasi response follow-up backend, merefresh snapshot saat gagal,
  lalu meneruskan error tanpa membuat jawaban atau audit event sintetis.
- Canonical contract test mencegah revision header dan larangan fallback tersebut
  mengalami regresi.
- Smoke memakai satu Chrome CDP session untuk 19 HTTP routes dan sembilan rendered
  routes, dengan profile temporary serta process-group cleanup.
- Interaction harness menjalankan backend dan Vite lokal terisolasi, lalu menguji
  create/start, artifact invariants, report/export, authoritative duplicate,
  library reload, dan delete tanpa menyentuh production.
- Assertion cancel/retry/clarification simulasi dihapus dari browser harness;
  revision dan lifecycle guard-nya tetap dicakup unit test backend.

Evidence:

- Backend full suite lulus: 12 files, 33 tests; `npm run build` dan
  `git diff --check` lulus.
- Frontend `npm run test:canonical-flow`, production-env build,
  `npm run test:smoke`, `npm run test:interaction`, dan `git diff --check` lulus.
- Interaction test membuktikan duplicate membuat ID baru berstatus `IDLE`, export
  Markdown/JSON berasal dari backend, library pulih setelah reload, dan delete
  authoritative berhasil.

Open risks:

- Follow-up backend masih memakai jawaban fallback server-side ketika LLM gagal;
  tidak ada lagi fallback frontend, tetapi provenance/quality policy fallback
  backend masih perlu keputusan produk.
- Auth, ownership, static browser token, durable persistence/queue/events,
  idempotency scope, dan authenticated SSE tetap release blocker berdasarkan
  D-013.
- Backend dan frontend belum dideploy bersama; production compatibility belum
  diverifikasi.

Next smallest slice:

- Commit dan push backend terlebih dahulu, lalu frontend beserta jurnal. Setelah
  itu tentukan deployment terkoordinasi atau lanjutkan final security hardening.

### 2026-09-08 - Local LLM gateway verification

Status: provider connectivity verified locally; automated provider-success gate pending.

Changes and evidence:

- Default, example, README, dan Docker Compose menggunakan
  `https://0xapi-one.pascalyx.web.id/v1` sebagai LLM base URL.
- Credential hanya disimpan dalam `.env` lokal yang di-ignore Git; Docker Compose
  menerimanya melalui `LLM_API_KEY` environment variable.
- Authenticated `GET /v1/models` menghasilkan HTTP 200.
- Probe melalui `LlmClient` aplikasi dan model `cx/gpt-5.4-mini` menghasilkan
  HTTP 200 serta response `OK`; usage token berhasil dibaca.
- Backend typecheck, build, `git diff --check`, dan pemeriksaan tracked diff lulus
  tanpa credential.

Open risks:

- Provider-success probe belum menjadi automated test dan tidak menggantikan
  test fallback/error handling.
- Credential yang pernah dikirim melalui chat harus dirotasi setelah verifikasi.

### 2026-09-08 - Fail-closed screening dan DuPont correction

Status: verified lokal; deployment pending.

Actual before:

- Financial screening memasukkan kembali seluruh input bila kurang dari lima
  perusahaan lolos, sehingga emiten gagal dapat muncul sebagai kandidat.
- Quality stage mengurutkan seluruh input tetapi tidak menerapkan ambang kualitas
  `>= 80` yang ditampilkan kepada user.
- Rumus DuPont membagi hasil persentase dengan 100 dua kali, sehingga ROE sekitar
  20% dihitung menjadi sekitar 0,2%; minimum-pool rollback menyamarkan defect ini.
- Report menyimpan funnel hard-coded yang dapat berbeda dari stage session aktual.
- Unit suite dapat memanggil gateway LLM eksternal ketika `.env` lokal berisi key.

Changes:

- Financial screening sekarang fail closed dan tidak pernah mengembalikan simbol
  yang gagal ROE atau Debt/Equity.
- Quality stage hanya mempertahankan skor `>= 80`, mengurutkan kandidat yang lolos,
  dan menyimpan alasan `LOW_QUALITY_SCORE` untuk yang dikeluarkan.
- DuPont ROE dihitung sebagai margin persen dikali asset turnover dan equity
  multiplier, tanpa pembagian persen kedua.
- Candidate count tetap maximum; pipeline dapat menghasilkan lebih sedikit atau
  nol kandidat jika tidak ada yang memenuhi kriteria.
- Report funnel disinkronkan ke persisted session funnel setelah final stage.
- Vitest dan interaction backend memakai LLM loopback agar deterministic, cepat,
  tidak berbiaya, dan tidak bergantung provider; provider asli tetap diuji dengan
  probe manual terpisah.
- Smoke rendered checks tidak lagi memakai fake session ID untuk layar berbasis
  data. HTTP routing tetap mencakup 19 route; deep screens dicakup interaction test
  dengan session backend nyata.

Evidence:

- Focused engine tests membuktikan satu/zero passer tidak dibackfill, skor 79
  dikeluarkan, kandidat qualified diurutkan, dan DuPont 20% tetap lolos threshold.
- Backend full suite lulus: 13 files, 37 tests; build dan `git diff --check` lulus.
- Frontend build, canonical contract, full interaction test, dan smoke lulus;
  smoke mencakup 19 HTTP routes serta lima rendered routes data-independent.
- Interaction authoritative menghasilkan tiga kandidat qualified dan tetap lulus
  untuk screener, peers, report, export, duplicate, library reload, dan delete.

Open risks:

- Discovery dan unavailable company report masih memiliki synthetic fixture
  fallback; missing-value fidelity dan explicit source-kind belum selesai.
- Frontend hydrator masih mengganti missing/zero candidate fields dengan angka
  default; nullable metric contract harus dimigrasikan bersama backend.
- Preview/preset criteria belum dikompilasi dari rule set yang sama dengan engine,
  dan exclusion reasons belum dipersist sebagai stage artifact canonical.

Next smallest slice:

- Hentikan synthetic provider fallback pada unavailable data, pertahankan missing
  sebagai null, lalu migrasikan frontend types/hydrator agar tidak menciptakan
  angka finansial pengganti.

### 2026-09-08 - Explicit fixture mode dan complete-candidate boundary

Status: verified lokal; deployment pending.

Actual before:

- `getCompanyReport()` membuat laporan finansial sintetis untuk ticker unavailable
  atau provider failure, sehingga completeness selalu tampak lulus.
- Completeness hanya memeriksa keberadaan object `overview` dan `financials`, bukan
  field finite yang dipakai scoring dan evidence.
- Zero earnings, debt, atau FCF dianggap missing melalui operator `||`, lalu diganti
  angka sehat; negative FCF juga diganti yield positif.
- Frontend hydrator mengisi candidate field yang hilang dengan angka default dan
  dapat mengubah zero valid menjadi angka lain.

Changes:

- Default `SECTORS_DEMO_FIXTURES=false`; unavailable report sekarang menghasilkan
  `null`. Fixture sintetis hanya tersedia bila flag demo/test diaktifkan eksplisit.
- Completeness mewajibkan market cap/price positif, valuation finite, revenue,
  assets, dan equity positif, serta earnings/debt/FCF finite sebelum report dapat
  menjadi kandidat.
- Step financial dan quality melakukan defensive revalidation dan mencatat
  `DATA_INCOMPLETE` bila report hilang atau invalid di antara tahap.
- Metric extraction tidak lagi membuat market cap, price, valuation, earnings,
  assets, equity, debt, atau FCF pengganti. Zero debt tetap zero; zero/negative
  earnings dan FCF mempertahankan tanda aslinya.
- Kandidat final tetap non-null karena incomplete provider DTO berhenti pada
  completeness boundary; tidak diperlukan nullable migration luas pada seluruh UI.
- Frontend hydrator memakai candidate metric, score, rank, dan DuPont backend apa
  adanya tanpa healthy defaults.
- Interaction test mengaktifkan fixture mode secara eksplisit; production default,
  README, `.env.example`, dan Docker Compose tetap false.
- Browser harness menunggu server sebelum Chrome, route/lazy component readiness,
  dan memulai smoke dari `about:blank` untuk menghapus startup flake.

Evidence:

- Focused suite lulus: 11 tests untuk engine dan provider cache/null behavior.
- Full backend suite lulus: 13 files, 42 tests; build dan diff check lulus.
- Regression membuktikan unavailable/empty report dikeluarkan, report yang hilang
  sebelum quality mendapat reason, zero debt tetap `0`, dan negative FCF tetap
  negatif.
- Frontend canonical contract, production-env build, 19-route smoke dengan lima
  rendered checks, full interaction, dan diff check lulus.

Open risks:

- Discovery masih dapat memakai priority universe/fallback list; source-kind dan
  provenance fixture belum menjadi field canonical pada setiap artifact.
- Current ratio, growth CAGR, consistency score, dividend default, forward
  estimates, segment/ownership mix, dan beberapa narrative masih generated
  presentation values dan perlu dihapus atau diberi label estimate.
- Detailed engine exclusion reasons belum dipersist dalam stage artifact; endpoint
  masih merekonstruksi alasan generic dari membership delta.

Next smallest slice:

- Persist structured stage input/exclusion reasons dari engine dan ubah Screener
  agar memakai artifact backend, lalu hapus local recomputation berdasarkan
  fixture/preset frontend.

### 2026-09-08 - Authoritative screening artifacts dan exclusion reasons

Status: verified lokal; deployment pending.

Actual before:

- Darwin engine menghasilkan `inputSymbols`, retained membership, exclusion count,
  dan structured reason, tetapi `ResearchService.runStep()` hanya menyimpan retained
  symbols dan membuang artifact lain.
- Endpoint stage companies merekonstruksi membership dari stage sebelumnya dan
  membuat generic financial reason yang bukan hasil engine.
- Controller mengabaikan query `disposition` walau frontend API client sudah
  mendukungnya.
- Screener menghitung ulang excluded membership dan reason dari fixture serta
  active preset frontend, sehingga threshold dapat berbeda dari engine.

Changes:

- Setiap persisted screening stage sekarang menyimpan canonical `stageId`,
  `inputSymbols`, `retainedSymbols`, `excludedSymbols`, `excludedCount`, dan
  structured `reasons`; report funnel memakai artifact session yang sama.
- Schema field baru optional agar persisted session lama tetap dapat dibaca.
- Endpoint stage companies memakai artifact tersimpan, memvalidasi
  `disposition=RETAINED|EXCLUDED`, dan didokumentasikan dalam OpenAPI.
- Legacy sessions memakai membership delta sebagai fallback, tetapi reason diberi
  `LEGACY_REASON_UNAVAILABLE` dan tidak lagi mengarang threshold finansial.
- Screener merender membership dan reason backend dari authoritative session
  snapshot. Fixture universe serta preset-specific reason reconstruction dihapus.
- Emiten yang gugur tanpa final dossier tetap tampil sebagai symbol dengan metrik
  unavailable dan tidak membuka candidate modal palsu.

Evidence:

- Backend focused schema/service/OpenAPI suite lulus: 3 files, 9 tests.
- Backend full suite lulus: 13 files, 43 tests; typecheck, build, dan diff check
  lulus.
- Frontend production-env build, Vue typecheck, canonical contract, 19-route smoke
  dengan lima rendered checks, dan diff check lulus.
- Full interaction lulus dan membuktikan setiap input stage berada pada retained
  atau excluded membership, exclusion count konsisten, serta reason kualitas
  `di bawah batas 80/100` dirender dari backend artifact.

Open risks:

- Endpoint membership belum paginated; scope saat ini hanya universe kecil.
- Sesi legacy tidak memiliki historical structured reasons dan hanya dapat
  menyatakan bahwa alasan rinci unavailable.
- Discovery source-kind/provenance dan generated presentation metrics yang dicatat
  pada slice sebelumnya belum diselesaikan.

Next smallest slice:

- Hapus atau labeli generated presentation metrics dan narrative estimates,
  kemudian tambahkan source-kind serta sourceRef canonical pada screening artifact.

### 2026-09-08 - Evidence-backed candidate metrics dan artifact provenance

Status: verified lokal; deployment pending.

Actual before:

- Engine membuat EV/EBITDA dari PEG atau konstanta, current ratio, CAGR, dividend
  yield, consistency score, peer rank, return harga, target konsensus, segment mix,
  ownership, payout ratio, index membership, tanggal, dan periode tanpa evidence
  provider yang sesuai.
- Growth dan consistency sintetis memengaruhi quality score serta threshold shortlist.
- Candidate dossier mengisi tanggal hari ini dan periode hard-coded bila source tidak
  tersedia; export dapat menulis `undefinedx` atau harga nol.
- UI menganggap field tersebut selalu tersedia dan beberapa layar memberi label
  `Fixture v1` pada evidence URL Sectors maupun session authoritative.
- Screening membership belum membawa `sourceKind` dan `sourceRef` canonical.

Changes:

- Generated market/presentation values dihapus dari candidate output. ESG, index
  membership, price date, dan tahun laporan hanya diterbitkan bila provider memberi
  nilai nyata.
- Quality score aktif memakai profitability, solvency, dan valuation yang memiliki
  evidence; bobot 25:20:20 dinormalisasi ke skala 0-100. Growth dan consistency
  tetap unavailable, bukan diisi nol atau konstanta.
- Methodology, filter copy, fallback thesis, dossier, dan Markdown export diselaraskan
  dengan model tiga faktor terobservasi; fallback tanggal/periode/harga palsu dihapus.
- Setiap screening stage menyimpan `sourceKind: voyager-derived` dan stable
  `sourceRef: voyager://research/{sessionId}/screening/{stageId}`. Fixture-only
  artifacts memakai `fixture://prototype-fixture-v1`.
- Frontend types, hydrator, peer workbench, report, company dossier, modal, cards,
  methodology, activity, trace, dan provenance menerima optional values dan
  menampilkan unavailable tanpa mengubahnya menjadi zero.
- Evidence URL Sectors sekarang dilabel sebagai Sectors API; source display dan
  fallback JSON export mengikuti metadata artifact sesi.

Evidence:

- Regression engine membuktikan current ratio, CAGR, dividend yield, listing
  performance, growth score, dan consistency score tidak diterbitkan tanpa source.
- Backend focused gate lulus: 4 files, 17 tests. Full suite lulus: 13 files,
  43 tests; typecheck, build, placeholder search, dan diff check lulus.
- Frontend Vue typecheck, production-env build, canonical contract, 19-route smoke
  dengan lima rendered checks, dan diff check lulus.
- Full interaction lulus serta membuktikan tiga score factors tersedia, growth dan
  consistency tetap absent, dan semua route report/dossier/peer tetap berfungsi.

Open risks:

- Formula quality score belum memiliki `formulaVersion`; session sebelum perubahan
  dapat memiliki skor dengan basis lima faktor sintetis.
- Historical session payload tidak dimigrasikan atau dibersihkan otomatis.
- Optional Sectors endpoints untuk segments, shareholders, corporate actions, dan
  listing performance belum diintegrasikan ke candidate artifact.
- Discovery masih dapat memakai explicit demo fixture universe pada test/demo mode;
  runtime source origin live/cache/fixture belum direkam pada provider response.

Next smallest slice:

- Version quality formula dan candidate artifact, lalu pisahkan metadata origin
  provider (`live`, `cache`, `stale-cache`, `demo-fixture`) dari provenance hasil
  turunan Voyager agar session lama dan baru dapat dibedakan secara deterministic.

### 2026-09-08 - Artifact versioning dan provider source origin

Status: verified lokal; deployment pending.

Actual before:

- Session baru dan lama tidak dapat dibedakan berdasarkan versi formula atau shape
  candidate/screening artifact.
- Provenance stage hanya menyatakan hasil turunan Voyager; origin report provider
  yang dipakai engine tidak menyatakan live, cache, stale cache, atau demo fixture.
- Fresh cache hit dan stale-if-error tidak terlihat pada candidate maupun stage,
  sementara fixture yang masuk cache berisiko tampak seperti cache provider nyata.
- UI lineage menampilkan source reference tetapi tidak menampilkan versi artifact,
  versi formula, atau origin provider.

Changes:

- Candidate baru memakai `artifactVersion: candidate-v2` dan
  `formulaVersion: quality-3f-v1`.
- Screening stage baru memakai `artifactVersion: screening-stage-v2`; quality dan
  final stage juga menyimpan `formulaVersion: quality-3f-v1`.
- `SectorsClient` menandai response dengan `sourceOrigin`: `live`, `cache`,
  `stale-cache`, atau `demo-fixture` pada boundary provider/cache.
- Demo fixture yang disajikan ulang dari cache tetap berorigin `demo-fixture` dan
  tidak disamarkan menjadi provider cache. Local fallback tanpa metadata juga
  diperlakukan konservatif sebagai demo fixture.
- Engine mengagregasi origin report ke setiap stage dan mempertahankan origin pada
  candidate final. Endpoint stage companies dan OpenAPI meneruskan metadata versi
  serta origin.
- Schema field baru optional agar session lama tetap readable; artifact baru selalu
  mengirim field versioning tersebut.
- Frontend types dan hydrator mempertahankan metadata. `DataProvenance` menampilkan
  provider origin serta versi artifact/formula secara terpusat.

Evidence:

- Focused backend gate lulus: 5 files, 22 tests. Regression membuktikan stale cache
  menjadi `stale-cache`, fixture cache tetap `demo-fixture`, schema legacy tetap
  diterima, dan session baru menyimpan version/origin lengkap.
- Backend full suite lulus: 13 files, 44 tests; typecheck, build, dan diff check
  lulus.
- Frontend Vue typecheck, production-env build, canonical contract, 19-route smoke
  dengan lima rendered checks, dan diff check lulus.
- Full interaction lulus dan membuktikan `screening-stage-v2`, `candidate-v2`,
  `quality-3f-v1`, serta `demo-fixture` melewati backend, persistence, hydration,
  dan lineage UI.

Open risks:

- Session lama tetap tidak memiliki version/origin metadata; UI menampilkan
  unavailable dan tidak menebak versinya.
- Cache masih in-memory dan origin metadata belum memiliki timestamp, age, TTL,
  atau persisted cache-entry identity.
- Local JSON fallback tidak memiliki manifest origin; saat ini sengaja dilabel
  `demo-fixture` agar tidak mengklaim data live.
- Report top-level belum versioned karena semantics report belum distabilkan.

Next smallest slice:

- Tambahkan freshness metadata (`retrievedAt`, `cachedAt`, `expiresAt`, `staleAt`)
  dan provider source reference per candidate/stage, lalu render warning stale cache
  tanpa mengubah status riset yang sudah completed.

### 2026-09-09 - Provider freshness metadata dan stale warning

Status: verified lokal; deployment pending.

Actual before:

- Provider origin tersedia tetapi tidak menyatakan kapan data diambil, kapan masuk
  cache, kapan expired, atau kapan stale fallback benar-benar digunakan.
- Stage hanya menyimpan origin aggregate; candidate tidak memiliki provider source
  reference yang terikat freshness clock.
- UI tidak dapat membedakan cache valid dari stale-if-error secara temporal dan
  tidak memberi warning saat riset completed memakai stale cache.

Changes:

- Provider response sekarang membawa structured `providerSource`: `origin`,
  `sourceRef`, `retrievedAt`, serta optional `cachedAt`, `expiresAt`, dan `staleAt`.
- Fresh cache hit mempertahankan `retrievedAt` fetch asli; waktu penyajian cache tidak
  menyamarkan umur data. `staleAt` hanya ditulis saat stale payload benar-benar
  disajikan melalui stale-if-error.
- Discovery live memakai source URL `/companies/`; company report memakai endpoint
  ticker; fixture memakai URI `fixture://` eksplisit.
- Candidate final menyimpan satu provider source report. Screening stage menyimpan
  deduplicated `providerSources` untuk seluruh input yang dievaluasi pada stage itu.
- Schema dan endpoint stage companies tetap menerima session lama tanpa freshness
  metadata; OpenAPI mendokumentasikan full provider source shape.
- Frontend types dan hydrator mempertahankan metadata. Lineage audit menampilkan
  waktu retrieval dan stale fallback timestamp.
- `DataProvenance` menampilkan accessible `role=alert` warning hanya bila origin
  `stale-cache`; lifecycle session tetap `COMPLETED` dan hasil tidak diubah menjadi
  failure palsu.

Evidence:

- Focused backend gate lulus: 4 files, 14 tests. Regression membuktikan stale source
  mempertahankan original `retrievedAt`, memiliki cache/expiry/stale clocks, dan
  demo fixture cache tetap dilabel fixture.
- Backend full suite lulus: 13 files, 44 tests; typecheck, build, dan diff check
  lulus.
- Frontend Vue typecheck, production-env build, canonical contract, 19-route smoke
  dengan lima rendered checks, dan diff check lulus.
- Canonical contract membuktikan stale warning memakai `role=alert`; full interaction
  membuktikan freshness metadata normal melewati persistence/hydration dan seluruh
  authoritative flow tetap lulus tanpa warning palsu.

Open risks:

- Cache masih in-memory; restart menghapus entry dan clock cache.
- Freshness policy masih TTL global satu jam dan stale-if-error 24 jam, belum
  berbeda per endpoint atau market schedule.
- UI menampilkan ISO timestamp agar audit exact; localized relative age belum ada.
- Stale source tidak otomatis memicu refresh/retry karena completed artifact harus
  tetap immutable sampai attempt baru dibuat.

Next smallest slice:

- Persist provider cache metadata/payload secara durable atau pindahkan ke cache
  backend terkelola, lalu version dan uji endpoint-specific TTL policy tanpa
  mengubah immutable published session artifacts.

### 2026-09-09 - Durable provider cache dan endpoint TTL

Status: verified lokal; deployment server pending.

Changes:

- `SectorsClient` mempertahankan in-memory map sebagai read path cepat dan menyimpan
  live provider entries ke `sectors-v1.json` memakai temporary file + atomic rename.
- Startup memuat cache yang version/base URL-nya cocok, mengabaikan malformed entry,
  dan memangkas entry yang sudah melewati stale-if-error window.
- Fixture tidak dipersist agar restart atau perubahan demo mode tidak membuat data
  demo menutupi provider live.
- Discovery memakai TTL 24 jam; company report memakai TTL 1 jam; stale-if-error
  tetap 24 jam dan sekarang juga berlaku pada discovery provider failure.
- Cache directory dan ketiga policy clock divalidasi melalui environment schema.
- Docker image membuat `/app/data/provider-cache`; Compose memasang bind mount pada
  path tersebut. Production aktual memakai server PM2, bukan Railway.
- `clearCache()` menghapus memory dan durable file. Load, write, dan clear failure
  menurunkan cache durability tanpa menggagalkan valid provider response.

Evidence:

- Focused typecheck dan 11 persistence/cache tests lulus: restart reload, durable
  clear, corrupt file tolerance, base URL isolation, fixture isolation, stale-window
  pruning, stale fallback, dan endpoint-specific TTL.
- Backend full suite lulus: 13 files, 49 tests; build dan diff check lulus.
- Docker manifest runtime check tidak dapat dijalankan karena Docker CLI tidak
  tersedia di WSL ini; perubahan Compose terbatas pada bind mount baru.

Open risks:

- Filesystem cache hanya benar untuk deployment single-process saat ini; multi-replica
  memerlukan shared cache dan koordinasi writer.
- Server PM2 perlu memakai durable path `/home/ubuntu/voyager-be-one/data/provider-cache`
  dengan permission untuk deployment user.
- Atomic synchronous serialization sesuai cache kecil/low-write saat ini, tetapi perlu
  diganti queued async/shared store bila payload atau write rate meningkat signifikan.

Next smallest slice:

- Deploy backend ke server PM2, lalu verifikasi cache hit tetap tersedia setelah
  process restart. Frontend production tetap dikelola Vercel Git integration.

### 2026-09-09 - Coordinated production deployment

Status: deployed dan production compatibility verified.

Topology:

- Backend berjalan pada server `43.134.52.193` sebagai PM2 app `voyager-be-one`
  dari `/home/ubuntu/voyager-be-one`, bind lokal `127.0.0.1:3003`, lalu Caddy dan
  Cloudflare mengekspos `https://voyager.pascalyx.web.id`.
- Frontend berjalan di Vercel melalui Git integration pada
  `https://voyager-fe-one.vercel.app`; Railway tidak digunakan.

Deployment:

- Server adalah artifact tree tanpa `.git`; source backend disinkronkan dengan
  `.env`, `data/`, `node_modules/`, dan build output dikecualikan dari overwrite.
- Backup pre-deploy tanpa secret/runtime data tersedia di
  `/home/ubuntu/voyager-be-one-backups/20260909T162429Z/app-before-deploy.tgz`.
- Dependency lockfile dan PM2 config server cocok dengan repository lokal.
- Build TypeScript dijalankan di server setelah `npm ci --include=dev`; setelah
  restart sehat, dependencies dipangkas kembali dengan `npm prune --omit=dev`.
- PM2 process list disimpan setelah deployment dan durability restart check.
- Vercel production deployment `6342185458` untuk frontend commit `f60f454`
  berstatus success.

Production evidence:

- Public dan local backend health mengembalikan HTTP 200; response backend baru
  memiliki `requestId`.
- Production OpenAPI memuat `providerSources`, `staleAt`, dan `If-Match`.
- PM2 menjalankan compiled durable-cache artifact sebagai single fork process.
- Controlled IDLE session `RES-c030567c-7130-452e-a65b-b6edc0f60678` berhasil
  membuat live discovery cache `sectors-v1.json` version 1.
- Cache file bertahan byte-identik setelah PM2 restart; session juga tetap terbaca.
  Probe kemudian dihapus menggunakan current revision dan endpoint mengembalikan 404.
- Vercel production menyajikan asset hash yang sama dengan verified local build;
  19-route production HTTP smoke lulus.

Limitations dan security follow-up:

- Browser MCP production check tidak berjalan karena local CDP runtime menolak
  koneksi; tidak ada klaim browser-interaction production dari deployment ini.
- `npm audit` melaporkan satu moderate production dependency finding. Tidak ada
  automatic breaking upgrade saat deployment; triage dependency dilakukan terpisah.
- Password server yang dikirim melalui chat harus dirotasi walaupun deployment
  memakai SSH key dan password tersebut tidak digunakan.
- PM2 environment listing dapat mengekspos credentials service lain kepada user
  server yang sama; credentials yang sempat tampil harus dirotasi dan secrets perlu
  dipindahkan dari process-list-visible configuration bila platform mendukungnya.

Next smallest slice:

- Triage moderate dependency finding, tambah reproducible server deploy/rollback
  script yang mempertahankan `.env` dan `data`, lalu jalankan browser production
  interaction/a11y gate saat CDP runtime tersedia.

### 2026-09-10 - Non-technical UI/UX/CX simplification

Status: deployed dan production browser verified.

Assessment before:

- UI visual cukup konsisten, tetapi UX masih menyerupai engineering console.
- Header menampilkan revision, SSE, idempotency, dan auth pada semua halaman.
- Navigasi global mencampur tugas utama, metodologi, scheduler, proses, dan audit.
- Form menampilkan banyak preferensi yang belum memengaruhi hasil seolah setara
  dengan aturan seleksi yang benar-benar digunakan.
- Sumber data menampilkan tenant, owner, artifact version, digest, dan riwayat audit
  langsung dalam alur baca utama.
- Session selesai memprioritaskan cara kerja sebelum laporan dan kandidat.

Changes:

- Sidebar desktop memiliki tiga tugas utama: Beranda, Pustaka riset, dan Riset baru.
  Bantuan tetap tersedia; proses dan audit hanya muncul dari konteks sesi.
- Mobile memiliki empat tujuan stabil: Beranda, Riset baru, Pustaka, dan Lainnya.
  Navigasi global tidak lagi bergantung pada session terakhir di store.
- Header hanya menampilkan plain-language status pada route session; badge
  infrastructure dihapus dari UI umum.
- Form memprioritaskan tujuan dan aturan seleksi. Preferensi yang belum memengaruhi
  kandidat dipindah ke disclosure `Preferensi lanjutan` yang tertutup default.
- Submission memiliki busy state dan network error memakai bahasa layanan yang dapat
  dipahami, bukan pesan backend/response internal.
- `DataProvenance` menjadi `Sumber data`; hanya asal, periode, dan waktu pembaruan
  yang terlihat. Version dan audit history tetap tersedia melalui disclosure.
- Fixture provenance tidak lagi meminta endpoint backend, menghapus tiga 404/error
  console pada home production.
- Session selesai memprioritaskan `Baca laporan`; proses dilipat sebagai
  `Cara hasil ini dibuat`. Istilah brief, universe, artifact, dan backend diganti
  dengan pilihan riset, perusahaan yang diperiksa, hasil, dan langkah riset.
- Home dan pustaka menghapus provenance berulang serta istilah workspace backend.

Verification:

- Frontend Vue typecheck, production build, canonical contract, 19-route smoke, dan
  full interaction suite lulus.
- Playwright WSL local visual check lulus pada desktop dan mobile tanpa horizontal
  overflow; advanced preferences tertutup; infrastructure terms tidak terlihat;
  console home/new research bersih.
- Backend full suite tetap lulus 49 tests dan build.
- Transitive `qs` dinaikkan dari 6.15.3 ke 6.16.0; production audit kini 0 finding.
- Backend security patch aktif di server dengan local/public health 200.
- Vercel production deployment `6355694396` sukses. Playwright production home
  tidak memiliki console warning/error, hanya meminta session list HTTP 200, dan
  tidak lagi meminta provenance untuk fixture.

Remaining UX opportunities:

- Report masih memiliki tujuh section dan beberapa export/view controls; sederhanakan
  menjadi Ringkasan, Kandidat, Risiko, serta Bukti dan metode.
- Scheduler masih cron-first dan cocok ditempatkan sebagai fitur lanjutan sampai ada
  form frekuensi/waktu/zona waktu yang lebih manusiawi.
- Loading/offline state pustaka dan polling session masih perlu membedakan cache lokal,
  gangguan koneksi, dan empty state secara eksplisit.

### 2026-09-10 - Report, jadwal, dan state pustaka sederhana

Status: deployed dan production verified.

Changes:

- Navigasi laporan diringkas dari tujuh menjadi empat bagian: Ringkasan, Kandidat,
  Risiko, serta Bukti dan metode. Ruang lingkup, ranking, analisis kandidat, dan
  pembanding tetap tersedia di dalam empat bagian tersebut.
- Cetak/simpan PDF menjadi aksi export utama. Salin ringkasan, mode dokumen A4,
  Markdown, dan JSON tetap tersedia melalui `Pilihan lain`.
- Form jadwal mengganti input Cron dengan frekuensi, waktu, dan zona waktu yang dapat
  dipahami. Backend menyimpan metadata pilihan tersebut dan tetap menerima
  `cronExpression` untuk kompatibilitas task lama.
- Copy scheduler secara eksplisit menyatakan eksekusi otomatis belum aktif;
  `Jalankan sekarang` tetap satu-satunya jalur eksekusi yang dijanjikan.
- Pustaka membedakan loading awal, gangguan koneksi tanpa cache, gangguan koneksi
  dengan daftar lokal terakhir, hasil filter kosong, dan pustaka kosong.

Verification:

- Frontend Vue typecheck, production build, canonical contract, 19-route smoke, dan
  full interaction suite lulus, termasuk empat report tab, export, dan mobile ranking.
- Backend full suite lulus 13 files/49 tests; typecheck, build, diff check, dan
  production dependency audit lulus dengan 0 vulnerability.
- Scheduler metadata memiliki focused persistence assertion untuk frekuensi, waktu,
  dan zona waktu.
- Backend commit `6226bdd` aktif di PM2 dan frontend commit `6fac8f4` berhasil
  dideploy Vercel. Health backend lokal/public menghasilkan HTTP 200.
- Backup pre-deploy backend tersedia di
  `/home/ubuntu/voyager-be-one-backups/20260909T181225Z/app-before-deploy.tgz`.
- Playwright production mobile memastikan dialog jadwal dapat di-scroll, tombol
  tutup berukuran 44px, dan field frekuensi/waktu/zona waktu tampil tanpa overflow.

Known limitation:

- Backend belum memiliki timer/parser Cron aktif. Metadata jadwal baru hanya
  menyimpan pilihan user sampai runtime scheduler dibangun dan diuji terpisah.

### 2026-09-11 - Frontend bank-evidence-v1

Status: implemented dan local verified; tidak commit, push, atau deploy.

Reason:

- Backend sibling mengoreksi objective bank dari filter nilai menjadi tinjauan bukti.
  ROE provider berasal dari earnings/equity dengan basis yang dapat tidak cocok dan
  P/BV historis belum terverifikasi basis tanggal/saham, sehingga keduanya tidak layak
  menjadi ambang, skor, ranking kualitas, atau rekomendasi.

Changes:

- Frontend memakai objective exact backend, `bank-evidence-contract-v1`,
  `objectiveType: bank-evidence`, dan `formulaVersion: bank-evidence-v1`.
- Form bank menyembunyikan kontrol jumlah kandidat dan mengirim 8; laporan menyatakan
  hingga delapan data tersedia. Generic tiga faktor tetap compatibility-only dan tidak
  tersedia sebagai pilihan riset baru.
- Semua tampilan bank menjelaskan membership dinamis berdasarkan ketersediaan data dan
  urutan market cap provider. ROE diberi label `provider-derived-unverified`; P/BV
  historis diberi label basis belum terverifikasi. Bahasa filter, lolos, skor, kualitas,
  ranking, ambang, dan rekomendasi dihapus dari cabang bank.
- Runtime sintetis memakai membership dinamis, mempertahankan BBNI-like ROE 10% dan
  P/BV -0,5, serta membuat satu top-eight tidak lengkap untuk menguji `cannot_assess`.
  Assertion sumber memastikan tidak ada logika simbol bank hardcoded di frontend.

Verification:

- `npm run test:canonical-flow`: lulus.
- `npm run test:interaction`: lulus di Chromium.
- `npm run test:smoke`: lulus 21 route tanpa runtime exception.
- `npx vue-tsc -b`: lulus.
- `VITE_BACKEND_URL=http://127.0.0.1:3000 npm run build`: lulus.
- `npm run test:architecture`: gagal terpisah pada atlas lama dengan
  `Error: activity (desktop):`. File arsitektur tidak berubah dan kegagalan ini tidak
  disembunyikan dalam klaim verifikasi frontend.
