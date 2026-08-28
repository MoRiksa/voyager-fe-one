# Handoff Backend Produksi Voyager One

Status: usulan kontrak aplikasi untuk review backend dan frontend  
Target awal: IDX; SGX hanya setelah keputusan produk eksplisit

> **PERINGATAN KONTRAK:** endpoint `/api/v1` di dokumen ini adalah **usulan API
> aplikasi Voyager**, bukan endpoint Sectors dan belum diimplementasikan. Endpoint
> Sectors didasarkan pada dokumentasi lokal
> `_private/sector-agent-skills/references/idx-endpoints.md` dan
> `_private/sector-agent-skills/references/sgx-endpoints.md`. Bentuk, akses, pagination,
> rate limit, dan perilakunya wajib diverifikasi terhadap dokumentasi resmi
> Sectors terkini sebelum implementasi produksi.

## 1. Ringkasan eksekutif dan batas arsitektur

Frontend saat ini adalah prototype Vue dengan Pinia, `localStorage`, dan fixture.
Backend produksi mengambil alih sesi, eksekusi, data pasar, derivasi, provenance,
audit, dan persistence tanpa mengubah invariant interaksi UI.

```text
Browser / Vue frontend
  | HTTPS + Voyager auth; /api/v1 only
  v
Voyager API + worker + database + cache
  | HTTPS server-to-server
  | Authorization: <raw_sectors_api_key>
  v
Sectors API https://api.sectors.app/v1
```

- Frontend hanya memanggil Voyager API dan tidak pernah memanggil Sectors.
- Backend memanggil Sectors server-side. Kuncinya hanya berada di secret manager.
- Header Sectors memakai raw key: `Authorization: <api_key>`, **tanpa Bearer**.
- Voyager tidak meneruskan response mentah Sectors sebagai domain publik.
- Voyager memiliki lifecycle, skor, funnel, rank, thesis, confidence, report,
  warning, cache policy, provenance, dan audit.
- Sectors adalah provider data; database Voyager adalah system of record sesi.
- Tidak setiap endpoint upstream perlu menjadi endpoint frontend publik.

Sumber frontend aktual:

- Domain: `src/types/index.ts:1-199`.
- State/transisi/persistence: `src/stores/researchStore.ts:17-710`.
- Route UI: `src/router/index.ts:6-120`.
- Funnel/alasan sementara: `src/views/ScreenerView.vue:11-53`.
- Preset dan fixture: `src/data/sectorsUniverse.ts:3-591`.

## 2. Konvensi API Voyager

### 2.1 Path, media type, dan header

- Base path `/api/v1`; JSON memakai UTF-8 dan field `camelCase`.
- Request biasa `application/json`; stream `text/event-stream`.
- ID opaque; breaking change memakai `/api/v2`.
- `Authorization: Bearer <voyager_token>` adalah token Voyager, bukan key Sectors.
- `X-Request-Id` selalu dikembalikan; client boleh mengirim UUID valid.
- `Idempotency-Key` wajib untuk create/start/retry/duplicate/answer.
- `If-Match: "<revision>"` wajib untuk mutation rawan race.
- `Last-Event-ID` dipakai saat SSE reconnect.
- `Retry-After` berupa detik integer pada 429/503 yang dapat diulang.
- `Accept-Language` default `id-ID`; kode dan nama field tidak dilokalkan.

Backend ke Sectors:

```http
Authorization: <raw_sectors_api_key>
Accept: application/json
```

Jangan mengirim `Authorization: Bearer <sectors_api_key>`.

### 2.2 Waktu, uang, angka, dan null

- Timestamp ISO 8601 UTC, misalnya `2026-08-28T09:15:04.123Z`.
- Tanggal kalender `YYYY-MM-DD`; periode finansial berupa object terstruktur.
- Money berupa decimal string dan currency, bukan float JSON:
  `{"amount":"1220500000000000","currency":"IDR"}`.
- Rasio/persen dapat number jika precision didokumentasikan.
- Tidak tersedia memakai `null`, bukan `0`, `"-"`, atau object kosong.
- `0` hanya berarti nilai sumber/perhitungan benar-benar nol.
- Unit eksplisit: `IDR`, `SGD`, `percent`, `ratio`, `shares`, atau `count`.
- API tidak mengirim nilai kanonik berformat UI seperti `Rp9.900`.

### 2.3 Envelope SNAP-inspired

Ini bukan klaim kepatuhan SNAP pembayaran.

```json
{"responseCode":"2003100","responseMessage":"Successful","session":{"id":"rs_01J6F2ZK9R7Q4T"}}
```

- `responseCode`: HTTP tiga digit + service dua digit + case dua digit.
- **Usulan:** service code Voyager Research `31`; belum dialokasikan registry.
- Contoh umum: `2003100`, `2013100`, `2023100`.
- Tidak ada wrapper generik `data`, `error`, atau `meta`.
- Gunakan root domain bernama: `session`, `sessions`, `stages`, `candidates`, dll.
- Error dapat memiliki `violations`, `warnings`, `failed`, `preserved`, `recovery`.

Pagination berada di root, 1-based, `pageSize` 1-100:

```json
{"responseCode":"2003100","responseMessage":"Successful","sessions":[],"page":1,"pageSize":20,"totalItems":0,"totalPages":0,"hasNextPage":false}
```

## 3. Domain frontend yang wajib dipenuhi

### 3.1 Status, brief, dan session

Seluruh `AgentStatus` aktual (`src/types/index.ts:1-16`):

```text
IDLE | UNDERSTANDING | PLANNING | DISCOVERING | SCREENING | RANKING |
RESEARCHING | COMPARING | VALIDATING | REPORTING | NEEDS_INPUT | PARTIAL |
CANCELLED | COMPLETED | FAILED
```

Terminal: `CANCELLED`, `COMPLETED`, `FAILED`. `PARTIAL` dapat di-retry dan berarti
artefak wajib tidak lengkap, bukan sekadar data opsional tidak tersedia.

`ResearchBrief` aktual:

```text
market: IDX | SGX
sectorScope: string; indexScope: string; candidateCount: positive integer
researchDepth: Ringkas | Standar | Mendalam; useSectorMetrics: boolean
optionalDimensions: string[]; clarificationNotes: string[]
```

Backend memvalidasi scope terhadap capabilities, bukan meneruskan string bebas.
Catatan klarifikasi dipertahankan untuk adapter; produksi juga menyimpan Q/A
terstruktur.

Field kompatibilitas `ResearchSession`:

```text
id, createdAt, updatedAt, objective, presetId, brief, status,
clarificationReturnStatus, plan, pillars, toolCalls, screeningFunnel,
candidates, report, creditsSpent
```

Tambahan produksi:

```text
revision, activeAttemptId, publishedAttemptId, artifactStatus, warnings,
capabilitiesVersion, formulaVersion, ownerId
```

