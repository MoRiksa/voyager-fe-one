import type {
  AgentStatus,
  CandidateCompany,
  ResearchBrief,
  ResearchReport,
  ResearchSession,
  ScreeningFunnelStep,
  ToolCallLog
} from '../types'

export type CreateResearchRequest = {
  readonly objective: string
  readonly presetId?: string
  readonly brief: ResearchBrief & { readonly market: 'IDX' }
}

export type ResearchSessionResponse = {
  readonly id: string
  readonly status: AgentStatus
  readonly session?: ResearchSession
}

export type CreateResearchResponse = ResearchSessionResponse

const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, '')
if (!backendUrl) throw new Error('VITE_BACKEND_URL is required.')
const validStatuses = new Set<string>([
  'IDLE',
  'UNDERSTANDING',
  'PLANNING',
  'DISCOVERING',
  'SCREENING',
  'RANKING',
  'RESEARCHING',
  'COMPARING',
  'VALIDATING',
  'REPORTING',
  'NEEDS_INPUT',
  'PARTIAL',
  'CANCELLED',
  'COMPLETED',
  'FAILED'
])
const isAgentStatus = (value: unknown): value is AgentStatus =>
  typeof value === 'string' && validStatuses.has(value)

const getHeaders = (idempotencyKey?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer voyager-dev-token',
    'X-Voyager-Token': 'voyager-dev-token'
  }
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }
  return headers
}

export const createResearchSession = async (
  request: CreateResearchRequest,
  idempotencyKey?: string
): Promise<CreateResearchResponse> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions`, {
    method: 'POST',
    headers: getHeaders(idempotencyKey || `ik-create-${Date.now()}`),
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    throw new Error('Backend gagal membuat sesi riset.')
  }

  const payload: any = await response.json()
  if (!payload?.session?.id || !isAgentStatus(payload.session.status)) {
    throw new Error('Response backend tidak memiliki research session id yang valid.')
  }

  return { id: payload.session.id, status: payload.session.status, session: payload.session }
}

export const startResearchSession = async (id: string, revision: number): Promise<ResearchSessionResponse> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/start`, {
    method: 'POST',
    headers: { 'If-Match': String(revision) }
  })
  if (!response.ok) throw new Error('Backend gagal memulai sesi riset.')
  const payload: any = await response.json()
  if (!payload?.session?.id || !isAgentStatus(payload.session.status)) {
    throw new Error('Response backend tidak memiliki status sesi yang valid.')
  }
  return { id: payload.session.id, status: payload.session.status, session: payload.session }
}

export const getResearchSession = async (id: string): Promise<ResearchSessionResponse> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}`)
  if (!response.ok) throw new Error('Backend gagal memuat sesi riset.')
  const payload: any = await response.json()
  if (!payload?.session?.id || !isAgentStatus(payload.session.status)) {
    throw new Error('Response backend tidak memiliki sesi riset yang valid.')
  }
  return { id: payload.session.id, status: payload.session.status, session: payload.session }
}

export const getResearchSessionFull = async (id: string): Promise<ResearchSession> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}`)
  if (!response.ok) throw new Error('Backend gagal memuat detail sesi riset.')
  const payload: any = await response.json()
  if (!payload?.session?.id) throw new Error('Sesi riset tidak ditemukan di backend.')
  return payload.session
}

export const getCandidates = async (id: string): Promise<CandidateCompany[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/candidates`)
  if (!response.ok) throw new Error('Gagal mengambil daftar kandidat.')
  const payload: any = await response.json()
  return payload.candidates || []
}

export const getCandidateDossier = async (id: string, symbol: string): Promise<CandidateCompany> => {
  const response = await fetch(
    `${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/candidates/${encodeURIComponent(symbol)}`
  )
  if (!response.ok) throw new Error('Gagal mengambil dossier kandidat.')
  const payload: any = await response.json()
  return payload.candidate
}

export const getReport = async (id: string): Promise<ResearchReport> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/report`)
  if (!response.ok) throw new Error('Gagal mengambil report sintesis.')
  const payload: any = await response.json()
  return payload.report
}

