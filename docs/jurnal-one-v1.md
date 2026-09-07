# Jurnal One V1 - Acuan End-to-End Voyager One

## 1. Status Dokumen

| Field | Value |
| --- | --- |
| Dokumen | Acuan tunggal delivery end-to-end Voyager One V1 |
| Status | Aktif, baseline audit selesai, implementasi korektif belum dimulai |
| Last updated | 2026-09-07 |
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
| Candidate count | `brief.candidateCount` dapat dikalahkan default top-level 5 | Satu canonical field; request 2 menghasilkan maksimum 2 | Blocked |
| Source of truth | Backend dan `localStorage` sama-sama menyimpan artifact | Backend database authoritative; localStorage preference only | Blocked |
| Execution ownership | Frontend memanggil `/execute`, lalu `/steps`; store juga punya async flow | Satu flow: create -> start -> worker -> SSE signal -> snapshot | Blocked |
| Lifecycle | Banyak status hanya disimulasikan frontend; completed masih punya active attempt | Backend menjalankan lifecycle dan clear active attempt atomik | Blocked |
| Attempt fence | Queue membawa attempt ID tetapi worker commit tidak memverifikasi ulang | Old/cancelled attempt tidak dapat menulis/publish | Blocked |
| Revision guard | Frontend tidak mengirim `If-Match`; backend tidak enforce CAS | Mutasi rawan race wajib revision guard dan 409 recovery | Blocked |
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
| UI complexity | Fundamental workflow luas dan technical detail mudah ikut tampil | Task-first, one primary action, progressive disclosure | Review next |
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
| 1 | Contract and Security Gate | Not started | 2-4 hari kerja |
| 2 | Backend Authoritative Core | Not started | 3-5 hari kerja |
| 3 | Data Fidelity and Artifact Contract | Not started | 5-8 hari kerja |
| 4 | Frontend Server-State Migration | Not started | 4-7 hari kerja |
| 5 | Durable Worker, SSE, and Scheduler | Not started | 7-12 hari kerja |
| 6 | Contract Tests and Production Hardening | Not started | 4-7 hari kerja |

Total awal:

- Demo satu-user yang benar tanpa data palsu: fase 1-4 versi minimal,
  sekitar 10-16 hari kerja.
- Production multi-user aman dan durable: seluruh fase, sekitar 25-43 hari kerja.
- Dua engineer frontend/backend paralel: sekitar 15-25 hari kerja, tergantung
  keputusan auth, database, queue, dan scope artifact.

### Fase 1 - Contract and Security Gate

Tujuan: tidak ada implementasi baru di atas kontrak ambigu atau API publik yang
praktis tanpa auth.

- [ ] Nyatakan kontrak normatif: jurnal + OpenAPI `/api/v1`.
- [ ] Pilih satu execution flow dan tandai `/execute`, `/steps`, atau
  `/async-execute` sebagai internal/deprecated/removed.
- [ ] Bekukan request create/preview full brief.
- [ ] Bekukan named roots seluruh response.
- [ ] Bekukan error envelope dan recovery action.
- [ ] Bekukan status lifecycle dan allowed transitions.
- [ ] Bekukan SSE event registry dan envelope.
- [ ] Pilih auth: OIDC bearer atau same-origin BFF cookie.
- [ ] Pilih SSE auth yang kompatibel dengan browser.
- [ ] Hapus static `voyager-dev-token` dan `X-Voyager-Token` dari frontend.
- [ ] Backend menolak missing, malformed, expired, wrong issuer/audience token.
- [ ] Terapkan owner/tenant authorization pada semua session, job, schedule,
  event, report, export, trace, dan knowledge operation.
- [ ] Pindahkan idempotency setelah authentication.
- [ ] Scope idempotency dengan principal, method, route, key, dan body digest.
- [ ] Terapkan exact production CORS policy sesuai auth strategy.
- [ ] Tambahkan rate limit dan quota untuk operasi mahal.
- [ ] Putuskan global company route.
- [ ] Reject SGX sampai capability benar-benar aktif.

Acceptance:

- [ ] Anonymous protected request menghasilkan 401.
- [ ] Forged/expired token menghasilkan 401.
- [ ] Missing scope menghasilkan 403.
- [ ] User A tidak dapat membaca atau mengubah resource User B.
- [ ] Idempotency response tidak dapat direplay lintas user/path/body.
- [ ] OpenAPI tervalidasi dan menjadi fixture contract tests.

### Fase 2 - Backend Authoritative Core

Tujuan: session, lifecycle, revision, attempt, dan command dimiliki backend.

- [ ] Canonical create schema menerima objective, presetId, dan full brief.
- [ ] Hilangkan precedence ganda `requestedCandidates` vs `brief.candidateCount`.
- [ ] Candidate count request dipatuhi.
- [ ] Implementasikan owner-scoped paginated session list.
- [ ] Implementasikan search, status filter, sort, page, dan pageSize.
- [ ] Stable `Idempotency-Key` untuk create/start/retry/duplicate/answer.
- [ ] `If-Match` diwajibkan pada mutation rawan race.
- [ ] Stale revision menghasilkan structured 409.
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
- [ ] Retry lama tidak dapat menimpa attempt baru.
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

### Fase 6 - Contract Tests and Production Hardening

Tujuan: CI dan operasi membuktikan sistem aman, benar, dan dapat dipulihkan.

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

