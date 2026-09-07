# Voyager Two V1 - Technical Analysis

## 1. Status Dokumen

| Field | Value |
| --- | --- |
| Dokumen | Product discovery dan delivery track technical analysis |
| Status | Discovery pending; belum menjadi commitment implementasi |
| Product track | Voyager Two V1, khusus technical analysis |
| Depends on | Voyager One fundamental end-to-end dan review UI/UX/CX |
| Last updated | 2026-09-07 |

Dokumen ini menjadi acuan eksklusif technical analysis. Seluruh delivery
fundamental, integrasi frontend/backend, security, backend authoritative,
durability, UI/UX/CX, testing, deployment, dan production hardening tetap menjadi
scope Voyager One di
[`jurnal-one-v1.md`](jurnal-one-v1.md).

## 2. Tujuan Pemisahan

Technical analysis tidak dimasukkan langsung ke Voyager One karena penambahan
chart, timeframe, indikator, signal, dan alert dapat meningkatkan beban kognitif
secara tajam. Voyager Two harus membantu keputusan riset yang jelas, bukan
menjadi terminal chart generik atau katalog indikator.

Pemisahan ini menjaga:

- Voyager One fokus pada kualitas dan kebenaran fundamental research.
- UI Voyager One dapat disederhanakan sebelum domain baru masuk.
- Kontrak OHLCV, freshness, indicator, dan provenance dirancang dengan benar.
- Fundamental thesis tidak tercampur dengan market timing tanpa aturan jelas.
- Produk tetap research/information tool, bukan automated trading atau pemberi
  instruksi transaksi.

## 3. Hipotesis Produk

Hipotesis awal, belum disetujui:

> Voyager Two memberi konteks perilaku harga dan volume terhadap thesis
> fundamental yang sudah tersedia, sehingga user dapat memahami kondisi pasar,
> momentum, risiko, dan horizon tanpa menerima instruksi beli atau jual.

Pertanyaan utama:

- Keputusan user apa yang menjadi lebih baik dengan technical analysis?
- Apakah technical analysis menjadi konteks setelah fundamental shortlist,
  workflow terpisah, atau input ranking?
- Apakah primary user investor jangka panjang, position trader, swing trader,
  atau analis riset?
- Berapa banyak indikator yang benar-benar diperlukan untuk keputusan tersebut?
- Apa yang harus tampil pertama dan apa yang tetap menjadi detail lanjutan?

## 4. Non-Goals Awal

- Automated order execution.
- Buy/sell signal tanpa konteks dan disclosure.
- Strategy marketplace.
- Indikator sebanyak mungkin.
- Chart kompleks sebagai landing experience.
- Backtest tanpa corporate-action adjustment dan bias disclosure.
- Menggabungkan skor fundamental dan technical menjadi satu angka tanpa formula,
  alasan, dan validasi yang eksplisit.

## 5. Actual vs Expected

| Area | Actual | Expected sebelum implementasi | Status |
| --- | --- | --- | --- |
| Fundamental base | Voyager One belum end-to-end authoritative | Fundamental state dan artifact stabil | Blocked |
| UI/UX/CX | Review simplification belum dilakukan | IA dan cognitive-load budget disetujui | Blocked |
| User decision | Belum ditentukan | Job-to-be-done dan primary persona jelas | Open |
| Technical role | Belum ditentukan | Context layer, ranking input, atau workflow terpisah dipilih | Open |
| Horizon | Belum ditentukan | Supported horizon dan non-supported horizon eksplisit | Open |
| Market data | Belum ada OHLCV contract | Provider, interval, adjustment, timezone, SLA jelas | Open |
| Indicators | Belum dipilih | Minimum purposeful indicator set | Open |
| Provenance | Belum ada | Observed, derived, interpreted, dan warning terpisah | Open |
| UX placement | Belum ada | Masuk IA tanpa menambah navigation overload | Open |
| Advice boundary | Fundamental disclaimer tersedia | Technical copy tetap informasional | Open |
| Testing | Belum ada | Formula, freshness, chart, accessibility, dan bias tests | Open |

