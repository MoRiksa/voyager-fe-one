import type { CandidateCompany, ResearchObjectivePreset } from '../types'

export const OBJECTIVE_PRESETS: ResearchObjectivePreset[] = [
  {
    id: 'obj-banking-moat',
    title: 'Bank berkualitas dengan ROE unggul',
    objective: 'Temukan bank Indonesia dengan ROE di atas 15%, kualitas modal yang kuat, kredit bermasalah yang rendah, dan margin bunga bersih yang stabil.',
    category: 'Quality & Moat',
    universe: 'Indonesian Financial & Banking Sector (98 Listed Companies)',
    expectedCandidates: 5,
    tags: ['Banking', 'High ROE', 'Asset Quality', 'Capital Adequacy']
  },
  {
    id: 'obj-consumer-growth',
    title: 'Pemimpin consumer dengan keunggulan kuat',
    objective: 'Temukan perusahaan consumer Indonesia dengan pricing power kuat, margin kotor di atas 30%, Debt-to-Equity di bawah 0.8x, dan arus kas bebas positif.',
    category: 'Growth Compounders',
    universe: 'Consumer Staples & Discretionary (142 Listed Companies)',
    expectedCandidates: 5,
    tags: ['Consumer Goods', 'Pricing Power', 'Free Cash Flow', 'Low Debt']
  },
  {
    id: 'obj-broad-fundamental',
    title: 'Perusahaan fundamental dengan valuasi wajar',
    objective: 'Temukan lima perusahaan Indonesia dengan fundamental kuat, keuangan sehat, valuasi wajar, dan pertumbuhan laba konsisten dari berbagai sektor BEI.',
    category: 'Growth Compounders',
    universe: 'Entire Indonesia Stock Exchange (914 Listed Companies)',
    expectedCandidates: 5,
    tags: ['All Sectors', 'Consistent Growth', 'Healthy Balance Sheet', 'Reasonable PE']
  },
  {
    id: 'obj-dividend-fcf',
    title: 'Arus kas kuat dan dividen berkelanjutan',
    objective: 'Temukan perusahaan industri dan infrastruktur dengan arus kas kuat, dividend yield di atas 6%, serta pengelolaan modal kerja yang sehat.',
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
    whySelected: 'Menjadi acuan kualitas perbankan Indonesia. Basis dana murah CASA di atas 80% mendukung ROE 21.8% dan kualitas kredit yang kuat dengan gross NPL di bawah 1.8%.',
    keyStrengths: [
      'Rasio CASA 81.4% menekan biaya dana',
      'ROE di atas 21% tetap konsisten melalui berbagai siklus suku bunga',
      'Rasio kredit bermasalah berada di bawah median perusahaan sejenis',
      'Ekosistem digital mendukung pendapatan berbasis biaya'
    ],
    potentialConcerns: [
      'P/BV 4.6x mencerminkan valuasi premium terhadap bank pembanding',
      'Penurunan suku bunga dapat menekan net interest margin'
    ],
    evidenceCitations: [
      {
        source: 'Prototype fixture: /companies/BBCA/financials',
        metric: 'Return on Equity (ROE)',
        value: '21.8%',
        context: 'Peringkat pertama di antara bank komersial besar; median sektor 14.2%'
      },
      {
        source: 'Prototype fixture: /companies/BBCA/ratios',
        metric: 'Net Interest Margin (NIM)',
        value: '5.8%',
        context: 'Didukung rasio CASA di atas 81%'
      },
      {
        source: 'Derived fixture: /scoring/dupont',
        metric: '3-Stage DuPont ROE',
        value: '21.8%',
        context: 'Net margin 36.4% x asset turnover 0.058x x leverage 10.3x'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 36.4,
      assetTurnover: 0.058,
      equityMultiplier: 10.32,
      calculatedRoe: 21.8
    },
    peerRankInMemory: '#1 dari 4 bank besar'
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
    whySelected: 'Memiliki basis aset terbesar di Indonesia, posisi kuat pada wholesale banking, dan ekosistem Livin yang berkembang. CAGR laba bersih 21.5% disertai dividend yield 5.4%.',
    keyStrengths: [
      'Portofolio corporate banking kuat pada transaksi pemerintah dan BUMN',
      'Livin by Mandiri memiliki lebih dari 25 juta pengguna terdaftar',
      'Payout ratio historis sekitar 60% mendukung dividend yield di atas 5.4%',
      'Biaya kredit menurun setelah siklus restrukturisasi 2020'
    ],
    potentialConcerns: [
      'Eksposur pembiayaan infrastruktur pemerintah lebih tinggi dibanding bank swasta',
      'Yield kredit korporasi sensitif terhadap repricing wholesale'
    ],
    evidenceCitations: [
      {
        source: 'Prototype fixture: /companies/BMRI/financials',
        metric: '3-Year Net Income CAGR',
        value: '+21.5%',
        context: 'Di atas rata-rata bank BUMN pembanding sebesar 15.8%'
      },
      {
        source: 'Prototype fixture: /companies/BMRI/valuation',
        metric: 'P/E Ratio vs PBV',
        value: '11.8x / 2.2x',
        context: 'Di bawah rata-rata historis lima tahun sebesar 13.5x'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 32.1,
      assetTurnover: 0.052,
      equityMultiplier: 12.22,
      calculatedRoe: 20.4
    },
    peerRankInMemory: '#2 dari 4 bank besar'
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
    whySelected: 'Indomie memiliki pangsa pasar domestik di atas 70% dan jangkauan yang berkembang di Timur Tengah serta Afrika. Pricing power membantu meredam fluktuasi biaya bahan baku.',
    keyStrengths: [
      'Ekuitas merek dan jaringan distribusi mencakup lebih dari 100 ribu titik ritel',
      'Gross margin bertahan di atas 35% meski harga gandum dan kemasan berfluktuasi',
      'Arus kas bebas organik menghasilkan yield 7.4%',
      'Operasi Pinehill memperluas diversifikasi geografis'
    ],
    potentialConcerns: [
      'Utang valuta asing terkait akuisisi Pinehill sensitif terhadap USD/IDR',
      'Persaingan meningkat pada segmen mi premium dan sehat'
    ],
    evidenceCitations: [
      {
        source: 'Prototype fixture: /companies/ICBP/financials',
        metric: 'Gross Profit Margin',
        value: '36.8%',
        context: 'Tertinggi di antara perusahaan makanan olahan pembanding'
      },
      {
        source: 'Derived fixture: /scoring/cashflow',
        metric: 'Free Cash Flow Yield',
        value: '7.4%',
        context: 'FCF tahunan melebihi IDR 9.8 triliun'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 13.8,
      assetTurnover: 0.58,
      equityMultiplier: 2.45,
      calculatedRoe: 19.6
    },
    peerRankInMemory: '#1 pada consumer staples'
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
    whySelected: 'Neraca kas bersih dan posisi dominan pada distribusi alat berat Komatsu dengan pangsa pasar 53%. FCF yield 12.8% disertai diversifikasi ke emas dan nikel.',
    keyStrengths: [
      'Posisi kas bersih dengan utang berbunga jangka panjang yang rendah',
      'Rekam jejak dividend yield tahunan rata-rata di atas 8%',
      'Diversifikasi dari batu bara termal menuju emas Martabe dan smelter nikel',
      'Model terintegrasi mencakup penjualan alat, perawatan, dan kontraktor tambang PAMA'
    ],
    potentialConcerns: [
      'Laba sensitif terhadap siklus komoditas dan renegosiasi volume kontraktor tambang',
      'Eksposur batu bara termal menimbulkan risiko transisi ESG'
    ],
    evidenceCitations: [
      {
        source: 'Prototype fixture: /companies/UNTR/ratios',
        metric: 'P/E Multiple',
        value: '5.2x',
        context: 'Diskon terhadap median historis sepuluh tahun sebesar 7.8x'
      },
      {
        source: 'Prototype fixture: /companies/UNTR/dividends',
        metric: 'Dividend Yield',
        value: '8.6%',
        context: 'Termasuk kelompok dividend yield tertinggi dalam IDX30'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 16.2,
      assetTurnover: 0.82,
      equityMultiplier: 1.60,
      calculatedRoe: 21.2
    },
    peerRankInMemory: '#1 pada alat berat'
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
    whySelected: 'Jaringan Alfamart memiliki lebih dari 19 ribu gerai nasional. Perputaran aset yang tinggi mendukung efisiensi modal, ROE 24.8%, dan pertumbuhan penjualan gerai yang stabil.',
    keyStrengths: [
      'Kepadatan jaringan gerai menciptakan hambatan masuk dan keunggulan logistik last-mile',
      'Perputaran persediaan rata-rata 14x per tahun',
      'Pendapatan berbasis biaya tumbuh dari pembayaran, pengambilan paket, dan top-up',
      'Laba bersih tumbuh dua digit selama delapan kuartal berturut-turut'
    ],
    potentialConcerns: [
      'P/E 32.4x memberi margin of safety terbatas jika penjualan ritel melambat',
      'Kenaikan upah minimum dapat menekan margin biaya operasional'
    ],
    evidenceCitations: [
      {
        source: 'Prototype fixture: /companies/AMRT/financials',
        metric: 'Return on Equity (ROE)',
        value: '24.8%',
        context: 'Pengembalian modal tertinggi di antara operator ritel pembanding'
      },
      {
        source: 'Prototype fixture: /companies/AMRT/ratios',
        metric: 'Asset Turnover',
        value: '2.84x',
        context: 'Menjadi penggerak utama efisiensi ROE DuPont'
      }
    ],
    dupontAnalysis: {
      netProfitMargin: 3.8,
      assetTurnover: 2.84,
      equityMultiplier: 2.30,
      calculatedRoe: 24.8
    },
    peerRankInMemory: '#1 pada ritel convenience'
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
    whySelected: 'Pemimpin dunia dalam pembiayaan mikro dengan jaringan AgenBRILink nasional. Aset beryield tinggi menghasilkan margin bunga bersih yang substansial.',
    keyStrengths: ['Keunggulan tak tertandingi dalam pembiayaan mikro dan ultra-mikro', 'Dividend yield tinggi >6,8%', 'Ekosistem AgenBRILink menggerakkan likuiditas berbiaya rendah'],
    potentialConcerns: ['Sensitivitas kualitas aset kredit mikro terhadap daya beli masyarakat akar rumput'],
    evidenceCitations: [{ source: 'Prototype fixture: /companies/BBRI/financials', metric: 'Dividend Yield', value: '6,8%', context: 'Peringkat atas di antara bank global' }],
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
    whySelected: 'Tulang punggung infrastruktur digital telekomunikasi nasional dengan Telkomsel dan bisnis Hyperscale Data Center yang terus berkembang.',
    keyStrengths: ['Jangkauan fiber optik komprehensif', 'Kepemimpinan pasar Telkomsel', 'FCF yield kuat >9%'],
    potentialConcerns: ['Penurunan pendapatan voice/SMS legacy dan persaingan harga broadband tetap'],
    evidenceCitations: [{ source: 'Prototype fixture: /companies/TLKM/financials', metric: 'FCF Yield', value: '9,1%', context: 'Generasi kas defensif seperti utilitas' }],
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
    whySelected: 'Konglomerat utama Indonesia dengan pangsa pasar dominan di 4W (54%) dan 2W (78%), didukung oleh alat berat dan jasa keuangan.',
    keyStrengths: ['Jaringan penjualan dan distribusi otomotif tak tertandingi', 'P/E multiple di bawah 6,5x', 'Pembayaran dividen tinggi'],
    potentialConcerns: ['Kecepatan adopsi EV dan persaingan dari produsen otomotif China'],
    evidenceCitations: [{ source: 'Prototype fixture: /companies/ASII/valuation', metric: 'P/E Multiple', value: '6,4x', context: 'Diskon terendah dalam 10 tahun' }],
    dupontAnalysis: { netProfitMargin: 9.8, assetTurnover: 0.74, equityMultiplier: 2.23, calculatedRoe: 16.2 },
    peerRankInMemory: '#1 Conglomerate'
  }
]
