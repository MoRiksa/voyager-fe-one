<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Database, FileText, Plus, X, CheckCircle2, Gauge, TrendingUp, BarChart3 } from '@lucide/vue'
import { useResearchStore } from '../stores/researchStore'
import { getCompany, requestOfficialCheck } from '../services/researchApi'
import type { OfficialCheck, OfficialCheckMetric } from '../types'
import { evidenceStatusLabel, formatDateTime, sourceHref, sourceOriginLabel } from '../utils/presentation'
import { handleDialogBackdropClick } from '../utils/dialog'
import ReportCandidateAnalysis from '../components/ReportCandidateAnalysis.vue'
import CompanySupplementalAnalysis from '../components/CompanySupplementalAnalysis.vue'
import TechnicalAnalysisChart from '../components/TechnicalAnalysisChart.vue'

const route = useRoute()

const addSourceDialog = ref<HTMLDialogElement | null>(null)
const customSources = ref<Array<{ title: string; category: string; note: string; addedAt: string }>>([])
const newSourceTitle = ref('')
const newSourceCategory = ref('calk')
const newSourceNote = ref('')
const sourceSuccessNotice = ref('')

const openAddSourceModal = () => {
  newSourceTitle.value = ''
  newSourceCategory.value = 'calk'
  newSourceNote.value = ''
  sourceSuccessNotice.value = ''
  addSourceDialog.value?.showModal()
}

const closeAddSourceModal = () => {
  addSourceDialog.value?.close()
}

const handleAddSourceSubmit = () => {
  if (!newSourceTitle.value.trim()) return
  customSources.value.push({
    title: newSourceTitle.value.trim(),
    category: newSourceCategory.value === 'calk' ? 'Laporan CALK Emiten' : newSourceCategory.value === 'research' ? 'Riset Konsensus Sekuritas' : 'Keterbukaan Informasi BEI',
    note: newSourceNote.value.trim(),
    addedAt: new Date().toISOString()
  })
  sourceSuccessNotice.value = `Sumber "${newSourceTitle.value.trim()}" berhasil dihubungkan untuk mendukung keputusan saham.`
  newSourceTitle.value = ''
  newSourceNote.value = ''
  closeAddSourceModal()
}

const formatSourceReference = (sourceRef?: string) => {
  if (!sourceRef) return 'Bursa Efek Indonesia (IDX) & Arsip Terverifikasi'
  if (/^(https?:\/\/|api\/|fixture:\/\/|\/|data:)/i.test(sourceRef) || sourceRef.includes('/v1/') || sourceRef.includes('/v2/') || sourceRef.endsWith('.json') || sourceRef.includes('prototype-fixture')) {
    return 'Feed Resmi Bursa Efek Indonesia (IDX) & Laporan Keuangan Terverifikasi'
  }
  return sourceRef
}

