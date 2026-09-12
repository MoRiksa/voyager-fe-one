import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AgentStatus, CandidateCompany, ResearchBrief, ResearchObjectivePreset, ResearchPlan, ResearchReport, ResearchSession, PillarStep, ToolCallLog, ScreeningFunnelStep, ProvenanceRecord, ScheduledTask } from '../types'
import * as api from '../services/researchApi'

const emptyReport = (id = ''): ResearchReport => ({ sessionId: id, timestamp: '', objective: '', universeSummary: 'Belum ada laporan yang dipublikasikan.', screeningFunnel: [], methodologyOverview: '', topCandidates: [], peerComparisonNotes: '', limitations: [], uncertaintyNotes: '', disclaimer: '' })
const emptyPlan = (): ResearchPlan => ({ objective: '', universe: 'Belum tersedia', criteria: [], steps: [], hypothesis: '', requiredDataPoints: [], estimatedDurationSeconds: null, estimatedCredits: null })
const defaultBrief = (): ResearchBrief => ({ market: 'IDX', sectorScope: 'Semua Sektor', indexScope: 'Semua Indeks', candidateCount: 5, researchDepth: 'Standar', useSectorMetrics: false, optionalDimensions: [], clarificationNotes: [] })
const activeStatuses = new Set<AgentStatus>(['UNDERSTANDING', 'PLANNING', 'DISCOVERING', 'SCREENING', 'RANKING', 'RESEARCHING', 'COMPARING', 'VALIDATING', 'REPORTING'])

const formulaVersions = (session: ResearchSession) => new Set([
  ...(session.candidates || []),
  ...(session.screeningFunnel || []),
  ...(session.report?.topCandidates || []),
  ...(session.report?.screeningFunnel || [])
].map(item => item.formulaVersion).filter(Boolean))

export const isRestrictedSession = (session: ResearchSession) => {
  const contract = session.report?.contract || session.plan?.contract
  const formulas = formulaVersions(session)
  return contract?.status !== 'supported'
    || contract.version !== 'bank-evidence-contract-v1'
    || contract.objectiveType !== 'bank-evidence'
    || formulas.size > 1
    || (formulas.size === 1 && !formulas.has('bank-evidence-v1'))
    || session.report?.objectiveStatus === 'cannot_assess'
}

