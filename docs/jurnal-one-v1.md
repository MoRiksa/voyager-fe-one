# Jurnal One V1 - Acuan End-to-End Voyager One

## 1. Status Dokumen

| Field | Value |
| --- | --- |
| Dokumen | Acuan tunggal delivery end-to-end Voyager One V1 |
| Status | Aktif, baseline dan review UI/UX/CX selesai, implementasi korektif belum dimulai |
| Last updated | 2026-09-08 |
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

Jika implementasi berubah, perbarui kolom **Actual**, checklist fase, bukti
verifikasi, keputusan, risiko, dan tanggal dokumen ini dalam commit yang sama.
Jangan menandai checklist selesai hanya karena kode sudah ditulis; checklist baru
selesai setelah acceptance criteria dan verifikasi terkait lulus.

## 2. North Star Produk

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
- [ ] Frontend interaction test lulus terhadap backend test instance.
- [x] Backend typecheck dan build lulus.
- [x] Backend unit test lulus: 10 files, 28 tests.
- [ ] Backend tests membuktikan provider success, bukan hanya fallback saat LLM
  atau Sectors gagal.
- [ ] Cross-repository contract test tersedia di CI.

Catatan: interaction test frontend saat baseline gagal pada pembuatan sesi karena
harness preview tidak menyediakan `VITE_BACKEND_URL`. Test tersebut juga masih
mengasumsikan `localStorage` dan simulasi frontend sebagai system of record.

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
| Create payload | Frontend tidak mengirim full `brief` | Objective, preset, dan seluruh brief dikirim | Blocked |
| Candidate count | Backend memakai `brief.candidateCount` sebagai field tunggal; frontend belum mengirim full brief | Request 2 menghasilkan maksimum 2 | Backend verified; frontend blocked |
| Source of truth | Backend dan `localStorage` sama-sama menyimpan artifact | Backend database authoritative; localStorage preference only | Blocked |
| Execution ownership | Backend `start` sudah enqueue satu job; frontend masih memanggil `/execute` dan `/steps` | Satu flow: create -> start -> worker -> SSE signal -> snapshot | Backend verified; frontend blocked |
| Lifecycle | Backend completion membersihkan active attempt; frontend masih mensimulasikan status | Backend menjalankan lifecycle dan clear active attempt atomik | Backend partial; frontend blocked |
| Attempt fence | Worker memverifikasi attempt sebelum dan sesudah setiap provider await | Old/cancelled attempt tidak dapat menulis/publish | Backend verified for current worker |
| Revision guard | Backend mewajibkan `If-Match` pada start/cancel/retry; frontend belum mengirimnya | Seluruh mutasi rawan race memakai revision guard dan recovery | Backend partial; frontend blocked |
| Idempotency | Timestamp key; backend key global tanpa principal/path/body digest | Stable action key, scoped identity+method+route+body | Blocked |
| SSE auth | Native EventSource tanpa auth header; bekerja karena guest full-access | Auth-compatible SSE strategy diputuskan | Blocked |
| SSE contract | Event names dan envelope custom; no dedupe/gap guard | Contract event registry, replay, dedupe, revision gap refetch | Blocked |
| Session list | Backend mengembalikan semua sesi; frontend tidak menggunakannya | Paginated, filtered, owner-scoped library | Blocked |
| Screening | Frontend dapat derive exclusion; backend mengembalikan symbol aggregate | Persisted paginated membership dan reasons authoritative | Blocked |
| Filter truth | Backend dapat memasukkan kembali emiten gagal agar pool >= 5 | Threshold diterapkan apa adanya; zero candidate valid | Blocked |
| Quality threshold | Label menyebut >=80 tetapi tidak memfilter | Formula/version/missing policy diterapkan dan diuji | Blocked |
| Candidate data | Frontend dan backend mengisi missing dengan angka/narasi sintetis | Missing null; fixture/synthetic hanya explicit demo mode | Blocked |
| Money | Number/float legacy | Decimal string + currency pada contract canonical | Blocked |
| Dossier root | Backend/client memakai `candidate` | Root canonical `dossier` atau kontrak dibekukan konsisten | Decision |
| Peer root | Backend/client memakai `benchmarks` | Root canonical `peerBenchmarks` atau kontrak dibekukan konsisten | Decision |
| Activity root | Backend/client memakai `activities` | Root canonical `activity` atau kontrak dibekukan konsisten | Decision |
| Errors | Fixed frontend messages; mixed backend shapes | Structured envelope, request ID, violations, warnings, recovery | Blocked |
| Clarification | Frontend membuat ID `clarification-1`; backend tidak membuat real clarification | Backend-issued clarification entity dan persisted return status | Blocked |
| Cancel/retry/delete | Sebagian aksi hanya mengubah local state | Semua command authoritative di backend | Blocked |
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
- [ ] Persist stage membership retained/excluded beserta reason.
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
- [ ] Funnel count sama dengan persisted membership.
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
- [ ] User dapat membuat full research brief tanpa field hilang.
- [ ] Backend menyusun dan menjalankan plan tanpa orchestration frontend.
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
