import type { ProviderSourceOrigin, ResearchReport } from '../types'

const dateTime = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta'
})

export const formatDateTime = (value?: string) => {
  if (!value) return 'Tidak tersedia'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : `${dateTime.format(date)} WIB`
}

export const formatDate = (value?: string) => {
  if (!value) return 'Tidak tersedia'
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'UTC' }).format(date)
}

const sourceOrigins: Record<string, string> = {
  live: 'Diambil langsung dari penyedia data',
  cache: 'Salinan tersimpan dari penyedia data',
  'stale-cache': 'Salinan lama karena sumber sedang tidak tersedia',
  'demo-fixture': 'Data demonstrasi'
}

export const sourceOriginLabel = (origin?: ProviderSourceOrigin) => sourceOrigins[origin || ''] || 'Tidak tersedia'

export const evidenceStatusLabel = (status?: string) => status === 'provider-derived-unverified'
  ? 'Dihitung dari data penyedia; basis belum diverifikasi'
  : status === 'single-source-unverified'
    ? 'Berasal dari satu sumber; belum diverifikasi independen'
    : 'Status bukti tidak tersedia'

const objectiveStatuses: Record<string, string> = {
  answered: 'Terjawab pada cakupan yang tersedia',
  not_answered: 'Belum terjawab karena tidak ada data kandidat',
  cannot_assess: 'Belum dapat dinilai karena data wajib tidak lengkap'
}

export const objectiveStatusLabel = (status?: ResearchReport['objectiveStatus']) => objectiveStatuses[status || ''] || 'Status jawaban tidak tersedia'

export const financialPeriodAge = (period?: string, reportTimestamp?: string) => {
  const year = Number(period?.match(/^FY(\d{4})$/)?.[1])
  const reportYear = reportTimestamp ? new Date(reportTimestamp).getUTCFullYear() : NaN
  if (!Number.isInteger(year) || !Number.isInteger(reportYear) || reportYear <= year) return ''
  const years = reportYear - year
  return `Laporan ini dibuat ${years} tahun setelah periode keuangan ${period}.`
}

export const sourceHref = (reference?: string) => {
  if (!reference) return null
  try {
    const url = new URL(reference)
    return url.protocol === 'https:' ? url.href : null
  } catch { return null }
}

export const sourceHost = (reference: string) => {
  try { return new URL(reference).hostname }
  catch { return reference }
}