`clarificationReturnStatus` wajib dipersisten; store memulihkannya setelah refresh
di `researchStore.ts:330-415`. Jangan mengandalkan memory worker.

### 3.2 Plan, pillar, dan artifact

`ResearchPlan` mempertahankan `objective`, `universe`, `criteria[]`,
`steps[{order,action,tool,description}]`, `hypothesis`, `requiredDataPoints[]`,
`estimatedDurationSeconds`, dan `estimatedCredits`.

| Pillar ID | Tanggung jawab | Status |
| --- | --- | --- |
| `planner` | brief, hipotesis, plan | `pending/active/completed/failed` |
| `screener` | universe dan funnel | sama |
| `engine` | riset kandidat | sama |
| `state` | persistence, audit, validasi | sama |
| `report` | sintesis dan publikasi | sama |

Pillar juga memuat `number`, `name`, `subtitle`, `metricsSummary?`, `durationMs?`.

`ArtifactStatus` direkomendasikan karena belum ada tipe eksplisit:

```text
NOT_STARTED | BUILDING | AVAILABLE | UNAVAILABLE | STALE | FAILED
plan | screening | candidates | peerBenchmarks | dossiers | report
```

`UNAVAILABLE` untuk artifact optional tidak membuat sesi `PARTIAL`.

### 3.3 Screening, candidate, evidence, provenance

`ScreeningStage` normalized:

```text
id, order, name, description, filterCriteria, inputCount, retainedCount,
excludedCount, retainedSymbols[], reasonSummary[], status, publishedAt
```

Membership persisted:

```text
stageId, companyId, disposition: RETAINED | EXCLUDED,
reasons[{code,message,metricKey,actualValue,operator,thresholdValue}]
```

Alasan tidak lagi dihitung ulang UI seperti prototype (`ScreenerView.vue:34-51`).

Candidate normalized:

```text
id, exchange, symbol, name, sector, subsector, rank, confidence,
marketData, metrics, score, thesis, strengths[], concerns[], evidence[],
dupont, peerBenchmark, indexMembership[], optionalArtifacts, provenance
```

Money dipakai untuk price/market cap. Metric memakai
`{value,unit,period,sourceRef}`. Adapter menerima confidence frontend
`HIGH | MEDIUM | MODERATE`; semantiknya harus masuk registry formula.

`Evidence`:

```text
id, claim, metricKey, value, unit, context, sourceRef, asOf,
financialPeriod, derivationId|null
```

`Provenance`:

```text
sourceRef, provider, endpoint, params, retrievedAt, asOf, financialPeriod,
units, currency, cacheStatus, cacheAgeSeconds, rawSnapshotRef, formulaVersion
```

### 3.4 Tool log dan report

`ToolCallLog` mempertahankan field aktual: `id`, `timestamp`, `pillar`, `toolName`,
`category`, `input`, `outputSummary`, `durationMs`, `status`, `creditCost`,
`sourceKind`. Production `sourceKind`:

```text
sectors-api | voyager-derived | user-input | cache | system
```

`prototype-fixture` hanya mode demo. Status tetap `SUCCESS | ERROR | CACHED`.
Log disanitasi; body upstream disimpan via `rawSnapshotRef`.

Report mempertahankan field `ResearchReport` (`src/types/index.ts:169-181`):
`sessionId`, `timestamp`, `objective`, `universeSummary`, `screeningFunnel`,
`methodologyOverview`, `topCandidates`, `peerComparisonNotes`, `limitations`,
`uncertaintyNotes`, `disclaimer`. Produksi menambah `revision`, `attemptId`,
`formulaVersion`, `sourceRefs`, `warnings`, `publishedAt`.

## 4. Matriks endpoint Voyager

Semua path di bawah `/api/v1`.

| Pri | Method dan path | Root | Fungsi |
| --- | --- | --- | --- |
| P0 | `GET /research-capabilities` | `capabilities` | market/scope/limit/feature |
| P0 | `GET /research-presets` | `presets` | preset authoritative |
| P0 | `POST /research-preview` | `preview` | validasi dan estimasi |
| P0 | `POST /research-sessions` | `session` | create IDLE |
| P0 | `GET /research-sessions` | `sessions` | library paginated |
| P0 | `GET /research-sessions/{id}` | `session` | snapshot konsisten |
| P0 | `POST /research-sessions/{id}/start` | `session` | attempt baru |
| P0 | `POST /research-sessions/{id}/cancel` | `session` | cancel |
| P0 | `POST /research-sessions/{id}/retry` | `session` | retry attempt |
| P0 | `DELETE /research-sessions/{id}` | - | soft delete |
| P1 | `POST /research-sessions/{id}/duplicate` | `session` | copy brief ke IDLE |
| P0 | `POST /research-sessions/{id}/clarifications/{cid}/answer` | `session` | answer |
| P1 | `POST /research-sessions/{id}/follow-ups` | `followUp` | follow-up |
| P0 | `GET /research-sessions/{id}/events` | SSE | realtime |
| P0 | `GET /research-sessions/{id}/activity` | `activity` | timeline user |
| P0 | `GET /research-sessions/{id}/trace` | `trace` | audit sanitized |
| P0 | `GET /research-sessions/{id}/screening-stages` | `stages` | summary |
| P0 | `GET /research-sessions/{id}/screening-stages/{sid}/companies` | `companies` | retained/excluded/reasons |
| P0 | `GET /research-sessions/{id}/candidates` | `candidates` | kandidat final |
| P0 | `GET /research-sessions/{id}/candidates/{symbol}` | `dossier` | detail sesi |
| P1 | `GET /research-sessions/{id}/peer-benchmarks` | `peerBenchmarks` | cohort benchmark |
| P0 | `GET /research-sessions/{id}/report` | `report` | report published |
| P2 | `GET /research-sessions/{id}/report/export?format={format}` | file | Markdown/PDF/JSON optional |
| Putuskan | `GET /companies/{symbol}` | `company` | global company |
| Putuskan | `POST /companies/{symbol}/research-sessions` | `session` | related research |

Implementasikan global company routes atau hapus frontend `/company/:symbol`
(`src/router/index.ts:68-71`). Jangan memakai "sesi aktif terakhir" secara implisit.
Route session-scoped `/research/:id/company/:symbol` tetap P0.

## 5. Contoh kontrak Voyager

Semua nilai bagian ini **ilustratif**, bukan data pasar aktual atau response
Sectors.

### 5.1 Capabilities dan preview

```http
GET /api/v1/research-capabilities HTTP/1.1
Authorization: Bearer voyager-user-token
Accept: application/json
```

```json
{"responseCode":"2003100","responseMessage":"Successful","capabilities":{"version":"2026-08-28.1","markets":["IDX"],"researchDepths":["Ringkas","Standar","Mendalam"],"candidateCount":{"minimum":1,"maximum":20,"default":5},"features":{"sse":true,"peerBenchmarks":true,"sgx":false,"reportMarkdown":true,"reportPdf":false}}}
```

