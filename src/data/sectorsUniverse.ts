import type { CandidateCompany, ResearchObjectivePreset } from '../types'

export const OBJECTIVE_PRESETS: ResearchObjectivePreset[] = [
  {
    id: 'obj-banking-moat',
    title: 'Top Indonesian Tier-1 Banking Quality & ROE',
    objective: 'Discover 5 Indonesian listed financial institutions demonstrating exceptional return on equity (ROE > 15%), strong capital adequacy, low non-performing loans, and consistent 3-year net interest margin stability.',
    category: 'Quality & Moat',
    universe: 'Indonesian Financial & Banking Sector (98 Listed Companies)',
    expectedCandidates: 5,
    tags: ['Banking', 'High ROE', 'Asset Quality', 'Capital Adequacy']
  },
  {
    id: 'obj-consumer-growth',
    title: 'High-Moat Consumer Goods Compounders',
    objective: 'Identify Indonesian consumer non-cyclical leaders with strong pricing power, gross margin > 30%, debt-to-equity < 0.8x, and positive free cash flow generation over a 5-year cycle.',
    category: 'Growth Compounders',
    universe: 'Consumer Staples & Discretionary (142 Listed Companies)',
    expectedCandidates: 5,
    tags: ['Consumer Goods', 'Pricing Power', 'Free Cash Flow', 'Low Debt']
  },
  {
    id: 'obj-broad-fundamental',
    title: 'Indonesian Fundamental Compounders with Fair Valuation',
    objective: 'Find 5 Indonesian companies worth researching further based on strong fundamentals, healthy financials, reasonable valuation, and consistent earnings growth across all IDX sectors.',
    category: 'Growth Compounders',
    universe: 'Entire Indonesia Stock Exchange (914 Listed Companies)',
    expectedCandidates: 5,
    tags: ['All Sectors', 'Consistent Growth', 'Healthy Balance Sheet', 'Reasonable PE']
  },
  {
    id: 'obj-dividend-fcf',
    title: 'High Free-Cash-Flow Yield with Sustainable Dividends',
    objective: 'Screen for resilient cash-generative industrial and commodity infrastructure companies with dividend yield > 6%, interest coverage > 5x, and robust working capital management.',
    category: 'Valuation & Dividends',
    universe: 'Energy, Basic Materials & Infrastructure (210 Listed Companies)',
    expectedCandidates: 5,
    tags: ['Dividend Yield', 'FCF Yield', 'Interest Coverage', 'Infrastructure']
  }
]

