<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { exportReportFile } from '../services/researchApi'
import ReportCandidateAnalysis from '../components/ReportCandidateAnalysis.vue'
import CandidateCard from '../components/CandidateCard.vue'

const store = useResearchStore()
const activeSection = ref('summary')
const selectedTicker = ref('')
const exportBusy = ref(false)
const exportError = ref('')
const copyStatus = ref('')
const copySummary = async () => {
  copyStatus.value = ''; exportError.value = ''
  try {
    await navigator.clipboard.writeText(`VOYAGER ONE — ${store.report.sessionId}\n${store.report.timestamp}\n${store.report.objective}\n${objectiveLabel.value}\n${store.report.universeSummary}\n${store.report.limitations.join('\n')}\n${store.report.disclaimer}`)
    copyStatus.value = 'Ringkasan disalin.'
  } catch { exportError.value = 'Ringkasan tidak dapat disalin. Izinkan akses clipboard atau unduh Markdown.' }
}
const documentMode = ref(false)
const hasReport = computed(() => Boolean(store.publishedAttemptId && store.report.timestamp))
const objectiveLabel = computed(() => store.report.objectiveStatus ? { answered: 'Tujuan terjawab pada cakupan terbatas', not_answered: 'Tujuan belum terjawab: tidak ada kandidat lolos', cannot_assess: 'Tujuan belum dapat dinilai sepenuhnya' }[store.report.objectiveStatus] : 'Status pemenuhan tujuan tidak tersedia')
const sections = [{ id: 'summary', label: 'Ringkasan' }, { id: 'candidates', label: 'Kandidat' }, { id: 'risks', label: 'Risiko' }, { id: 'evidence', label: 'Bukti & metode' }]
const tabs = ref<HTMLButtonElement[]>([])
const tabKeydown = (event: KeyboardEvent, index: number) => {
  const next = event.key === 'ArrowRight' ? (index + 1) % sections.length : event.key === 'ArrowLeft' ? (index + sections.length - 1) % sections.length : event.key === 'Home' ? 0 : event.key === 'End' ? sections.length - 1 : -1
  if (next < 0) return
  event.preventDefault(); activeSection.value = sections[next].id; void nextTick(() => tabs.value[next]?.focus())
}
const download = async (format: 'markdown' | 'json') => {
  if (exportBusy.value) return
  exportBusy.value = true; exportError.value = ''
  try { await exportReportFile(store.report.sessionId, format) }
  catch (e) { exportError.value = e instanceof Error ? e.message : 'Ekspor tidak tersedia.' }
  finally { exportBusy.value = false }
}
let openedDetails: HTMLDetailsElement[] = []
const preparePrint = () => {
  documentMode.value = true
  void nextTick(() => {
    const details = Array.from(document.querySelectorAll<HTMLDetailsElement>('.report-page details:not([open])'))
    openedDetails.push(...details)
    details.forEach(detail => { detail.open = true })
  })
}
const finishPrint = () => {
  openedDetails.forEach(detail => { detail.open = false })
  openedDetails = []
  documentMode.value = false
}
const print = async () => {
  exportError.value = ''
  try { preparePrint(); await nextTick(); window.print() }
  catch { exportError.value = 'Laporan tidak dapat dicetak. Coba lagi dari menu browser.'; finishPrint() }
}
onMounted(() => { window.addEventListener('beforeprint', preparePrint); window.addEventListener('afterprint', finishPrint) })
onUnmounted(() => { window.removeEventListener('beforeprint', preparePrint); window.removeEventListener('afterprint', finishPrint) })
</script>