```http
POST /api/v1/research-preview HTTP/1.1
Authorization: Bearer voyager-user-token
Content-Type: application/json

{"objective":"Temukan bank IDX berkualitas dengan ROE kuat.","presetId":"obj-banking-moat","brief":{"market":"IDX","sectorScope":"banks","indexScope":"lq45","candidateCount":5,"researchDepth":"Standar","useSectorMetrics":true,"optionalDimensions":["segments"],"clarificationNotes":[]}}
```

```json
{"responseCode":"2003100","responseMessage":"Preview generated","preview":{"normalizedBrief":{"market":"IDX","sectorScope":"banks","indexScope":"lq45","candidateCount":5,"researchDepth":"Standar","useSectorMetrics":true,"optionalDimensions":["segments"],"clarificationNotes":[]},"estimatedUniverseCount":42,"maximumCandidates":5,"criteria":["data minimum tersedia","ROE di atas ambang","ranking kualitas"],"estimatedDurationSeconds":75,"estimatedCredits":120,"warnings":[]}}
```

### 5.2 Create dan start

```http
POST /api/v1/research-sessions HTTP/1.1
Authorization: Bearer voyager-user-token
Content-Type: application/json
Idempotency-Key: 7ad3c808-2360-45bd-a347-58a7f86a31aa

{"objective":"Temukan bank IDX berkualitas dengan ROE kuat.","presetId":"obj-banking-moat","brief":{"market":"IDX","sectorScope":"banks","indexScope":"lq45","candidateCount":5,"researchDepth":"Standar","useSectorMetrics":true,"optionalDimensions":["segments"],"clarificationNotes":[]}}
```

```json
{"responseCode":"2013100","responseMessage":"Research session created","session":{"id":"rs_01J6F2ZK9R7Q4T","revision":1,"status":"IDLE","clarificationReturnStatus":"IDLE","activeAttemptId":null,"createdAt":"2026-08-28T09:15:04.123Z","updatedAt":"2026-08-28T09:15:04.123Z","objective":"Temukan bank IDX berkualitas dengan ROE kuat.","presetId":"obj-banking-moat","creditsSpent":0}}
```

```http
POST /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/start HTTP/1.1
Authorization: Bearer voyager-user-token
Idempotency-Key: 56896a71-b8c0-4143-a526-e9603e029733
If-Match: "1"
Content-Length: 0
```

```json
{"responseCode":"2023100","responseMessage":"Research started","session":{"id":"rs_01J6F2ZK9R7Q4T","revision":2,"status":"UNDERSTANDING","activeAttemptId":"ra_01J6F30FN5N0","clarificationReturnStatus":"IDLE","updatedAt":"2026-08-28T09:16:00.000Z"}}
```

### 5.3 GET dan list sessions

```http
GET /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","session":{"id":"rs_01J6F2ZK9R7Q4T","revision":18,"createdAt":"2026-08-28T09:15:04.123Z","updatedAt":"2026-08-28T09:17:21.812Z","objective":"Temukan bank IDX berkualitas dengan ROE kuat.","presetId":"obj-banking-moat","brief":{"market":"IDX","sectorScope":"banks","indexScope":"lq45","candidateCount":5,"researchDepth":"Standar","useSectorMetrics":true,"optionalDimensions":["segments"],"clarificationNotes":[]},"status":"COMPLETED","clarificationReturnStatus":"IDLE","activeAttemptId":null,"publishedAttemptId":"ra_01J6F30FN5N0","formulaVersion":"quality-idx-v1.0.0","artifactStatus":{"plan":"AVAILABLE","screening":"AVAILABLE","candidates":"AVAILABLE","peerBenchmarks":"AVAILABLE","dossiers":"AVAILABLE","report":"AVAILABLE"},"plan":{"objective":"Temukan bank IDX berkualitas dengan ROE kuat.","universe":"IDX banks dalam LQ45","criteria":["ROE terukur","data minimum tersedia"],"steps":[{"order":1,"action":"Bangun universe","tool":"sectors_index_membership","description":"Iris LQ45 dengan banks"}],"hypothesis":"Profitabilitas relatif unggul akan menempati ranking atas.","requiredDataPoints":["ROE","equity","earnings"],"estimatedDurationSeconds":75,"estimatedCredits":120},"pillars":[{"id":"planner","number":1,"name":"Perencana Riset","subtitle":"Menyusun hipotesis","status":"completed","metricsSummary":"3 kriteria","durationMs":815},{"id":"screener","number":2,"name":"Penyaring Kandidat","subtitle":"Mempersempit universe","status":"completed","metricsSummary":"42 menjadi 5","durationMs":12430},{"id":"engine","number":3,"name":"Analisis Mendalam","subtitle":"Meninjau kandidat","status":"completed","metricsSummary":"5 kandidat","durationMs":30120},{"id":"state","number":4,"name":"Status dan Audit","subtitle":"Memvalidasi state","status":"completed","metricsSummary":"18 revision","durationMs":910},{"id":"report","number":5,"name":"Sintesis dan Laporan","subtitle":"Menerbitkan laporan","status":"completed","metricsSummary":"1 report","durationMs":3210}],"warnings":[{"code":"OPTIONAL_SEGMENTS_UNAVAILABLE","message":"Data segmen tidak tersedia untuk satu kandidat","scope":"candidate","recoverable":true}],"creditsSpent":117}}
```

```http
GET /api/v1/research-sessions?page=1&pageSize=20&status=COMPLETED&sort=-updatedAt HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","sessions":[{"id":"rs_01J6F2ZK9R7Q4T","objective":"Temukan bank IDX berkualitas dengan ROE kuat.","status":"COMPLETED","candidateCount":5,"createdAt":"2026-08-28T09:15:04.123Z","updatedAt":"2026-08-28T09:17:21.812Z","creditsSpent":117}],"page":1,"pageSize":20,"totalItems":1,"totalPages":1,"hasNextPage":false}
```

### 5.4 Cancel dan retry

```http
POST /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/cancel HTTP/1.1
Authorization: Bearer voyager-user-token
Idempotency-Key: 6a9428e7-4871-4394-9c95-b2cb841744df
If-Match: "9"
Content-Length: 0
```

```json
{"responseCode":"2023100","responseMessage":"Cancellation requested","session":{"id":"rs_01J6F2ZK9R7Q4T","revision":10,"status":"CANCELLED","activeAttemptId":null,"updatedAt":"2026-08-28T09:16:42.010Z"}}
```

```http
POST /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/retry HTTP/1.1
Authorization: Bearer voyager-user-token
Idempotency-Key: c3346503-821d-4bd3-b162-93c689040996
If-Match: "10"
Content-Length: 0
```

```json
{"responseCode":"2023100","responseMessage":"Research retry started","session":{"id":"rs_01J6F2ZK9R7Q4T","revision":11,"status":"UNDERSTANDING","activeAttemptId":"ra_01J6F36PJ8TM","previousAttemptId":"ra_01J6F30FN5N0","updatedAt":"2026-08-28T09:18:03.500Z"}}
```

