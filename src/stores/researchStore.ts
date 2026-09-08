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
  ResearchSession,
  ResearchBrief,
  ProvenanceRecord,
  ScheduledTask
} from '../types'
import { OBJECTIVE_PRESETS, ALL_COMPANIES_DATABASE } from '../data/sectorsUniverse'
import {
  answerClarification as apiAnswerClarification,
  sendFollowUp as apiSendFollowUp,
  duplicateResearchSession as apiDuplicateResearchSession,
  createCompanyResearchSession as apiCreateCompanyResearchSession,
  cancelResearchSession as apiCancelResearchSession,
  retryResearchSession as apiRetryResearchSession,
  getResearchSessionFull as apiGetResearchSessionFull,
  getResearchSessions as apiGetResearchSessions,
  deleteResearchSession as apiDeleteResearchSession,
  getProvenanceTrail as apiGetProvenanceTrail,
  subscribeSessionSse as apiSubscribeSessionSse,
  asyncExecuteResearchSession as apiAsyncExecuteResearchSession,
  getResearchSchedules as apiGetResearchSchedules,
  createResearchSchedule as apiCreateResearchSchedule,
  toggleResearchSchedule as apiToggleResearchSchedule,
  runResearchScheduleNow as apiRunResearchScheduleNow
} from '../services/researchApi'