<template>
  <div class="report-page page-shell space-y-6">
    <section v-if="!hasReport" data-testid="results-pending" class="max-w-2xl rounded-2xl border border-slate-200 bg-white p-7">
      <h1 class="text-2xl font-bold">Laporan belum tersedia</h1><p class="mt-3 text-sm leading-6 text-slate-600">{{ store.status === 'FAILED' ? 'Proses gagal. Hasil akhir belum dipublikasikan.' : store.isExecuting ? 'Proses masih berjalan. Tunggu publikasi hasil.' : 'Sesi ini belum memiliki laporan yang dipublikasikan.' }}</p><p v-if="store.failureReason" role="alert" class="mt-3 text-sm text-rose-700">{{ store.failureReason }}</p><router-link :to="`/research/${store.report.sessionId}`" class="button-primary mt-5">Kembali ke sesi</router-link>
    </section>
    <template v-else>
      <header class="flex flex-wrap items-start justify-between gap-5"><div><p class="section-kicker">Laporan riset</p><h1 data-testid="objective-status" class="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{{ objectiveLabel }}</h1><p class="mt-3 text-sm text-slate-600">Proses: {{ store.status }} · Laporan dibuat: {{ store.report.timestamp }}</p></div><div class="flex flex-wrap gap-2 print:hidden"><button type="button" class="button-primary" @click="print">Cetak / simpan PDF</button><details><summary class="button-secondary cursor-pointer">Pilihan ekspor</summary><div class="mt-2 grid gap-2"><button type="button" :disabled="exportBusy" class="button-secondary" @click="download('markdown')">Unduh Markdown</button><button type="button" :disabled="exportBusy" class="button-secondary" @click="download('json')">Unduh JSON</button></div></details></div></header>
      <p v-if="exportError" role="alert" class="text-sm text-rose-700">{{ exportError }}</p>
      <div class="print:hidden"><button type="button" class="button-secondary" @click="copySummary">Salin ringkasan</button><p role="status" class="mt-2 text-sm">{{ copyStatus }}</p></div>
      <p class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{{ store.report.contract?.coveragePolicy || 'Cakupan kontrak laporan lama belum terverifikasi.' }} Skor bukan peluang untung atau tingkat keyakinan. Bukti satu sumber belum diverifikasi independen; narasi AI tidak tersedia pada screening ini.</p>
      <button v-if="documentMode" type="button" class="button-secondary print:hidden" @click="documentMode = false">Kembali ke tampilan ringkas</button>
      <nav v-if="!documentMode" role="tablist" aria-label="Bagian laporan" class="flex flex-wrap gap-2 print:hidden"><button v-for="(section, index) in sections" :id="`report-tab-${section.id}`" :key="section.id" :ref="el => { if (el) tabs[index] = el as HTMLButtonElement }" type="button" role="tab" :aria-selected="activeSection === section.id" :tabindex="activeSection === section.id ? 0 : -1" :aria-controls="`report-panel-${section.id}`" :class="activeSection === section.id ? 'button-primary' : 'button-secondary'" @click="activeSection = section.id" @keydown="tabKeydown($event, index)">{{ section.label }}</button></nav>
      <section v-show="documentMode || activeSection === 'summary'" id="report-panel-summary" :role="documentMode ? undefined : 'tabpanel'" aria-labelledby="report-tab-summary" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 class="text-xl font-bold">Pertanyaan dan batas jawaban</h2><p class="text-sm leading-6">{{ store.report.objective }}</p><p class="text-sm leading-6 text-slate-600">{{ store.report.universeSummary }}</p>
        <p v-if="store.report.objectiveStatus === 'cannot_assess'" class="text-sm text-amber-900">Sebagian perusahaan belum dapat dinilai karena data tidak lengkap. Ini berbeda dari gagal kriteria finansial.</p>
        <div class="grid gap-4 xl:grid-cols-2"><CandidateCard v-for="candidate in store.candidates" :key="candidate.symbol" :candidate="candidate" /></div>
        <p v-if="!store.candidates.length" class="text-sm">Tidak ada shortlist yang dipublikasikan. Tinjau alasan seleksi dan kelengkapan data sebelum menyimpulkan.</p>
        <h3 class="font-bold">Batas analisis</h3><ul class="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600"><li v-for="limitation in store.report.limitations" :key="limitation">{{ limitation }}</li></ul>
        <h3 class="font-bold">Langkah riset berikutnya</h3><p class="text-sm leading-6 text-slate-600">Periksa laporan keuangan sumber dan tanggal harga. Verifikasi risiko serta kecocokan sektor sebelum menggunakan shortlist; kesehatan bank dan keberlanjutan dividen belum dijawab.</p>
      </section>
      <section v-show="documentMode || activeSection === 'candidates'" id="report-panel-candidates" :role="documentMode ? undefined : 'tabpanel'" aria-label="Kandidat"><template v-if="documentMode"><ReportCandidateAnalysis v-for="candidate in store.candidates" :key="candidate.symbol" :selected-ticker="candidate.symbol" :candidates="[candidate]" :session-id="store.report.sessionId" /></template><ReportCandidateAnalysis v-else v-model:selected-ticker="selectedTicker" :candidates="store.candidates" :session-id="store.report.sessionId" /><p class="mt-4 text-sm leading-6 text-slate-600">{{ store.report.peerComparisonNotes }}</p></section>
      <section v-show="documentMode || activeSection === 'risks'" id="report-panel-risks" :role="documentMode ? undefined : 'tabpanel'" aria-labelledby="report-tab-risks" class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6"><h2 class="text-xl font-bold">Risiko dan yang belum diketahui</h2><p class="text-sm leading-6">{{ store.report.uncertaintyNotes }}</p><article v-for="candidate in store.candidates" :key="candidate.symbol"><h3 class="font-bold">{{ candidate.symbol }}</h3><ul class="mt-2 list-disc space-y-1 pl-5 text-sm leading-6"><li v-for="risk in candidate.potentialConcerns" :key="risk">{{ risk }}</li><li v-if="!candidate.potentialConcerns.length">Risiko spesifik belum tersedia; bukan berarti tidak ada risiko.</li></ul></article><ul class="list-disc space-y-2 pl-5 text-sm leading-6"><li v-for="limitation in store.report.limitations" :key="limitation">{{ limitation }}</li></ul></section>
      <section v-show="documentMode || activeSection === 'evidence'" id="report-panel-evidence" :role="documentMode ? undefined : 'tabpanel'" aria-labelledby="report-tab-evidence" class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"><h2 class="text-xl font-bold">Bukti dan metode</h2><p class="text-sm leading-6">{{ store.report.methodologyOverview }}</p><ul class="list-disc space-y-2 pl-5 text-sm"><li v-for="criterion in store.report.contract?.criteria || store.activePlan.criteria" :key="criterion">{{ criterion }}</li></ul><article v-for="candidate in store.candidates" :key="candidate.symbol" class="border-t border-slate-200 pt-4"><h3 class="font-bold">{{ candidate.symbol }}</h3><p class="mt-2 break-words text-xs leading-6">Sumber: {{ candidate.providerSource?.sourceRef || 'Tidak tersedia' }} · Asal: {{ candidate.sourceOrigin || 'Tidak tersedia' }}<br />FY: {{ candidate.financialPeriod || 'Tidak tersedia' }} · Harga per: {{ candidate.priceAsOf || 'Tidak tersedia' }} · Diambil: {{ candidate.providerSource?.retrievedAt || 'Tidak tersedia' }}<br />Formula: {{ candidate.formulaVersion || 'Tidak tersedia' }} · Bukti: {{ candidate.evidenceStatus || 'Tidak tersedia' }} · Narasi: {{ candidate.narrativeStatus || 'Tidak tersedia' }}</p><ul class="mt-3 space-y-3 text-sm"><li v-for="citation in candidate.evidenceCitations" :key="`${citation.source}-${citation.metric}`"><strong>{{ citation.metric }}: {{ citation.value }}</strong><p>{{ citation.context }}</p><p class="break-words text-xs text-slate-500">{{ citation.source }} · {{ citation.period || 'Periode tidak tersedia' }} · {{ citation.asOf || 'Tanggal tidak tersedia' }}</p></li></ul></article></section>
      <footer class="text-xs leading-6 text-slate-600"><p>{{ store.report.disclaimer }}</p><div class="mt-4 flex flex-wrap gap-3 print:hidden"><router-link to="/research" class="button-secondary">Kembali ke pustaka</router-link><router-link :to="`/research/${store.report.sessionId}/screener`" class="button-secondary">Tinjau alasan seleksi</router-link><router-link to="/research/new" data-testid="report-use-template" class="button-secondary">Gunakan sebagai template</router-link></div></footer>
    </template>
  </div>
</template>

<style>
@page { size: A4; margin: 15mm; }
@media print {
  .report-page { padding: 0 !important; color: #000; background: #fff; }
  .report-page header { display: block !important; }
  .report-page [id^="report-panel-"] { display: block !important; margin-top: 6mm; }
  .report-page button, .report-page a, .report-page [role="tablist"] { display: none !important; }
  .report-page .grid { display: block; }
  .report-page article, .report-page dl > div { break-inside: avoid; }
  .report-page h2, .report-page h3 { break-after: avoid; }
  .report-page pre { white-space: pre-wrap; overflow: visible; }
}
</style>