### 5.5 Klarifikasi SSE dan answer

```text
id: evt_0000042
event: clarification.required
data: {"eventId":"evt_0000042","sessionId":"rs_01J6F2ZK9R7Q4T","revision":7,"attemptId":"ra_01J6F30FN5N0","occurredAt":"2026-08-28T09:16:18.400Z","clarification":{"id":"cl_01J6F32C2B","question":"Apakah prioritas utama pertumbuhan, valuasi, atau dividen?","answerType":"single_line","expiresAt":null},"clarificationReturnStatus":"PLANNING"}

```

```http
POST /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/clarifications/cl_01J6F32C2B/answer HTTP/1.1
Authorization: Bearer voyager-user-token
Content-Type: application/json
Idempotency-Key: c14bb609-acde-45a3-b2af-bdc53a1f298a
If-Match: "7"

{"answer":"Utamakan kualitas dan valuasi relatif."}
```

```json
{"responseCode":"2003100","responseMessage":"Clarification answered","session":{"id":"rs_01J6F2ZK9R7Q4T","revision":8,"status":"PLANNING","clarificationReturnStatus":"PLANNING","updatedAt":"2026-08-28T09:16:31.000Z"}}
```

### 5.6 Stages dan excluded companies

```http
GET /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/screening-stages HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","stages":[{"id":"stg_universe","order":1,"name":"Dataset awal","description":"Universe tervalidasi","filterCriteria":"IDX banks dalam LQ45","inputCount":42,"retainedCount":42,"excludedCount":0,"retainedSymbols":["BBCA","BBRI","BMRI"],"reasonSummary":[],"status":"AVAILABLE","publishedAt":"2026-08-28T09:17:10.000Z"},{"id":"stg_quality","order":4,"name":"Shortlist kualitas","description":"Normalisasi cohort bank","filterCriteria":"Skor quality-idx-v1 >= 80","inputCount":12,"retainedCount":5,"excludedCount":7,"retainedSymbols":["BBCA","BBRI","BMRI","BBNI","BRIS"],"reasonSummary":[{"code":"QUALITY_SCORE_BELOW_THRESHOLD","count":7}],"status":"AVAILABLE","publishedAt":"2026-08-28T09:17:10.000Z"}]}
```

Summary dapat membatasi simbol; endpoint membership paginated authoritative.

```http
GET /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/screening-stages/stg_quality/companies?disposition=EXCLUDED&page=1&pageSize=20&sort=symbol HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","companies":[{"id":"cmp_idx_bbtn","exchange":"IDX","symbol":"BBTN","name":"PT Bank Tabungan Negara (Persero) Tbk","disposition":"EXCLUDED","reasons":[{"code":"QUALITY_SCORE_BELOW_THRESHOLD","message":"Skor kualitas di bawah ambang tahap","metricKey":"qualityScore","actualValue":76.4,"operator":">=","thresholdValue":80}]}],"stage":{"id":"stg_quality","inputCount":12,"retainedCount":5,"excludedCount":7},"page":1,"pageSize":20,"totalItems":7,"totalPages":1,"hasNextPage":false}
```

Nilai BBTN hanya ilustrasi kontrak, bukan penilaian aktual.

### 5.7 Candidates dan dossier

```http
GET /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/candidates?page=1&pageSize=20&sort=rank HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","candidates":[{"id":"cmp_idx_bbca","exchange":"IDX","symbol":"BBCA","name":"PT Bank Central Asia Tbk","sector":"Financials","subsector":"banks","rank":1,"confidence":"HIGH","marketData":{"price":{"amount":"9900","currency":"IDR"},"marketCap":{"amount":"1220500000000000","currency":"IDR"},"asOf":"2024-12-30"},"metrics":{"pe":{"value":22.4,"unit":"ratio"},"roe":{"value":21.8,"unit":"percent"}},"score":{"value":94,"scaleMaximum":100,"formulaVersion":"quality-idx-v1.0.0"},"thesis":"Profitabilitas dan konsistensi relatif kuat.","strengths":["ROE relatif kuat"],"concerns":["Valuasi premium"],"sourceRefs":["src_01J6F34A"]}],"page":1,"pageSize":20,"totalItems":5,"totalPages":1,"hasNextPage":false}
```

Angka candidate berasal dari fixture frontend dan tetap ilustratif.

```http
GET /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/candidates/BBCA HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","dossier":{"sessionId":"rs_01J6F2ZK9R7Q4T","revision":18,"symbol":"BBCA","rank":1,"scoreBreakdown":{"profitability":96,"growth":91,"solvency":98,"valuation":82,"consistency":99},"dupont":{"netProfitMargin":36.4,"assetTurnover":0.058,"equityMultiplier":10.32,"calculatedRoe":21.8,"formulaVersion":"dupont-v1.0.0"},"peerBenchmark":{"cohort":"IDX banks dalam LQ45","cohortSize":12,"rank":1,"tieBreak":"symbol-ascending"},"evidence":[{"id":"ev_01J6F35B","claim":"ROE mendukung profitabilitas","metricKey":"roe","value":21.8,"unit":"percent","context":"Periode attempt","sourceRef":"src_01J6F34A","asOf":"2024-12-31","financialPeriod":{"kind":"FY","year":2024,"quarter":null},"derivationId":"drv_01J6F35A"}],"optionalArtifacts":{"segments":{"status":"UNAVAILABLE","items":[]}},"warnings":[{"code":"OPTIONAL_SEGMENTS_UNAVAILABLE","message":"Data segmen tidak tersedia","scope":"candidate","recoverable":true}]}}
```

### 5.8 Report

```http
GET /api/v1/research-sessions/rs_01J6F2ZK9R7Q4T/report HTTP/1.1
Authorization: Bearer voyager-user-token
```

```json
{"responseCode":"2003100","responseMessage":"Successful","report":{"sessionId":"rs_01J6F2ZK9R7Q4T","revision":18,"attemptId":"ra_01J6F30FN5N0","publishedAt":"2026-08-28T09:17:21.812Z","objective":"Temukan bank IDX berkualitas dengan ROE kuat.","universeSummary":"Universe tervalidasi disaring menjadi lima kandidat.","screeningFunnel":[{"stage":"Shortlist kualitas","count":5,"description":"Normalisasi cohort bank","filterCriteria":"Skor >= 80","retainedSymbols":["BBCA","BBRI","BMRI","BBNI","BRIS"]}],"methodologyOverview":"Metrik dinormalisasi pada cohort dengan formula versioned.","topCandidateSymbols":["BBCA","BBRI","BMRI","BBNI","BRIS"],"peerComparisonNotes":"Perbandingan hanya berlaku pada cohort attempt ini.","limitations":["Cakupan mengikuti provider dan brief."],"uncertaintyNotes":"Data optional ditandai per kandidat.","disclaimer":"Bukan nasihat keuangan atau instruksi transaksi.","formulaVersion":"quality-idx-v1.0.0","sourceRefs":["src_01J6F34A"],"warnings":[]}}
```