export const useResearchStore = defineStore('research', () => {
  const currentObjective = ref('')
  const activePresetId = ref('custom')
  const activeBrief = ref(defaultBrief())
  const status = ref<AgentStatus>('IDLE')
  const isExecuting = computed(() => activeStatuses.has(status.value))
  const presets = ref<ResearchObjectivePreset[]>([])
  const sessions = ref<ResearchSession[]>([])
  const recentSessions = computed(() => [...sessions.value].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
  const report = ref(emptyReport())
  const activePlan = ref(emptyPlan())
  const pillars = ref<PillarStep[]>([])
  const candidates = ref<CandidateCompany[]>([])
  const screeningFunnel = ref<ScreeningFunnelStep[]>([])
  const toolCalls = ref<ToolCallLog[]>([])
  const currentRevision = ref(0)
  const activeAttemptId = ref<string | null>(null)
  const publishedAttemptId = ref<string | null>(null)
  const failureReason = ref('')
  const selectedSymbol = ref('')
  const selectedCompany = computed(() => candidates.value.find(c => c.symbol === selectedSymbol.value))
  const isDetailModalOpen = ref(false)
  const isMethodologyModalOpen = ref(false)
  const clarificationQuestion = ref<string | null>(null)
  const provenanceTrail = ref<ProvenanceRecord[]>([])
  const isActiveSessionRestricted = computed(() => {
    const session = sessions.value.find(item => item.id === report.value.sessionId)
    return session ? isRestrictedSession(session) : true
  })
  const schedules = ref<ScheduledTask[]>([])
  const sseConnected = ref(false)
  let unsubscribe: (() => void) | undefined
  const toast = ref<{ message: string; tone: 'success' | 'error' | 'info' } | null>(null)
  let toastTimer: ReturnType<typeof setTimeout> | undefined
  const dismissToast = () => { toast.value = null; clearTimeout(toastTimer) }
  const notify = (message: string, tone: 'success' | 'error' | 'info' = 'info') => { dismissToast(); toast.value = { message, tone }; toastTimer = setTimeout(dismissToast, 6000) }
  const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Layanan riset tidak tersedia.'

  const hydrateFromBackendSession = (session: any) => {
    if (!session?.id || !Number.isInteger(session.revision)) throw new Error('Snapshot sesi tidak valid.')
    if (session.id === report.value.sessionId && session.revision < currentRevision.value) return
    currentObjective.value = typeof session.objective === 'string' ? session.objective : session.objective?.objective || ''
    activePresetId.value = session.presetId || 'custom'
    activeBrief.value = { ...defaultBrief(), ...session.brief }
    status.value = session.status
    currentRevision.value = session.revision
    activeAttemptId.value = session.activeAttemptId ?? null
    publishedAttemptId.value = session.publishedAttemptId ?? null
    failureReason.value = session.failureReason || [...(session.attempts || [])].reverse().find((a: any) => a.state === 'FAILED')?.failureReason || ''
    activePlan.value = session.plan ? { ...emptyPlan(), ...session.plan } : emptyPlan()
    pillars.value = session.pillars || []
    screeningFunnel.value = session.screeningFunnel || session.screening || []
    toolCalls.value = session.toolCalls || []
    candidates.value = (session.candidates || []).map((c: any) => ({
      ...c,
      name: c.name || c.companyName || c.symbol,
      sector: c.sector || 'Tidak tersedia',
      subsector: c.subsector || c.sector || 'Tidak tersedia',
      whySelected: c.whySelected || 'Alasan pemilihan belum tersedia.',
      keyStrengths: c.keyStrengths || [],
      potentialConcerns: c.potentialConcerns || [],
      evidenceCitations: c.evidenceCitations || []
    }))
    report.value = session.report ? { ...emptyReport(session.id), ...session.report, topCandidates: candidates.value, screeningFunnel: screeningFunnel.value } : emptyReport(session.id)
    selectedSymbol.value = candidates.value.some(c => c.symbol === selectedSymbol.value) ? selectedSymbol.value : candidates.value[0]?.symbol || ''
    provenanceTrail.value = session.provenanceTrail || []
    clarificationQuestion.value = session.clarifications?.find((c: any) => !c.answer)?.question || null
    sessions.value = [session, ...sessions.value.filter(s => s.id !== session.id)]
  }
  const refreshSessions = async () => {
    try { sessions.value = await api.getResearchSessions(); return true } catch { return false }
  }
  const loadSession = (id: string) => {
    const session = sessions.value.find(s => s.id === id)
    if (!session) return false
    hydrateFromBackendSession(session)
    return true
  }
  const setObjective = (objective: string, presetId = 'custom') => { currentObjective.value = objective; activePresetId.value = presetId }
  const selectPreset = (preset: ResearchObjectivePreset) => setObjective(preset.objective, preset.id)
  const setResearchBrief = (brief: Partial<ResearchBrief>) => { activeBrief.value = { ...activeBrief.value, ...brief } }
  const disconnectSse = () => { unsubscribe?.(); unsubscribe = undefined; sseConnected.value = false }
  const connectSse = (id = report.value.sessionId) => {
    disconnectSse()
    if (!id) return
    unsubscribe = api.subscribeSessionSse(id, () => {
      sseConnected.value = true
      void api.getResearchSessionFull(id).then(session => { if (report.value.sessionId === id) hydrateFromBackendSession(session) }).catch(() => { sseConnected.value = false })
    }, () => { sseConnected.value = false })
  }
  const lifecycle = async (action: typeof api.retryResearchSession) => {
    try { hydrateFromBackendSession(await action(report.value.sessionId, currentRevision.value)); return true }
    catch (error) { notify(errorMessage(error), 'error'); return false }
  }
  const retryResearch = async () => { const ok = await lifecycle(api.retryResearchSession); if (ok) connectSse(); return ok }
  const cancelResearch = async () => { const ok = await lifecycle(api.cancelResearchSession); if (ok) disconnectSse(); return ok }
  const addFollowUp = async (question: string) => { const result = await api.sendFollowUp(report.value.sessionId, question, currentRevision.value); hydrateFromBackendSession(result.session); return result.followUp.answer }
  const answerClarification = async (answer: string) => {
    const call = [...toolCalls.value].reverse().find(c => c.toolName === 'clarification_request')
    if (!call) return false
    return lifecycle((id, revision) => api.answerClarification(id, String(call.input.clarificationId || call.id), answer, revision))
  }
  const duplicateSession = async (id: string) => {
    const session = sessions.value.find(s => s.id === id)
    if (typeof session?.revision !== 'number' || isRestrictedSession(session)) return null
    try { const copy = await api.duplicateResearchSession(id, session.revision); hydrateFromBackendSession(copy); return copy.id } catch (error) { notify(errorMessage(error), 'error'); return null }
  }
  const deleteSession = async (id: string) => {
    const session = sessions.value.find(s => s.id === id)
    if (typeof session?.revision !== 'number' || !await api.deleteResearchSession(id, session.revision)) return false
    sessions.value = sessions.value.filter(s => s.id !== id)
    if (report.value.sessionId === id) { report.value = emptyReport(); candidates.value = []; screeningFunnel.value = []; activePlan.value = emptyPlan(); status.value = 'IDLE'; publishedAttemptId.value = null }
    return true
  }
  const fetchProvenance = async (id = report.value.sessionId) => { try { provenanceTrail.value = await api.getProvenanceTrail(id) } catch (error) { notify(errorMessage(error), 'error') } }
  const fetchSchedules = async () => { try { schedules.value = await api.getResearchSchedules() } catch (error) { notify(errorMessage(error), 'error') } }
  const createSchedule = async (params: any) => { try { const schedule = await api.createResearchSchedule(params); schedules.value.push(schedule); return schedule } catch (error) { notify(errorMessage(error), 'error'); return null } }
  const toggleSchedule = async (id: string, enabled: boolean) => { try { await api.toggleResearchSchedule(id, enabled); await fetchSchedules() } catch (error) { notify(errorMessage(error), 'error') } }
  const runScheduleNow = async (id: string) => { try { const result = await api.runResearchScheduleNow(id); hydrateFromBackendSession(result.session); return result } catch (error) { notify(errorMessage(error), 'error'); return null } }
  const createCompanyResearch = async (symbol: string, objective?: string) => { try { const session = await api.createCompanyResearchSession(symbol, objective); hydrateFromBackendSession(session); return session.id } catch (error) { notify(errorMessage(error), 'error'); return null } }
  return { currentObjective, activePresetId, activeBrief, status, isExecuting, presets, sessions, recentSessions, report, activePlan, pillars, candidates, screeningFunnel, toolCalls, currentRevision, activeAttemptId, publishedAttemptId, failureReason, selectedSymbol, selectedCompany, isDetailModalOpen, isMethodologyModalOpen, clarificationQuestion, provenanceTrail, isActiveSessionRestricted, schedules, sseConnected, toast,
    hydrateFromBackendSession, refreshSessions, loadSession, setObjective, selectPreset, setResearchBrief, connectSse, disconnectSse, retryResearch, cancelResearch, addFollowUp, answerClarification, duplicateSession, deleteSession, fetchProvenance, fetchSchedules, createSchedule, toggleSchedule, runScheduleNow, createCompanyResearch, notify, dismissToast,
    openCandidateModal: (symbol: string) => { selectedSymbol.value = symbol; isDetailModalOpen.value = true }, closeCandidateModal: () => { isDetailModalOpen.value = false }, openMethodology: () => { isMethodologyModalOpen.value = true }, closeMethodology: () => { isMethodologyModalOpen.value = false }
  }
})
