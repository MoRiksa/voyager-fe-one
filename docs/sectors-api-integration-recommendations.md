# Rekomendasi Integrasi Sectors API untuk Voyager One

> Dokumen ini merangkum gap analysis antara state frontend Voyager One saat ini dengan kemampuan Sectors API, serta rekomendasi konkret untuk meningkatkan akurasi dan kelengkapan sistem.

**Tanggal**: 27 Agustus 2026  
**Versi**: 1.0  
**Status**: Draft untuk Review

---

## Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [State Saat Ini](#state-saat-ini)
3. [Gap Analysis](#gap-analysis)
4. [Evaluasi Sistem Scoring](#evaluasi-sistem-scoring)
5. [Rekomendasi Perbaikan](#rekomendasi-perbaikan)
6. [Roadmap Implementasi](#roadmap-implementasi)
7. [Referensi API](#referensi-api)

---

## Ringkasan Eksekutif

Voyager One saat ini menggunakan **fixture data statis** untuk 8 perusahaan Indonesia dengan scoring 5-faktor. Integrasi dengan Sectors API dapat meningkatkan:

| Aspek | Saat Ini | Dengan Sectors API |
|-------|----------|-------------------|
| Universe | 8 perusahaan fixture | 900+ perusahaan IDX real-time |
| Data freshness | Statis | Daily/quarterly updates |
| Peer comparison | Tidak ada | Otomatis vs sector median |
| Scoring accuracy | 7/10 | Potensi 9/10 |
| Temporal analysis | Tidak ada | Historical trends + momentum |

**Rekomendasi utama**: Implementasi bertahap dimulai dari endpoint yang memberikan value tertinggi dengan effort terendah.

---

## State Saat Ini

### Data yang Tersedia di Fixture

```
src/data/sectorsUniverse.ts
```

| Kategori | Metrik | Status |
|----------|--------|--------|
| **Identitas** | Symbol, Name, Sector, Subsector | ✅ |
| **Valuasi** | P/E, P/BV, EV/EBITDA | ✅ |
| **Profitabilitas** | ROE, ROA | ✅ |
| **Solvency** | Debt/Equity, Current Ratio | ✅ |
| **Cash Flow** | FCF Yield, Dividend Yield | ✅ |
| **Growth** | 3Y Revenue CAGR, Net Income CAGR | ✅ |
| **Derived** | Quality Score, DuPont Analysis | ✅ |

### Perusahaan dalam Fixture

| Symbol | Sector | Quality Score |
|--------|--------|---------------|
| BBCA | Financials | 94 |
| BMRI | Financials | 91 |
| BBRI | Financials | 89 |
| ICBP | Consumer Non-Cyclicals | 89 |
| UNTR | Industrials | 88 |
| AMRT | Consumer Discretionary | 87 |
| ASII | Conglomerate | 85 |
| TLKM | Telecommunications | 84 |

### Formula Scoring Saat Ini

```
Quality Score = (0.25 × Profitability) + (0.25 × Growth) + (0.20 × Solvency) 
              + (0.20 × Valuation) + (0.10 × Consistency)
```

---

## Gap Analysis

### Fitur Sectors API yang Belum Dimanfaatkan

#### Prioritas Tinggi

| Fitur | Endpoint | Gap | Dampak |
|-------|----------|-----|--------|
| **Price Performance** | `GET /listing-performance/{ticker}/` | Tidak ada data return 7d/30d/90d/365d | Tidak bisa menilai momentum dan timing |
| **Historical Financials** | `GET /financials/quarterly/{ticker}/` | CAGR dihitung manual, tidak ada trend | Tidak bisa validasi consistency score |
| **Peer Comparison** | `GET /company/report/{ticker}/?sections=peers` | Valuasi tanpa benchmark sektor | P/E 22x dianggap sama di semua sektor |
| **Index Membership** | `GET /index/{index}/` | Tidak ada filter likuiditas | Bisa merekomendasikan saham tidak likuid |
| **Top Growth** | `GET /companies/top-growth/` | Tidak ada real-time growth ranking | Screening growth tidak optimal |
| **Top by Metrics** | `GET /companies/top/` | Screening manual per metrik | Tidak efisien untuk universe besar |
| **Forward Estimates** | `GET /company/report/{ticker}/?sections=future` | Hanya backward-looking | Tidak ada analyst consensus |

#### Prioritas Medium

| Fitur | Endpoint | Gap | Dampak |
|-------|----------|-----|--------|
| **Revenue Segments** | `GET /company/get-segments/{ticker}/` | Tidak ada business mix | Tidak bisa nilai diversifikasi |
| **Daily Transaction** | `GET /daily/{ticker}` | Tidak ada volume analysis | Liquidity assessment manual |
| **ESG Score** | `GET /company/report/{ticker}/?sections=overview` | Tidak ada sustainability rating | ESG-conscious investors tidak terlayani |
| **52-Week Range** | `GET /company/report/{ticker}/?sections=overview` | Tidak ada technical context | Valuasi tanpa price range |
| **Top Movers** | `GET /companies/top-changes/` | Tidak ada market sentiment | Momentum investing tidak tersedia |

#### Prioritas Rendah

| Fitur | Endpoint | Gap | Dampak |
|-------|----------|-----|--------|
| **Management** | `GET /company/report/{ticker}/?sections=management` | Tidak ada info key personnel | Governance assessment terbatas |
| **Ownership** | `GET /company/report/{ticker}/?sections=ownership` | Tidak ada shareholder structure | Tidak tahu institutional holding |

### Perbandingan Data Structure

**Voyager One Fixture:**
```typescript
interface CandidateCompany {
  symbol: string
  name: string
  sector: string
  subsector: string
  marketCapTrillionIdr: number
  priceIdr: number
  peRatio: number
  pbvRatio: number
  evToEbitda: number
  roePercent: number
  roaPercent: number
  debtToEquity: number
  currentRatio: number
  freeCashFlowYieldPercent: number
  revenue3yCagrPercent: number
  netIncome3yCagrPercent: number
  dividendYieldPercent: number
  qualityScore: number
  scoreBreakdown: ScoreBreakdown
  // ... explainability fields
}
```

**Sectors API Company Report:**
```typescript
// GET /company/report/{ticker}/?sections=all
interface SectorsCompanyReport {
  symbol: string
  company_name: string
  overview: {
    market_cap: number
    sector: string
    listing_date: string
    employees: number
    esg_score: number
    all_time_price: {
      ytd_low: { date: string, price: number }
      ytd_high: { date: string, price: number }
      '52_w_low': { date: string, price: number }
      '52_w_high': { date: string, price: number }
      // ...
    }
  }
  valuation: { pe: number, pb: number, ps: number, pcf: number }
  future: { /* forward estimates */ }
  peers: { /* peer comparison */ }
  financials: { /* revenue, earnings, margins */ }
  dividend: { /* yield, payout, history */ }
  management: { /* key personnel */ }
  ownership: { /* shareholder structure */ }
}
```

---

## Evaluasi Sistem Scoring

### Kelebihan Formula Saat Ini

| Aspek | Evaluasi |
|-------|----------|
| **Bobot seimbang** | ✅ Profitability + Growth = 50%, memberikan penekanan pada earnings power |
| **Risk-aware** | ✅ Solvency 20% memastikan perusahaan dengan leverage tinggi tidak mendapat skor tinggi |
| **Value consideration** | ✅ Valuation 20% mencegah overpaying untuk growth |
| **DuPont integration** | ✅ Memberikan insight sumber ROE (margin vs turnover vs leverage) |

### Kelemahan yang Teridentifikasi

| Issue | Severity | Dampak | Root Cause |
|-------|----------|--------|------------|
| **Tidak ada normalisasi sektor** | High | Bank ROE 20% vs Retail ROE 20% diperlakukan sama | Tidak ada peer comparison dari API |
| **Tidak ada momentum** | High | Scoring murni fundamental, timing diabaikan | Tidak ada price performance data |
| **Tidak ada forward-looking** | High | Hanya historical metrics | Tidak ada analyst estimates |
| **Consistency sulit divalidasi** | Medium | Skor consistency 80-99 tanpa historical proof | Tidak ada quarterly time series |
| **Tidak ada liquidity filter** | Medium | Bisa rekomendasikan saham tidak likuid | Tidak ada volume/index membership |
| **Valuation tanpa benchmark** | Medium | P/E absolut, bukan relatif terhadap peers | Tidak ada sector median |

### Scoring Accuracy Assessment

```
Current State:  ████████░░ 7/10
With Sectors API: █████████░ 9/10 (potential)
```

**Gap to close:**
1. Sector-relative valuation (+0.5)
2. Momentum integration (+0.5)
3. Liquidity filtering (+0.3)
4. Forward estimates (+0.3)
5. Validated consistency (+0.4)

---

## Rekomendasi Perbaikan

### 1. Enhanced Scoring Formula

**Proposed Structure:**

```typescript
interface EnhancedScoreBreakdown {
  // === FUNDAMENTAL (60%) ===
  profitability: number    // 20% - ROE, ROA, margins (vs sector median)
  growth: number           // 20% - Revenue & earnings CAGR (validated)
  solvency: number         // 10% - D/E, current ratio, interest coverage
  valuation: number        // 10% - PE, PBV vs sector median (relative)
  
  // === MARKET (25%) ===
  momentum: number         // 15% - Price performance 30d, 90d, 365d
  liquidity: number        // 10% - Index membership, avg volume
  
  // === QUALITY (15%) ===
  consistency: number      // 10% - Earnings variance, FCF stability
  forward: number          // 5% - Forward PE discount, analyst growth est
}

// New formula
const enhancedScore = 
  (0.20 * profitability) +
  (0.20 * growth) +
  (0.10 * solvency) +
  (0.10 * valuation) +
  (0.15 * momentum) +
  (0.10 * liquidity) +
  (0.10 * consistency) +
  (0.05 * forward)
```

### 2. API Integration Points

**Phase 1: Core Data (Week 1-2)**

```typescript
// Replace fixture with live universe
const getUniverse = async (subsector: string) => {
  const companies = await fetch(`/companies/?sub_sector=${subsector}`)
  return companies
}

// Get comprehensive company data
const getCompanyData = async (ticker: string) => {
  const [report, performance, financials] = await Promise.all([
    fetch(`/company/report/${ticker}/?sections=overview,valuation,peers,financials`),
    fetch(`/listing-performance/${ticker}/`),
    fetch(`/financials/quarterly/${ticker}/?n_quarters=12`)
  ])
  return { report, performance, financials }
}
```

**Phase 2: Screening Enhancement (Week 3-4)**

```typescript
// Use API screening endpoints
const screenByMetrics = async (criteria: ScreeningCriteria) => {
  const topByDividend = await fetch(`/companies/top/?classifications=dividend_yield&min_mcap_billion=5000`)
  const topGrowth = await fetch(`/companies/top-growth/?classifications=top_earnings_growth_gainers`)
  // Combine and rank
}

// Index-based liquidity filter
const filterByLiquidity = async (symbols: string[]) => {
  const lq45 = await fetch(`/index/lq45/`)
  const idx30 = await fetch(`/index/idx30/`)
  const liquidSymbols = new Set([...lq45, ...idx30].map(c => c.symbol))
  return symbols.filter(s => liquidSymbols.has(s))
}
```

**Phase 3: Advanced Analytics (Week 5-6)**

```typescript
// Momentum scoring
const calculateMomentum = (performance: ListingPerformance) => {
  const weights = { chg_7d: 0.1, chg_30d: 0.3, chg_90d: 0.3, chg_365d: 0.3 }
  // Normalize and score
}

// Consistency validation
const validateConsistency = (quarterlyFinancials: QuarterlyData[]) => {
  const earningsVariance = calculateVariance(quarterlyFinancials.map(q => q.earnings))
  const revenueGrowthConsistency = /* ... */
  return consistencyScore
}

// Peer-relative valuation
const relativizeValuation = (company: Company, peers: PeerData) => {
  const sectorMedianPE = peers.pe_median
  const relativeDiscount = (sectorMedianPE - company.pe) / sectorMedianPE
  return valuationScore
}
```

### 3. UI/UX Enhancements

**New Data Points to Display:**

| Location | New Information | Source |
|----------|-----------------|--------|
| Candidate Card | 30d return badge | `/listing-performance/` |
| Company View | 52-week range chart | `/company/report/?sections=overview` |
| Company View | Peer comparison table | `/company/report/?sections=peers` |
| Peers View | Sector median benchmark line | `/company/report/?sections=peers` |
| Report | Forward PE & analyst estimates | `/company/report/?sections=future` |
| Screener | Index membership badges (LQ45, IDX30) | `/index/` |

**New Screening Presets:**

```typescript
const enhancedPresets = [
  {
    id: 'obj-lq45-value',
    title: 'Saham LQ45 dengan valuasi menarik',
    apiFilters: {
      indexMembership: ['lq45'],
      classifications: ['pe', 'dividend_yield'],
      minMcapBillion: 10000
    }
  },
  {
    id: 'obj-growth-momentum',
    title: 'Growth stocks dengan momentum positif',
    apiFilters: {
      topGrowth: 'top_earnings_growth_gainers',
      minPerformance30d: 5,
      minMcapBillion: 5000
    }
  },
  {
    id: 'obj-dividend-aristocrats',
    title: 'Dividend leaders dengan track record',
    apiFilters: {
      classifications: ['dividend_yield', 'total_dividend'],
      minDividendYield: 5,
      minMcapBillion: 10000
    }
  }
]
```

---

## Roadmap Implementasi

### Phase 0: Preparation (Week 0)

- [ ] Obtain Sectors API key
- [ ] Set up API client with rate limiting
- [ ] Create TypeScript types for API responses
- [ ] Set up caching layer (localStorage + memory)

### Phase 1: Core Integration (Week 1-2)

| Task | Endpoint | Priority | Effort |
|------|----------|----------|--------|
| Replace fixture universe | `/companies/?sub_sector=` | P0 | Medium |
| Add company report data | `/company/report/{ticker}/` | P0 | Medium |
| Add quarterly financials | `/financials/quarterly/{ticker}/` | P0 | High |
| Implement data caching | - | P0 | Medium |

**Deliverable**: Live data untuk 8 perusahaan existing dengan fallback ke fixture

### Phase 2: Screening Enhancement (Week 3-4)

| Task | Endpoint | Priority | Effort |
|------|----------|----------|--------|
| Index membership filter | `/index/{index}/` | P1 | Low |
| Top metrics screening | `/companies/top/` | P1 | Medium |
| Top growth screening | `/companies/top-growth/` | P1 | Medium |
| Price performance | `/listing-performance/{ticker}/` | P1 | Low |

**Deliverable**: Enhanced screening dengan 3 preset baru

### Phase 3: Scoring Enhancement (Week 5-6)

| Task | Component | Priority | Effort |
|------|-----------|----------|--------|
| Momentum factor | Score calculation | P1 | Medium |
| Peer-relative valuation | Score calculation | P1 | High |
| Consistency validation | Score calculation | P2 | High |
| Liquidity factor | Score calculation | P2 | Low |

**Deliverable**: Enhanced 8-factor scoring formula

### Phase 4: Advanced Features (Week 7-8)

| Task | Endpoint | Priority | Effort |
|------|----------|----------|--------|
| Forward estimates | `/company/report/?sections=future` | P2 | Medium |
| Revenue segments | `/company/get-segments/{ticker}/` | P2 | Medium |
| ESG integration | `/company/report/?sections=overview` | P3 | Low |
| Daily transaction volume | `/daily/{ticker}` | P3 | Low |

**Deliverable**: Full Sectors API integration

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Universe coverage | 8 companies | 100+ companies | Count of screenable companies |
| Data freshness | Static | Daily | Last update timestamp |
| Scoring accuracy | 7/10 | 9/10 | Backtesting vs actual returns |
| Screening presets | 4 | 10 | Available preset count |
| User satisfaction | - | >4.5/5 | User feedback score |

---

## Referensi API

### Base URL
```
https://api.sectors.app/v1
```

### Authentication
```
Authorization: <api_key>
```

### Key Endpoints Summary

| # | Endpoint | Use Case |
|---|----------|----------|
| 1 | `GET /companies/?sub_sector={subsector}` | Get universe by sector |
| 2 | `GET /company/report/{ticker}/` | Comprehensive company data |
| 3 | `GET /financials/quarterly/{ticker}/` | Historical financials |
| 4 | `GET /listing-performance/{ticker}/` | Price performance |
| 5 | `GET /index/{index}/` | Index membership |
| 6 | `GET /companies/top/` | Metric-based screening |
| 7 | `GET /companies/top-growth/` | Growth-based screening |
| 8 | `GET /companies/top-changes/` | Momentum screening |

### Rate Limits & Pricing

Refer to [Sectors.app Pricing](https://sectors.app/pricing) for current limits.

Recommended approach:
- Cache company reports for 24 hours
- Cache quarterly financials for 7 days
- Cache index membership for 24 hours
- Real-time only for price performance

---

## Appendix: Immediate Wins (Tanpa API)

Jika integrasi API belum memungkinkan, berikut improvement yang bisa dilakukan dengan fixture saat ini:

### 1. Tambahkan Disclaimer

```typescript
const scoringDisclaimer = `
Skor kualitas adalah demonstrasi metodologi menggunakan data prototype. 
Dalam implementasi produksi, skor akan:
- Dibandingkan dengan median sektor (peer-relative)
- Memperhitungkan momentum harga
- Memvalidasi konsistensi dari data historis
- Memfilter berdasarkan likuiditas
`
```

### 2. Jelaskan Keterbatasan di UI

| Location | Disclaimer |
|----------|------------|
| Methodology Modal | "Benchmark seharusnya vs sector peers, bukan nilai absolut" |
| Score Tooltip | "Momentum dan timing belum diperhitungkan dalam skor ini" |
| Report | "Data menggunakan fixture demonstrasi, bukan real-time market data" |

### 3. Dokumentasi Internal

Tambahkan catatan di `ui-ux-evolution.md`:

```markdown
## Scoring Limitations (Pre-API Integration)

Current scoring does not include:
- Sector-relative benchmarking
- Price momentum factors  
- Liquidity/volume filtering
- Forward-looking estimates
- Real-time data validation

These will be addressed when Sectors API is integrated.
```

---

**Dokumen ini akan diperbarui seiring progress implementasi.**