export const useResearchStore = defineStore('research', () => {
  const STORAGE_KEY = 'voyager-one-research-sessions-v1'
  const STORAGE_VERSION = 2
  const activeStatuses = new Set<AgentStatus>(['UNDERSTANDING', 'PLANNING', 'DISCOVERING', 'SCREENING', 'RANKING', 'RESEARCHING', 'COMPARING', 'VALIDATING', 'REPORTING'])
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
  const defaultResearchBrief = (): ResearchBrief => ({
    market: 'IDX',
    sectorScope: 'Semua sektor fixture',
    indexScope: 'Seluruh fixture IDX',
    candidateCount: 5,
    researchDepth: 'Standar',
    useSectorMetrics: true,
    optionalDimensions: [],
    clarificationNotes: []
  })
  const normalizeResearchBrief = (brief?: Partial<ResearchBrief>): ResearchBrief => {
    const defaults = defaultResearchBrief()
    return {
      market: brief?.market === 'IDX' || brief?.market === 'SGX' ? brief.market : defaults.market,
      sectorScope: typeof brief?.sectorScope === 'string' ? brief.sectorScope : defaults.sectorScope,
      indexScope: typeof brief?.indexScope === 'string' ? brief.indexScope : defaults.indexScope,
      candidateCount: typeof brief?.candidateCount === 'number' && Number.isFinite(brief.candidateCount) && brief.candidateCount > 0
        ? Math.floor(brief.candidateCount)
        : defaults.candidateCount,
      researchDepth: ['Ringkas', 'Standar', 'Mendalam'].includes(brief?.researchDepth || '')
        ? brief!.researchDepth!
        : defaults.researchDepth,
      useSectorMetrics: typeof brief?.useSectorMetrics === 'boolean' ? brief.useSectorMetrics : defaults.useSectorMetrics,
      optionalDimensions: Array.isArray(brief?.optionalDimensions) ? brief.optionalDimensions.filter(item => typeof item === 'string') : [],
      clarificationNotes: Array.isArray(brief?.clarificationNotes) ? brief.clarificationNotes.filter(item => typeof item === 'string') : []
    }
  }
  // --- Core State ---
  const currentObjective = ref<string>(OBJECTIVE_PRESETS[2].objective)
  const activePresetId = ref<string>('obj-broad-fundamental')
  const status = ref<AgentStatus>('COMPLETED')
  const isExecuting = ref<boolean>(false)
  const executionSpeedMs = ref<number>(800) // delay per step in ms for simulation
  const creditsRemaining = ref<number>(8840)
  const totalCredits = ref<number>(10000)
  const activeBrief = ref<ResearchBrief>(defaultResearchBrief())
  const clarificationQuestion = ref<string | null>(null)
  const clarificationId = ref<string | null>(null)
  let clarificationReturnStatus: AgentStatus = 'IDLE'
  let executionToken = 0

  // 9 Batches Metadata State
  const currentRevision = ref<number>(1)
  const activeAttemptId = ref<string | null>(null)
  const publishedAttemptId = ref<string | null>(null)
  const ownerId = ref<string>('user-default-analyst')
  const tenantId = ref<string>('tenant-default')
  const provenanceTrail = ref<ProvenanceRecord[]>([])
  const schedules = ref<ScheduledTask[]>([])
  const sseConnected = ref<boolean>(false)
  let sseUnsubscribe: (() => void) | null = null
  
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
      name: 'Perencana Riset',
      subtitle: 'Menyusun hipotesis dan urutan eksekusi terstruktur',
      status: 'completed',
      metricsSummary: 'Menunggu konteks sesi'
    },
    {
      id: 'screener',
      number: 2,
      name: 'Penyaring Kandidat',
      subtitle: 'Mempersempit universe melalui beberapa tahap',
      status: 'completed',
      metricsSummary: 'Menunggu hasil penyaringan'
    },
    {
      id: 'engine',
      number: 3,
      name: 'Analisis Mendalam',
      subtitle: 'Meninjau fundamental, DuPont, dan kesehatan neraca',
      status: 'completed',
      metricsSummary: 'Menunggu kandidat'
    },
    {
      id: 'state',
      number: 4,
      name: 'Status dan Audit',
      subtitle: 'Menyimpan status serta jejak aktivitas sesi',
      status: 'completed',
      metricsSummary: 'Menunggu event audit'
    },
    {
      id: 'report',
      number: 5,
      name: 'Sintesis dan Laporan',
      subtitle: 'Merangkum bukti, pembanding, dan keterbatasan',
      status: 'completed',
      metricsSummary: 'Menunggu hasil akhir'
    }
  ])

  // Active Research Plan
  const activePlan = ref<ResearchPlan>({
    objective: OBJECTIVE_PRESETS[2].objective,
    universe: 'Dataset prototype belum dipilih',
    criteria: [],
    steps: [],
    hypothesis: 'Menunggu tujuan dan ruang lingkup sesi.',
    requiredDataPoints: [],
    estimatedDurationSeconds: 4.5,
    estimatedCredits: 120
  })

  // Tool Calls Log (Trace & Audit)
  const toolCalls = ref<ToolCallLog[]>([])

  // Screening Funnel Numbers
  const screeningFunnel = ref<ScreeningFunnelStep[]>([])

  // Candidates List
  const candidates = ref<CandidateCompany[]>([])

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

  const getScreeningPreview = (presetId: string) => {
    const results = deriveSessionResults(presetId)
    return {
      universe: results.funnel[0],
      criteria: results.funnel.slice(1).map(step => step.filterCriteria),
      maximumCandidates: OBJECTIVE_PRESETS.find(preset => preset.id === presetId)?.expectedCandidates || 5
    }
  }

  const deriveSessionArtifacts = (results: ReturnType<typeof deriveSessionResults>, objective = currentObjective.value, basePillars = pillars.value) => {
    const now = new Date().toLocaleTimeString('id-ID', { hour12: false })
    const criteria = results.funnel.slice(1).map(step => step.filterCriteria)
    const plan: ResearchPlan = {
      objective,
      universe: `${results.funnel[0].count} perusahaan fixture: ${results.funnel[0].retainedSymbols.join(', ')}`,
      criteria,
      steps: results.funnel.map((step, index) => ({ order: index + 1, action: step.stage, tool: 'prototype_fixture_filter', description: step.filterCriteria })),
      hypothesis: 'Perusahaan yang memenuhi filter terukur dan memiliki skor kualitas tertinggi menjadi kandidat untuk ditinjau lebih lanjut.',
      requiredDataPoints: ['Kapitalisasi pasar', 'ROE', 'Debt-to-Equity', 'FCF Yield', 'Skor kualitas'],
      estimatedDurationSeconds: 4.5,
      estimatedCredits: 0
    }
    const nextPillars = clone(basePillars).map(pillar => ({ ...pillar, durationMs: undefined }))
    nextPillars[0].metricsSummary = `${criteria.length} kriteria · ${results.funnel.length} tahap`
    nextPillars[1].metricsSummary = `${results.funnel[0].count} → ${results.funnel[3].count} shortlist fixture`
    nextPillars[2].metricsSummary = `${results.candidates.length} kandidat tersedia untuk ditinjau`
    nextPillars[3].metricsSummary = `${results.funnel.length} event audit · sumber fixture`
    nextPillars[4].metricsSummary = `${results.candidates.length} kandidat diperingkat`
    const calls: ToolCallLog[] = results.funnel.map((step, index) => ({
      id: `audit-${index + 1}`,
      timestamp: now,
      pillar: index === 0 ? 'planner' : index < 4 ? 'screener' : 'report',
      toolName: 'prototype_fixture_filter',
      category: index === 0 ? 'Research Engine' : 'Derived Intelligence',
      input: {
        source: 'prototype-fixture-v1',
        input_symbols: index === 0 ? step.retainedSymbols : results.funnel[index - 1].retainedSymbols,
        criteria: step.filterCriteria
      },
      outputSummary: `${step.stage}: ${step.count} perusahaan tersisa (${step.retainedSymbols.join(', ') || 'tidak ada'}).`,
      durationMs: 0,
      status: 'SUCCESS',
      creditCost: 0,
      sourceKind: 'prototype-fixture'
    }))
    return { plan, pillars: nextPillars, toolCalls: calls }
  }

  const applyResults = (results: ReturnType<typeof deriveSessionResults>, objective = currentObjective.value, basePillars = pillars.value) => {
    const artifacts = deriveSessionArtifacts(results, objective, basePillars)
    activePlan.value = artifacts.plan
    pillars.value = artifacts.pillars
    toolCalls.value = artifacts.toolCalls
    screeningFunnel.value = clone(results.funnel)
    candidates.value = clone(results.candidates)
    report.value.screeningFunnel = clone(results.funnel)
    report.value.topCandidates = clone(results.candidates)
    report.value.universeSummary = `${results.funnel[0].count} perusahaan dalam dataset prototype disaring menjadi ${results.candidates.length} kandidat akhir.`
    report.value.methodologyOverview = 'Penyaringan deterministik menggunakan ruang lingkup preset, kelengkapan metrik, filter finansial yang didukung fixture, ambang skor kualitas, dan ranking akhir. Data fixture tidak dihitung ulang sebagai laporan keuangan atau peer benchmark baru.'
    report.value.peerComparisonNotes = results.candidates.length
      ? `${results.candidates.map(company => company.symbol).join(', ')} lolos seluruh tahap berdasarkan metrik yang tersedia pada dataset prototype.`
      : 'Tidak ada perusahaan pada dataset prototype yang memenuhi seluruh kriteria.'
    report.value.limitations = [
      'Hasil ini menggunakan delapan fixture perusahaan untuk memvalidasi alur seleksi, bukan cakupan penuh Bursa Efek Indonesia.',
      'Kriteria yang datanya belum tersedia, termasuk NPL, histori NIM, interest coverage, frekuensi perdagangan, dan kepatuhan pelaporan, tidak diterapkan.',
      'Metrik valuasi bersifat statis dan dapat berubah setelah pembaruan harga atau laporan keuangan.'
    ]
    report.value.uncertaintyNotes = 'Provenance: prototype-fixture-v1. Hasil memvalidasi alur seleksi dan tidak mewakili cakupan atau keyakinan data pasar produksi.'
  }

  const preparePendingSession = (results: ReturnType<typeof deriveSessionResults>) => {
    const artifacts = deriveSessionArtifacts(results)
    activePlan.value = artifacts.plan
    pillars.value = artifacts.pillars.map(pillar => ({ ...pillar, status: 'pending' }))
    toolCalls.value = []
    screeningFunnel.value = []
    candidates.value = []
    report.value.screeningFunnel = []
    report.value.topCandidates = []
    report.value.universeSummary = 'Ruang lingkup sudah disiapkan. Hasil tersedia setelah proses riset selesai.'
    report.value.peerComparisonNotes = 'Menunggu hasil seleksi kandidat.'
    report.value.uncertaintyNotes = 'Riset sedang berjalan. Belum ada hasil akhir yang dapat ditinjau.'
  }

  // Final Report
  const report = ref<ResearchReport>({
    sessionId: 'RES-2026-IDX-0941',
    timestamp: '2026-08-25 20:30:15 WIB',
    objective: currentObjective.value,
    universeSummary: 'Dataset prototype belum dievaluasi.',
    screeningFunnel: screeningFunnel.value,
    methodologyOverview: 'Penyaringan bertahap menggabungkan lima faktor penilaian: profitabilitas, pertumbuhan, solvabilitas, valuasi, dan konsistensi. Analisis DuPont serta perbandingan perusahaan sejenis diterapkan pada kandidat terpilih.',
    topCandidates: [],
    peerComparisonNotes: 'Menunggu hasil seleksi sesi.',
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

  const setResearchBrief = (brief: Partial<ResearchBrief>) => {
    activeBrief.value = normalizeResearchBrief({ ...activeBrief.value, ...brief })
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

  const normalizeActivePillars = () => {
    pillars.value.forEach(pillar => {
      if (pillar.status === 'active') pillar.status = 'pending'
    })
  }

  const deriveClarificationReturnStatus = (session: Partial<ResearchSession>): AgentStatus => {
    const restorableStatuses: AgentStatus[] = ['IDLE', 'PARTIAL', 'CANCELLED', 'COMPLETED', 'FAILED']
    if (session.clarificationReturnStatus && restorableStatuses.includes(session.clarificationReturnStatus)) {
      return session.clarificationReturnStatus
    }
    if (session.status && restorableStatuses.includes(session.status)) return session.status
    const hasCompletedArtifacts = Boolean(session.pillars?.length) && session.pillars!.every(pillar => pillar.status === 'completed')
      && Boolean(session.screeningFunnel?.length || session.candidates?.length)
    if (hasCompletedArtifacts) return 'COMPLETED'
    const hasArtifacts = session.pillars?.some(pillar => pillar.status === 'active' || pillar.status === 'completed')
      || session.toolCalls?.some(call => call.toolName !== 'clarification_request')
      || Boolean(session.screeningFunnel?.length || session.candidates?.length)
    return hasArtifacts ? 'PARTIAL' : 'IDLE'
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
      brief: activeBrief.value,
      status: sessionStatus,
      clarificationReturnStatus,
      plan: activePlan.value,
      pillars: pillars.value,
      toolCalls: toolCalls.value,
      screeningFunnel: screeningFunnel.value,
      candidates: candidates.value,
      report: report.value,
      creditsSpent: totalCredits.value - creditsRemaining.value,
      revision: currentRevision.value,
      activeAttemptId: activeAttemptId.value,
      publishedAttemptId: publishedAttemptId.value
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
      if ([1, STORAGE_VERSION].includes(parsed?.version || 0) && Array.isArray(parsed?.sessions)) {
        sessions.value = parsed.sessions.map(session => {
          const brief = normalizeResearchBrief(session.brief)
          const sessionClarificationReturnStatus = deriveClarificationReturnStatus(session)
          if (parsed.version !== 1) {
            return ['IDLE', 'NEEDS_INPUT', 'PARTIAL', 'CANCELLED', 'COMPLETED', 'FAILED'].includes(session.status)
              ? { ...session, brief, clarificationReturnStatus: sessionClarificationReturnStatus }
              : { ...session, brief, status: 'PARTIAL', clarificationReturnStatus: sessionClarificationReturnStatus }
          }
          const results = deriveSessionResults(session.presetId)
          const normalizedStatus = session.status === 'COMPLETED' || session.status === 'FAILED' ? session.status : 'PARTIAL'
          const artifacts = deriveSessionArtifacts(results, session.objective, session.pillars)
          return {
            ...session,
            brief,
            status: normalizedStatus,
            clarificationReturnStatus: sessionClarificationReturnStatus,
            plan: artifacts.plan,
            pillars: artifacts.pillars,
            toolCalls: artifacts.toolCalls,
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
              ],
              methodologyOverview: 'Penyaringan deterministik menggunakan ruang lingkup preset, kelengkapan metrik, filter finansial yang didukung fixture, ambang skor kualitas, dan ranking akhir. Data fixture tidak dihitung ulang sebagai laporan keuangan atau peer benchmark baru.',
              uncertaintyNotes: 'Provenance: prototype-fixture-v1. Hasil memvalidasi alur seleksi dan tidak mewakili cakupan atau keyakinan data pasar produksi.'
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

  const refreshSessions = async () => {
    try {
      sessions.value = await apiGetResearchSessions()
      persistSessions()
      return true
    } catch {
      return false
    }
  }

  const loadSession = (id: string) => {
    const session = sessions.value.find(item => item.id === id)
    if (!session) return false
    if (isExecuting.value && report.value.sessionId === id) return true
    if (isExecuting.value && report.value.sessionId !== id) {
      executionToken += 1
      isExecuting.value = false
      status.value = 'PARTIAL'
      normalizeActivePillars()
      saveCurrentSession('PARTIAL')
    }
    currentObjective.value = session.objective
    activePresetId.value = session.presetId
    activeBrief.value = normalizeResearchBrief(session.brief)
    status.value = session.status
    clarificationReturnStatus = deriveClarificationReturnStatus(session)
    activePlan.value = clone(session.plan)
    pillars.value = clone(session.pillars)
    toolCalls.value = clone(session.toolCalls)
    screeningFunnel.value = clone(session.screeningFunnel)
    candidates.value = clone(session.candidates)
    report.value = clone(session.report)
    selectedSymbol.value = candidates.value[0]?.symbol || ''
    isDetailModalOpen.value = false
    isExecuting.value = false
    executionToken += 1
    const clarificationCall = session.status === 'NEEDS_INPUT'
      ? [...session.toolCalls].reverse().find(call => call.toolName === 'clarification_request')
      : undefined
    clarificationQuestion.value = clarificationCall?.input.question as string || null
    clarificationId.value = clarificationCall
      ? String(clarificationCall.input.clarificationId || clarificationCall.id)
      : null
    return true
  }

  const createSession = (sessionId?: string) => {
    const id = sessionId || `RES-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`
    const results = deriveSessionResults(activePresetId.value)
    report.value.sessionId = id
    report.value.objective = currentObjective.value
    report.value.timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
    preparePendingSession(results)
    currentRevision.value = 0
    activeAttemptId.value = null
    publishedAttemptId.value = null
    selectedSymbol.value = ''
    saveCurrentSession('IDLE')
    return id
  }

  const hydrateFromBackendSession = (session: any) => {
    if (!session) return
    const id = session.id
    if (id === report.value.sessionId && typeof session.revision === 'number' && session.revision < currentRevision.value) return
    report.value.sessionId = id
    if (typeof session.objective === 'string') {
      currentObjective.value = session.objective
    } else if (session.objective?.objective) {
      currentObjective.value = session.objective.objective
    }
    if (session.presetId) {
      activePresetId.value = session.presetId
    }
    if (session.brief) {
      activeBrief.value = normalizeResearchBrief(session.brief)
    }
    status.value = session.status || 'COMPLETED'
    isExecuting.value = activeStatuses.has(session.status)

    if (typeof session.revision === 'number') currentRevision.value = session.revision
    if ('activeAttemptId' in session) activeAttemptId.value = session.activeAttemptId
    if ('publishedAttemptId' in session) publishedAttemptId.value = session.publishedAttemptId
    if (session.ownerId) ownerId.value = session.ownerId
    if (session.tenantId) tenantId.value = session.tenantId
    if (Array.isArray(session.provenanceTrail)) provenanceTrail.value = session.provenanceTrail

    if (session.plan) {
      activePlan.value = {
        objective: session.plan.objective || currentObjective.value,
        universe: session.plan.universe || 'IDX Universe',
        criteria: Array.isArray(session.plan.criteria) ? session.plan.criteria.map((c: any) => typeof c === 'string' ? c : `${c.metric} ${c.operator} ${c.value}`) : [],
        steps: Array.isArray(session.plan.steps) ? session.plan.steps.map((s: any) => ({
          order: s.order || 1,
          action: s.action || '',
          tool: s.tool || '',
          description: s.description || ''
        })) : [],
        hypothesis: session.plan.hypothesis || '',
        requiredDataPoints: session.plan.requiredDataPoints || [],
        estimatedDurationSeconds: session.plan.estimatedDurationSeconds || 15,
        estimatedCredits: session.plan.estimatedCredits || 12
      }
    }

    if (session.pillars && Array.isArray(session.pillars)) {
      pillars.value = session.pillars.map((p: any) => ({
        id: p.id,
        number: p.number || 1,
        name: p.name || '',
        subtitle: p.subtitle || p.description || '',
        status: p.status || 'completed',
        metricsSummary: p.metricsSummary,
        durationMs: p.durationMs
      }))
    }

    if (session.screeningFunnel && Array.isArray(session.screeningFunnel)) {
      screeningFunnel.value = session.screeningFunnel.map((s: any) => ({
        stage: s.stage || s.description || '',
        count: s.count || 0,
        description: s.description || '',
        filterCriteria: s.filterCriteria || '',
        inputSymbols: Array.isArray(s.inputSymbols) ? s.inputSymbols : undefined,
        retainedSymbols: s.retainedSymbols || [],
        excludedSymbols: Array.isArray(s.excludedSymbols) ? s.excludedSymbols : undefined,
        excludedCount: typeof s.excludedCount === 'number' ? s.excludedCount : undefined,
        reasons: Array.isArray(s.reasons) ? s.reasons : undefined
      }))
    } else if (session.screening && Array.isArray(session.screening)) {
      screeningFunnel.value = session.screening.map((s: any) => ({
        stage: s.stage || s.description || '',
        count: s.count || 0,
        description: s.description || '',
        filterCriteria: s.filterCriteria || '',
        inputSymbols: Array.isArray(s.inputSymbols) ? s.inputSymbols : undefined,
        retainedSymbols: s.retainedSymbols || [],
        excludedSymbols: Array.isArray(s.excludedSymbols) ? s.excludedSymbols : undefined,
        excludedCount: typeof s.excludedCount === 'number' ? s.excludedCount : undefined,
        reasons: Array.isArray(s.reasons) ? s.reasons : undefined
      }))
    }

    if (Array.isArray(session.candidates)) {
      candidates.value = session.candidates.map((c: any, index: number) => ({
        symbol: c.symbol,
        name: c.companyName || c.name || c.symbol,
        sector: c.sector || 'Financials',
        subsector: c.subsector || c.sector || 'Banks',
        marketCapTrillionIdr: c.marketCapTrillionIdr,
        priceIdr: c.priceIdr,
        peRatio: c.peRatio,
        pbvRatio: c.pbvRatio,
        evToEbitda: c.evToEbitda,
        roePercent: c.roePercent,
        roaPercent: c.roaPercent,
        debtToEquity: c.debtToEquity,
        currentRatio: c.currentRatio,
        freeCashFlowYieldPercent: c.freeCashFlowYieldPercent,
        revenue3yCagrPercent: c.revenue3yCagrPercent,
        netIncome3yCagrPercent: c.netIncome3yCagrPercent,
        dividendYieldPercent: c.dividendYieldPercent,
        qualityScore: c.qualityScore,
        scoreBreakdown: c.scoreBreakdown,
        rank: c.rank,
        confidenceLevel: c.confidenceLevel || 'HIGH',
        whySelected: c.whySelected || `${c.symbol} menunjukkan metrik profitabilitas dan neraca yang unggul.`,
        keyStrengths: c.keyStrengths || c.strengths || ['ROE kuat', 'Arus kas sehat'],
        potentialConcerns: c.potentialConcerns || c.concerns || ['Risiko siklus makro'],
        evidenceCitations: c.evidenceCitations || c.evidence || [],
        dupontAnalysis: c.dupontAnalysis,
        peerRankInMemory: c.peerRankInMemory || `#${index + 1} di sektornya`,
        priceAsOf: c.priceAsOf,
        financialPeriod: c.financialPeriod
      }))
      selectedSymbol.value = candidates.value[0]?.symbol || ''
    }

    if (session.report) {
      report.value = {
        sessionId: id,
        timestamp: session.report.timestamp || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
        objective: session.report.objective || currentObjective.value,
        universeSummary: session.report.universeSummary || `${screeningFunnel.value[0]?.count || 914} emiten dianalisis melalui penyaringan Darwin Engine.`,
        screeningFunnel: clone(screeningFunnel.value),
        methodologyOverview: session.report.methodologyOverview || session.report.methodology || 'Penyaringan fundamental kuantitatif Darwin Engine yang divalidasi oleh Agen AI Voyager.',
        topCandidates: clone(candidates.value),
        peerComparisonNotes: session.report.peerComparisonNotes || session.report.comparisonSummary || `${candidates.value.map(c => c.symbol).join(', ')} menonjol dalam profitabilitas dan kualitas modal.`,
        limitations: session.report.limitations || ['Data historis bersumber dari Sectors API v2.', 'Kondisi makroekonomi dapat memengaruhi kinerja masa depan.'],
        uncertaintyNotes: session.report.uncertaintyNotes || session.report.uncertainty || 'Tingkat keyakinan tinggi berdasarkan konsistensi laporan keuangan.',
        disclaimer: session.report.disclaimer || 'Laporan ini disusun secara otomatis untuk tujuan riset dan analisis investasi, bukan merupakan rekomendasi beli/jual mutlak.'
      }
    }

    if (session.toolCalls && Array.isArray(session.toolCalls)) {
      toolCalls.value = session.toolCalls
    }

    saveCurrentSession(session.status || 'COMPLETED')
  }

  const applyBackendStatus = (sessionStatus: AgentStatus) => {
    status.value = sessionStatus
    isExecuting.value = activeStatuses.has(sessionStatus)
    saveCurrentSession(sessionStatus)
  }

  const addFollowUp = async (question: string): Promise<string> => {
    const normalized = question.trim()
    if (!normalized) return ''
    const sessionId = report.value.sessionId
    try {
      const res = await apiSendFollowUp(sessionId, normalized, currentRevision.value)
      hydrateFromBackendSession(res.session)
      return res.followUp.answer
    } catch (error) {
      try {
        hydrateFromBackendSession(await apiGetResearchSessionFull(sessionId))
      } catch {
        // Preserve the last authoritative snapshot if recovery also fails.
      }
      throw error
    }
  }

  const cancelResearch = async () => {
    if (!isExecuting.value) return false
    try {
      const session = await apiCancelResearchSession(report.value.sessionId, currentRevision.value)
      executionToken += 1
      hydrateFromBackendSession(session)
      disconnectSse()
      return true
    } catch {
      try {
        hydrateFromBackendSession(await apiGetResearchSessionFull(report.value.sessionId))
      } catch {
        // Preserve the last authoritative snapshot if recovery also fails.
      }
      return false
    }
  }

  const answerClarification = async (answer: string): Promise<boolean> => {
    const normalizedAnswer = answer.trim()
    if (status.value !== 'NEEDS_INPUT' || !clarificationId.value || !normalizedAnswer) return false
    const sessionId = report.value.sessionId
    try {
      const session = await apiAnswerClarification(sessionId, clarificationId.value, normalizedAnswer, currentRevision.value)
      hydrateFromBackendSession(session)
      return true
    } catch {
      try {
        hydrateFromBackendSession(await apiGetResearchSessionFull(sessionId))
      } catch {
        // Preserve the last authoritative snapshot if recovery also fails.
      }
      return false
    }
  }

  const duplicateSession = async (id: string): Promise<string | null> => {
    const source = sessions.value.find(session => session.id === id)
    if (!source || typeof source.revision !== 'number') return null
    try {
      const duplicated = await apiDuplicateResearchSession(id, source.revision)
      if (duplicated?.id) {
        hydrateFromBackendSession(duplicated)
        return duplicated.id
      }
    } catch {
      await refreshSessions()
    }
    return null
  }

  const createCompanyResearch = async (symbol: string, objective?: string): Promise<string | null> => {
    try {
      const res = await apiCreateCompanyResearchSession(symbol, objective)
      if (res?.id) {
        hydrateFromBackendSession(res)
        return res.id
      }
    } catch (e) {
      console.warn('Backend company research failed:', e)
    }
    return null
  }

  const deleteSession = async (id: string) => {
    const session = sessions.value.find(item => item.id === id)
    if (!session || typeof session.revision !== 'number' || !await apiDeleteResearchSession(id, session.revision)) {
      await refreshSessions()
      return false
    }
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
    const capturedPresetId = activePresetId.value
    const capturedObjective = currentObjective.value
    const capturedBrief = clone(activeBrief.value)
    const token = ++executionToken
    isExecuting.value = true
    status.value = 'UNDERSTANDING'
    saveCurrentSession('UNDERSTANDING')

    // Reset pillars to pending
    pillars.value.forEach(p => {
      p.status = 'pending'
    })

    // Helper sleep
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    const ownsExecution = () => executionToken === token && report.value.sessionId === sessionId && isExecuting.value

    try {
      // Step 1: Understanding & Planning
      status.value = 'PLANNING'
      pillars.value[0].status = 'active'
      await sleep(executionSpeedMs.value)
      if (!ownsExecution()) return
      pillars.value[0].status = 'completed'
      creditsRemaining.value -= 10
      saveCurrentSession('PLANNING')

      // Step 2: Discovering & Screening
      status.value = 'DISCOVERING'
      pillars.value[1].status = 'active'
      await sleep(executionSpeedMs.value * 0.6)
      if (!ownsExecution()) return
      status.value = 'SCREENING'
      await sleep(executionSpeedMs.value * 0.8)
      if (!ownsExecution()) return
      pillars.value[1].status = 'completed'
      creditsRemaining.value -= 40
      saveCurrentSession('SCREENING')

      // Step 3: Deep Researching Candidates
      status.value = 'RESEARCHING'
      pillars.value[2].status = 'active'
      await sleep(executionSpeedMs.value * 1.2)
      if (!ownsExecution()) return
      status.value = 'COMPARING'
      await sleep(executionSpeedMs.value * 0.7)
      if (!ownsExecution()) return
      pillars.value[2].status = 'completed'
      creditsRemaining.value -= 75
      saveCurrentSession('RESEARCHING')

      // Step 4: State & Validation
      status.value = 'VALIDATING'
      pillars.value[3].status = 'active'
      await sleep(executionSpeedMs.value * 0.6)
      if (!ownsExecution()) return
      pillars.value[3].status = 'completed'
      saveCurrentSession('VALIDATING')

      // Step 5: Final Reporting
      status.value = 'REPORTING'
      pillars.value[4].status = 'active'
      await sleep(executionSpeedMs.value * 0.8)
      if (!ownsExecution()) return
      pillars.value[4].status = 'completed'

      const results = deriveSessionResults(capturedPresetId)
      currentObjective.value = capturedObjective
      activePresetId.value = capturedPresetId
      activeBrief.value = capturedBrief
      applyResults(results, capturedObjective)

      // Update Report timestamp & top candidates
      report.value.timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB'
      report.value.objective = capturedObjective

      status.value = 'COMPLETED'
      saveCurrentSession('COMPLETED')
    } catch (err) {
      if (!ownsExecution()) return
      status.value = 'FAILED'
      saveCurrentSession('FAILED')
    } finally {
      if (executionToken === token) isExecuting.value = false
    }
  }

  const retryResearch = async () => {
    if (isExecuting.value || !['FAILED', 'PARTIAL', 'CANCELLED'].includes(status.value)) return false
    try {
      const session = await apiRetryResearchSession(report.value.sessionId, currentRevision.value)
      hydrateFromBackendSession(session)
      connectSse(report.value.sessionId)
      return true
    } catch {
      try {
        hydrateFromBackendSession(await apiGetResearchSessionFull(report.value.sessionId))
      } catch {
        // Preserve the last authoritative snapshot if recovery also fails.
      }
      return false
    }
  }

  // --- 9 Batches Actions ---

  const fetchProvenance = async (id: string = report.value.sessionId) => {
    if (!id || !id.startsWith('RES-')) return
    try {
      const trail = await apiGetProvenanceTrail(id)
      if (Array.isArray(trail)) {
        provenanceTrail.value = trail
      }
    } catch (err) {
      console.warn('Gagal memuat provenance:', err)
    }
  }

  const connectSse = (id: string = report.value.sessionId) => {
    disconnectSse()
    if (!id || !id.startsWith('RES-')) return
    try {
      sseUnsubscribe = apiSubscribeSessionSse(
        id,
        () => {
          sseConnected.value = true
          void apiGetResearchSessionFull(id).then(hydrateFromBackendSession).catch(() => undefined)
        },
        () => {
          sseConnected.value = false
        }
      )
      sseConnected.value = true
    } catch {
      sseConnected.value = false
    }
  }

  const disconnectSse = () => {
    if (sseUnsubscribe) {
      sseUnsubscribe()
      sseUnsubscribe = null
    }
    sseConnected.value = false
  }

  const startAsyncPipeline = async (id: string = report.value.sessionId) => {
    if (!id || !id.startsWith('RES-')) return null
    try {
      const job = await apiAsyncExecuteResearchSession(id, `ik-async-${Date.now()}`)
      if (job?.jobId) {
        notify(`Eksekusi asinkron dimulai (Job ID: ${job.jobId})`, 'success')
        isExecuting.value = true
        status.value = 'DISCOVERING'
        connectSse(id)
        return job
      }
    } catch (err) {
      notify('Gagal memulai eksekusi asinkron backend', 'error')
    }
    return null
  }

  const fetchSchedules = async () => {
    try {
      const list = await apiGetResearchSchedules()
      if (Array.isArray(list)) {
        schedules.value = list
      }
    } catch (err) {
      console.warn('Gagal memuat riset terjadwal:', err)
    }
  }

  const createSchedule = async (params: any) => {
    try {
      const sched = await apiCreateResearchSchedule(params)
      if (sched?.id) {
        schedules.value.push(sched)
        notify(`Jadwal riset "${sched.name}" berhasil dibuat!`, 'success')
        return sched
      }
    } catch (err) {
      notify('Gagal membuat jadwal riset', 'error')
    }
    return null
  }

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      const sched = await apiToggleResearchSchedule(id, enabled)
      if (sched) {
        const idx = schedules.value.findIndex(s => s.id === id)
        if (idx !== -1) schedules.value[idx] = sched
        notify(`Jadwal riset ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`, 'info')
        return sched
      }
    } catch (err) {
      notify('Gagal mengubah status jadwal', 'error')
    }
    return null
  }

  const runScheduleNow = async (id: string) => {
    try {
      const res = await apiRunResearchScheduleNow(id)
      if (res?.session?.id) {
        notify(`Riset terjadwal dipicu! Sesi ID: ${res.session.id}`, 'success')
        hydrateFromBackendSession(res.session)
        connectSse(res.session.id)
        return res
      }
    } catch (err) {
      notify('Gagal memicu riset terjadwal', 'error')
    }
    return null
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
    activeBrief,
    clarificationQuestion,
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
    
    // 9 Batches Metadata State & Actions
    currentRevision,
    activeAttemptId,
    publishedAttemptId,
    ownerId,
    tenantId,
    provenanceTrail,
    schedules,
    sseConnected,

    // Actions
    fetchProvenance,
    connectSse,
    disconnectSse,
    startAsyncPipeline,
    fetchSchedules,
    createSchedule,
    toggleSchedule,
    runScheduleNow,
    setObjective,
    selectPreset,
    setResearchBrief,
    getScreeningPreview,
    openCandidateModal,
    closeCandidateModal,
    openMethodology,
    closeMethodology,
    hydrateSessions,
    refreshSessions,
    loadSession,
    createSession,
    hydrateFromBackendSession,
    applyBackendStatus,
    addFollowUp,
    duplicateSession,
    createCompanyResearch,
    cancelResearch,
    answerClarification,
    retryResearch,
    deleteSession,
    notify,
    dismissToast,
    saveCurrentSession,
    runAutonomousResearch
  }
})