export const getScreeningStages = async (id: string): Promise<ScreeningFunnelStep[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/screening-stages`)
  if (!response.ok) throw new Error('Gagal mengambil tahapan screening.')
  const payload: any = await response.json()
  return payload.stages || []
}

export const getStageCompanies = async (id: string, stageId: string, disposition?: 'RETAINED' | 'EXCLUDED'): Promise<{ stageId: string; count: number; retainedSymbols: string[]; excludedSymbols?: string[]; description?: string; reasons?: any[] }> => {
  const url = `${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/screening-stages/${encodeURIComponent(stageId)}/companies${disposition ? `?disposition=${disposition}` : ''}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Gagal mengambil emiten per stage.')
  return response.json()
}

export const getPeerBenchmarks = async (id: string): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/peer-benchmarks`)
  if (!response.ok) throw new Error('Gagal mengambil peer benchmarks.')
  const payload: any = await response.json()
  return payload.benchmarks
}

export const getActivity = async (id: string): Promise<any[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/activity`)
  if (!response.ok) throw new Error('Gagal mengambil activity feed.')
  const payload: any = await response.json()
  return payload.activities || []
}

export const getTrace = async (id: string): Promise<ToolCallLog[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/trace`)
  if (!response.ok) throw new Error('Gagal mengambil trace tool calls.')
  const payload: any = await response.json()
  return payload.toolCalls || []
}

export const cancelResearchSession = async (id: string, revision: number): Promise<ResearchSession> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    headers: { 'If-Match': String(revision) }
  })
  if (!response.ok) throw new Error('Gagal membatalkan sesi riset.')
  const payload: any = await response.json()
  return payload.session
}

export const retryResearchSession = async (id: string, revision: number): Promise<ResearchSession> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/retry`, {
    method: 'POST',
    headers: { 'If-Match': String(revision) }
  })
  if (!response.ok) throw new Error('Gagal mengulang sesi riset.')
  const payload: any = await response.json()
  return payload.session
}

export const duplicateResearchSession = async (id: string): Promise<ResearchSession> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/duplicate`, { method: 'POST' })
  if (!response.ok) throw new Error('Gagal menduplikasi sesi riset.')
  const payload: any = await response.json()
  return payload.session
}

export const answerClarification = async (
  id: string,
  clarificationId: string,
  answer: string
): Promise<ResearchSession> => {
  const response = await fetch(
    `${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/clarifications/${encodeURIComponent(clarificationId)}/answer`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    }
  )
  if (!response.ok) throw new Error('Gagal mengirim jawaban klarifikasi.')
  const payload: any = await response.json()
  return payload.session
}

export const sendFollowUp = async (
  id: string,
  question: string
): Promise<{ followUp: { question: string; answer: string; timestamp: string }; session: ResearchSession }> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/follow-ups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
  if (!response.ok) throw new Error('Gagal mengirim pertanyaan follow-up ke AI.')
  return response.json()
}

export const exportReportFile = async (
  id: string,
  format: 'markdown' | 'json' = 'markdown'
): Promise<void> => {
  const url = `${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/report/export?format=${format}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Gagal mengekspor laporan.')
  const blob = await response.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `voyager-report-${id}.${format === 'json' ? 'json' : 'md'}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(downloadUrl)
}

export const createCompanyResearchSession = async (
  symbol: string,
  objective?: string
): Promise<ResearchSession> => {
  const response = await fetch(`${backendUrl}/api/v1/companies/${encodeURIComponent(symbol)}/research-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objective })
  })
  if (!response.ok) throw new Error('Gagal membuat sesi riset emiten.')
  const payload: any = await response.json()
  return payload.session
}

export const deleteResearchSession = async (id: string): Promise<boolean> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })
  return response.ok
}

export const getCompany = async (symbol: string): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/companies/${encodeURIComponent(symbol)}`)
  if (!response.ok) throw new Error('Gagal memuat profil perusahaan.')
  const payload: any = await response.json()
  return payload.company
}

export const getCompanies = async (): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/companies`)
  if (!response.ok) throw new Error('Gagal memuat daftar perusahaan.')
  return response.json()
}

