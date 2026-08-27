import type { AgentStatus } from '../types'

type SessionStatus = AgentStatus | 'PARTIAL'

const activeStatuses: SessionStatus[] = ['UNDERSTANDING', 'PLANNING', 'DISCOVERING', 'SCREENING', 'RANKING', 'RESEARCHING', 'COMPARING', 'VALIDATING', 'REPORTING']

export const sessionStatusMeta = (status: SessionStatus, isExecuting = false) => {
  if (status === 'COMPLETED') return { label: 'Selesai', shortLabel: 'Selesai', tone: 'completed', className: 'status-completed' }
  if (status === 'FAILED') return { label: 'Gagal', shortLabel: 'Gagal', tone: 'failed', className: 'status-failed' }
  if (status === 'PARTIAL') return { label: 'Hasil parsial', shortLabel: 'Parsial', tone: 'partial', className: 'status-partial' }
  if (isExecuting || activeStatuses.includes(status)) return { label: 'Sedang berjalan', shortLabel: 'Aktif', tone: 'active', className: 'status-active' }
  return { label: 'Disiapkan', shortLabel: 'Siap', tone: 'idle', className: 'status-idle' }
}
