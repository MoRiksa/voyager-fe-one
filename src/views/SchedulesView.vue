<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResearchStore } from '../stores/researchStore'
import {
  Clock,
  Calendar,
  Play,
  Plus,
  Check,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X
} from '@lucide/vue'

const store = useResearchStore()
const router = useRouter()

const isCreateModalOpen = ref(false)
const newName = ref('')
const newObjective = ref('')
const newCron = ref('0 8 * * 1-5')
const newMarket = ref<'IDX' | 'SGX'>('IDX')
const newCandidates = ref(5)
const isSubmitting = ref(false)
const selectedPresetId = ref<string>('obj-banking-moat')

onMounted(() => {
  void store.fetchSchedules()
})

const activeTaskCount = computed(() => store.schedules.filter(t => t.enabled).length)

const choosePresetForSchedule = (preset: any) => {
  selectedPresetId.value = preset.id
  newName.value = preset.title
  newObjective.value = preset.objective
  newCandidates.value = preset.expectedCandidates || 5
}

const handleToggle = async (id: string, currentEnabled: boolean) => {
  await store.toggleSchedule(id, !currentEnabled)
}

const handleRunNow = async (id: string) => {
  const result = await store.runScheduleNow(id)
  if (result?.session?.id) {
    router.push(`/research/${result.session.id}`)
  }
}

