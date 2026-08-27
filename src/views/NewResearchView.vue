<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import type { ResearchObjectivePreset } from '../types'
import { ArrowRight, Check, Clock3, Coins, Search, SlidersHorizontal } from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()
const objective = ref(store.currentObjective)
const selectedPreset = ref(store.activePresetId)
const depth = ref<'quick' | 'standard' | 'deep'>('standard')
const error = ref('')

const selectedTemplate = computed(() => store.presets.find(preset => preset.id === selectedPreset.value))
const estimate = computed(() => depth.value === 'quick' ? { time: '2-3 menit', credits: 60 } : depth.value === 'deep' ? { time: '8-10 menit', credits: 220 } : { time: '4-6 menit', credits: 120 })

const chooseTemplate = (preset: ResearchObjectivePreset) => {
  selectedPreset.value = preset.id
  objective.value = preset.objective
  store.selectPreset(preset)
  error.value = ''
}

const submit = async () => {
  if (objective.value.trim().length < 20) {
    error.value = 'Jelaskan tujuan riset dengan sedikitnya 20 karakter agar ruang lingkupnya dapat disusun.'
    return
  }
  error.value = ''
  store.setObjective(objective.value.trim(), selectedPreset.value)
  store.activePlan.objective = objective.value.trim()
  const sessionId = store.createSession()
  void store.runAutonomousResearch()
  await router.push(`/research/${sessionId}`)
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header class="max-w-3xl">
      <p class="section-kicker">Riset baru</p>
      <h1 class="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Susun tujuan sebelum riset dimulai</h1>
      <p class="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Berikan konteks yang cukup agar ruang lingkup, kriteria, dan kedalaman riset sesuai dengan pertanyaan Anda.</p>
    </header>

    <form class="mt-8 grid gap-6 lg:grid-cols-[1fr_19rem]" @submit.prevent="submit">
      <div class="space-y-6">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <label for="research-objective" class="text-sm font-bold text-slate-900">Apa yang ingin Anda teliti?</label>
          <p id="objective-help" class="mt-1 text-xs leading-5 text-slate-500">Jelaskan karakteristik perusahaan, sektor, atau keputusan riset yang ingin dibantu.</p>
          <textarea
            id="research-objective"
            v-model="objective"
            rows="5"
            aria-describedby="objective-help objective-error"
            :aria-invalid="Boolean(error)"
            class="mt-4 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#407EC9] focus:ring-4 focus:ring-[#407EC9]/10"
            placeholder="Contoh: Temukan lima perusahaan consumer Indonesia dengan pertumbuhan laba konsisten, neraca sehat, dan valuasi di bawah median sektornya."
          ></textarea>
          <p v-if="error" id="objective-error" role="alert" class="mt-2 text-sm font-medium text-rose-700">{{ error }}</p>
        </section>

        <section aria-labelledby="template-title">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 id="template-title" class="text-lg font-bold text-slate-950">Template riset</h2>
              <p class="mt-1 text-xs text-slate-500">Pilih sebagai titik awal, lalu sesuaikan tujuan Anda.</p>
            </div>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="preset in store.presets"
              :key="preset.id"
              type="button"
              :aria-pressed="selectedPreset === preset.id"
              class="min-h-32 rounded-2xl border p-5 text-left transition-[border-color,background-color,transform] duration-150 active:scale-[0.98]"
              :class="selectedPreset === preset.id ? 'border-[#407EC9] bg-[#407EC9]/5 ring-2 ring-[#407EC9]/15' : 'border-slate-200 bg-white hover:border-slate-300'"
              @click="chooseTemplate(preset)"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="text-xs font-semibold text-[#2F64A8]">{{ preset.category }}</span>
                <Check v-if="selectedPreset === preset.id" class="h-4 w-4 text-[#407EC9]" />
              </div>
              <h3 class="mt-2 text-sm font-bold leading-5 text-slate-950">{{ preset.title }}</h3>
              <p class="mt-2 text-xs leading-5 text-slate-500">{{ preset.universe }}</p>
            </button>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 class="text-lg font-bold text-slate-950">Kedalaman riset</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <label v-for="option in [
              { value: 'quick', title: 'Penyaringan cepat', text: 'Ringkasan kandidat dan metrik utama.' },
              { value: 'standard', title: 'Riset standar', text: 'Analisis, perbandingan, dan laporan.' },
              { value: 'deep', title: 'Perbandingan mendalam', text: 'Lebih banyak evidence dan peer review.' }
            ]" :key="option.value" class="cursor-pointer rounded-xl border p-4" :class="depth === option.value ? 'border-[#407EC9] bg-[#407EC9]/5' : 'border-slate-200'">
              <input v-model="depth" type="radio" name="depth" :value="option.value" class="sr-only" />
              <span class="block text-sm font-bold text-slate-900">{{ option.title }}</span>
              <span class="mt-1 block text-xs leading-5 text-slate-500">{{ option.text }}</span>
            </label>
          </div>
        </section>
      </div>

      <aside class="h-fit rounded-2xl border border-slate-200 bg-[#102138] p-5 text-white shadow-xl lg:sticky lg:top-24">
        <SlidersHorizontal class="h-5 w-5 text-blue-200" />
        <h2 class="mt-4 text-lg font-bold">Ringkasan riset</h2>
        <dl class="mt-5 space-y-4 text-sm">
          <div>
            <dt class="text-xs text-slate-400">Ruang lingkup</dt>
            <dd class="mt-1 font-semibold">{{ selectedTemplate?.universe || 'Seluruh Bursa Efek Indonesia' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-400">Target hasil</dt>
            <dd class="mt-1 font-semibold">{{ selectedTemplate?.expectedCandidates || 5 }} kandidat</dd>
          </div>
          <div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div><dt class="flex items-center gap-1 text-xs text-slate-400"><Clock3 class="h-3.5 w-3.5" /> Estimasi</dt><dd class="mt-1 font-mono font-bold">{{ estimate.time }}</dd></div>
            <div><dt class="flex items-center gap-1 text-xs text-slate-400"><Coins class="h-3.5 w-3.5" /> Kredit</dt><dd class="mt-1 font-mono font-bold">~{{ estimate.credits }}</dd></div>
          </div>
        </dl>
        <button type="submit" class="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#407EC9] px-5 text-sm font-bold text-white transition-[background-color,transform] hover:bg-[#2F64A8] active:scale-[0.98]">
          <Search class="h-4 w-4" />
          Mulai riset
          <ArrowRight class="h-4 w-4" />
        </button>
        <p class="mt-3 text-xs leading-5 text-slate-400">Anda dapat meninjau progress dan hasil sementara dari halaman sesi.</p>
      </aside>
    </form>
  </div>
</template>
