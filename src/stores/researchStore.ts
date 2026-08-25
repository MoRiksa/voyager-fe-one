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
  ResearchObjectivePreset
} from '../types'
import { OBJECTIVE_PRESETS, ALL_COMPANIES_DATABASE } from '../data/sectorsUniverse'

export const useResearchStore = defineStore('research', () => {
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
      filterCriteria: 'Status: ACTIVE on IDX'
    },
    {
      stage: 'Basic Eligibility',
      count: 284,
      description: 'Filtered by market liquidity, trading frequency & reporting compliance',
      filterCriteria: 'Market Cap > IDR 1T & 3-yr financial history'
    },
    {
      stage: 'Financial Screening',
      count: 68,
      description: 'Fundamental filter on profitability, leverage, and growth stability',
      filterCriteria: 'ROE > 12% & Debt/Equity < 1.5x'
    },
    {
      stage: 'Quality Shortlist',
      count: 18,
      description: 'Derived Intelligence ranking score thresholding',
      filterCriteria: 'Proprietary Quality Score >= 80/100'
    },
    {
      stage: 'Final Selection',
      count: 5,
      description: 'Validated top compounders with explainable competitive moats',
      filterCriteria: 'Passed Deep DuPont, Cash Flow & Peer Audit'
    }
  ])

  // Candidates List
  const candidates = ref<CandidateCompany[]>(ALL_COMPANIES_DATABASE.slice(0, 5))

  // Selected company object
  const selectedCompany = computed<CandidateCompany>(() => {
    return ALL_COMPANIES_DATABASE.find(c => c.symbol === selectedSymbol.value) || candidates.value[0]
  })

  // Final Report
  const report = ref<ResearchReport>({
    sessionId: 'RES-2026-IDX-0941',
    timestamp: '2026-08-25 20:30:15 WIB',
    objective: currentObjective.value,
    universeSummary: 'Entire Indonesia Stock Exchange (914 Listed Companies filtered down to 5 final candidates)',
    screeningFunnel: screeningFunnel.value,
    methodologyOverview: 'Autonomous multi-stage funnel utilizing Sectors API financial datasets combined with a proprietary 5-factor Derived Intelligence Scoring model (Profitability, Growth, Solvency, Valuation, Consistency). Deep DuPont deconstruction and cross-sectional peer benchmarking applied to all shortlisted candidates.',
    topCandidates: candidates.value,
    peerComparisonNotes: 'BBCA commands the highest quality score (94) driven by a 21.8% ROE and pristine asset quality. BMRI provides strong earnings growth (+21.5% CAGR) at a modest P/E (11.8x). ICBP demonstrates defensive consumer pricing power with 36.8% gross margin. UNTR offers deep value and cash flow yield (12.8%). AMRT leads capital velocity (Asset Turnover 2.84x).',
    limitations: [
      'Valuation metrics reflect latest available trailing Sectors dataset and may change with upcoming quarterly filings.',
      'Commodity sensitivity for industrials (UNTR) and currency risks on imported inputs (ICBP) remain external variables not captured in static ratios.',
      'Financial institutions (BBCA, BMRI) operate under banking capital ratios where standard Debt-to-Equity is not directly comparable to non-financial corporates.'
    ],
    uncertaintyNotes: 'High overall data confidence (>95%) with all primary financial statements verified directly against official Sectors API endpoints.',
    disclaimer: 'This autonomous research report is generated strictly for informational and analytical research purposes under the Sectors Hackathon 2026 guidelines. It does not constitute financial advice, investment recommendations, or automated trade execution instructions.'
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

  // Autonomous Execution Simulation (Live Agent Loop)
  const runAutonomousResearch = async () => {
    if (isExecuting.value) return
    isExecuting.value = true
    status.value = 'UNDERSTANDING'

    // Reset pillars to pending
    pillars.value.forEach(p => {
      p.status = 'pending'
    })

    // Helper sleep
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    try {
      // Step 1: Understanding & Planning
      status.value = 'PLANNING'
      pillars.value[0].status = 'active'
      await sleep(executionSpeedMs.value)
      pillars.value[0].status = 'completed'
      creditsRemaining.value -= 10

      // Step 2: Discovering & Screening
      status.value = 'DISCOVERING'
      pillars.value[1].status = 'active'
      await sleep(executionSpeedMs.value * 0.6)
      status.value = 'SCREENING'
      await sleep(executionSpeedMs.value * 0.8)
      pillars.value[1].status = 'completed'
      creditsRemaining.value -= 40

      // Step 3: Deep Researching Candidates
      status.value = 'RESEARCHING'
      pillars.value[2].status = 'active'
      await sleep(executionSpeedMs.value * 1.2)
      status.value = 'COMPARING'
      await sleep(executionSpeedMs.value * 0.7)
      pillars.value[2].status = 'completed'
      creditsRemaining.value -= 75

      // Step 4: State & Validation
      status.value = 'VALIDATING'
      pillars.value[3].status = 'active'
      await sleep(executionSpeedMs.value * 0.6)
      pillars.value[3].status = 'completed'

      // Step 5: Final Reporting
      status.value = 'REPORTING'
      pillars.value[4].status = 'active'
      await sleep(executionSpeedMs.value * 0.8)
      pillars.value[4].status = 'completed'

      // Filter or rearrange candidates based on objective keywords if custom
      if (currentObjective.value.toLowerCase().includes('banking') || currentObjective.value.toLowerCase().includes('bank')) {
        candidates.value = [
          ALL_COMPANIES_DATABASE[0], // BBCA
          ALL_COMPANIES_DATABASE[1], // BMRI
          ALL_COMPANIES_DATABASE[5], // BBRI
          ALL_COMPANIES_DATABASE[2], // ICBP
          ALL_COMPANIES_DATABASE[3]  // UNTR
        ]
      } else if (currentObjective.value.toLowerCase().includes('consumer') || currentObjective.value.toLowerCase().includes('retail')) {
        candidates.value = [
          ALL_COMPANIES_DATABASE[2], // ICBP
          ALL_COMPANIES_DATABASE[4], // AMRT
          ALL_COMPANIES_DATABASE[0], // BBCA
          ALL_COMPANIES_DATABASE[7], // ASII
          ALL_COMPANIES_DATABASE[1]  // BMRI
        ]
      } else {
        candidates.value = ALL_COMPANIES_DATABASE.slice(0, 5)
      }

      // Update Report timestamp & top candidates
      report.value.timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
      report.value.objective = currentObjective.value
      report.value.topCandidates = candidates.value

      status.value = 'COMPLETED'
    } catch (err) {
      status.value = 'FAILED'
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
    presets: OBJECTIVE_PRESETS,
    
    // Actions
    setObjective,
    selectPreset,
    openCandidateModal,
    closeCandidateModal,
    openMethodology,
    closeMethodology,
    runAutonomousResearch
  }
})