## 6. Discovery Checklist

### 6.1 User dan keputusan

- [ ] Tetapkan primary persona.
- [ ] Tetapkan jobs-to-be-done.
- [ ] Tetapkan keputusan yang dibantu dan keputusan yang tidak dibantu.
- [ ] Tetapkan horizon: intraday, swing, position, atau research-only.
- [ ] Validasi kebutuhan melalui interview atau usability study.
- [ ] Tentukan success metric yang tidak bergantung pada return investasi.

### 6.2 Posisi dalam produk

- [ ] Pilih technical analysis sebagai context layer, ranking input, atau workflow
  terpisah.
- [ ] Tentukan hubungan dengan fundamental shortlist dan company dossier.
- [ ] Tentukan conflict policy antara fundamental thesis dan technical context.
- [ ] Tentukan apakah technical context tersedia sebelum fundamental report.
- [ ] Tentukan route dan navigation placement setelah review UI/UX/CX.
- [ ] Tetapkan cognitive-load budget per screen.

### 6.3 Data contract

- [ ] Pilih provider OHLCV.
- [ ] Verifikasi exchange coverage dan symbol mapping.
- [ ] Tentukan interval yang didukung.
- [ ] Tentukan market calendar dan timezone.
- [ ] Tentukan freshness SLA dan delayed-data disclosure.
- [ ] Terapkan split, dividend, rights issue, dan corporate-action adjustment.
- [ ] Definisikan missing candles, market halt, dan incomplete session behavior.
- [ ] Tentukan cache, stale policy, rate limit, dan raw snapshot retention.
- [ ] Bedakan observed market data dan derived indicator.

### 6.4 Indicator contract

- [ ] Pilih minimum indicator set berdasarkan job-to-be-done.
- [ ] Dokumentasikan formula dan parameter.
- [ ] Version setiap formula.
- [ ] Tentukan warm-up period dan insufficient-history behavior.
- [ ] Tentukan null/missing policy.
- [ ] Hindari satu composite score kecuali dapat dijelaskan dan divalidasi.
- [ ] Pisahkan indicator value, interpretation, confidence, dan warning.
- [ ] Tentukan kondisi market regime bila diperlukan.

### 6.5 Trust dan safety

- [ ] Gunakan bahasa observasi, bukan instruksi transaksi.
- [ ] Tampilkan timeframe dan data-as-of pada setiap interpretation.
- [ ] Tampilkan freshness dan stale warning.
- [ ] Tampilkan formula version dan source reference.
- [ ] Dokumentasikan false-signal dan lagging-indicator limitations.
- [ ] Tetapkan backtest requirements atau larangan backtest pada V1.
- [ ] Jika backtest tersedia, disclose survivorship, look-ahead, selection, dan
  transaction-cost bias.
- [ ] Pastikan technical context tidak menutupi fundamental risks.

### 6.6 UI/UX/CX

- [ ] Tentukan first-read summary tanpa chart overload.
- [ ] Tentukan second-read chart dan supporting evidence.
- [ ] Tentukan advanced indicator disclosure.
- [ ] Batasi primary action per context menjadi satu.
- [ ] Rancang mobile chart interaction tanpa hover dependency.
- [ ] Sediakan table/text alternative untuk chart.
- [ ] Pastikan keyboard, screen reader, zoom, contrast, dan reduced motion.
- [ ] Hindari warna hijau/merah sebagai satu-satunya pembeda.
- [ ] Uji pemahaman antara trend, momentum, volatility, dan recommendation.

### 6.7 Backend dan operasi

- [ ] Definisikan canonical API dan OpenAPI.
- [ ] Persist observed series metadata, derived indicators, and provenance.
- [ ] Pisahkan compute jobs dari request lifecycle bila diperlukan.
- [ ] Terapkan idempotency, revision, ownership, dan tenant boundaries.
- [ ] Tentukan update schedule dan market-session triggers.
- [ ] Tambahkan provider health, freshness, cache, and compute metrics.
- [ ] Tambahkan reconciliation terhadap corrected market data.

