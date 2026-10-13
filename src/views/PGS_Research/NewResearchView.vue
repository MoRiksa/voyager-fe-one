<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../../stores/researchStore'
import type { ResearchObjectivePreset } from '../../types'
import { createResearchSession, startResearchSession, getResearchSessionFull, getResearchCapabilities, getResearchPresets, getResearchPreview } from '../../services/researchApi'
import { AlertCircle, Check, CheckCircle2 } from '@lucide/vue'

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
const isBank = computed(() => store.presets.find(preset => preset.id === selectedPreset.value)?.contract?.objectiveType === 'bank-evidence')
const request = computed(() => ({ objective: objective.value.trim(), presetId: selectedPreset.value, brief: { market: 'IDX' as const, sectorScope: isBank.value ? 'Perbankan' : 'Semua Sektor', indexScope: 'Semua Indeks', candidateCount: isBank.value ? 8 : candidateCount.value, researchDepth: researchDepth.value, useSectorMetrics: false, optionalDimensions: [], clarificationNotes: [] } }))
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
  <div class="w-full max-w-[96rem] space-y-7 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
    <header class="max-w-2xl">
      <p class="section-kicker">Riset baru</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Tinjauan data bank IDX</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600">Tinjau data ROE dan P/BV bank berkapitalisasi pasar terbesar yang tersedia dari provider.</p>
    </header>

    <!-- Loading: skeleton matching the final two-column form -->
    <div v-if="loading" class="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
      <p role="status" class="sr-only">Memuat kemampuan layanan…</p>
      <div class="space-y-6">
        <div class="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
        <div class="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
      </div>
      <div class="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"></div>
    </div>

    <form v-else data-testid="research-form" class="mt-8 grid gap-6 lg:grid-cols-[1fr_18rem]" @submit.prevent="submit">
      <div class="space-y-6">
        <!-- Primary concern: the objective description the user writes -->
        <section class="rounded-2xl border-2 border-[#2F64A8]/25 bg-white p-6 ring-1 ring-[#2F64A8]/10 sm:p-7">
          <label for="research-objective" class="block text-lg font-bold text-slate-950">Tujuan yang diperiksa</label>
          <p class="mt-1 text-sm leading-6 text-slate-600">Jelaskan dengan bahasa Anda sendiri apa yang ingin diperiksa. Voyager memeriksa deskripsi ini terhadap aturan yang didukung sebelum menjalankannya.</p>
          <textarea
            id="research-objective"
            data-testid="research-objective"
            v-model="objective"
            :disabled="isSubmitting"
            rows="5"
            placeholder="Contoh: Tinjau data ROE dan P/BV bank IDX berkapitalisasi pasar terbesar pada periode yang tersedia."
            :aria-invalid="Boolean(error)"
            :aria-describedby="error ? 'objective-help objective-error' : 'objective-help'"
            class="mt-4 w-full rounded-xl border border-slate-300 p-3.5 text-sm leading-6 text-slate-900 transition-colors placeholder:text-slate-400 focus:border-[#2F64A8] focus:outline-none focus:ring-2 focus:ring-[#2F64A8]/30"
            @input="selectedPreset = 'custom'"
          ></textarea>
          <p id="objective-help" class="mt-2 text-xs leading-5 text-slate-600">Tujuan bebas akan dinilai otomatis. Hanya tujuan yang berstatus didukung di panel kanan yang dapat dijalankan.</p>

          <!-- Quick-fill templates: compact chips, secondary to the field above -->
          <div class="mt-5 border-t border-slate-100 pt-4">
            <p class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Isi cepat dari template</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="preset in store.presets"
                :key="preset.id"
                :data-testid="`preset-${preset.id}`"
                type="button"
                :aria-pressed="selectedPreset === preset.id && objective === preset.objective"
                :disabled="isSubmitting || !preset.supported || preset.availableForNewResearch === false"
                :title="!preset.supported || preset.availableForNewResearch === false ? (preset.availabilityReason || preset.unsupportedReasons?.join(' ')) : preset.objective"
                class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:active:scale-100"
                :class="selectedPreset === preset.id && objective === preset.objective
                  ? 'border-[#2F64A8] bg-[#2F64A8] text-white'
                  : preset.supported && preset.availableForNewResearch !== false
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-[#2F64A8]/50 hover:text-[#2F64A8]'
                    : 'border-slate-200'"
                @click="chooseTemplate(preset)"
              >
                <Check
                  v-if="selectedPreset === preset.id && objective === preset.objective"
                  class="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {{ preset.title }}
              </button>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 class="text-lg font-bold text-slate-950">Cakupan yang didukung</h2>
          <p class="mt-1 text-sm text-slate-600">IDX · {{ isBank ? 'Subsektor Banks' : 'Semua Sektor' }} · Semua Indeks. Tanpa dimensi tambahan.</p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <p v-if="isBank" data-testid="bank-candidate-coverage" class="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><strong class="text-slate-900">Laporan menampilkan hingga 8 bank.</strong><br />Jumlah aktual mengikuti data top-eight yang tersedia.</p>
            <label v-else class="text-sm font-semibold text-slate-900">Batas kandidat<input v-model.number="candidateCount" data-testid="brief-candidate-count" type="number" required :min="capabilities?.candidateCount.minimum" :max="capabilities?.candidateCount.maximum" :disabled="isSubmitting" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 transition-colors focus:border-[#2F64A8] focus:outline-none focus:ring-2 focus:ring-[#2F64A8]/30" /></label>
            <label class="text-sm font-semibold text-slate-900">Penyajian<select v-model="researchDepth" data-testid="brief-depth" :disabled="isSubmitting" class="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 text-slate-900 transition-colors focus:border-[#2F64A8] focus:outline-none focus:ring-2 focus:ring-[#2F64A8]/30"><option v-for="depth in capabilities?.researchDepths" :key="depth">{{ depth }}</option></select></label>
          </div>
          <p class="mt-3 text-xs leading-5 text-slate-600">Data top-eight yang tidak lengkap membuat tujuan berstatus belum dapat dinilai sepenuhnya. Ringkas/Standar tidak mengaktifkan pendalaman.</p>
        </section>
      </div>

      <!-- Secondary: compact tips / contract summary -->
      <aside class="h-fit rounded-xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Aturan sebelum mulai</h2>
        <p v-if="previewLoading" role="status" class="mt-2 text-xs text-slate-600">Memeriksa tujuan…</p>
        <div v-if="preview" data-testid="screening-rule-contract" class="mt-3 space-y-3 text-xs leading-5 text-slate-600">
          <p class="flex items-center gap-1.5 text-sm font-semibold" :class="preview.contract.status === 'supported' ? 'text-emerald-700' : 'text-rose-700'">
            <component :is="preview.contract.status === 'supported' ? CheckCircle2 : AlertCircle" class="size-4 shrink-0" aria-hidden="true" />
            {{ preview.contract.status === 'supported' ? 'Tujuan didukung' : 'Tujuan belum didukung' }}
          </p>
          <ul class="list-disc space-y-1.5 pl-4"><li v-for="criterion in preview.contract.criteria" :key="criterion">{{ criterion }}</li><li v-for="reason in preview.contract.unsupportedReasons" :key="reason">{{ reason }}</li></ul>
          <p>{{ preview.contract.coveragePolicy }}</p>
          <template v-if="isBank"><p>ROE berasal dari earnings / total equity provider dengan basis yang dapat tidak cocok.</p><p>P/BV historis provider belum terverifikasi basis tanggal dan sahamnya.</p></template><p v-else v-for="limitation in preview.contract.limitations" :key="limitation">{{ limitation }}</p>
          <p data-testid="actual-universe" class="rounded-lg bg-slate-50 p-2.5 text-slate-600"><strong class="text-slate-900">Sebelum mulai:</strong> hingga 8 bank diperiksa. Waktu selesai bergantung respons penyedia data. Voyager tidak mengenakan kredit untuk proses ini saat ini.</p>
        </div>
        <p v-else-if="!previewLoading" class="mt-2 text-xs text-slate-600">Tulis atau pilih tujuan untuk memuat kontrak screening.</p>
        <p v-if="error" id="objective-error" data-testid="objective-error" role="alert" class="mt-3 text-xs leading-5 text-rose-700">{{ error }}</p>
        <router-link v-if="createdId" :to="`/research/${createdId}`" class="mt-2 block text-xs font-semibold text-[#2F64A8] underline">Buka sesi yang sudah dibuat</router-link>
        <button type="submit" :disabled="isSubmitting || previewLoading || preview?.contract.status !== 'supported'" :aria-busy="isSubmitting" class="button-primary mt-4 w-full disabled:opacity-50">{{ isSubmitting ? 'Memulai riset…' : 'Mulai riset' }}</button>
        <button v-if="!capabilities" type="button" class="button-secondary mt-3 w-full" @click="load">Coba muat ulang</button>
      </aside>
    </form>
  </div>
</template>
