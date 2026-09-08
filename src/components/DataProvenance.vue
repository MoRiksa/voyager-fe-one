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

onMounted(() => {
  if (store.report?.sessionId) {
    void store.fetchProvenance(store.report.sessionId)
  }
})

watch(() => store.report?.sessionId, (newId) => {
  if (newId) {
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
        Asal dan periode data (Lineage Audit)
      </h2>
      <div class="flex items-center gap-1.5 text-[10px] font-mono">
        <span class="rounded bg-indigo-100 px-1.5 py-0.5 text-indigo-700 font-semibold">
          rev {{ store.currentRevision }}
        </span>
        <span v-if="store.activeAttemptId" class="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800 font-semibold">
          {{ store.activeAttemptId }}
        </span>
      </div>
    </div>

    <div v-if="staleSources.length" data-testid="stale-data-warning" role="alert" class="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
      <strong>Data cache kedaluwarsa digunakan.</strong> Riset tetap selesai, tetapi {{ staleSources.length }} sumber disajikan melalui stale-if-error. Tinjau waktu pengambilan sebelum menggunakan hasil.
    </div>

    <dl class="mt-2 grid gap-x-5 gap-y-2" :class="compact ? 'text-[11px] sm:grid-cols-2' : 'text-xs sm:grid-cols-2'">
      <div>
        <dt class="font-semibold text-slate-500">Sumber Primary</dt>
        <dd class="mt-0.5 font-medium text-slate-800">{{ source || 'Sectors API v2 & Local Gateway' }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Tenant / Owner</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ store.tenantId }} / {{ store.ownerId }}</dd>
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
        <dt class="font-semibold text-slate-500">Origin provider</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ sourceOrigins.join(', ') || unavailable }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Versi artifact / formula</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ [...artifactVersions, ...formulaVersions].join(' / ') || unavailable }}</dd>
      </div>
      <div>
        <dt class="font-semibold text-slate-500">Data diambil</dt>
        <dd class="mt-0.5 font-mono text-slate-800">{{ latestRetrievedAt || unavailable }}</dd>
      </div>
      <div v-if="staleSources.length">
        <dt class="font-semibold text-amber-700">Stale fallback digunakan</dt>
        <dd class="mt-0.5 font-mono text-amber-900">{{ staleSources.map(source => source.staleAt || source.retrievedAt).join(', ') }}</dd>
      </div>
    </dl>

    <!-- Backend Provenance Audit Logs -->
    <div v-if="store.provenanceTrail && store.provenanceTrail.length > 0" class="mt-3 border-t border-slate-200 pt-3">
      <div class="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
        <span>Immutable Provenance Trail ({{ store.provenanceTrail.length }} Record)</span>
        <span class="text-[10px] text-slate-400 font-mono">idempotent audit</span>
      </div>
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
    </div>
  </aside>
</template>
