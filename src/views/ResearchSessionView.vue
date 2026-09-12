<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { getResearchSessionFull, startResearchSession } from '../services/researchApi'
import { sessionStatusMeta } from '../utils/status'
import CandidateCard from '../components/CandidateCard.vue'
import DataProvenance from '../components/DataProvenance.vue'
const store = useResearchStore()
const busy = ref(false)
const readError = ref('')
let token = 0
const poll = async (id: string, current: number) => {
  while (current === token && store.isExecuting) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (current !== token) return
    try {
      const session = await getResearchSessionFull(id)
      if (current !== token) return
      store.hydrateFromBackendSession(session); readError.value = ''
    } catch { readError.value = 'Pembaruan status terputus. Snapshot terakhir ditampilkan; mencoba menghubungkan kembali.' }
  }
}
watch(() => [store.report.sessionId, store.isExecuting] as const, ([id, running]) => {
  const current = ++token
  if (id && running) void poll(id, current)
}, { immediate: true })
onUnmounted(() => { token += 1; store.disconnectSse() })
const act = async (action: 'start' | 'retry' | 'cancel') => {
  if (busy.value) return
  busy.value = true
  try {
    if (action === 'start') store.hydrateFromBackendSession((await startResearchSession(store.report.sessionId, store.currentRevision)).session)
    else if (action === 'retry') await store.retryResearch()
    else await store.cancelResearch()
  } catch (error) { store.notify(error instanceof Error ? error.message : 'Proses gagal dimulai.', 'error') }
  finally { busy.value = false }
}
</script>
<template>
  <div class="page-shell space-y-6">
    <header class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><p class="section-kicker">Sesi riset</p><h1 class="mt-2 text-2xl font-bold">{{ store.currentObjective }}</h1><div v-if="store.isActiveSessionRestricted" data-testid="restricted-session" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-950"><strong>Arsip ini tidak dapat digunakan untuk keputusan investasi.</strong> Metode lama tidak sesuai dengan tujuan tertulis atau data wajib tidak lengkap. Kandidat, skor, dan kesimpulan lama tidak divalidasi.</div><p class="mt-4 text-sm font-semibold" role="status">Proses: {{ sessionStatusMeta(store.status, store.isExecuting).label }}</p><p class="mt-2 text-sm leading-6 text-slate-600">{{ store.status === 'COMPLETED' ? 'Proses perhitungan selesai. Ini tidak berarti tujuan berhasil dijawab.' : store.isExecuting ? 'Pemeriksaan data berjalan. Hasil hanya tersedia setelah publikasi.' : 'Sesi belum menghasilkan proses pemeriksaan yang selesai.' }}</p><p v-if="store.failureReason" role="alert" class="mt-3 text-sm leading-6 text-rose-700">{{ store.failureReason }}</p><p v-if="readError" role="alert" class="mt-3 text-sm text-amber-900">{{ readError }}</p>
      <div class="mt-5 flex flex-wrap gap-3"><button v-if="store.status === 'IDLE' && store.activePlan.contract?.status === 'supported'" type="button" :disabled="busy" class="button-primary" @click="act('start')">Mulai sesi</button><button v-if="store.isExecuting" data-testid="session-cancel" type="button" :disabled="busy" class="button-secondary" @click="act('cancel')">Batalkan</button><button v-if="['FAILED', 'PARTIAL', 'CANCELLED'].includes(store.status) && store.activePlan.contract?.status === 'supported'" data-testid="session-retry" type="button" :disabled="busy" class="button-primary" @click="act('retry')">Jalankan ulang</button><router-link v-if="store.publishedAttemptId" data-testid="session-next" :to="`/research/${store.report.sessionId}/report`" class="button-primary">{{ store.isActiveSessionRestricted ? 'Baca arsip dengan peringatan' : 'Baca laporan' }}</router-link><router-link v-if="store.screeningFunnel.length" :to="`/research/${store.report.sessionId}/screener`" class="button-secondary">Tinjau proses data</router-link></div>
    </header>
    <section v-if="store.activePlan.contract?.status !== 'supported'" class="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><h2 class="font-bold">Tujuan belum didukung atau kontrak sesi lama belum terverifikasi</h2><p v-for="reason in store.activePlan.contract?.unsupportedReasons" :key="reason">{{ reason }}</p><router-link to="/research/new" class="mt-3 inline-block underline">Pilih screening yang didukung</router-link></section>
    <section v-if="store.publishedAttemptId" class="space-y-4"><h2 class="text-xl font-bold">Data kandidat untuk ditinjau</h2><p class="text-sm leading-6 text-slate-600">{{ store.report.objectiveStatus === 'cannot_assess' ? 'Satu atau lebih bank top-eight tidak memiliki data wajib; tujuan belum dapat dinilai sepenuhnya.' : store.report.objectiveStatus === 'not_answered' ? 'Tidak ada data kandidat yang dapat ditampilkan; tujuan belum terjawab.' : 'Laporan menampilkan hingga delapan kandidat sesuai data yang tersedia pada cakupan provider.' }}</p><div class="grid gap-4 xl:grid-cols-2"><CandidateCard v-for="candidate in store.candidates" :key="candidate.symbol" :candidate="candidate" /></div></section>
    <DataProvenance />
    <details class="rounded-2xl border border-slate-200 bg-white p-6"><summary class="min-h-11 cursor-pointer font-bold">Cakupan dan aturan yang diperiksa</summary><p data-testid="persisted-brief" class="mt-3 text-sm leading-6">{{ store.activeBrief.market }} · {{ store.activeBrief.sectorScope }} · {{ store.activeBrief.indexScope }} · {{ store.activePlan.contract?.objectiveType === 'bank-evidence' ? 'hingga 8 data kandidat tersedia' : `maksimal ${store.activeBrief.candidateCount} kandidat` }} · {{ store.activeBrief.researchDepth }}</p><p class="mt-3 text-sm leading-6">{{ store.activePlan.contract?.coveragePolicy || store.activePlan.universe }}</p><ul class="mt-3 list-disc space-y-2 pl-5 text-sm"><li v-for="criterion in store.activePlan.contract?.criteria || store.activePlan.criteria" :key="criterion">{{ criterion }}</li></ul><p class="mt-4 text-sm leading-6 text-slate-600">Pendalaman dan benchmark peer independen belum didukung. Tinjauan bank hanya menampilkan ROE dan P/BV yang tersedia. Status proses selesai tidak berarti riset lanjutan telah dilakukan.</p></details>
  </div>
</template>
