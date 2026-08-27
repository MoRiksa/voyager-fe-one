import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  AgentStatus, 
  PillarStep, 
  ResearchPlan, 
  ToolCallLog, 
  CandidateCompany, 
  ResearchReport,
  ScreeningFunnelStep,
  ResearchObjectivePreset,
  ResearchSession
} from '../types'
import { OBJECTIVE_PRESETS, ALL_COMPANIES_DATABASE } from '../data/sectorsUniverse'

export const useResearchStore = defineStore('research', () => {
  const STORAGE_KEY = 'voyager-one-research-sessions-v1'
  const STORAGE_VERSION = 2
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
  // --- Core State ---
  const currentObjective = ref<string>(OBJECTIVE_PRESETS[2].objective)
  const activePresetId = ref<string>('obj-broad-fundamental')
  const status = ref<AgentStatus>('COMPLETED')
  const isExecuting = ref<boolean>(false)
  const executionSpeedMs = ref<number>(800) // delay per step in ms for simulation
  const creditsRemaining = ref<number>(8840)
  const totalCredits = ref<number>(10000)
  
  // Selected Company for detail dossier view
  const selectedSymbol = ref<string>('BBCA')
  const isDetailModalOpen = ref<boolean>(false)
  const isMethodologyModalOpen = ref<boolean>(false)
  const sessions = ref<ResearchSession[]>([])
  const toast = ref<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null)
  let toastTimer: ReturnType<typeof setTimeout> | undefined

  // 5 Pillars State
  const pillars = ref<PillarStep[]>([
    {
      id: 'planner',
      number: 1,
      name: 'Research Planner',
      subtitle: 'Formulates structured hypothesis & execution graph',
      status: 'completed',
      metricsSummary: '4 Criteria • 8 Execution Steps',
      durationMs: 420
    },
    {
      id: 'screener',
      number: 2,
      name: 'Autonomous Screener',
      subtitle: 'Dynamic multi-stage universe narrowing',
      status: 'completed',
      metricsSummary: '914 → 18 Qualified Shortlist',
      durationMs: 1250
    },
    {
      id: 'engine',
      number: 3,
      name: 'Deep Research Engine',
      subtitle: 'Fundamental, DuPont & balance sheet audit',
      status: 'completed',
      metricsSummary: '5 Candidates Deep Researched',
      durationMs: 1840
    },
    {
      id: 'state',
      number: 4,
      name: 'State & Observability',
      subtitle: 'State persistence & tool call audit trail',
      status: 'completed',
      metricsSummary: '14 Tool Calls • 0 Fabrications',
      durationMs: 310
    },
    {
      id: 'report',
      number: 5,
      name: 'Synthesis & Final Report',
      subtitle: 'Evidence-backed report & peer comparison',
      status: 'completed',
      metricsSummary: '5 Top Candidates Ranked',
      durationMs: 650
    }
  ])

  // Active Research Plan
  const activePlan = ref<ResearchPlan>({
    objective: OBJECTIVE_PRESETS[2].objective,
    universe: 'Indonesian Listed Companies (IDX / BEI)',
    criteria: [
      'High Return on Equity (ROE > 15%) & healthy capital efficiency',
      'Robust balance sheet with Debt-to-Equity < 1.0x (except prudential financials)',
      'Consistent 3-year revenue and net earnings CAGR (> 10%)',
      'Defensive free cash flow generation with reasonable P/E and EV/EBITDA multiples'
    ],
    steps: [
      { order: 1, action: 'Load Indonesian Stock Universe', tool: 'sectors_search_companies', description: 'Query 900+ active tickers from Sectors registry' },
      { order: 2, action: 'Filter Financial & Solvency Metrics', tool: 'sectors_financial_metrics', description: 'Retrieve ROE, Debt/Equity, Current Ratio & FCF' },
      { order: 3, action: 'Execute Derived Intelligence Scoring', tool: 'derived_scoring_engine', description: 'Apply 5-factor deterministic model (0-100 score)' },
      { order: 4, action: 'Rank & Shortlist Top Candidates', tool: 'derived_screener_rank', description: 'Select top 18 candidates for deep analysis' },
      { order: 5, action: 'Deep Financial Statement & DuPont Audit', tool: 'sectors_financial_statements', description: 'Deconstruct Net Margin, Asset Turnover, Leverage' },
      { order: 6, action: 'Conduct Dynamic Peer Group Benchmarking', tool: 'sectors_peer_comparison', description: 'Compare valuation & operational moats against peers' },
      { order: 7, action: 'Validate Findings & Check Missing Data', tool: 'agent_validator', description: 'Flag anomalies, missing values, and certainty scores' },
      { order: 8, action: 'Synthesize Evidence-Backed Final Report', tool: 'agent_report_synthesizer', description: 'Compile explainable thesis and risk disclosures' }
    ],
    hypothesis: 'Indonesian market compounders will be concentrated in financial leaders with deposit moats, consumer staples with pricing power, and cash-rich heavy industrial operators.',
    requiredDataPoints: ['ROE', 'ROA', 'Debt-to-Equity', 'Current Ratio', 'P/E', 'P/BV', 'FCF Yield', 'Revenue 3Y CAGR', 'Net Profit Margin'],
    estimatedDurationSeconds: 4.5,
    estimatedCredits: 120
  })

  // Tool Calls Log (Trace & Audit)
  const toolCalls = ref<ToolCallLog[]>([
    {
      id: 'tool-01',
      timestamp: '20:30:12.102',
      pillar: 'planner',
      toolName: 'sectors_search_companies',
      category: 'Sectors API',
      input: { market: 'IDX', status: 'ACTIVE', min_market_cap_idr: 1000000000000 },
      outputSummary: 'Loaded 914 active Indonesian listed tickers with market cap > IDR 1T.',
      durationMs: 380,
      status: 'SUCCESS',
      creditCost: 10
    },
    {
      id: 'tool-02',
      timestamp: '20:30:12.490',
      pillar: 'screener',
      toolName: 'sectors_financial_metrics_batch',
      category: 'Sectors API',
      input: { tickers_count: 914, metrics: ['roe', 'debt_to_equity', 'pe_ratio', 'revenue_growth_3y'] },
      outputSummary: 'Retrieved fundamental dataset for 914 companies. 284 passed basic liquidity checks.',
      durationMs: 520,
      status: 'SUCCESS',
      creditCost: 40
    },
    {
      id: 'tool-03',
      timestamp: '20:30:13.015',
      pillar: 'screener',
      toolName: 'derived_scoring_engine',
      category: 'Derived Intelligence',
      input: { weights: { profitability: 0.25, growth: 0.25, solvency: 0.20, valuation: 0.20, consistency: 0.10 } },
      outputSummary: 'Computed 5-factor proprietary Quality Score. Top candidate score: 94 (BBCA).',
      durationMs: 140,
      status: 'SUCCESS',
      creditCost: 0
    },
    {
      id: 'tool-04',
      timestamp: '20:30:13.160',
      pillar: 'screener',
      toolName: 'derived_screener_rank',
      category: 'Derived Intelligence',
      input: { min_score: 80, limit: 18 },
      outputSummary: 'Shortlisted 18 companies scoring above 80/100 threshold for deep research.',
      durationMs: 95,
      status: 'SUCCESS',
      creditCost: 0
    },
    {
      id: 'tool-05',
      timestamp: '20:30:13.260',
      pillar: 'engine',
      toolName: 'sectors_financial_statements',
      category: 'Sectors API',
      input: { symbol: 'BBCA', period: 'FY2021-FY2025', statement: 'all' },
      outputSummary: 'Parsed 5-year balance sheet & income statement. Net margin steady at 36.4%.',
      durationMs: 290,
      status: 'SUCCESS',
      creditCost: 15
    },
    {
      id: 'tool-06',
      timestamp: '20:30:13.560',
      pillar: 'engine',
      toolName: 'sectors_financial_statements',
      category: 'Sectors API',
      input: { symbol: 'BMRI', period: 'FY2021-FY2025', statement: 'all' },
      outputSummary: 'Parsed 5-year statements. 3Y Net income CAGR validated at +21.5%.',
      durationMs: 310,
      status: 'SUCCESS',
      creditCost: 15
    },
    {
      id: 'tool-07',
      timestamp: '20:30:13.880',
      pillar: 'engine',
      toolName: 'sectors_financial_statements',
      category: 'Sectors API',
      input: { symbol: 'ICBP', period: 'FY2021-FY2025', statement: 'all' },
      outputSummary: 'Gross margins confirmed at 36.8%, FCF generation strong at IDR 9.8T.',
      durationMs: 275,
      status: 'SUCCESS',
      creditCost: 15
    },
    {
      id: 'tool-08',
      timestamp: '20:30:14.160',
      pillar: 'engine',
      toolName: 'sectors_financial_statements',
      category: 'Sectors API',
      input: { symbol: 'UNTR', period: 'FY2021-FY2025', statement: 'all' },
      outputSummary: 'Net cash balance sheet verified. FCF yield outstanding at 12.8%.',
      durationMs: 280,
      status: 'SUCCESS',
      creditCost: 15
    },
    {
      id: 'tool-09',
      timestamp: '20:30:14.450',
      pillar: 'engine',
      toolName: 'sectors_financial_statements',
      category: 'Sectors API',
      input: { symbol: 'AMRT', period: 'FY2021-FY2025', statement: 'all' },
      outputSummary: 'Asset turnover confirmed at 2.84x, sustaining ROE of 24.8%.',
      durationMs: 290,
      status: 'SUCCESS',
      creditCost: 15
    },
    {
      id: 'tool-10',
      timestamp: '20:30:14.750',
      pillar: 'engine',
      toolName: 'sectors_peer_comparison',
      category: 'Sectors API',
      input: { peers: ['BBCA', 'BMRI', 'BBRI', 'BBNI'], sector: 'Financials' },
      outputSummary: 'Generated cross-sectional banking peer matrix. BBCA leads in ROE & CASA.',
      durationMs: 340,
      status: 'SUCCESS',
      creditCost: 20
    },
    {
      id: 'tool-11',
      timestamp: '20:30:15.100',
      pillar: 'engine',
      toolName: 'agent_validator',
      category: 'Validation',
      input: { candidate_symbols: ['BBCA', 'BMRI', 'ICBP', 'UNTR', 'AMRT'] },
      outputSummary: 'Zero financial data anomalies found. High confidence level assigned.',
      durationMs: 180,
      status: 'SUCCESS',
      creditCost: 0
    },
    {
      id: 'tool-12',
      timestamp: '20:30:15.290',
      pillar: 'report',
      toolName: 'agent_report_synthesizer',
      category: 'Research Engine',
      input: { format: 'EXECUTIVE_DOSSIER', include_evidence: true },
      outputSummary: 'Compiled comprehensive evidence-backed research report for 5 companies.',
      durationMs: 320,
      status: 'SUCCESS',
      creditCost: 0
    }
  ])

  // Screening Funnel Numbers
  const screeningFunnel = ref<ScreeningFunnelStep[]>([
    {
      stage: 'Total Universe',
      count: 914,
      description: 'Active companies listed on the Indonesia Stock Exchange (IDX)',
      filterCriteria: 'Status: ACTIVE on IDX',
      retainedSymbols: ALL_COMPANIES_DATABASE.map(company => company.symbol)
    },
    {
      stage: 'Basic Eligibility',
      count: 284,
      description: 'Filtered by market liquidity, trading frequency & reporting compliance',
      filterCriteria: 'Market Cap > IDR 1T & 3-yr financial history',
      retainedSymbols: ALL_COMPANIES_DATABASE.map(company => company.symbol)
    },
    {
      stage: 'Financial Screening',
      count: 68,
      description: 'Fundamental filter on profitability, leverage, and growth stability',
      filterCriteria: 'ROE > 12% & Debt/Equity < 1.5x',
      retainedSymbols: ALL_COMPANIES_DATABASE.map(company => company.symbol)
    },
    {
      stage: 'Quality Shortlist',
      count: 18,
      description: 'Derived Intelligence ranking score thresholding',
      filterCriteria: 'Proprietary Quality Score >= 80/100',
      retainedSymbols: ALL_COMPANIES_DATABASE.map(company => company.symbol)
    },
    {
      stage: 'Final Selection',
      count: 5,
      description: 'Validated top compounders with explainable competitive moats',
      filterCriteria: 'Passed Deep DuPont, Cash Flow & Peer Audit',
      retainedSymbols: ALL_COMPANIES_DATABASE.slice(0, 5).map(company => company.symbol)
    }
  ])

  // Candidates List
  const candidates = ref<CandidateCompany[]>(ALL_COMPANIES_DATABASE.slice(0, 5))

  // Selected company object
  const selectedCompany = computed<CandidateCompany | undefined>(() => {
    return candidates.value.find(c => c.symbol === selectedSymbol.value) || candidates.value[0]
  })

  const recentSessions = computed(() => [...sessions.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))

  const deriveSessionResults = (presetId: string) => {
    const preset = OBJECTIVE_PRESETS.find(item => item.id === presetId)
    const scoped = ALL_COMPANIES_DATABASE.filter(company => {
      if (presetId === 'obj-banking-moat') return company.sector === 'Financials'
      if (presetId === 'obj-consumer-growth') return company.sector.includes('Consumer')
      if (presetId === 'obj-dividend-fcf') return ['Industrials', 'Telecommunications', 'Consumer Discretionary / Conglomerate'].includes(company.sector)
      return true
    })
    const eligible = scoped.filter(company => [company.marketCapTrillionIdr, company.roePercent, company.debtToEquity, company.freeCashFlowYieldPercent, company.qualityScore].every(Number.isFinite))
    const financiallyQualified = eligible.filter(company => {
      if (presetId === 'obj-banking-moat') return company.roePercent > 15
      if (presetId === 'obj-consumer-growth') return company.debtToEquity < 0.8 && company.freeCashFlowYieldPercent > 0
      if (presetId === 'obj-dividend-fcf') return company.dividendYieldPercent > 6 && company.freeCashFlowYieldPercent > 0 && company.currentRatio > 1
      return company.roePercent > 12 && company.debtToEquity < 1.5
    })
    const qualityShortlist = financiallyQualified.filter(company => company.qualityScore >= 80).sort((a, b) => b.qualityScore - a.qualityScore || a.symbol.localeCompare(b.symbol))
    const finalCompanies = qualityShortlist.slice(0, preset?.expectedCandidates || 5).map((company, index) => ({ ...clone(company), rank: index + 1 }))
    const stage = (name: string, description: string, criteria: string, companies: CandidateCompany[]): ScreeningFunnelStep => ({
      stage: name,
      count: companies.length,
      description,
      filterCriteria: criteria,
      retainedSymbols: companies.map(company => company.symbol)
    })
    const funnel = [
      stage('Dataset awal', 'Perusahaan fixture yang termasuk dalam ruang lingkup tujuan riset.', preset?.universe || 'Seluruh dataset prototype', scoped),
      stage('Kelengkapan data', 'Perusahaan dengan metrik minimum yang tersedia untuk evaluasi.', 'Kapitalisasi, ROE, Debt/Equity, FCF yield, dan skor kualitas tersedia', eligible),
      stage('Penyaringan finansial', 'Filter finansial yang dapat dievaluasi dari dataset prototype.', presetId === 'obj-banking-moat' ? 'ROE > 15%' : presetId === 'obj-consumer-growth' ? 'Debt/Equity < 0.8x dan FCF yield > 0%' : presetId === 'obj-dividend-fcf' ? 'Dividend yield > 6%, FCF yield > 0%, dan current ratio > 1x' : 'ROE > 12% dan Debt/Equity < 1.5x', financiallyQualified),
      stage('Shortlist kualitas', 'Perusahaan yang memenuhi ambang skor kualitas deterministik.', 'Skor kualitas >= 80/100', qualityShortlist),
      stage('Seleksi akhir', 'Kandidat berperingkat tertinggi tanpa menambahkan perusahaan yang tidak lolos.', `Maksimal ${preset?.expectedCandidates || 5} kandidat berdasarkan skor kualitas`, finalCompanies)
    ]
    return { funnel, candidates: finalCompanies }
  }

  const applyResults = (results: ReturnType<typeof deriveSessionResults>) => {
    screeningFunnel.value = clone(results.funnel)
    candidates.value = clone(results.candidates)
    report.value.screeningFunnel = clone(results.funnel)
    report.value.topCandidates = clone(results.candidates)
    report.value.universeSummary = `${results.funnel[0].count} perusahaan dalam dataset prototype disaring menjadi ${results.candidates.length} kandidat akhir.`
    report.value.peerComparisonNotes = results.candidates.length
      ? `${results.candidates.map(company => company.symbol).join(', ')} lolos seluruh tahap berdasarkan metrik yang tersedia pada dataset prototype.`
      : 'Tidak ada perusahaan pada dataset prototype yang memenuhi seluruh kriteria.'
    report.value.limitations = [
      'Hasil ini menggunakan delapan fixture perusahaan untuk memvalidasi alur seleksi, bukan cakupan penuh Bursa Efek Indonesia.',
      'Kriteria yang datanya belum tersedia, termasuk NPL, histori NIM, interest coverage, frekuensi perdagangan, dan kepatuhan pelaporan, tidak diterapkan.',
      'Metrik valuasi bersifat statis dan dapat berubah setelah pembaruan harga atau laporan keuangan.'
    ]
  }

  // Final Report
  const report = ref<ResearchReport>({
    sessionId: 'RES-2026-IDX-0941',
    timestamp: '2026-08-25 20:30:15 WIB',
    objective: currentObjective.value,
    universeSummary: 'Seluruh Bursa Efek Indonesia (914 perusahaan disaring menjadi 5 kandidat akhir)',
    screeningFunnel: screeningFunnel.value,
    methodologyOverview: 'Penyaringan bertahap menggabungkan lima faktor penilaian: profitabilitas, pertumbuhan, solvabilitas, valuasi, dan konsistensi. Analisis DuPont serta perbandingan perusahaan sejenis diterapkan pada kandidat terpilih.',
    topCandidates: candidates.value,
    peerComparisonNotes: 'BBCA memiliki skor kualitas tertinggi (94) dengan ROE 21.8% dan kualitas aset yang kuat. BMRI menawarkan pertumbuhan laba tinggi pada P/E 11.8x. ICBP menunjukkan margin defensif. UNTR menonjol pada valuasi dan FCF yield 12.8%. AMRT unggul pada perputaran aset 2.84x.',
    limitations: [
      'Metrik valuasi menggunakan data trailing yang tersedia dan dapat berubah setelah laporan keuangan berikutnya.',
      'Sensitivitas komoditas pada UNTR dan risiko mata uang pada input impor ICBP belum sepenuhnya tercermin dalam rasio statis.',
      'Debt-to-Equity bank tidak dapat dibandingkan langsung dengan perusahaan non-finansial karena karakter struktur modalnya berbeda.'
    ],
    uncertaintyNotes: 'Tingkat keyakinan data: tinggi. Periode data dan keterbatasan tiap metrik tetap perlu diperiksa sebelum mengambil keputusan.',
    disclaimer: 'Laporan ini dibuat untuk tujuan informasi dan analisis. Laporan tidak merupakan nasihat keuangan, rekomendasi investasi, atau instruksi transaksi.'
  })

  // --- Actions ---

  const setObjective = (newObjective: string, presetId?: string) => {
    currentObjective.value = newObjective
    if (presetId) {
      activePresetId.value = presetId
    } else {
      activePresetId.value = 'custom'
    }
  }

  const selectPreset = (preset: ResearchObjectivePreset) => {
    currentObjective.value = preset.objective
    activePresetId.value = preset.id
  }

  const openCandidateModal = (symbol: string) => {
    selectedSymbol.value = symbol
    isDetailModalOpen.value = true
  }

  const closeCandidateModal = () => {
    isDetailModalOpen.value = false
  }

  const openMethodology = () => {
    isMethodologyModalOpen.value = true
  }

  const closeMethodology = () => {
    isMethodologyModalOpen.value = false
  }

  const persistSessions = () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, sessions: sessions.value.slice(0, 5) }))
    } catch {
      // Storage may be unavailable or full; the in-memory session remains usable.
    }
  }

  const snapshotSession = (sessionStatus: ResearchSession['status'] = status.value): ResearchSession => {
    const now = new Date().toISOString()
    const existing = sessions.value.find(session => session.id === report.value.sessionId)
    return clone({
      id: report.value.sessionId,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      objective: currentObjective.value,
      presetId: activePresetId.value,
      status: sessionStatus,
      plan: activePlan.value,
      pillars: pillars.value,
      toolCalls: toolCalls.value,
      screeningFunnel: screeningFunnel.value,
      candidates: candidates.value,
      report: report.value,
      creditsSpent: totalCredits.value - creditsRemaining.value
    })
  }

  const saveCurrentSession = (sessionStatus: ResearchSession['status'] = status.value) => {
    const snapshot = snapshotSession(sessionStatus)
    sessions.value = [snapshot, ...sessions.value.filter(session => session.id !== snapshot.id)].slice(0, 5)
    persistSessions()
  }

  const hydrateSessions = () => {
    if (typeof window === 'undefined') return
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as { version?: number; sessions?: ResearchSession[] } | null
      if ((parsed?.version === 1 || parsed?.version === STORAGE_VERSION) && Array.isArray(parsed.sessions)) {
        sessions.value = parsed.sessions.map(session => {
          const results = deriveSessionResults(session.presetId)
          const normalizedStatus = session.status === 'COMPLETED' || session.status === 'FAILED' ? session.status : 'PARTIAL'
          return {
            ...session,
            status: normalizedStatus,
            screeningFunnel: clone(results.funnel),
            candidates: clone(results.candidates),
            report: {
              ...session.report,
              screeningFunnel: clone(results.funnel),
              topCandidates: clone(results.candidates),
              universeSummary: `${results.funnel[0].count} perusahaan dalam dataset prototype disaring menjadi ${results.candidates.length} kandidat akhir.`,
              peerComparisonNotes: results.candidates.length
                ? `${results.candidates.map(company => company.symbol).join(', ')} lolos seluruh tahap berdasarkan metrik yang tersedia pada dataset prototype.`
                : 'Tidak ada perusahaan pada dataset prototype yang memenuhi seluruh kriteria.',
              limitations: [
                'Hasil ini menggunakan delapan fixture perusahaan untuk memvalidasi alur seleksi, bukan cakupan penuh Bursa Efek Indonesia.',
                'Kriteria yang datanya belum tersedia, termasuk NPL, histori NIM, interest coverage, frekuensi perdagangan, dan kepatuhan pelaporan, tidak diterapkan.',
                'Metrik valuasi bersifat statis dan dapat berubah setelah pembaruan harga atau laporan keuangan.'
              ]
            }
          }
        })
        persistSessions()
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    if (!sessions.value.length) {
      applyResults(deriveSessionResults(activePresetId.value))
      saveCurrentSession('COMPLETED')
    }
    else loadSession(recentSessions.value[0].id)
  }

  const loadSession = (id: string) => {
    const session = sessions.value.find(item => item.id === id)
    if (!session) return false
    currentObjective.value = session.objective
    activePresetId.value = session.presetId
    status.value = session.status === 'PARTIAL' ? 'FAILED' : session.status
    activePlan.value = clone(session.plan)
    pillars.value = clone(session.pillars)
    toolCalls.value = clone(session.toolCalls)
    screeningFunnel.value = clone(session.screeningFunnel)
    candidates.value = clone(session.candidates)
    report.value = clone(session.report)
    selectedSymbol.value = candidates.value[0]?.symbol || ''
    isDetailModalOpen.value = false
    isExecuting.value = false
    return true
  }

  const createSession = () => {
    const id = `RES-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`
    const results = deriveSessionResults(activePresetId.value)
    report.value.sessionId = id
    report.value.objective = currentObjective.value
    report.value.timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
    pillars.value.forEach(pillar => { pillar.status = 'pending' })
    applyResults(results)
    selectedSymbol.value = candidates.value[0]?.symbol || ''
    saveCurrentSession('IDLE')
    return id
  }

  const addFollowUp = (question: string) => {
    const now = new Date()
    toolCalls.value.push({
      id: `follow-up-${now.getTime()}`,
      timestamp: now.toLocaleTimeString('id-ID', { hour12: false, fractionalSecondDigits: 3 }),
      pillar: 'report',
      toolName: 'session_follow_up',
      category: 'Research Engine',
      input: { question },
      outputSummary: `Follow-up dicatat: ${question}`,
      durationMs: 0,
      status: 'SUCCESS',
      creditCost: 0
    })
    saveCurrentSession(status.value)
  }

  const deleteSession = (id: string) => {
    if (sessions.value.length <= 1) return false
    sessions.value = sessions.value.filter(session => session.id !== id)
    persistSessions()
    if (report.value.sessionId === id && recentSessions.value[0]) loadSession(recentSessions.value[0].id)
    return true
  }

  const dismissToast = () => {
    toast.value = null
    if (toastTimer) clearTimeout(toastTimer)
  }

  const notify = (message: string, tone: 'success' | 'error' | 'info' = 'info') => {
    dismissToast()
    toast.value = { message, tone }
    toastTimer = setTimeout(dismissToast, 4000)
  }

  // Autonomous Execution Simulation (Live Agent Loop)
  const runAutonomousResearch = async (sessionId = report.value.sessionId) => {
    if (isExecuting.value) return
    isExecuting.value = true
    status.value = 'UNDERSTANDING'
    saveCurrentSession('UNDERSTANDING')

    // Reset pillars to pending
    pillars.value.forEach(p => {
      p.status = 'pending'
    })

    // Helper sleep
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const ownsSession = () => report.value.sessionId === sessionId

    try {
      // Step 1: Understanding & Planning
      status.value = 'PLANNING'
      pillars.value[0].status = 'active'
      await sleep(executionSpeedMs.value)
      if (!ownsSession()) return
      pillars.value[0].status = 'completed'
      creditsRemaining.value -= 10
      saveCurrentSession('PLANNING')

      // Step 2: Discovering & Screening
      status.value = 'DISCOVERING'
      pillars.value[1].status = 'active'
      await sleep(executionSpeedMs.value * 0.6)
      if (!ownsSession()) return
      status.value = 'SCREENING'
      await sleep(executionSpeedMs.value * 0.8)
      if (!ownsSession()) return
      pillars.value[1].status = 'completed'
      creditsRemaining.value -= 40
      saveCurrentSession('SCREENING')

      // Step 3: Deep Researching Candidates
      status.value = 'RESEARCHING'
      pillars.value[2].status = 'active'
      await sleep(executionSpeedMs.value * 1.2)
      if (!ownsSession()) return
      status.value = 'COMPARING'
      await sleep(executionSpeedMs.value * 0.7)
      if (!ownsSession()) return
      pillars.value[2].status = 'completed'
      creditsRemaining.value -= 75
      saveCurrentSession('RESEARCHING')

      // Step 4: State & Validation
      status.value = 'VALIDATING'
      pillars.value[3].status = 'active'
      await sleep(executionSpeedMs.value * 0.6)
      if (!ownsSession()) return
      pillars.value[3].status = 'completed'
      saveCurrentSession('VALIDATING')

      // Step 5: Final Reporting
      status.value = 'REPORTING'
      pillars.value[4].status = 'active'
      await sleep(executionSpeedMs.value * 0.8)
      if (!ownsSession()) return
      pillars.value[4].status = 'completed'

      applyResults(deriveSessionResults(activePresetId.value))

      // Update Report timestamp & top candidates
      report.value.timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
      report.value.objective = currentObjective.value

      status.value = 'COMPLETED'
      saveCurrentSession('COMPLETED')
    } catch (err) {
      status.value = 'FAILED'
      saveCurrentSession('FAILED')
    } finally {
      isExecuting.value = false
    }
  }

  return {
    // State
    currentObjective,
    activePresetId,
    status,
    isExecuting,
    executionSpeedMs,
    creditsRemaining,
    totalCredits,
    selectedSymbol,
    selectedCompany,
    isDetailModalOpen,
    isMethodologyModalOpen,
    pillars,
    activePlan,
    toolCalls,
    screeningFunnel,
    candidates,
    report,
    sessions,
    recentSessions,
    toast,
    presets: OBJECTIVE_PRESETS,
    companyUniverse: ALL_COMPANIES_DATABASE,
    
    // Actions
    setObjective,
    selectPreset,
    openCandidateModal,
    closeCandidateModal,
    openMethodology,
    closeMethodology,
    hydrateSessions,
    loadSession,
    createSession,
    addFollowUp,
    deleteSession,
    notify,
    dismissToast,
    saveCurrentSession,
    runAutonomousResearch
  }
})
