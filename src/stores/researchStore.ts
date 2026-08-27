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
      metricsSummary: 'Menunggu konteks sesi'
    },
    {
      id: 'screener',
      number: 2,
      name: 'Autonomous Screener',
      subtitle: 'Dynamic multi-stage universe narrowing',
      status: 'completed',
      metricsSummary: 'Menunggu hasil penyaringan'
    },
    {
      id: 'engine',
      number: 3,
      name: 'Deep Research Engine',
      subtitle: 'Fundamental, DuPont & balance sheet audit',
      status: 'completed',
      metricsSummary: 'Menunggu kandidat'
    },
    {
      id: 'state',
      number: 4,
      name: 'State & Observability',
      subtitle: 'State persistence & tool call audit trail',
      status: 'completed',
      metricsSummary: 'Menunggu event audit'
    },
    {
      id: 'report',
      number: 5,
      name: 'Synthesis & Final Report',
      subtitle: 'Evidence-backed report & peer comparison',
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

  const deriveSessionArtifacts = (results: ReturnType<typeof deriveSessionResults>, objective = currentObjective.value, basePillars = pillars.value) => {
    const now = new Date().toLocaleTimeString('id-ID', { hour12: false, fractionalSecondDigits: 3 })
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

  const applyResults = (results: ReturnType<typeof deriveSessionResults>) => {
    const artifacts = deriveSessionArtifacts(results)
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
          if (parsed.version === STORAGE_VERSION) {
            return session.status === 'COMPLETED' || session.status === 'FAILED' || session.status === 'PARTIAL'
              ? session
              : { ...session, status: 'PARTIAL' }
          }
          const results = deriveSessionResults(session.presetId)
          const normalizedStatus = session.status === 'COMPLETED' || session.status === 'FAILED' ? session.status : 'PARTIAL'
          const artifacts = deriveSessionArtifacts(results, session.objective, session.pillars)
          return {
            ...session,
            status: normalizedStatus,
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
    preparePendingSession(results)
    selectedSymbol.value = ''
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
      creditCost: 0,
      sourceKind: 'user-input'
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
