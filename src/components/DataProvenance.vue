<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'

const props = defineProps<{
  source?: string
  financialPeriod?: string
  priceAsOf?: string
  generatedAt?: string
  compact?: boolean
}>()

const store = useResearchStore()
const unavailable = 'Tidak diketahui / tidak tersedia'
const sourceOrigins = computed(() => [...new Set(store.screeningFunnel.flatMap(stage => stage.sourceOrigins || []))])
const providerSources = computed(() => store.screeningFunnel.flatMap(stage => stage.providerSources || []))
const artifactVersions = computed(() => [...new Set(store.screeningFunnel.map(stage => stage.artifactVersion).filter(Boolean))])
const formulaVersions = computed(() => [...new Set(store.candidates.map(candidate => candidate.formulaVersion).filter(Boolean))])
const staleSources = computed(() => providerSources.value.filter(source => source.origin === 'stale-cache'))
const latestRetrievedAt = computed(() => providerSources.value.map(source => source.retrievedAt).filter(Boolean).sort().at(-1))
const hasBackendProvenance = computed(() => store.screeningFunnel.some(stage => stage.sourceKind !== 'prototype-fixture'))

onMounted(() => {
  if (store.report?.sessionId && hasBackendProvenance.value) {
    void store.fetchProvenance(store.report.sessionId)
  }
})

watch(() => store.report?.sessionId, (newId) => {
  if (newId && hasBackendProvenance.value) {
    void store.fetchProvenance(newId)
  }
})
</script>

<template>
  <aside
    aria-label="Asal dan periode data"
    class="rounded-xl border border-slate-200 bg-slate-50/70 text-slate-600"
    :class="compact ? 'px-3 py-2.5' : 'p-4'"
  >
    <div class="flex items-center justify-between">
      <h2 class="font-bold uppercase tracking-wider text-slate-700" :class="compact ? 'text-[10px]' : 'text-xs'">
        Sumber data
      </h2>
    </div>

    <div v-if="staleSources.length" data-testid="stale-data-warning" role="alert" class="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
      <strong>Data lama digunakan sementara.</strong> Layanan sumber sedang bermasalah. Periksa waktu pembaruan sebelum menggunakan hasil.
    </div>

    <dl class="mt-2 grid gap-x-5 gap-y-2" :class="compact ? 'text-[11px] sm:grid-cols-2' : 'text-xs sm:grid-cols-2'">
      <div>
        <dt class="font-semibold text-slate-500">Asal data</dt>
        <dd class="mt-0.5 font-medium text-slate-800">{{ source || 'Sectors API' }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Periode keuangan</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ financialPeriod || unavailable }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Laporan Dibuat</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ generatedAt || store.report?.timestamp || unavailable }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Terakhir diperbarui</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ latestRetrievedAt || unavailable }}</dd>
      </div>
      <div v-if="staleSources.length">
        <dt class="font-semibold text-amber-700">Data lama digunakan pada</dt>
        <dd class="mt-0.5 font-mono text-amber-900">{{ staleSources.map(source => source.staleAt || source.retrievedAt).join(', ') }}</dd>
      </div>
    </dl>

    <details v-if="sourceOrigins.length || artifactVersions.length || formulaVersions.length" class="mt-3 border-t border-slate-200 pt-3 text-xs">
      <summary class="min-h-10 cursor-pointer py-2 font-semibold text-slate-600">Detail sumber data</summary>
      <dl class="mt-2 grid gap-2 sm:grid-cols-2">
        <div><dt class="text-slate-500">Jenis sumber</dt><dd class="mt-0.5 font-mono text-slate-800">{{ sourceOrigins.join(', ') || unavailable }}</dd></div>
        <div><dt class="text-slate-500">Versi perhitungan</dt><dd class="mt-0.5 font-mono text-slate-800">{{ [...artifactVersions, ...formulaVersions].join(' / ') || unavailable }}</dd></div>
      </dl>
    </details>

    <details v-if="store.provenanceTrail && store.provenanceTrail.length > 0" class="mt-3 border-t border-slate-200 pt-3">
      <summary class="min-h-10 cursor-pointer py-2 text-xs font-semibold text-slate-600">Riwayat pemeriksaan data ({{ store.provenanceTrail.length }})</summary>
      <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        <div
          v-for="rec in store.provenanceTrail.slice().reverse()"
          :key="rec.provenanceId"
          class="rounded bg-white p-2 border border-slate-200 text-[10px] font-mono leading-relaxed"
        >
          <div class="flex items-center justify-between text-indigo-900 font-semibold">
            <span>{{ rec.provenanceId }} — {{ rec.action }}</span>
            <span class="text-slate-500">{{ new Date(rec.timestamp).toLocaleTimeString() }}</span>
          </div>
          <div class="text-slate-600 mt-0.5 truncate" :title="rec.sourceRef">
            Ref: {{ rec.sourceRef }}
          </div>
          <div v-if="rec.inputDigest || rec.outputDigest" class="flex gap-2 text-slate-500 mt-0.5">
            <span v-if="rec.inputDigest">in: {{ rec.inputDigest }}</span>
            <span v-if="rec.outputDigest">out: {{ rec.outputDigest }}</span>
          </div>
        </div>
      </div>
    </details>
  </aside>
</template>
