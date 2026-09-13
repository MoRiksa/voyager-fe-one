<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import { getCompany, requestOfficialCheck } from '../services/researchApi'
import type { OfficialCheck, OfficialCheckMetric } from '../types'
import { formatDateTime, sourceHref } from '../utils/presentation'
import ReportCandidateAnalysis from '../components/ReportCandidateAnalysis.vue'
import CompanySupplementalAnalysis from '../components/CompanySupplementalAnalysis.vue'

const route = useRoute()
const store = useResearchStore()
const symbol = computed(() => String(route.params.symbol).toUpperCase())
const company = computed(() => route.params.id ? store.candidates.find(c => c.symbol === symbol.value) : undefined)
const profile = ref<any>(null)
const error = ref('')
const loading = ref(false)
const officialCheck = ref<OfficialCheck | null>(null)
const officialCheckError = ref('')
const officialCheckState = ref<'idle' | 'loading' | 'success' | 'unavailable' | 'error'>('idle')
let token = 0
let officialCheckToken = 0

const load = async () => {
  const current = ++token
  ++officialCheckToken
  profile.value = null
  error.value = ''
  loading.value = false
  officialCheck.value = null
  officialCheckError.value = ''
  officialCheckState.value = 'idle'
  if (route.params.id) return
  loading.value = true
  try { const result = await getCompany(symbol.value); if (current === token) profile.value = result }
  catch (e) { if (current === token) error.value = e instanceof Error ? e.message : 'Profil tidak tersedia.' }
  finally { if (current === token) loading.value = false }
}

const checkOfficialData = async () => {
  if (officialCheckState.value === 'loading' || !route.params.id || !company.value) return
  const sessionId = String(route.params.id)
  const requestedSymbol = symbol.value
  const current = ++officialCheckToken
  officialCheckError.value = ''
  officialCheckState.value = 'loading'
  try {
    const result = await requestOfficialCheck(sessionId, requestedSymbol)
    if (current !== officialCheckToken) return
    officialCheck.value = result.officialCheck
    officialCheckState.value = result.officialCheck.status === 'unavailable' ? 'unavailable' : 'success'
  } catch (e) {
    if (current !== officialCheckToken) return
    officialCheckError.value = e instanceof Error ? e.message : 'Pemeriksaan data resmi belum dapat dilakukan.'
    officialCheckState.value = 'error'
  }
}

const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })
const metricValue = (metric: OfficialCheckMetric, value: number | null) => value === null
  ? 'Tidak tersedia'
  : `${number.format(value)}${metric.key === 'roe' ? '%' : 'x'}`
const differenceValue = (metric: OfficialCheckMetric) => metric.difference === null
  ? 'Tidak tersedia'
  : `${metric.difference > 0 ? '+' : ''}${number.format(metric.difference)}${metric.key === 'roe' ? ' poin persentase' : 'x'}`
const metricStatus = (status: OfficialCheckMetric['status']) => ({
  matched: 'Sesuai',
  different: 'Berbeda',
  insufficient: 'Data belum cukup'
}[status])
const metricStatusClass = (status: OfficialCheckMetric['status']) => status === 'matched'
  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
  : status === 'different'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-slate-200 bg-slate-100 text-slate-700'
const plainLanguage = (value: string) => value
  .replace(/contextRef/gi, 'acuan periode')
  .replace(/SHA-?256/gi, 'sidik berkas')
  .replace(/XBRL/gi, 'laporan resmi')
  .replace(/LLM/gi, 'layanan pemeriksaan')
  .replace(/enrichment/gi, 'pelengkapan data')
  .replace(/taxonomy/gi, 'klasifikasi data')
  .replace(/parsing/gi, 'pembacaan dokumen')
  .replace(/model/gi, 'sistem pemeriksaan')

watch(() => route.fullPath, load, { immediate: true })
</script>

