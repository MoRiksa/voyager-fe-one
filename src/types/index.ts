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
  | 'NEEDS_INPUT'
  | 'PARTIAL'
  | 'CANCELLED'
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
  supported?: boolean
  unsupportedReasons?: string[]
  contract?: ResearchContract
  id: string
  title: string
  objective: string
  category: 'Quality & Moat' | 'Valuation & Dividends' | 'Growth Compounders' | 'Sector Deep-Dive'
  universe: string
  expectedCandidates: number
  tags: string[]
}

export interface ResearchBrief {
  market: 'IDX' | 'SGX'
  sectorScope: string
  indexScope: string
  candidateCount: number
  researchDepth: 'Ringkas' | 'Standar' | 'Mendalam'
  useSectorMetrics: boolean
  optionalDimensions: string[]
  clarificationNotes: string[]
}

export interface ResearchPlan {
  contract?: ResearchContract
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
  estimatedDurationSeconds: number | null
  estimatedCredits: number | null
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
  growth?: number       // unavailable until historical data is sourced
  solvency: number      // 0-100 (weight 20%)
  valuation: number     // 0-100 (weight 20%)
  consistency?: number  // unavailable until historical data is sourced
}

export interface DuPontAnalysis {
  netProfitMargin: number // %
  assetTurnover: number   // x
  equityMultiplier: number // x
  calculatedRoe: number   // %
}

export interface CandidatePresentationItem {
  label: string
  value: string
  detail?: string
}

export interface CandidateTrend {
  label: string
  period?: string
  value: number
}

export interface CandidateCompany {
  artifactVersion?: 'candidate-v2'
  formulaVersion?: 'quality-3f-v1' | 'quality-3f-v2'
  sourceOrigin?: ProviderSourceOrigin
  providerSource?: ProviderSourceMetadata
  symbol: string
  name: string
  sector: string
  subsector: string
  marketCapTrillionIdr: number
  priceIdr: number
  peRatio: number
  pbvRatio: number
  evToEbitda?: number
  roePercent: number
  roaPercent: number
  debtToEquity: number
  currentRatio?: number
  freeCashFlowYieldPercent: number
  revenue3yCagrPercent?: number
  netIncome3yCagrPercent?: number
  dividendYieldPercent?: number
  
  // Derived Intelligence
  qualityScore: number // 0 - 100 derived score
  scoreBreakdown: ScoreBreakdown
  rank: number
  confidenceLevel?: 'HIGH' | 'MEDIUM' | 'MODERATE'
  evidenceStatus?: string
  narrativeStatus?: string
  
  // Explainability
  whySelected: string
  keyStrengths: string[]
  potentialConcerns: string[]
  evidenceCitations: {
    source: string
    metric: string
    value: string
    context: string
    asOf?: string
    period?: string
  }[]
  dupontAnalysis: DuPontAnalysis
  peerRankInMemory?: string

  // Optional API-backed presentation data
  priceAsOf?: string
  financialPeriod?: string
  indexMembership?: string[]
  listingPerformance?: CandidatePresentationItem[]
  forwardEstimates?: CandidatePresentationItem[]
  segments?: CandidatePresentationItem[]
  esg?: CandidatePresentationItem[]
  ownershipManagement?: CandidatePresentationItem[]
  dividendHistory?: CandidatePresentationItem[]
  trends?: CandidateTrend[]
}

export interface ScreeningFunnelStep {
  artifactVersion?: 'screening-stage-v2'
  formulaVersion?: 'quality-3f-v1' | 'quality-3f-v2'
  sourceOrigins?: ProviderSourceOrigin[]
  providerSources?: ProviderSourceMetadata[]
  stage: string
  stageId?: string
  count: number
  description: string
  filterCriteria: string
  inputSymbols?: string[]
  retainedSymbols: string[]
  excludedSymbols?: string[]
  excludedCount?: number
  reasons?: ScreeningReason[]
  sourceKind?: 'voyager-derived' | 'prototype-fixture'
  sourceRef?: string
}

export type ProviderSourceOrigin = 'live' | 'cache' | 'stale-cache' | 'demo-fixture'

export interface ProviderSourceMetadata {
  origin: ProviderSourceOrigin
  sourceRef: string
  retrievedAt: string
  cachedAt?: string
  expiresAt?: string
  staleAt?: string
}

export interface ScreeningReason {
  symbol: string
  code: string
  message: string
  metricKey: string
  actualValue: number | string
  operator: string
  thresholdValue: number | string
}

export interface ResearchReport {
  contract?: ResearchContract
  objectiveStatus?: 'answered' | 'not_answered' | 'cannot_assess'
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

export interface ResearchContract {
  version: string
  status: 'supported' | 'unsupported'
  supportedObjective: string
  criteria: string[]
  unsupportedReasons: string[]
  discoveryLimit: number
  coveragePolicy: string
  limitations: string[]
}

export interface ProvenanceRecord {
  provenanceId: string
  sessionId: string
  attemptId: string | null
  revision: number
  action: string
  provider: string
  endpoint?: string
  sourceRef: string
  inputDigest?: string
  outputDigest?: string
  auditDetails?: any
  timestamp: string
}

export interface ScheduledTask {
  id: string
  name: string
  cronExpression: string
  frequency?: 'daily' | 'weekdays' | 'weekly' | 'monthly'
  scheduleTime?: string
  timezone?: string
  objective: string
  market: 'IDX' | 'SGX'
  requestedCandidates: number
  enabled: boolean
  lastRunAt?: string | null
  nextRunAt?: string | null
  runCount: number
}

export interface ResearchJob {
  jobId: string
  sessionId: string
  attemptId: string
  type: string
  step?: number
  status: 'queued' | 'processing' | 'completed' | 'failed'
  error?: string
  createdAt: string
}

export interface ResearchSession {
  id: string
  createdAt: string
  updatedAt: string
  objective: string
  presetId: string
  brief: ResearchBrief
  status: AgentStatus
  clarificationReturnStatus: AgentStatus
  plan: ResearchPlan
  pillars: PillarStep[]
  toolCalls: ToolCallLog[]
  screeningFunnel: ScreeningFunnelStep[]
  candidates: CandidateCompany[]
  report: ResearchReport
  creditsSpent: number
  revision?: number
  activeAttemptId?: string | null
  publishedAttemptId?: string | null
  ownerId?: string
  tenantId?: string
  provenanceTrail?: ProvenanceRecord[]
}