### 5.9 Validation dan operational errors

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json
X-Request-Id: req_01J6F40A

{"responseCode":"4223101","responseMessage":"Request validation failed","violations":[{"field":"brief.candidateCount","code":"OUT_OF_RANGE","message":"candidateCount must be between 1 and 20"},{"field":"brief.market","code":"UNSUPPORTED_VALUE","message":"SGX is not enabled"}],"recovery":{"action":"EDIT_REQUEST","retryable":false}}
```

```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json
Retry-After: 30

{"responseCode":"5033102","responseMessage":"Required upstream data is temporarily unavailable","failed":{"component":"sectors-api","operation":"quarterly-financials","attemptId":"ra_01J6F36PJ8TM"},"preserved":{"sessionRevision":14,"publishedAttemptId":"ra_01J6F30FN5N0","artifacts":["plan","screening"]},"warnings":[{"code":"UPSTREAM_REQUIRED_DATA_UNAVAILABLE","message":"Quarterly financials could not be refreshed","scope":"session","recoverable":true}],"recovery":{"action":"RETRY_SESSION","retryable":true,"retryAfterSeconds":30}}
```

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{"responseCode":"4293101","responseMessage":"Voyager request limit exceeded","failed":{"component":"voyager-api","operation":"start-research"},"preserved":{"sessionRevision":2,"status":"IDLE"},"recovery":{"action":"RETRY_SAME_IDEMPOTENCY_KEY","retryable":true,"retryAfterSeconds":60}}
```

## 6. Kontrak SSE

```http
GET /api/v1/research-sessions/{id}/events HTTP/1.1
Accept: text/event-stream
Authorization: Bearer <voyager_token>
Last-Event-ID: evt_0000041
```

Setiap event: `eventId`, `sessionId`, `revision`, `attemptId`, `occurredAt`,
`type`, `payload`.

```text
stream.ready | session.status.changed | attempt.started |
attempt.cancel.requested | attempt.cancelled | pillar.started |
pillar.completed | pillar.failed | plan.published | clarification.required |
clarification.answered | screening.stage.published | candidates.published |
dossier.published | warning.raised | report.published | session.completed |
session.partial | session.failed | heartbeat
```

```text
id: evt_0000043
event: screening.stage.published
data: {"eventId":"evt_0000043","sessionId":"rs_01J6F2ZK9R7Q4T","revision":9,"attemptId":"ra_01J6F30FN5N0","occurredAt":"2026-08-28T09:16:44.000Z","type":"screening.stage.published","payload":{"stageId":"stg_quality","retainedCount":5,"excludedCount":7}}

```

- Server melanjutkan setelah `Last-Event-ID`; ID unik/monoton per sesi.
- Delivery at-least-once; client dedupe `eventId` dan guard `attemptId`.
- Jika ID melewati retention: 409 `REFETCH_SESSION_THEN_RECONNECT`.
- Heartbeat maksimal 15 detik; gap revision memicu GET snapshot authoritative.
- SSE hanya sinyal perubahan, bukan source of truth artifact.

## 7. Lifecycle dan konsistensi

```text
IDLE -> UNDERSTANDING -> PLANNING -> DISCOVERING -> SCREENING -> RANKING
     -> RESEARCHING -> COMPARING -> VALIDATING -> REPORTING -> COMPLETED
active -> NEEDS_INPUT -> persisted clarificationReturnStatus
active -> CANCELLED | FAILED | PARTIAL
FAILED | PARTIAL | CANCELLED -> retry -> UNDERSTANDING (new attempt)
```

- Clarification dan return status ditulis dalam satu transaksi.
- `PARTIAL`: artifact wajib gagal tetapi subset/published set konsisten berguna.
- Optional missing: sesi tetap `COMPLETED`, artifact `UNAVAILABLE`, ada warning.
- `FAILED`: tidak ada minimum publication set aman. Nol kandidat valid tetap
  `COMPLETED`.
- Stage, candidate, dossier, benchmark, report published harus memiliki attempt,
  revision, formula, dan cohort yang sama.
- Candidate/report tidak terlihat sebelum commit publication atomik.
- Retry membangun draft baru; pointer `publishedAttemptId` berganti atomik.
- GET default membaca published set; trace boleh membaca draft.
- Count stage sama dengan persisted membership; rank unik/tie deterministik.
- Setiap start/retry membuat attempt; hanya satu aktif per sesi.
- Worker menulis jika `activeAttemptId` masih cocok.
- Cancel mem-fence late completion; late result diaudit, tidak dipublikasi.
- Mutation menaikkan revision; stale `If-Match` menghasilkan 409.
- Idempotency replay mengembalikan response awal, bukan attempt kedua.

## 8. Error dan warning

`DataWarning`:

```text
code, message, scope, symbol?, stageId?, sourceRef?, recoverable, impact,
occurredAt
```

Kode minimum:

```text
OPTIONAL_DATA_UNAVAILABLE | OPTIONAL_SEGMENTS_UNAVAILABLE |
OPTIONAL_FORWARD_ESTIMATES_UNAVAILABLE | STALE_CACHE_USED |
UPSTREAM_PARTIAL_RESPONSE | UPSTREAM_REQUIRED_DATA_UNAVAILABLE |
FINANCIAL_PERIOD_MISMATCH | CURRENCY_MISMATCH | UNIT_UNKNOWN |
METRIC_MISSING | COHORT_TOO_SMALL | LOW_CONFIDENCE |
FORMULA_INPUT_INCOMPLETE
```

| HTTP | Kasus | Recovery |
| --- | --- | --- |
| 200/201/202 | sukses/scheduled | tidak ada |
| 400 | JSON/query invalid | koreksi request |
| 401 | token invalid | login/refresh |
| 403 | izin kurang | jangan retry |
| 404 | resource tidak ada/disamarkan | kembali ke library |
| 409 | revision/status/idempotency conflict | refetch |
| 410 | event/export expired | refetch/regenerate |
| 422 | domain validation | koreksi brief |
| 429 | limit Voyager | hormati Retry-After |
| 502 | upstream schema invalid | retry terkontrol |
| 503 | dependency sementara gagal | retry delay |
| 504 | timeout | cek session sebelum retry |

Error operasional menjelaskan yang gagal, yang dipertahankan, dan recovery.
Kegagalan optional tidak otomatis membuat session partial.

## 9. Matriks endpoint Sectors

Sumber workspace: `_private/sector-agent-skills/references/idx-endpoints.md:7-481`
dan `_private/sector-agent-skills/assets/endpoint-map.md:5-49`. Status adalah
keputusan Voyager.

### 9.1 Seluruh 19 endpoint IDX