export const getResearchCapabilities = async (): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-capabilities`)
  if (!response.ok) throw new Error('Gagal memuat kapabilitas riset.')
  const payload: any = await response.json()
  return payload.capabilities
}

export const getResearchPresets = async (): Promise<any[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-presets`)
  if (!response.ok) throw new Error('Gagal memuat preset riset.')
  const payload: any = await response.json()
  return payload.presets || []
}

export const getResearchPreview = async (brief: any): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-preview`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ brief })
  })
  if (!response.ok) throw new Error('Gagal memuat estimasi preview.')
  const payload: any = await response.json()
  return payload.preview
}

export const getProvenanceTrail = async (id: string): Promise<any[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/provenance`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Gagal memuat jejak audit provenance.')
  const payload: any = await response.json()
  return payload.provenanceTrail || []
}

export const asyncExecuteResearchSession = async (id: string, idempotencyKey?: string): Promise<{ jobId: string; sessionId: string; attemptId: string; status: string }> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/async-execute`, {
    method: 'POST',
    headers: getHeaders(idempotencyKey || `ik-async-${Date.now()}`)
  })
  if (!response.ok) throw new Error('Gagal mengeksekusi pipeline asinkron.')
  const payload: any = await response.json()
  return payload.job
}

export const getJobStatus = async (id: string, jobId: string): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/jobs/${encodeURIComponent(jobId)}`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Gagal mengecek status job antrean.')
  const payload: any = await response.json()
  return payload.job
}

export const subscribeSessionSse = (
  id: string,
  onEvent: (evt: { type: string; data: any; id: string }) => void,
  onError?: (err: any) => void
): (() => void) => {
  const sseUrl = `${backendUrl}/api/v1/research-sessions/${encodeURIComponent(id)}/events`
  const eventSource = new EventSource(sseUrl)

  const handleMessage = (evt: MessageEvent) => {
    try {
      const data = JSON.parse(evt.data)
      onEvent({ type: evt.type || 'message', data, id: evt.lastEventId })
    } catch {
      onEvent({ type: evt.type || 'message', data: evt.data, id: evt.lastEventId })
    }
  }

  eventSource.addEventListener('plan.ready', handleMessage as EventListener)
  eventSource.addEventListener('step.completed', handleMessage as EventListener)
  eventSource.addEventListener('report.published', handleMessage as EventListener)
  eventSource.addEventListener('completed', handleMessage as EventListener)
  eventSource.addEventListener('session.cancelled', handleMessage as EventListener)
  eventSource.addEventListener('session.retried', handleMessage as EventListener)

  eventSource.onerror = (err) => {
    if (onError) onError(err)
  }

  return () => {
    eventSource.close()
  }
}

export const getResearchSchedules = async (): Promise<any[]> => {
  const response = await fetch(`${backendUrl}/api/v1/research-schedules`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Gagal memuat daftar riset terjadwal.')
  const payload: any = await response.json()
  return payload.schedules || []
}

export const createResearchSchedule = async (params: any, idempotencyKey?: string): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-schedules`, {
    method: 'POST',
    headers: getHeaders(idempotencyKey || `ik-sched-${Date.now()}`),
    body: JSON.stringify(params)
  })
  if (!response.ok) throw new Error('Gagal membuat jadwal riset baru.')
  const payload: any = await response.json()
  return payload.schedule
}

export const toggleResearchSchedule = async (id: string, enabled: boolean): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-schedules/${encodeURIComponent(id)}/toggle`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ enabled })
  })
  if (!response.ok) throw new Error('Gagal mengubah status jadwal riset.')
  const payload: any = await response.json()
  return payload.schedule
}

export const runResearchScheduleNow = async (id: string): Promise<any> => {
  const response = await fetch(`${backendUrl}/api/v1/research-schedules/${encodeURIComponent(id)}/run-now`, {
    method: 'POST',
    headers: getHeaders(`ik-runnow-${Date.now()}`)
  })
  if (!response.ok) throw new Error('Gagal memicu eksekusi jadwal riset.')
  return response.json()
}
