<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import type { ResearchObjectivePreset } from '../types'
import { createResearchSession, startResearchSession, getResearchSessionFull, getResearchCapabilities, getResearchPresets, getResearchPreview } from '../services/researchApi'

const store = useResearchStore()
const router = useRouter()
const objective = ref(store.currentObjective)
const selectedPreset = ref(store.activePresetId)
const candidateCount = ref(5)
const researchDepth = ref<'Ringkas' | 'Standar'>('Standar')
const capabilities = ref<any>(null)
const preview = ref<any>(null)
const loading = ref(true)
const previewLoading = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const createdId = ref('')
let createdRequest = ''
let idempotencyKey = ''
let submittedRequest = ''
const isBank = computed(() => store.presets.find(preset => preset.id === selectedPreset.value)?.contract?.objectiveType === 'bank-screen')
const request = computed(() => ({ objective: objective.value.trim(), presetId: selectedPreset.value, brief: { market: 'IDX' as const, sectorScope: isBank.value ? 'Perbankan' : 'Semua Sektor', indexScope: 'Semua Indeks', candidateCount: candidateCount.value, researchDepth: researchDepth.value, useSectorMetrics: false, optionalDimensions: [], clarificationNotes: [] } }))
let previewRevision = 0
const loadPreview = async () => {
  const revision = ++previewRevision
  preview.value = null
  if (!objective.value.trim() || !capabilities.value) return
  previewLoading.value = true
  try { const result = await getResearchPreview(request.value); if (revision === previewRevision) preview.value = result }
  catch (e) { if (revision === previewRevision) error.value = e instanceof Error ? e.message : 'Preview tidak tersedia.' }
  finally { if (revision === previewRevision) previewLoading.value = false }
}
watch(request, () => { error.value = ''; void loadPreview() })
const chooseTemplate = (preset: ResearchObjectivePreset) => {
  if (!preset.supported || preset.availableForNewResearch === false || isSubmitting.value) return
  selectedPreset.value = preset.id
  objective.value = preset.objective
  error.value = ''
  void loadPreview()
}
const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [nextCapabilities, presets] = await Promise.all([getResearchCapabilities(), getResearchPresets()])
    capabilities.value = nextCapabilities
    store.presets = presets
    await loadPreview()
  } catch (e) { error.value = e instanceof Error ? e.message : 'Kapabilitas riset tidak tersedia.' }
  finally { loading.value = false }
}
onMounted(load)
const submit = async () => {
  if (isSubmitting.value || previewLoading.value || preview.value?.contract.status !== 'supported') return
  isSubmitting.value = true
  error.value = ''
  try {
    const serialized = JSON.stringify(request.value)
    if (submittedRequest !== serialized) { submittedRequest = serialized; idempotencyKey = crypto.randomUUID() }
    const created = createdId.value && createdRequest === serialized
      ? { id: createdId.value, session: await getResearchSessionFull(createdId.value) }
      : await createResearchSession(request.value, idempotencyKey)
    createdId.value = created.id
    createdRequest = serialized
    store.hydrateFromBackendSession(created.session)
    if (created.session?.status === 'IDLE') {
      const started = await startResearchSession(created.id, created.session.revision!)
      store.hydrateFromBackendSession(started.session)
    }
    await router.push(`/research/${created.id}`)
  } catch (e) { error.value = e instanceof Error ? e.message : 'Riset gagal dimulai.' }
  finally { isSubmitting.value = false }
}
</script>