| # | Sectors route | Status | Pemakaian |
| --- | --- | --- | --- |
| 1 | `GET /subsectors/` | P0 use | capabilities/scope |
| 2 | `GET /industries/` | P1 use | taxonomy rinci |
| 3 | `GET /subindustries/` | P2 defer | schema bervariasi |
| 4 | `GET /index/{index}/` | P0 use | membership/universe |
| 5 | `GET /companies/?sub_sector={subSector}` | P0 use | universe |
| 6 | `GET /companies/?sub_industry={subIndustry}` | P2 defer | setelah normalize |
| 7 | `GET /companies/list_companies_with_segments/` | P1 internal | availability hint |
| 8 | `GET /listing-performance/{ticker}/` | P1 use | momentum/presentation |
| 9 | `GET /company/get_quarterly_financial_dates/{ticker}/` | P0 use | period/provenance |
| 10 | `GET /financials/quarterly/{ticker}/` | P0 use | fundamental/trend |
| 11 | `GET /company/get-segments/{ticker}/` | P1 optional | dossier |
| 12 | `GET /company/report/{ticker}/` | P0 use | overview/valuation/peers |
| 13 | `GET /index-daily/{index_code}/` | P2 defer | market benchmark |
| 14 | `GET /idx-total/` | P2 defer | total market cap |
| 15 | `GET /companies/top-changes/` | P2 defer | momentum discovery |
| 16 | `GET /most-traded/` | P1 use | liquidity |
| 17 | `GET /companies/top-growth/` | P1 use | discovery seed |
| 18 | `GET /companies/top/` | P1 use | metric seed/filter |
| 19 | `GET /daily/{ticker}` | P1 use | price/volume/mcap |

### 9.2 Empat route unik SGX

Semua deferred kecuali capability SGX diaktifkan.

| # | Route | Status |
| --- | --- | --- |
| 1 | `GET /sgx/sectors/` | deferred unless SGX enabled |
| 2 | `GET /sgx/companies/?sector={sector}` | deferred unless enabled |
| 3 | `GET /sgx/company/report/{ticker}` | deferred unless enabled |
| 4 | `GET /sgx/companies/top/` | deferred unless enabled |

Docs mencatat duplicate registry route #2/#3, bukan route unik tambahan
(`references/sgx-endpoints.md:166-178`).

### 9.3 Parameter Sectors

- Base URL `https://api.sectors.app/v1`; date `YYYY-MM-DD`.
- IDX ticker uppercase tanpa `.JK`; SGX tanpa `.SI`.
- Sector/subsector kebab-case; multiple values comma-separated.
- IDX minimum market cap billion IDR; SGX million SGD.
- `/most-traded/` date range maksimum 90 hari menurut docs lokal.
- Encode parameter dengan URL library; jangan konkatenasi input bebas.
- Pagination/rate limit upstream tidak didokumentasikan lokal.
- Upstream route tidak otomatis menjadi public Voyager route.

## 10. Contoh Sectors berbasis docs lokal

Contoh JSON valid tetapi bukan capture live. Nilai ilustratif ditandai.

### 10.1 Subsectors dan index membership

```http
GET /v1/subsectors/ HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```json
[{"sector":"financials","subsector":"banks"},{"sector":"consumer-non-cyclicals","subsector":"food-and-beverage"}]
```

Nilai string ilustratif; schema `{sector,subsector}` dari docs.

```http
GET /v1/index/lq45/ HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```json
[{"symbol":"BBCA","company_name":"PT Bank Central Asia Tbk"},{"symbol":"BMRI","company_name":"PT Bank Mandiri (Persero) Tbk"}]
```

Membership ilustratif; schema `{symbol,company_name}` dari docs.

### 10.2 Financial dates dan quarterly financials

```http
GET /v1/company/get_quarterly_financial_dates/BBCA/ HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

Contoh persis docs lokal:

```json
{"2024":[["2024-04-30","Q1"],["2024-07-31","Q2"]],"2023":[["2023-04-28","Q1"],["2023-07-31","Q2"],["2023-10-30","Q3"],["2024-01-31","Q4"]]}
```

```http
GET /v1/financials/quarterly/BBCA/?n_quarters=4 HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

Schema docs, tanpa numeric rekaan:

```text
[{symbol:string,date:string,revenue:number,operating_expense:number,
earnings:number,ebit:number,ebitda:number,total_assets:number,
total_liabilities:number,total_equity:number,total_debt:number,
operating_cash_flow:number,free_cash_flow:number,
financials_sector_metrics:object}]
```

Docs menyatakan ada field laporan tambahan. Adapter toleran field tambahan dan
menolak field wajib bertipe salah.

### 10.3 Company report dan listing performance

```http
GET /v1/company/report/BBCA/?sections=overview,valuation,peers,financials HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```text
{symbol:string,company_name:string,
 overview:{market_cap:number,sector:string,listing_date:string,employees:number,
 price data,ESG score,all_time_price:{ytd_low|ytd_high|52_w_low|52_w_high|
 90_d_low|90_d_high|all_time_low|all_time_high:{date:string,price:number}}},
 valuation:{PE/PB/PS/PCF fields},future:object,peers:object,financials:object,
 dividend:object,management:object,ownership:object}
```

`sections`: `overview,valuation,future,peers,financials,dividend,management,ownership`.
Kirim parameter hanya bila bukan `all`.

```http
GET /v1/listing-performance/BBCA/ HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```json
{"symbol":"BBCA","chg_7d":1.2,"chg_30d":2.8,"chg_90d":-1.5,"chg_365d":5.3}
```

Semua angka perubahan ilustratif; field dan tipe number dari docs.

### 10.4 Segments, top companies, most traded, daily

```http
GET /v1/company/get-segments/UNTR/?financial_year=2024 HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```json
{"symbol":"UNTR","financial_year":2024,"revenue_breakdown":[{"value":100,"source":"Company","target":"Heavy equipment"}]}
```

`100` dan label breakdown adalah **schema placeholder ilustratif**, bukan aktual.
Docs hanya menjamin array `{value,source,target}`.

```http
GET /v1/companies/top/?classifications=dividend_yield,revenue,pe&n_stock=5&min_mcap_billion=5000&logic=and HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```json
{"dividend_yield":[{"symbol":"UNTR","company_name":"Illustrative Company","dividend_yield":7.5}],"revenue":[{"symbol":"ASII","company_name":"Illustrative Company","revenue":50000000}],"pe":[{"symbol":"UNTR","company_name":"Illustrative Company","pe":8.2}]}
```

Nilai dan perusahaan ilustratif sesuai bentuk docs.