<template>
  <div class="page-shell space-y-6">
    <router-link :to="route.params.id ? `/research/${route.params.id}/report` : '/research'" class="button-secondary">Kembali ke {{ route.params.id ? 'laporan' : 'pustaka' }}</router-link>

    <template v-if="company">
      <h1 class="text-3xl font-bold">{{ company.symbol }} — {{ company.name }}</h1>
      <ReportCandidateAnalysis :candidates="[company]" :selected-ticker="company.symbol" :session-id="store.report.sessionId" />

      <section data-testid="official-check-panel" aria-labelledby="official-check-title" class="min-w-0 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
        <div class="border-b border-blue-100 bg-blue-50/70 p-5 sm:p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h2 id="official-check-title" class="text-lg font-bold text-slate-950">Pemeriksaan data resmi</h2>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Bandingkan data kandidat ini secara opsional dengan laporan resmi yang tersedia. Kandidat tetap dapat ditinjau tanpa pemeriksaan ini.</p>
            </div>
            <button data-testid="official-check-button" type="button" :disabled="officialCheckState === 'loading'" :aria-busy="officialCheckState === 'loading'" class="button-primary shrink-0 disabled:cursor-not-allowed disabled:opacity-60" @click="checkOfficialData">
              {{ officialCheckState === 'loading' ? 'Memeriksa…' : officialCheck ? 'Periksa kembali' : 'Periksa data resmi' }}
            </button>
          </div>
        </div>

        <div v-if="officialCheckState === 'loading'" role="status" aria-live="polite" class="p-5 text-sm font-semibold text-[#244F87] sm:p-6">Pemeriksaan laporan resmi sedang berjalan…</div>
        <div v-else-if="officialCheckState === 'error'" class="p-5 sm:p-6">
          <p role="alert" class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{{ officialCheckError }}</p>
        </div>
        <div v-else-if="officialCheck" class="space-y-6 p-5 sm:p-6">
          <div class="flex flex-wrap items-center gap-2">
            <span class="status-badge" :class="officialCheck.status === 'completed' ? 'status-completed' : officialCheck.status === 'partial' ? 'status-partial' : 'status-idle'">{{ officialCheck.status === 'completed' ? 'Pemeriksaan selesai' : officialCheck.status === 'partial' ? 'Pemeriksaan selesai sebagian' : 'Data resmi tidak tersedia' }}</span>
            <span class="text-xs text-slate-600">Periode {{ officialCheck.period || 'tidak tersedia' }} · <time :datetime="officialCheck.checkedAt">{{ formatDateTime(officialCheck.checkedAt) }}</time></span>
          </div>

          <div v-if="officialCheckState === 'unavailable'" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Laporan resmi yang dapat dibandingkan belum tersedia untuk kandidat dan periode ini.
          </div>

          <div v-if="officialCheck.source" class="grid gap-3 text-sm sm:grid-cols-2">
            <div><p class="text-xs font-semibold text-slate-500">Sumber resmi</p><p class="mt-1 font-semibold">{{ officialCheck.source.authority }}</p></div>
            <div><p class="text-xs font-semibold text-slate-500">Dokumen</p><p class="mt-1 break-words font-semibold">Laporan keuangan {{ officialCheck.source.issuerName }} · {{ officialCheck.period }}</p></div>
          </div>

          <div v-if="officialCheck.metrics.length" class="grid min-w-0 gap-4 lg:grid-cols-2">
            <article v-for="metric in officialCheck.metrics" :key="metric.key" class="min-w-0 rounded-xl border border-slate-200 p-4">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <h3 class="font-bold">{{ metric.label }}</h3>
                <span class="rounded-full border px-2.5 py-1 text-xs font-bold" :class="metricStatusClass(metric.status)">{{ metricStatus(metric.status) }}</span>
              </div>
              <dl class="mt-4 grid grid-cols-2 gap-3 text-sm tabular-nums">
                <div><dt class="text-xs text-slate-500">Data penyedia</dt><dd class="mt-1 font-mono font-bold">{{ metricValue(metric, metric.providerValue) }}</dd></div>
                <div><dt class="text-xs text-slate-500">Data resmi</dt><dd class="mt-1 font-mono font-bold">{{ metricValue(metric, metric.officialValue) }}</dd></div>
                <div class="col-span-2"><dt class="text-xs text-slate-500">Selisih</dt><dd class="mt-1 font-mono font-bold">{{ differenceValue(metric) }}</dd></div>
              </dl>
              <p class="mt-4 break-words text-sm leading-6 text-slate-600">{{ plainLanguage(metric.note) }}</p>
            </article>
          </div>

          <div class="space-y-3 text-sm leading-6">
            <p>{{ plainLanguage(officialCheck.summary) }}</p>
            <div v-if="officialCheck.limitations.length" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <h3 class="font-bold">Batas pemeriksaan</h3>
              <ul class="mt-2 list-disc space-y-1 pl-5"><li v-for="limitation in officialCheck.limitations" :key="limitation">{{ plainLanguage(limitation) }}</li></ul>
            </div>
          </div>

          <details v-if="officialCheck.source || officialCheck.technical" class="min-w-0 border-t border-slate-200 pt-3 text-xs leading-6 text-slate-600">
            <summary class="min-h-11 cursor-pointer py-3 text-sm font-bold text-slate-800">Detail sumber</summary>
            <dl class="grid min-w-0 gap-x-5 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
              <template v-if="officialCheck.source">
                <dt>Nama penerbit</dt><dd class="break-words">{{ officialCheck.source.issuerName }}</dd>
                <dt>Nama berkas</dt><dd class="break-all font-mono">{{ officialCheck.source.fileName }}</dd>
                <dt>ID berkas</dt><dd class="break-all font-mono">{{ officialCheck.source.fileId }}</dd>
                <dt>URL berkas</dt><dd class="break-all"><a v-if="sourceHref(officialCheck.source.url)" :href="sourceHref(officialCheck.source.url)!" target="_blank" rel="noopener noreferrer" class="font-semibold text-[#2F64A8] underline">Buka berkas resmi</a><span v-else>{{ officialCheck.source.url }}</span></dd>
                <dt>Berkas diperbarui</dt><dd><time :datetime="officialCheck.source.fileModified">{{ formatDateTime(officialCheck.source.fileModified) }}</time></dd>
                <dt>SHA-256 (sidik berkas)</dt><dd class="break-all font-mono">{{ officialCheck.source.sha256 }}</dd>
              </template>
              <template v-if="officialCheck.technical">
                <dt>Model yang diminta</dt><dd class="break-all font-mono">{{ officialCheck.technical.requestedModel }}</dd>
                <dt>Model yang digunakan</dt><dd class="break-all font-mono">{{ officialCheck.technical.returnedModel }}</dd>
                <dt>Versi instruksi</dt><dd class="break-all font-mono">{{ officialCheck.technical.promptVersion }}</dd>
                <dt v-if="officialCheck.technical.promptTokens !== undefined">Token masukan</dt><dd v-if="officialCheck.technical.promptTokens !== undefined" class="font-mono">{{ officialCheck.technical.promptTokens }}</dd>
                <dt v-if="officialCheck.technical.completionTokens !== undefined">Token keluaran</dt><dd v-if="officialCheck.technical.completionTokens !== undefined" class="font-mono">{{ officialCheck.technical.completionTokens }}</dd>
                <dt v-if="officialCheck.technical.totalTokens !== undefined">Total token</dt><dd v-if="officialCheck.technical.totalTokens !== undefined" class="font-mono">{{ officialCheck.technical.totalTokens }}</dd>
              </template>
              <dt>Asal hasil</dt><dd>{{ officialCheck.fromCache ? 'Salinan pemeriksaan tersimpan' : 'Pemeriksaan baru' }}</dd>
            </dl>
          </details>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-6"><h2 class="text-lg font-bold">Sumber dan data pendukung</h2><p class="mt-3 break-words text-xs leading-6">{{ company.providerSource?.sourceRef || 'Sumber tidak tersedia' }}</p><ul class="mt-4 space-y-4 text-sm leading-6"><li v-for="citation in company.evidenceCitations" :key="`${citation.source}-${citation.metric}`"><strong>{{ citation.metric }}: {{ citation.value }}</strong><p>{{ citation.context }}</p><p class="break-words text-xs text-slate-600">{{ citation.source }} · {{ citation.period || 'Periode tidak tersedia' }} · {{ citation.asOf || 'Tanggal tidak tersedia' }}</p></li></ul></section>
      <details class="rounded-2xl border border-slate-200 bg-white p-6"><summary class="min-h-11 cursor-pointer font-bold">Ketersediaan data tambahan</summary><CompanySupplementalAnalysis :company="company" /></details>
    </template>

    <section v-else-if="route.params.id" class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">Kandidat tidak tersedia dalam sesi ini</h1><p class="mt-3 text-sm">Ticker {{ symbol }} bukan kandidat pada snapshot sesi ini. Ini bukan pernyataan bahwa perusahaan tidak ada.</p></section>
    <p v-else-if="loading" role="status">Memuat profil perusahaan…</p>
    <section v-else-if="error" class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">Profil belum dapat dimuat</h1><p role="alert" class="mt-3 text-sm text-rose-700">{{ error }}</p><button type="button" class="button-secondary mt-4" @click="load">Coba lagi</button></section>
    <section v-else class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">{{ symbol }} — {{ profile?.companyName || profile?.name || 'Nama tidak tersedia' }}</h1><p class="mt-3 text-sm">Sektor: {{ profile?.sector || 'Tidak tersedia' }}</p><p class="mt-3 text-sm leading-6 text-slate-600">Profil global bukan hasil screening. Skor, ranking, dan alasan pemilihan hanya tersedia dalam konteks laporan sesi. Riset mendalam perusahaan belum didukung.</p><router-link to="/research/new" class="button-primary mt-5">Pilih screening yang didukung</router-link></section>
  </div>
</template>