<template>
  <div class="page-shell max-w-5xl">
    <header class="max-w-3xl"><p class="section-kicker">Riset baru</p><h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Screening IDX dengan aturan yang jelas</h1><p class="mt-3 text-sm leading-6 text-slate-600">Pilih tujuan yang dapat diperiksa. Hasil merupakan shortlist terbatas untuk riset lanjutan, bukan rekomendasi membeli.</p></header>
    <p v-if="loading" role="status" class="mt-6">Memuat kemampuan layanan…</p>
    <form v-else data-testid="research-form" class="mt-8 grid gap-6 lg:grid-cols-[1fr_19rem]" @submit.prevent="submit">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 class="text-lg font-bold">Pilih tujuan secara eksplisit</h2>
          <div class="mt-4 grid gap-3"><div v-for="preset in store.presets" :key="preset.id"><button :data-testid="`preset-${preset.id}`" type="button" :aria-pressed="selectedPreset === preset.id && objective === preset.objective" :disabled="isSubmitting || !preset.supported || preset.availableForNewResearch === false" class="min-h-12 w-full rounded-xl border p-4 text-left font-semibold disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500" :class="preset.supported && preset.availableForNewResearch !== false ? 'border-blue-200 bg-blue-50 text-[#2F64A8]' : ''" @click="chooseTemplate(preset)">{{ preset.title }}<span class="block text-xs font-normal">{{ !preset.supported ? 'Belum didukung' : preset.availableForNewResearch === false ? 'Tidak ditawarkan untuk riset baru' : 'Dapat dijalankan' }}</span></button><p v-if="!preset.supported || preset.availableForNewResearch === false" class="mt-1 px-2 text-xs leading-5 text-slate-600">{{ preset.availabilityReason || preset.unsupportedReasons?.join(' ') }}</p></div></div>
          <label for="research-objective" class="mt-5 block text-sm font-bold">Tujuan yang diperiksa</label>
          <textarea id="research-objective" data-testid="research-objective" v-model="objective" :disabled="isSubmitting" rows="4" aria-describedby="objective-help" class="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm leading-6" @input="selectedPreset = 'custom'"></textarea>
          <p id="objective-help" class="mt-2 text-xs leading-5 text-slate-600">Tujuan bebas belum dapat diterjemahkan menjadi aturan. Screen bank hanya memakai objective kanonik, ROE, dan P/BV untuk menyusun shortlist riset lanjutan.</p>
        </section>
        <section class="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 class="font-bold">Cakupan yang didukung</h2><p class="mt-2 text-sm text-slate-600">IDX · {{ isBank ? 'Subsektor Banks' : 'Semua Sektor' }} · Semua Indeks. Tanpa dimensi tambahan.</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2"><label class="text-sm font-semibold">Batas kandidat<input v-model.number="candidateCount" data-testid="brief-candidate-count" type="number" required :min="capabilities?.candidateCount.minimum" :max="capabilities?.candidateCount.maximum" :disabled="isSubmitting" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" /></label><label class="text-sm font-semibold">Penyajian<select v-model="researchDepth" data-testid="brief-depth" :disabled="isSubmitting" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3"><option v-for="depth in capabilities?.researchDepths" :key="depth">{{ depth }}</option></select></label></div>
          <p class="mt-3 text-xs leading-5 text-slate-600">Batas kandidat bukan janji jumlah hasil. Ringkas/Standar tidak mengaktifkan pendalaman.</p>
        </section>
      </div>
      <aside class="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
        <h2 class="font-bold">Aturan sebelum mulai</h2>
        <p v-if="previewLoading" role="status" class="mt-3 text-sm">Memeriksa tujuan…</p>
        <div v-if="preview" data-testid="screening-rule-contract" class="mt-4 space-y-4 text-sm leading-6">
          <p class="font-semibold">{{ preview.contract.status === 'supported' ? 'Tujuan didukung' : 'Tujuan belum didukung' }}</p>
          <ul class="list-disc space-y-2 pl-4"><li v-for="criterion in preview.contract.criteria" :key="criterion">{{ criterion }}</li><li v-for="reason in preview.contract.unsupportedReasons" :key="reason">{{ reason }}</li></ul>
          <p>{{ preview.contract.coveragePolicy }}</p>
          <p v-for="limitation in preview.contract.limitations" :key="limitation">{{ limitation }}</p>
          <p data-testid="actual-universe">Jumlah universe: {{ preview.estimatedUniverseCount ?? 'Belum tersedia' }}. Durasi: {{ preview.estimatedDurationSeconds ?? 'Belum tersedia' }}. Credits: {{ preview.estimatedCredits ?? 'Belum tersedia' }}.</p>
        </div>
        <p v-else-if="!previewLoading" class="mt-3 text-sm text-slate-600">Pilih tujuan untuk memuat kontrak screening.</p>
        <p v-if="error" id="objective-error" data-testid="objective-error" role="alert" class="mt-4 text-sm leading-6 text-rose-700">{{ error }}</p>
        <router-link v-if="createdId" :to="`/research/${createdId}`" class="mt-3 block text-sm underline">Buka sesi yang sudah dibuat</router-link>
        <button type="submit" :disabled="isSubmitting || previewLoading || preview?.contract.status !== 'supported'" :aria-busy="isSubmitting" class="button-primary mt-5 min-h-12 w-full disabled:opacity-50">{{ isSubmitting ? 'Memulai riset…' : 'Mulai riset' }}</button>
        <button v-if="!capabilities" type="button" class="button-secondary mt-3" @click="load">Coba muat ulang</button>
      </aside>
    </form>
  </div>
</template>