export const ALL_COMPANIES_DATABASE: CandidateCompany[] = [
  {
    symbol: 'BBCA',
    name: 'PT Bank Central Asia Tbk',
    sector: 'Financials',
    subsector: 'Commercial Banks',
    marketCapTrillionIdr: 1220.5,
    priceIdr: 9900,
    peRatio: 22.4,
    pbvRatio: 4.6,
    evToEbitda: 14.8,
    roePercent: 21.8,
    roaPercent: 3.8,
    debtToEquity: 0.12,
    currentRatio: 1.45,
    freeCashFlowYieldPercent: 4.8,
    revenue3yCagrPercent: 12.4,
    netIncome3yCagrPercent: 16.2,
    dividendYieldPercent: 2.8,
    qualityScore: 94,
    scoreBreakdown: {
      profitability: 96,
      growth: 91,
      solvency: 98,
      valuation: 82,
      consistency: 99
    },
    rank: 1,
    confidenceLevel: 'HIGH',
    whySelected: 'Industry benchmark in Indonesian banking. Dominates low-cost current and savings account (CASA) deposit base (>80%), generating industry-highest ROE of 21.8% alongside exceptional loan quality (gross NPL under 1.8%).',
    keyStrengths: [
      'Market-leading CASA deposit franchise (81.4% ratio) driving ultra-low funding costs',
      'Consistent return on equity (>21%) sustained across multi-decade interest rate cycles',
      'Pristine credit underwriting with non-performing loan ratio substantially below peer median',
      'High digital banking ecosystem stickiness generating sticky non-interest fee income'
    ],
    potentialConcerns: [
      'Premium valuation multiple (P/BV 4.6x) trades at high premium relative to regional banking peers',
      'Net interest margin compression risk in a rapidly descending interest rate environment'
    ],
    evidenceCitations: [
      {
        source: 'Sectors API: /companies/BBCA/financials',
        metric: 'Return on Equity (ROE)',
        value: '21.8%',
        context: 'Ranked #1 among Tier-1 Indonesian commercial banks (Sector median: 14.2%)'
      },
      {
        source: 'Sectors API: /companies/BBCA/ratios',
        metric: 'Net Interest Margin (NIM)',
        value: '5.8%',
        context: 'Supported by CASA ratio exceeding 81%'
      },
      {
        source: 'Intelligence Engine: /scoring/dupont',
        metric: '3-Stage DuPont ROE',
        value: '21.8%',
        context: 'Net Margin (36.4%) x Asset Turnover (0.058x) x Financial Leverage (10.3x)'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 36.4,
      assetTurnover: 0.058,
      equityMultiplier: 10.32,
      calculatedRoe: 21.8
    },
    peerRankInMemory: '#1 of 4 Big Banks'
  },
  {
    symbol: 'BMRI',
    name: 'PT Bank Mandiri (Persero) Tbk',
    sector: 'Financials',
    subsector: 'Commercial Banks',
    marketCapTrillionIdr: 642.0,
    priceIdr: 6875,
    peRatio: 11.8,
    pbvRatio: 2.2,
    evToEbitda: 9.4,
    roePercent: 20.4,
    roaPercent: 2.7,
    debtToEquity: 0.18,
    currentRatio: 1.38,
    freeCashFlowYieldPercent: 6.2,
    revenue3yCagrPercent: 14.1,
    netIncome3yCagrPercent: 21.5,
    dividendYieldPercent: 5.4,
    qualityScore: 91,
    scoreBreakdown: {
      profitability: 92,
      growth: 94,
      solvency: 90,
      valuation: 89,
      consistency: 90
    },
    rank: 2,
    confidenceLevel: 'HIGH',
    whySelected: 'Largest asset base in Indonesia with stellar corporate wholesale leadership and rapidly expanding digital retail Livin ecosystem. Delivers superior net profit CAGR of 21.5% with attractive 5.4% dividend yield.',
    keyStrengths: [
      'Dominant corporate banking book capturing major government and state enterprise transactions',
      'Robust digital retail expansion with Livin by Mandiri achieving over 25 million registered users',
      'Strong dividend payout commitment (60% historical payout ratio) yielding >5.4%',
      'Significant credit cost reduction and restructuring recoveries post-2020 cycle'
    ],
    potentialConcerns: [
      'Higher exposure to state-mandated infrastructure financing compared to private competitors',
      'Corporate loan yield sensitivity during wholesale credit repricing periods'
    ],
    evidenceCitations: [
      {
        source: 'Sectors API: /companies/BMRI/financials',
        metric: '3-Year Net Income CAGR',
        value: '+21.5%',
        context: 'Outperformed state-owned banking peer average of 15.8%'
      },
      {
        source: 'Sectors API: /companies/BMRI/valuation',
        metric: 'P/E Ratio vs PBV',
        value: '11.8x / 2.2x',
        context: 'Compelling risk-reward relative to historical 5-year average of 13.5x'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 32.1,
      assetTurnover: 0.052,
      equityMultiplier: 12.22,
      calculatedRoe: 20.4
    },
    peerRankInMemory: '#2 of 4 Big Banks'
  },
  {
    symbol: 'ICBP',
    name: 'PT Indofood CBP Sukses Makmur Tbk',
    sector: 'Consumer Non-Cyclicals',
    subsector: 'Processed Food & Beverage',
    marketCapTrillionIdr: 134.1,
    priceIdr: 11500,
    peRatio: 14.6,
    pbvRatio: 2.8,
    evToEbitda: 9.8,
    roePercent: 19.6,
    roaPercent: 7.9,
    debtToEquity: 0.68,
    currentRatio: 2.15,
    freeCashFlowYieldPercent: 7.4,
    revenue3yCagrPercent: 11.8,
    netIncome3yCagrPercent: 14.6,
    dividendYieldPercent: 3.4,
    qualityScore: 89,
    scoreBreakdown: {
      profitability: 90,
      growth: 88,
      solvency: 86,
      valuation: 91,
      consistency: 94
    },
    rank: 3,
    confidenceLevel: 'HIGH',
    whySelected: 'Global instant noodle powerhouse (Indomie) with unassailable domestic market share (>70%) and expanding global presence across Middle East and Africa. Strong pricing power cushions raw material cost fluctuations.',
    keyStrengths: [
      'Immense brand equity and distribution network spanning 100,000+ retail touchpoints across Indonesia',
      'Resilient gross profit margin maintained above 35% despite wheat and packaging price volatility',
      'High cash conversion cycle with strong organic free cash flow generating 7.4% yield',
      'Steady geographic diversification through Pinehill international export operations'
    ],
    potentialConcerns: [
      'Foreign currency debt exposure related to the Pinehill acquisition remains sensitive to USD/IDR shifts',
      'Intensifying competition in premium and healthy noodle segments'
    ],
    evidenceCitations: [
      {
        source: 'Sectors API: /companies/ICBP/financials',
        metric: 'Gross Profit Margin',
        value: '36.8%',
        context: 'Highest in Indonesian processed foods peer universe'
      },
      {
        source: 'Intelligence Engine: /scoring/cashflow',
        metric: 'Free Cash Flow Yield',
        value: '7.4%',
        context: 'Annual FCF exceeds IDR 9.8 Trillion'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 13.8,
      assetTurnover: 0.58,
      equityMultiplier: 2.45,
      calculatedRoe: 19.6
    },
    peerRankInMemory: '#1 in Consumer Staples'
  },
  {
    symbol: 'UNTR',
    name: 'PT United Tractors Tbk',
    sector: 'Industrials',
    subsector: 'Heavy Equipment & Mining Contracting',
    marketCapTrillionIdr: 96.8,
    priceIdr: 26000,
    peRatio: 5.2,
    pbvRatio: 1.1,
    evToEbitda: 3.1,
    roePercent: 21.2,
    roaPercent: 13.5,
    debtToEquity: 0.22,
    currentRatio: 2.42,
    freeCashFlowYieldPercent: 12.8,
    revenue3yCagrPercent: 18.5,
    netIncome3yCagrPercent: 15.3,
    dividendYieldPercent: 8.6,
    qualityScore: 88,
    scoreBreakdown: {
      profitability: 91,
      growth: 86,
      solvency: 95,
      valuation: 96,
      consistency: 80
    },
    rank: 4,
    confidenceLevel: 'HIGH',
    whySelected: 'Pristine net cash balance sheet and dominant heavy machinery distributorship (Komatsu, 53% market share). High free cash flow yield (12.8%) with proactive green mineral diversification into gold and nickel.',
    keyStrengths: [
      'Formidable net cash position with virtually negligible long-term interest-bearing debt',
      'Substantial dividend distribution track record averaging >8% annual dividend yield',
      'Strategic revenue diversification away from thermal coal into gold mining (Martabe) and nickel smelting',
      'Integrated business model combining equipment sales, maintenance, and mining contracting (PAMA)'
    ],
    potentialConcerns: [
      'Earnings sensitivity to global commodity cycles and mining contractor volume renegotiations',
      'Environmental, social, and governance (ESG) transition headwinds regarding thermal coal exposure'
    ],
    evidenceCitations: [
      {
        source: 'Sectors API: /companies/UNTR/ratios',
        metric: 'P/E Multiple',
        value: '5.2x',
        context: 'Significant valuation discount relative to 10-year historical median (7.8x)'
      },
      {
        source: 'Sectors API: /companies/UNTR/dividends',
        metric: 'Dividend Yield',
        value: '8.6%',
        context: 'Top decile dividend yield among IDX30 constituents'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 16.2,
      assetTurnover: 0.82,
      equityMultiplier: 1.60,
      calculatedRoe: 21.2
    },
    peerRankInMemory: '#1 in Heavy Equipment'
  },
  {
    symbol: 'AMRT',
    name: 'PT Sumber Alfaria Trijaya Tbk',
    sector: 'Consumer Discretionary',
    subsector: 'Food Retail & Convenience',
    marketCapTrillionIdr: 128.5,
    priceIdr: 3090,
    peRatio: 32.4,
    pbvRatio: 7.8,
    evToEbitda: 16.2,
    roePercent: 24.8,
    roaPercent: 9.6,
    debtToEquity: 0.35,
    currentRatio: 1.12,
    freeCashFlowYieldPercent: 4.1,
    revenue3yCagrPercent: 12.8,
    netIncome3yCagrPercent: 22.4,
    dividendYieldPercent: 1.9,
    qualityScore: 87,
    scoreBreakdown: {
      profitability: 94,
      growth: 92,
      solvency: 88,
      valuation: 74,
      consistency: 96
    },
    rank: 5,
    confidenceLevel: 'HIGH',
    whySelected: 'Indispensable neighborhood convenience store footprint (Alfamart) exceeding 19,000 stores nationwide. Achieves incredible asset turnover and capital efficiency with ROE of 24.8% and steady same-store-sales growth (SSSG).',
    keyStrengths: [
      'Dense neighborhood store saturation creating high barrier to entry and last-mile logistics advantages',
      'High asset velocity with inventory turnover averaging 14x per annum',
      'Growing fee-based service revenue from financial utility payments, parcel pickup, and top-ups',
      'Consistent double-digit net profit expansion over consecutive 8 quarters'
    ],
    potentialConcerns: [
      'Elevated price-to-earnings ratio (32.4x) leaves limited safety margin for retail sales slowdowns',
      'Minimum wage inflation across tier-2 and tier-3 Indonesian cities affecting operating expense margins'
    ],
    evidenceCitations: [
      {
        source: 'Sectors API: /companies/AMRT/financials',
        metric: 'Return on Equity (ROE)',
        value: '24.8%',
        context: 'Highest capital return among Indonesian retail sector operators'
      },
      {
        source: 'Sectors API: /companies/AMRT/ratios',
        metric: 'Asset Turnover',
        value: '2.84x',
        context: 'Underpins superior DuPont ROE model efficiency'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 3.8,
      assetTurnover: 2.84,
      equityMultiplier: 2.30,
      calculatedRoe: 24.8
    },
    peerRankInMemory: '#1 in Retail Convenience'
  },
  {
    symbol: 'BBRI',
    name: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    sector: 'Financials',
    subsector: 'Micro & Ultra-Micro Banking',
    marketCapTrillionIdr: 710.0,
    priceIdr: 4720,
    peRatio: 12.1,
    pbvRatio: 2.3,
    evToEbitda: 8.9,
    roePercent: 19.8,
    roaPercent: 3.1,
    debtToEquity: 0.16,
    currentRatio: 1.40,
    freeCashFlowYieldPercent: 5.8,
    revenue3yCagrPercent: 13.5,
    netIncome3yCagrPercent: 17.8,
    dividendYieldPercent: 6.8,
    qualityScore: 89,
    scoreBreakdown: {
      profitability: 91,
      growth: 90,
      solvency: 89,
      valuation: 88,
      consistency: 92
    },
    rank: 6,
    confidenceLevel: 'HIGH',
    whySelected: 'World-leading microfinance powerhouse with nationwide AgenBRILink agent network. High yield assets generate substantial net interest margins.',
    keyStrengths: ['Unrivaled micro & ultra-micro lending moat', 'High dividend yield >6.8%', 'AgenBRILink ecosystem driving low-cost liquidity'],
    potentialConcerns: ['Micro loan asset quality sensitivity to grassroots purchasing power'],
    evidenceCitations: [{ source: 'Sectors API: /companies/BBRI/financials', metric: 'Dividend Yield', value: '6.8%', context: 'Top tier among global banking peers' }],
    dupontAnalysis: { netProfitMargin: 28.5, assetTurnover: 0.055, equityMultiplier: 12.63, calculatedRoe: 19.8 },
    peerRankInMemory: '#3 of 4 Big Banks'
  },
  {
    symbol: 'TLKM',
    name: 'PT Telkom Indonesia (Persero) Tbk',
    sector: 'Telecommunications',
    subsector: 'Integrated Telecoms',
    marketCapTrillionIdr: 282.0,
    priceIdr: 2850,
    peRatio: 12.4,
    pbvRatio: 2.0,
    evToEbitda: 4.8,
    roePercent: 16.5,
    roaPercent: 8.4,
    debtToEquity: 0.54,
    currentRatio: 1.25,
    freeCashFlowYieldPercent: 9.1,
    revenue3yCagrPercent: 4.2,
    netIncome3yCagrPercent: 5.1,
    dividendYieldPercent: 6.2,
    qualityScore: 84,
    scoreBreakdown: {
      profitability: 88,
      growth: 72,
      solvency: 89,
      valuation: 92,
      consistency: 86
    },
    rank: 7,
    confidenceLevel: 'HIGH',
    whySelected: 'Dominant national digital telecom infrastructure backbone with Telkomsel and expanding Hyperscale Data Center business.',
    keyStrengths: ['Comprehensive fiber optic coverage', 'Telkomsel market leadership', 'Strong FCF yield >9%'],
    potentialConcerns: ['Legacy voice/SMS revenue runoff and fixed broadband price competition'],
    evidenceCitations: [{ source: 'Sectors API: /companies/TLKM/financials', metric: 'FCF Yield', value: '9.1%', context: 'Defensive utility-like cash generation' }],
    dupontAnalysis: { netProfitMargin: 16.4, assetTurnover: 0.52, equityMultiplier: 1.93, calculatedRoe: 16.5 },
    peerRankInMemory: '#1 in Telecommunications'
  },
  {
    symbol: 'ASII',
    name: 'PT Astra International Tbk',
    sector: 'Consumer Discretionary / Conglomerate',
    subsector: 'Automotive & Multi-Industry',
    marketCapTrillionIdr: 202.4,
    priceIdr: 5000,
    peRatio: 6.4,
    pbvRatio: 1.0,
    evToEbitda: 4.2,
    roePercent: 16.2,
    roaPercent: 7.8,
    debtToEquity: 0.38,
    currentRatio: 1.62,
    freeCashFlowYieldPercent: 11.2,
    revenue3yCagrPercent: 10.4,
    netIncome3yCagrPercent: 9.8,
    dividendYieldPercent: 8.2,
    qualityScore: 85,
    scoreBreakdown: {
      profitability: 85,
      growth: 80,
      solvency: 92,
      valuation: 95,
      consistency: 84
    },
    rank: 8,
    confidenceLevel: 'HIGH',
    whySelected: 'Indonesia premier conglomerate with dominant market share in 4W (54%) and 2W (78%), backed by heavy equipment and financial services.',
    keyStrengths: ['Unrivaled automotive sales and distribution network', 'P/E multiple below 6.5x', 'High dividend payout'],
    potentialConcerns: ['EV adoption pace and foreign Chinese automaker entry competition'],
    evidenceCitations: [{ source: 'Sectors API: /companies/ASII/valuation', metric: 'P/E Multiple', value: '6.4x', context: '10-year discount trough' }],
    dupontAnalysis: { netProfitMargin: 9.8, assetTurnover: 0.74, equityMultiplier: 2.23, calculatedRoe: 16.2 },
    peerRankInMemory: '#1 Conglomerate'
  }
]