```http
GET /v1/most-traded/?start=2025-01-01&end=2025-01-15&n_stock=5&adjusted=false HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```json
{"2025-01-15":[{"symbol":"BBRI","company_name":"Illustrative Company","volume":123456789,"price":4500}]}
```

Nilai numeric/perusahaan adalah contoh schema docs, bukan observation aktual.

```http
GET /v1/daily/BBCA?start=2025-01-01&end=2025-01-15 HTTP/1.1
Host: api.sectors.app
Authorization: <raw_sectors_api_key>
```

```text
[{symbol:string,date:string,close:number,volume:number,market_cap:number}]
```

Currency/unit `close` dan `market_cap` harus diverifikasi dari docs resmi.

## 11. Kepemilikan derived intelligence

Sectors menyediakan data upstream. Score, DuPont, funnel, rank, cohort benchmark,
thesis, confidence, evidence synthesis, dan report adalah milik Voyager, bukan raw
Sectors.

Setiap derivasi menyimpan:

```text
derivationId, formulaVersion, formulaName, computedAt, inputSourceRefs[],
inputMetricKeys[], normalizationCohort, cohortRevision, missingDataPolicy,
tieBreakPolicy, outputValue, outputUnit
```

- Formula immutable; perubahan membuat version baru.
- Input menunjuk snapshot mentah dan field normalized.
- Cohort menyimpan exchange, scope, period policy, dan membership exact.
- Tie-break deterministik: score desc, confidence desc, symbol asc.
- Missing bukan nol; policy per metric adalah exclude, renormalize, atau lower
  confidence, dan harus versioned/terlihat di methodology.
- Jangan membandingkan bank/non-bank dengan rasio tidak comparable.
- DuPont menyimpan formula, period alignment, dan availability average balance.
- Confidence memiliki faktor/threshold eksplisit, bukan label arbitrer.

## 12. Provenance, cache, dan snapshot

Wajib: `provider`, `endpoint`, canonical `params`, `retrievedAt`, `asOf`,
`financialPeriod`, `units`, `currency`, `cacheStatus`, `cacheAgeSeconds`,
`rawSnapshotRef`, `sourceRefs`, `formulaVersion`.

- Raw body immutable/content-addressed; simpan hash, HTTP status, content type,
  retrieval time, adapter schema version.
- Enkripsi at rest, batasi service role, jangan simpan Authorization.
- Evidence menunjuk source reference stabil; jangan bocorkan signed URL/secret.
- Cache key mencakup provider, endpoint, canonical params, market, adapter version.

TTL berikut **kebijakan produk Voyager, bukan SLA Sectors**:

| Data | Fresh | Stale-if-error |
| --- | --- | --- |
| taxonomy | 24 jam | 7 hari |
| index membership | 24 jam | 72 jam |
| quarterly dates/financials | 7 hari | 30 hari + warning |
| company report | 24 jam | 72 jam |
| listing performance | 1 jam | 6 jam |
| segments | 7 hari | 30 hari |
| top/growth/movers | 1 jam | 6 jam |
| most traded/daily | 15 menit | 1 jam |

Stale data selalu memunculkan `STALE_CACHE_USED` dan age.

## 13. Security dan reliability

- `SECTORS_API_KEY` server-only; jangan pakai prefix env publik Vite.
- Redact Authorization, cookie, token, prompt internal, credential dari log/trace.
- Trace publik memakai allowlist; egress allowlist `api.sectors.app`.
- Semua query session scoped dengan owner/tenant; unauthorized dapat menjadi 404.
- Dossier symbol wajib anggota session revision; export mengikuti ownership sama.
- Idempotency menyimpan owner, route, key, body hash, response, expiry. Body berbeda
  dengan key sama menghasilkan 409.
- Objective/answer/follow-up dibatasi; body awal maksimum 64 KiB; pageSize 100;
  dimensions allowlist; SSE dan start diberi per-user limits.
- Client Sectors memakai timeout, retry GET dengan jitter, circuit breaker,
  concurrency cap, dan schema validation.
- Audit menyimpan actor, action, resource, revision, attempt, request ID, outcome.
- Jangan simpan/kirim chain-of-thought, hidden prompt, atau reasoning token. Simpan
  ringkasan keputusan, formula, evidence, dan tool outcome auditable.
- Prompt template hanya version/hash tanpa secret; report tetap non-advisory.

## 14. Storage entities dan index

| Entity | Isi utama |
| --- | --- |
| `research_sessions` | owner, brief, status, revision, pointers |
| `research_attempts` | attempt number/status/timestamps/cancel |
| `clarifications` | question, answer, return status |
| `research_plans`, `pillar_runs` | plan dan execution status |
| `screening_stages` | criteria/count/publication |
| `screening_memberships`, `screening_reasons` | disposition/reasons |
| `companies`, `metric_observations` | identity dan normalized metrics |
| `candidate_results`, `peer_benchmarks` | rank/score/cohort |
| `evidence`, `derivations`, `reports` | intelligence versioned |
| `tool_call_logs`, `session_events`, `data_warnings` | audit/event/warning |
| `source_records`, `raw_snapshots` | provenance/raw body |
| `idempotency_keys`, `audit_logs` | safety/audit |

Index/constraint minimum:

```text
research_sessions(owner_id,updated_at desc)
research_sessions(owner_id,status,updated_at desc)
unique active research_attempts(session_id)
unique research_attempts(session_id,attempt_number)
unique session_events(session_id,sequence)
unique screening_stages(session_id,attempt_id,order)
unique screening_memberships(stage_id,company_id)
unique candidate_results(session_id,publication_revision,rank)
unique candidate_results(session_id,publication_revision,company_id)
unique companies(exchange,symbol)
metric_observations(company_id,metric_key,as_of,financial_period,source_ref)
source_records(provider,endpoint,params_hash,retrieved_at desc)
unique raw_snapshots(content_hash)
unique idempotency_keys(owner_id,route,idempotency_key)
audit_logs(resource_type,resource_id,occurred_at desc)
```

Gunakan FK dan check constraint enum/status. Soft delete tidak menghapus audit/raw
sebelum retention policy mengizinkan.

## 15. Acceptance criteria frontend

- Refresh memulihkan session, brief, status, `clarificationReturnStatus`.
- Create menghasilkan IDLE; final result belum terlihat.
- Double-click/network retry tidak membuat dua attempt.
- Progress menjaga urutan status, lima pillar, dan revision.
- SSE reconnect tidak menduplikasi activity; gap memicu refetch.
- Clarification kembali ke persisted return status.
- Cancel menang atas late completion; retry memakai attempt baru dan menjaga
  published result lama hingga publikasi atomik baru.
- Nol kandidat valid adalah COMPLETED; optional unavailable juga tetap COMPLETED.
- PARTIAL hanya menampilkan artifact published dan memberi label non-final.
- Stage count sama dengan retained/excluded membership dan persisted reasons.
- Tabs retained/excluded memakai pagination backend.
- Candidate, peers, dossier, report berasal dari attempt/revision sama.
- Money diformat dari decimal/currency; null tidak berubah nol.
- Activity user-readable; trace sanitized.
- User A tidak dapat list/get/SSE/export session user B.
- Library mendukung search/filter/sort/page, duplicate, delete.
- Global company route diimplementasikan atau frontend route dihapus eksplisit.
- Export bebas secret, hidden prompt, chain-of-thought.
- 409/422/429/503 memicu recovery terdefinisi, bukan crash generic.
- Existing keyboard, live region, focus, dan accessibility invariant tetap lulus.

## 16. Delivery dan urutan integrasi

### P0

- Freeze OpenAPI, auth, response code, enum.
- Session/attempt/revision/idempotency/ownership storage.
- Sectors taxonomy/index/companies/dates/financials/report client + provenance.
- Worker lifecycle, cancel fencing, warnings, atomic publication.
- Preview/create/list/get/start/cancel/retry/clarification/SSE.
- Stages/membership/reasons/candidates/dossier/report/activity/trace.
- Formula v1 approved dengan deterministic golden tests.

### P1

- Peer benchmark, optional segments, listing, most-traded, daily.
- Follow-up, duplicate server-side, richer capabilities.
- Top growth/top metrics discovery; cache/circuit breaker/metrics/reconciliation.

### P2

- Markdown/PDF/JSON exports; index daily, IDX total, movers, subindustry.
- SGX setelah currency/ticker/taxonomy/formula tests.
- Global company research bila dipilih produk.

Urutan frontend:

1. API client/envelope parser dan Voyager runtime base URL.
2. Capabilities/presets/preview, pertahankan form.
3. Ganti localStorage session dengan server; localStorage hanya preference.
4. Hubungkan commands/clarification/SSE dengan revision guard.
5. Ganti funnel dengan paginated membership/reasons.
6. Ganti candidate/peer/dossier/report melalui satu adapter boundary.
7. Ganti activity/trace/export; hapus label fixture produksi.
8. Putuskan global route dan jalankan smoke/interaction/a11y/contract tests.

## 17. Keputusan terbuka eksplisit

1. **Auth:** cookie BFF, OIDC bearer, atau lain; tetapkan CSRF/CORS/tenant.
2. **REST stack:** language/framework, OpenAPI generation, migration, observability.
3. **Worker/queue:** produk, delivery semantics, timeout, DLQ, scheduler owner.
4. **SSE auth/reconnect:** cookie/bearer, retention, limits, proxy behavior.
5. **Credit source:** billing ledger, internal estimate, atau fitur dihapus.
6. **SGX scope:** release dan dukungan SGD/ticker/taxonomy/formula.
7. **Score formula:** factor, weight, cohort, missing policy, confidence, owner.
8. **Retention:** session/event/audit/raw/export/hard-delete schedule.
9. **Global company route:** implementasikan atau hapus `/company/:symbol`.
10. **API response registry:** service `31` masih usulan; alokasikan case/message.
11. **Upstream pagination/rate limits:** tidak ada di docs lokal; verifikasi official
    docs dan plan akun sebelum menetapkan concurrency/TTL.

## 18. Mapping frontend ke normalized backend

| Frontend | Backend | Adapter sementara |
| --- | --- | --- |
| session IDs/timestamps/status | field sama, ISO UTC | format UI |
| `clarificationReturnStatus` | persisted field | jangan infer |
| `plan`, `pillars` | field sama | pastikan lima pillar |
| `toolCalls` | activity/trace | map production sourceKind |
| funnel `stage` | stage `name` | rename |
| funnel `count` | `retainedCount` | rename |
| `retainedSymbols` | retained membership | fetch pages |
| excluded diff/alasan UI | excluded membership/reasons | hentikan derivasi client |
| symbol/name/sector/subsector | candidate identity | langsung |
| `marketCapTrillionIdr` | `marketData.marketCap` Money | parse IDR, bagi 1e12 hanya untuk display |
| `priceIdr` | `marketData.price` Money | decimal formatter, bukan operasi float |
| `peRatio`, `pbvRatio` | `metrics.pe/pb.value` | flatten legacy |
| `evToEbitda` | `metrics.evToEbitda.value` | flatten nullable |
| `roePercent`, `roaPercent` | `metrics.roe/roa.value` | preserve null |
| `debtToEquity`, `currentRatio` | normalized metrics | sector-aware flatten |
| `freeCashFlowYieldPercent` | `metrics.freeCashFlowYield.value` | flatten |
| revenue/net income CAGR | versioned CAGR metrics | flatten + formula ref |
| `dividendYieldPercent` | dividend yield metric | flatten |
| `qualityScore` | `score.value` | flatten |
| `scoreBreakdown` | `score.factors` | map keys |
| `rank`, `confidenceLevel` | rank/confidence | existing enum map |
| `whySelected` | `thesis` | rename |
| strengths/concerns | fields sama | rename concerns |
| `evidenceCitations` | evidence + sourceRefs | compose legacy label, keep ID |
| `dupontAnalysis` | dossier `dupont` | flatten |
| `peerRankInMemory` | structured benchmark | derive display string |
| `priceAsOf` | `marketData.asOf` | format date |
| `financialPeriod` | structured period | format FY/Q |
| index membership | normalized array | langsung |
| listing/forward/segments/ESG | optional artifacts | map items + preserve status |
| ownership/management | separate artifacts | gabung hanya untuk legacy UI |
| dividend history/trends | observations/time series | map presentation |
| report timestamp | `publishedAt` | timezone user |
| report topCandidates | symbol refs | join revision sama |
| `creditsSpent` | billing/usage summary | tampilkan jika source diputuskan |

Adapter hanya di API boundary frontend. Money, metrics, evidence, provenance,
warning, dan artifact status tetap kontrak kanonik backend.

## 19. Checklist dan definisi selesai

- OpenAPI mencakup seluruh P0, enum, example, error; tidak ada root data/error/meta.
- Sectors adapter raw key tanpa Bearer, schema validation, tanpa secret di log.
- Formula golden tests membuktikan score/rank/tie deterministik.
- Migration memiliki FK, unique, dan check constraints.
- Test membuktikan cancel-vs-complete fencing, idempotency replay/conflict, SSE
  resume/duplicate/expiry/auth, dan atomic publication.
- Test membedakan optional unavailable dari partial dan menjaga money/null/currency.
- Security test mencegah IDOR, secret/prompt leakage, oversized input.
- Load test mencakup list, SSE fan-out, dan upstream concurrency cap.
- Metrics: job/queue/upstream latency, errors, cache hit/stale, warning rate,
  cancel late write, SSE reconnect, publication lag.
- Runbook: upstream outage, stale cache, stuck attempt, event replay, formula
  rollback, raw snapshot lookup.

Selesai berarti frontend dapat menjalankan brief, preview, create/start, progress,
clarification, cancel/retry, funnel/reasons, peers, dossier, activity, trace, dan
report tanpa fixture; seluruh artifact konsisten, provenanced, race-safe, dan
tidak mengekspos key Sectors.

Kontrak Voyager tetap proposal sampai keputusan bagian 17 ditutup, OpenAPI
ditinjau bersama, dan integrasi Sectors diverifikasi terhadap dokumentasi resmi
terkini. Docs lokal adalah dasar auditable, bukan pengganti verifikasi provider.