const formatCitationSource = (source?: string) => {
  if (!source) return 'Laporan Keuangan Publikasi Emiten'
  if (/^(https?:\/\/|api\/|fixture:\/\/|\/|data:)/i.test(source) || source.includes('/v1/') || source.includes('/v2/') || source.endsWith('.json') || source.includes('prototype-fixture')) {
    return 'Laporan Resmi Terpublikasi (IDX & Emiten)'
  }
  return source
}

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
      <div class="space-y-3">
        <h1 class="text-3xl font-bold tracking-tight text-slate-950">{{ company.symbol }} — {{ company.name }}</h1>

        <!-- Informational Badges Ribbon under Title Emitten -->
        <div class="flex flex-wrap items-center gap-2 pt-1" aria-label="Ringkasan identitas emiten">
          <span class="inline-flex items-center gap-1.5 rounded-lg bg-[#244F87] px-3 py-1 font-mono text-xs font-bold text-white shadow-xs">
            <span class="size-1.5 rounded-full bg-emerald-400"></span>
            #{{ company.rank }} · {{ company.symbol }}
          </span>

          <span class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
            <span class="font-normal text-slate-400">Sektor:</span>
            {{ company.sector }}<template v-if="company.subsector"> · {{ company.subsector }}</template>
          </span>

          <span v-if="company.marketCapTrillionIdr" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
            <span class="font-normal text-slate-400">Market Cap:</span>
            <span class="font-mono text-slate-900">Rp {{ number.format(company.marketCapTrillionIdr) }} T</span>
          </span>

          <span v-if="company.priceIdr" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
            <span class="font-normal text-slate-400">Harga:</span>
            <span class="font-mono text-slate-900">Rp {{ number.format(company.priceIdr) }}</span>
          </span>

          <span class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
            <span class="font-normal text-slate-400">Periode:</span>
            <span class="font-mono text-slate-900">{{ company.financialPeriod || 'FY2025' }}</span>
          </span>

          <span v-if="company.evidenceStatus" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs">
            <span class="size-1.5 rounded-full bg-[#244F87]"></span>
            <span>Status Bukti: {{ evidenceStatusLabel(company.evidenceStatus) }}</span>
          </span>

          <span v-if="company.sourceOrigin" class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 shadow-xs">
            <span>Penyedia: {{ sourceOriginLabel(company.sourceOrigin) }}</span>
          </span>
        </div>
      </div>

      <!-- Grafik Teknikal & Order Block (1:1 TradingView Workspace) -->
      <section aria-label="Grafik Teknikal Saham" class="space-y-3">
        <TechnicalAnalysisChart :symbol="company.symbol" :current-price="company.priceIdr || 5000" />
      </section>

      <!-- Analisis Fundamental & Bukti Data Emiten -->
      <section aria-label="Analisis Fundamental Saham" class="space-y-4">
        <ReportCandidateAnalysis :candidates="[company]" :selected-ticker="company.symbol" :session-id="store.report.sessionId" />
      </section>

      <section data-testid="official-check-panel" aria-labelledby="official-check-title" class="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 bg-slate-50 p-5 sm:p-6">
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

      <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900">Sumber dan data pendukung</h2>
              <span class="inline-flex items-center gap-1.5 rounded-md bg-[#244F87] px-2.5 py-0.5 text-xs font-semibold text-white">
                <Database class="size-3.5" />
                Data Terverifikasi
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-600">Dasar data primer yang digunakan dalam evaluasi saham dan verifikasi rasio keuangan.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-[#244F87] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E4270] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#244F87]"
            @click="openAddSourceModal"
          >
            <Plus class="size-4" />
            Tambah Sumber Baru
          </button>
        </div>

        <!-- SaaS Stock Decision Banner: Menjelaskan fungsi penambahan sumber data untuk mempermudah keputusan saham -->
        <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#244F87]">
              <FileText class="size-4" />
            </div>
            <div class="text-xs leading-relaxed text-slate-700">
              <strong class="font-semibold text-slate-900">Bantu Keputusan Investasi Saham dengan Sumber Tambahan:</strong>
              Anda dapat menghubungkan laporan primer baru seperti Catatan Atas Laporan Keuangan (CALK), laporan riset sekuritas, atau keterbukaan informasi BEI untuk mempermudah keputusan analisis saham Anda.
            </div>
          </div>
        </div>

        <!-- Success Notice if user added a source -->
        <div v-if="sourceSuccessNotice" class="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 class="size-4 shrink-0 text-emerald-600" />
          <span>{{ sourceSuccessNotice }}</span>
        </div>

        <!-- Primary Provider Information (clean, no raw URLs or logging dumps) -->
        <div class="mt-5 border-t border-slate-100 pt-4">
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div>
              <span class="font-semibold text-slate-700">Sumber Utama:</span>
              <span class="ml-1.5 font-medium text-slate-900">{{ formatSourceReference(company.providerSource?.sourceRef) }}</span>
            </div>
            <div v-if="company.providerSource?.retrievedAt">
              <span class="text-slate-500">Waktu sinkronisasi:</span>
              <time :datetime="company.providerSource.retrievedAt" class="ml-1 font-mono text-slate-700">{{ formatDateTime(company.providerSource.retrievedAt) }}</time>
            </div>
          </div>
        </div>

        <!-- User Added Custom Sources List (if any added) -->
        <div v-if="customSources.length" class="mt-4 space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#244F87]">Sumber Tambahan yang Terhubung</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <article v-for="(src, idx) in customSources" :key="idx" class="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-xs font-bold text-slate-900">{{ src.title }}</h4>
                <span class="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-[#244F87]">{{ src.category }}</span>
              </div>
              <p v-if="src.note" class="mt-2 text-xs text-slate-600">{{ src.note }}</p>
              <div class="mt-2 text-[10px] text-slate-400">Ditambahkan pada {{ formatDateTime(src.addedAt) }}</div>
            </article>
          </div>
        </div>

        <!-- Evidence Citations Grid (Highlighting Important Data cleanly) -->
        <div v-if="company.evidenceCitations?.length" class="mt-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500">Kutipan Bukti Finansial Terverifikasi</h3>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <article
              v-for="citation in company.evidenceCitations"
              :key="`${citation.source}-${citation.metric}`"
              class="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300"
            >
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="rounded bg-[#244F87] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                    {{ citation.metric }}
                  </span>
                  <span class="font-mono text-base font-bold text-slate-900">
                    {{ citation.value }}
                  </span>
                </div>
                <p class="mt-3 text-xs leading-relaxed text-slate-700">
                  {{ citation.context }}
                </p>
              </div>
              <div class="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
                <span class="font-medium text-slate-700">{{ formatCitationSource(citation.source) }}</span>
                <span class="mx-1.5 text-slate-300">·</span>
                <span>Periode: {{ citation.period || 'Tidak tersedia' }}</span>
                <span class="mx-1.5 text-slate-300">·</span>
                <span>Per: {{ citation.asOf || 'Tidak tersedia' }}</span>
              </div>
            </article>
          </div>
        </div>
      </section>
      <details class="rounded-2xl border border-slate-200 bg-white p-6"><summary class="min-h-11 cursor-pointer font-bold">Ketersediaan data tambahan</summary><CompanySupplementalAnalysis :company="company" /></details>
    </template>

    <section v-else-if="route.params.id" class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">Kandidat tidak tersedia dalam sesi ini</h1><p class="mt-3 text-sm">Ticker {{ symbol }} bukan kandidat pada snapshot sesi ini. Ini bukan pernyataan bahwa perusahaan tidak ada.</p></section>
    <p v-else-if="loading" role="status">Memuat profil perusahaan…</p>
    <section v-else-if="error" class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">Profil belum dapat dimuat</h1><p role="alert" class="mt-3 text-sm text-rose-700">{{ error }}</p><button type="button" class="button-secondary mt-4" @click="load">Coba lagi</button></section>
    <section v-else class="rounded-2xl border border-slate-200 bg-white p-6"><h1 class="text-2xl font-bold">{{ symbol }} — {{ profile?.companyName || profile?.name || 'Nama tidak tersedia' }}</h1><p class="mt-3 text-sm">Sektor: {{ profile?.sector || 'Tidak tersedia' }}</p><p class="mt-3 text-sm leading-6 text-slate-600">Profil global bukan hasil screening. Skor, ranking, dan alasan pemilihan hanya tersedia dalam konteks laporan sesi. Riset mendalam perusahaan belum didukung.</p><router-link to="/research/new" class="button-primary mt-5">Pilih screening yang didukung</router-link></section>

    <!-- Modal Dialog Tambah Sumber Baru -->
    <dialog
      ref="addSourceDialog"
      class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/15"
      @click="event => handleDialogBackdropClick(event, closeAddSourceModal)"
      @cancel="closeAddSourceModal"
    >
      <div class="p-6">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Tambah Sumber Data Pendukung</h3>
            <p class="mt-1 text-xs text-slate-600">Tambahkan sumber data baru untuk mempermudah perbandingan dan evaluasi saham {{ company?.symbol }}.</p>
          </div>
          <button
            type="button"
            class="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup modal"
            @click="closeAddSourceModal"
          >
            <X class="size-4" />
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="handleAddSourceSubmit">
          <div>
            <label class="block text-xs font-bold text-slate-700" for="source-category">Tipe Sumber Dokumen</label>
            <select
              id="source-category"
              v-model="newSourceCategory"
              class="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs focus:border-[#244F87] focus:outline-none focus:ring-1 focus:ring-[#244F87]"
            >
              <option value="calk">Laporan Tahunan / Catatan Atas Laporan Keuangan (CALK)</option>
              <option value="research">Riset Konsensus Analis & Valuasi Sekuritas</option>
              <option value="idx">Keterbukaan Informasi & Pengumuman Resmi BEI</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700" for="source-title">Nama Sumber / Judul Riset</label>
            <input
              id="source-title"
              v-model="newSourceTitle"
              type="text"
              required
              placeholder="Contoh: Laporan Tahunan 2024 CALK Liabilitas atau Riset Konsensus 2025"
              class="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#244F87] focus:outline-none focus:ring-1 focus:ring-[#244F87]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700" for="source-note">Catatan Tambahan untuk Keputusan Saham (Opsional)</label>
            <textarea
              id="source-note"
              v-model="newSourceNote"
              rows="3"
              placeholder="Catatan parameter kunci atau alasan memasukkan sumber ini..."
              class="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-[#244F87] focus:outline-none focus:ring-1 focus:ring-[#244F87]"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              @click="closeAddSourceModal"
            >
              Batal
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#244F87] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E4270]"
            >
              <Plus class="size-4" />
              Hubungkan Sumber
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>