- [ ] Seluruh required CI gate hijau.
- [ ] Tidak ada P0/P1 security finding terbuka.
- [ ] Tidak ada synthetic financial value pada production.
- [ ] Failure provider memiliki explicit degraded/recovery state.
- [ ] Deploy/rollback tidak merusak session aktif atau published artifact.

## 9. UI/UX/CX Review Berikutnya

Review UI/UX/CX dilakukan setelah jurnal ini dibuat dan sebelum technical
analysis ditambahkan. Review tidak boleh mengubah visual identity secara acak;
fokusnya mengurangi beban kognitif sambil mempertahankan trust dan evidence.

### 9.1 Pertanyaan yang harus dijawab

- Siapa primary user V1 dan keputusan apa yang sedang dibuat?
- Berapa banyak konsep yang harus dipahami sebelum memulai riset?
- Informasi apa yang harus tampil pada first read, second read, dan audit view?
- Apakah `pillars`, `attempt`, `revision`, `queue`, `trace`, dan `provenance`
  perlu terlihat sebagai istilah utama atau hanya detail audit?
- Apakah Research, Results, Reports, Screener, Peers, Activity, Trace, Schedules,
  Methodology, dan Glossary menghasilkan navigation overload?
- Apa satu primary action pada setiap route?
- Bagaimana active, needs-input, partial, failed, cancelled, dan completed state
  dijelaskan tanpa menuntut user memahami arsitektur backend?
- Kapan user perlu melihat warning, confidence, missing data, stale cache, dan
  formula details?
- Bagaimana dua device dan reconnect dijelaskan tanpa memperlihatkan state
  management internal?
- Bagaimana technical analysis nanti masuk tanpa mencampur thesis fundamental,
  market timing context, dan trading recommendation?

### 9.2 Prinsip evaluasi

- Task first, architecture second.
- Satu primary action per context.
- Progressive disclosure.
- Jangan menjadikan produk generic chatbot.
- Jangan menyembunyikan methodology, evidence, limitations, atau audit.
- Jangan mengubah semua data menjadi cards; gunakan format terbaik untuk tugas.
- Mobile bukan desktop yang diperkecil.
- Status harus menjawab: apa yang terjadi, apakah user perlu bertindak, dan apa
  yang aman untuk dilihat sekarang.
- Technical detail harus tersedia tanpa mengganggu alur keputusan utama.

### 9.3 Deliverable review UI/UX/CX

- [ ] Primary persona dan jobs-to-be-done.
- [ ] Journey map fundamental research end-to-end.
- [ ] Inventory route dan feature; keep, merge, move, hide, atau remove.
- [ ] Revised information architecture.
- [ ] State/copy matrix untuk lifecycle dan errors.
- [ ] Progressive disclosure matrix per route.
- [ ] Mobile navigation dan data-presentation strategy.
- [ ] Accessibility risks dan remediation priority.
- [ ] CX trust model: freshness, source, confidence, warning, limitation.
- [ ] Technical-analysis integration principles dan boundaries.
- [ ] Usability acceptance criteria sebelum implementasi visual.

## 10. Voyager Two V1 - Technical Analysis

Technical analysis dipisahkan menjadi delivery track eksklusif **Voyager Two V1** agar
scope fundamental Voyager One tidak melebar dan UI tidak menjadi kumpulan fitur.
North star, keputusan produk, data contract, UX boundaries, checklist discovery,
dan definition of ready berada di [`voyager-two-v1.md`](voyager-two-v1.md).

- [x] Tetapkan Voyager One untuk seluruh delivery fundamental dan pekerjaan
  end-to-end selain technical analysis.
- [x] Tetapkan Voyager Two khusus technical analysis.
- [ ] Selesaikan review UI/UX/CX Voyager One sebelum menetapkan IA Voyager Two.
- [ ] Stabilkan fundamental end-to-end sebelum implementasi Voyager Two dimulai.
- [ ] Tutup definition of ready di `voyager-two-v1.md`.

## 11. Keputusan Terbuka

| ID | Keputusan | Opsi | Status |
| --- | --- | --- | --- |
| D-001 | Auth browser/API | OIDC bearer; BFF secure cookie | Open |
| D-002 | SSE auth | Fetch stream bearer; same-origin cookie/BFF; signed short-lived stream token | Open |
| D-003 | Canonical execution endpoint | Start auto-enqueues; explicit execute command; internal worker route | Recommended: start auto-enqueues |
| D-004 | Database | PostgreSQL; managed alternative | Open |
| D-005 | Durable queue | Redis/BullMQ; managed queue; DB jobs | Open |
| D-006 | Event retention | DB table; Redis stream; managed event stream | Open |
| D-007 | Global company route | Full implementation; remove route | Open |
| D-008 | Credits | Billing ledger; estimate only; remove | Open |
| D-009 | SGX | Defer; release with explicit formula/currency support | Deferred |
| D-010 | Report exports | User report only; separate privileged audit export | Open |
| D-011 | Preview deployments | Stable preview domain; allowlist automation; same-origin proxy | Open |
| D-012 | Technical analysis role | Context layer; ranking input; separate workflow | Discovery pending |

Setiap keputusan yang ditutup harus mencatat:

- tanggal;
- decision owner;
- pilihan;
- alasan dan tradeoff;
- dampak frontend/backend/data/UX;
- migration atau rollback path.

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