const handleCreateSubmit = async () => {
  if (!newName.value.trim() || !newObjective.value.trim()) return
  isSubmitting.value = true
  try {
    await store.createSchedule({
      name: newName.value.trim(),
      objective: newObjective.value.trim(),
      cronExpression: newCron.value.trim(),
      market: newMarket.value,
      requestedCandidates: newCandidates.value,
      enabled: true
    })
    isCreateModalOpen.value = false
    newName.value = ''
    newObjective.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <!-- Header matching NewResearchView.vue -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="max-w-3xl">
        <p class="section-kicker">Otomasi & Cron Triggers</p>
        <h1 class="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl flex items-center gap-3">
          <span>Riset Terjadwal</span>
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
            Batch 9 Scheduler Active
          </span>
        </h1>
        <p class="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Jalankan analisis fundamental kuantitatif secara berkala. Background worker akan mengeksekusi pipeline 5-step dan mempublikasikan laporan otomatis pada interval yang ditentukan.
        </p>
      </div>

      <button
        @click="isCreateModalOpen = true"
        type="button"
        class="button-primary min-h-11 shrink-0 px-5 text-sm font-semibold shadow-sm"
      >
        <Plus class="h-4 w-4" />
        <span>Tambah Jadwal Riset</span>
      </button>
    </header>

    <!-- Main Grid: Task List & Sticky Summary Sidebar -->
    <div class="mt-8 grid gap-6 lg:grid-cols-[1fr_19rem]">
      <!-- Left Column: Task Cards -->
      <div class="space-y-6">
        <!-- Section: Active Tasks -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-950">Daftar Riset Terjadwal</h2>
              <p class="mt-0.5 text-xs text-slate-500">Tugas yang aktif akan dipicu otomatis sesuai jadwal ekspresi Cron yang dikonfigurasi.</p>
            </div>
            <span class="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#2F64A8]">
              {{ activeTaskCount }} dari {{ store.schedules.length }} Tugas Aktif
            </span>
          </div>

          <div v-if="store.schedules.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Clock class="mx-auto h-8 w-8 text-slate-400" />
            <p class="mt-2 text-sm font-semibold text-slate-700">Belum Ada Riset Terjadwal</p>
            <p class="mt-1 text-xs text-slate-500">Klik tombol "Tambah Jadwal Riset" untuk membuat otomatisasi baru.</p>
          </div>

          <div class="space-y-4">
            <div
              v-for="task in store.schedules"
              :key="task.id"
              class="rounded-2xl border bg-white p-5 shadow-sm sm:p-6 transition-all duration-150"
              :class="task.enabled ? 'border-slate-200 hover:border-[#407EC9]/50' : 'border-slate-200 opacity-75 bg-slate-50/50'"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#2F64A8] font-mono">{{ task.market }}</span>
                    <h3 class="text-base font-bold text-slate-950">{{ task.name }}</h3>
                    <span
                      class="rounded px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
                      :class="task.enabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ task.enabled ? 'Aktif' : 'Non-aktif' }}
                    </span>
                  </div>
                  <p class="text-xs leading-5 text-slate-600">{{ task.objective }}</p>
                </div>

                <!-- Control Buttons -->
                <div class="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    @click="handleToggle(task.id, task.enabled)"
                    type="button"
                    class="rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-150"
                    :class="task.enabled ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100' : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'"
                  >
                    {{ task.enabled ? 'Non-aktifkan' : 'Aktifkan' }}
                  </button>

                  <button
                    @click="handleRunNow(task.id)"
                    type="button"
                    class="button-primary min-h-9 px-3.5 text-xs font-semibold shadow-sm"
                  >
                    <Play class="h-3.5 w-3.5 fill-current" />
                    <span>Jalankan Seketika</span>
                  </button>
                </div>
              </div>

              <!-- Task Metadata Bar -->
              <div class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3.5 text-xs sm:grid-cols-4 font-mono">
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Jadwal Cron</span>
                  <span class="font-bold text-slate-800 flex items-center gap-1">
                    <Clock class="h-3 w-3 text-[#2F64A8]" />
                    {{ task.cronExpression }}
                  </span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Total Eksekusi</span>
                  <span class="font-semibold text-slate-800">{{ task.runCount }}x selesai</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Eksekusi Terakhir</span>
                  <span class="text-slate-700">{{ task.lastRunAt ? new Date(task.lastRunAt).toLocaleDateString('id-ID') : 'Belum pernah' }}</span>
                </div>
                <div>
                  <span class="text-[10px] font-bold text-slate-400 block uppercase">Jadwal Berikutnya</span>
                  <span class="text-slate-700">{{ task.nextRunAt ? new Date(task.nextRunAt).toLocaleDateString('id-ID') : '-' }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Information Card -->
        <section class="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <ShieldCheck class="h-5 w-5 text-[#2F64A8] shrink-0 mt-0.5" />
            <div class="space-y-1 text-xs leading-5 text-slate-700">
              <h4 class="font-bold text-slate-950 text-sm">Mekanisme Background Worker & Idempotency</h4>
              <p>Setiap eksekusi jadwal menggunakan <strong>Message Queue (Batch 7)</strong> secara asinkron dengan garansi <strong>Idempotency Key (Batch 8)</strong> untuk mencegah duplikasi sesi. Hasil riset dipersisikan ke <strong>Session DB (Batch 6)</strong> dan dipancarkan melalui <strong>SSE Realtime (Batch 5)</strong>.</p>
            </div>
          </div>
        </section>
      </div>

      <!-- Right Column: Sticky Summary Sidebar matching NewResearchView.vue -->
      <aside class="h-fit rounded-2xl border border-slate-200 bg-[#102138] p-5 text-white shadow-xl lg:sticky lg:top-24 space-y-4">
        <div class="flex items-center gap-2">
          <SlidersHorizontal class="h-5 w-5 text-blue-200" />
          <h2 class="text-lg font-bold">Ringkasan Otomasi</h2>
        </div>

        <dl class="space-y-4 text-xs">
          <div>
            <dt class="text-slate-400">Total Tugas Terdaftar</dt>
            <dd class="mt-1 font-semibold text-base text-white">{{ store.schedules.length }} Tugas</dd>
          </div>
          <div>
            <dt class="text-slate-400">Mode Eksekusi</dt>
            <dd class="mt-1 font-semibold text-emerald-300 flex items-center gap-1.5">
              <Sparkles class="h-3.5 w-3.5" />
              Background Worker Async (202 Accepted)
            </dd>
          </div>
          <div>
            <dt class="text-slate-400">Persistensi DB</dt>
            <dd class="mt-1 font-semibold text-white">FilePersistentResearchRepository (Batch 6)</dd>
          </div>
          <div>
            <dt class="text-slate-400">Jalur Audit</dt>
            <dd class="mt-1 font-semibold text-white">Immutable Provenance Trail (Batch 3)</dd>
          </div>
        </dl>

        <div class="border-t border-slate-700 pt-4">
          <button
            @click="isCreateModalOpen = true"
            type="button"
            class="button-primary min-h-11 w-full text-xs font-bold shadow-md"
          >
            <Plus class="h-4 w-4" />
            <span>Buat Jadwal Riset Baru</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- Create Schedule Modal Styled like NewResearchView Cards -->
    <div v-if="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div>
            <p class="section-kicker">Konfigurasi Riset Terjadwal</p>
            <h2 class="text-xl font-bold text-slate-950 mt-0.5">Tambah Otomasi Jadwal Baru</h2>
          </div>
          <button @click="isCreateModalOpen = false" class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Template Selector Chips -->
        <div>
          <label class="block text-xs font-bold text-slate-900 mb-2">Pilih Template Aturan Preset</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="preset in store.presets"
              :key="preset.id"
              type="button"
              class="rounded-xl border p-3 text-left transition-all duration-150 text-xs"
              :class="selectedPresetId === preset.id ? 'border-[#407EC9] bg-blue-50/60 ring-2 ring-[#407EC9]/15 font-bold text-slate-950' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
              @click="choosePresetForSchedule(preset)"
            >
              <div class="flex items-center justify-between">
                <span class="font-semibold text-[#2F64A8] text-[11px]">{{ preset.category }}</span>
                <CheckCircle2 v-if="selectedPresetId === preset.id" class="h-3.5 w-3.5 text-[#407EC9]" />
              </div>
              <p class="mt-1 font-bold text-slate-900 truncate">{{ preset.title }}</p>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleCreateSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-900 mb-1">Nama Tugas Riset</label>
            <input
              v-model="newName"
              type="text"
              required
              placeholder="Contoh: Monthly Banking Quality Audit"
              class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 focus:border-[#2F64A8] focus:outline-none"
            />
          </div>

          <div>
            <label class="block font-bold text-slate-900 mb-1">Tujuan Riset (Objective Teks)</label>
            <textarea
              v-model="newObjective"
              rows="3"
              required
              placeholder="Jelaskan kriteria fundamental..."
              class="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 focus:border-[#2F64A8] focus:outline-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-slate-900 mb-1">Pasar</label>
              <select v-model="newMarket" class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 font-semibold">
                <option value="IDX">IDX (Indonesia)</option>
                <option value="SGX">SGX (Singapore)</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-900 mb-1">Cron Expression</label>
              <input
                v-model="newCron"
                type="text"
                required
                class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 font-mono text-slate-900"
              />
            </div>
            <div>
              <label class="block font-bold text-slate-900 mb-1">Target Kandidat</label>
              <select v-model.number="newCandidates" class="w-full min-h-10 rounded-xl border border-slate-300 bg-white px-3 text-slate-900">
                <option :value="3">3 Kandidat</option>
                <option :value="5">5 Kandidat</option>
                <option :value="10">10 Kandidat</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              @click="isCreateModalOpen = false"
              type="button"
              class="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="button-primary min-h-10 px-5 font-bold disabled:opacity-50"
            >
              <Plus class="h-4 w-4" />
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Schedule' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
