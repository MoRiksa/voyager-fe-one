export type AgentStatus = 
  | 'IDLE' 
  | 'UNDERSTANDING' 
  | 'PLANNING' 
  | 'DISCOVERING' 
  | 'SCREENING' 
  | 'RANKING' 
  | 'RESEARCHING' 
  | 'COMPARING' 
  | 'VALIDATING' 
  | 'REPORTING' 
  | 'COMPLETED' 
  | 'FAILED'

export type PillarId = 'planner' | 'screener' | 'engine' | 'state' | 'report'

export interface PillarStep {
  id: PillarId
  number: number
  name: string
  subtitle: string
  status: 'pending' | 'active' | 'completed' | 'failed'
  metricsSummary?: string
  durationMs?: number
}

export interface ResearchObjectivePreset {
  id: string
  title: string
  objective: string
  category: 'Quality & Moat' | 'Valuation & Dividends' | 'Growth Compounders' | 'Sector Deep-Dive'
  universe: string
  expectedCandidates: number
  tags: string[]
}

export interface ResearchPlan {
  objective: string
  universe: string
  criteria: string[]
  steps: {
    order: number
    action: string
    tool: string
    description: string
  }[]
  hypothesis: string
  requiredDataPoints: string[]
  estimatedDurationSeconds: number
  estimatedCredits: number
}

export interface ToolCallLog {
  id: string
  timestamp: string
  pillar: PillarId
  toolName: string
  category: 'Derived Intelligence' | 'Research Engine' | 'Validation'
  input: Record<string, any>
  outputSummary: string
  durationMs: number
  status: 'SUCCESS' | 'ERROR' | 'CACHED'
  creditCost: number
  sourceKind?: 'prototype-fixture' | 'user-input'
}

export interface ScoreBreakdown {
  profitability: number // 0-100 (weight 25%)
  growth: number        // 0-100 (weight 25%)
  solvency: number      // 0-100 (weight 20%)
  valuation: number     // 0-100 (weight 20%)
  consistency: number   // 0-100 (weight 10%)
}

export interface DuPontAnalysis {
  netProfitMargin: number // %
  assetTurnover: number   // x
  equityMultiplier: number // x
  calculatedRoe: number   // %
}

export interface CandidateCompany {
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
  
  // Derived Intelligence
  qualityScore: number // 0 - 100 derived score
  scoreBreakdown: ScoreBreakdown
  rank: number
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'MODERATE'
  
  // Explainability
  whySelected: string
  keyStrengths: string[]
  potentialConcerns: string[]
  evidenceCitations: {
    source: string
    metric: string
    value: string
    context: string
  }[]
  dupontAnalysis: DuPontAnalysis
  peerRankInMemory: string
}

export interface ScreeningFunnelStep {
  stage: string
  count: number
  description: string
  filterCriteria: string
  retainedSymbols: string[]
}

export interface ResearchReport {
  sessionId: string
  timestamp: string
  objective: string
  universeSummary: string
  screeningFunnel: ScreeningFunnelStep[]
  methodologyOverview: string
  topCandidates: CandidateCompany[]
  peerComparisonNotes: string
  limitations: string[]
  uncertaintyNotes: string
  disclaimer: string
}

export interface ResearchSession {
  id: string
  createdAt: string
  updatedAt: string
  objective: string
  presetId: string
  status: AgentStatus | 'PARTIAL'
  plan: ResearchPlan
  pillars: PillarStep[]
  toolCalls: ToolCallLog[]
  screeningFunnel: ScreeningFunnelStep[]
  candidates: CandidateCompany[]
  report: ResearchReport
  creditsSpent: number
}