### 6.8 Testing

- [ ] Golden tests untuk formula indikator.
- [ ] Corporate-action adjustment tests.
- [ ] Timezone, market-calendar, dan interval-boundary tests.
- [ ] Missing/incomplete candle tests.
- [ ] Provider schema-drift tests.
- [ ] Stale/freshness behavior tests.
- [ ] Fundamental-technical conflict presentation tests.
- [ ] Mobile chart usability tests.
- [ ] Accessibility tests untuk chart dan alternative representation.
- [ ] Contract dan production smoke tests.

## 7. Kandidat Scope V1

Daftar ini hanya bahan discovery. Jangan anggap seluruhnya harus dibuat.

### Context minimum

- Price trend pada horizon yang dipilih.
- Relative position terhadap range.
- Volume context.
- Volatility/risk context.
- Data freshness dan market status.
- Plain-language interpretation dengan limitations.

### Indicator candidates

- Moving average untuk trend context.
- Relative strength atau momentum yang terdefinisi jelas.
- ATR atau realized volatility untuk risk context.
- Volume average/relative volume untuk participation context.
- Support/resistance hanya jika definisi algoritmik dan explainability disetujui.

Lebih sedikit indikator dengan hubungan keputusan yang jelas lebih baik daripada
banyak indikator tanpa hierarchy.

## 8. Opsi Integrasi Dengan Fundamental

| Opsi | Kelebihan | Risiko | Status |
| --- | --- | --- | --- |
| Context setelah shortlist | Tidak mengubah fundamental ranking; mudah dijelaskan | User dapat salah membaca sebagai timing signal | Recommended untuk discovery |
| Input ranking | Satu urutan kandidat | Mencampur horizon dan dapat merusak explainability | Tidak direkomendasikan untuk V1 |
| Workflow terpisah | Boundary domain jelas | Menambah route dan navigation complexity | Perlu UX review |
| Company dossier section | Kontekstual per emiten | Dossier dapat terlalu padat | Perlu progressive disclosure |

## 9. Definition of Ready

Voyager Two V1 belum boleh masuk implementasi sebelum:

- [ ] Voyager One fundamental end-to-end tidak lagi memakai simulated production
  state atau fabricated financial defaults.
- [ ] Review UI/UX/CX Voyager One selesai.
- [ ] Primary persona dan job-to-be-done technical analysis disetujui.
- [ ] Posisi technical analysis dalam product journey disetujui.
- [ ] Provider OHLCV dan data contract tervalidasi.
- [ ] Indicator minimum dan formula version disetujui.
- [ ] Advice boundary, disclosures, dan limitations disetujui.
- [ ] Information architecture tidak menambah navigation overload.
- [ ] Accessibility strategy untuk chart tersedia.
- [ ] Acceptance criteria dan testing plan tersedia.

## 10. Definition of Done

Placeholder ini akan diperinci setelah Definition of Ready terpenuhi.

- [ ] Data observed memiliki source, as-of, interval, adjustment, dan freshness.
- [ ] Derived indicator memiliki formula version dan input lineage.
- [ ] Interpretation tidak berubah menjadi buy/sell instruction.
- [ ] Fundamental dan technical context tidak tercampur tanpa explanation.
- [ ] Missing/stale/incomplete data menghasilkan explicit state.
- [ ] Desktop dan mobile menjaga hierarchy dan satu primary action.
- [ ] Chart memiliki accessible alternative.
- [ ] Contract, formula, provider, integration, and accessibility tests lulus.
- [ ] Production monitoring dan runbook tersedia.

## 11. Next Step

Jangan mulai implementasi dari daftar indikator. Urutan berikutnya:

1. Selesaikan audit UI/UX/CX Voyager One.
2. Selesaikan fundamental end-to-end sesuai `jurnal-one-v1.md`.
3. Jalankan discovery persona, decision, dan horizon Voyager Two.
4. Bekukan data dan indicator contract.
5. Baru susun fase implementasi Voyager Two V1.
