<script setup lang="ts">
import { defineAsyncComponent, nextTick, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
import { X, BookOpen } from '@lucide/vue'
import { handleDialogBackdropClick } from '../utils/dialog'

const MethodologyView = defineAsyncComponent(() => import('../views/PGS_Docs/MethodologyView.vue'))
const store = useResearchStore()
const dialog = ref<HTMLDialogElement>()
let previousFocus: HTMLElement | null = null

watch(() => store.isMethodologyModalOpen, async open => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement
    await nextTick()
    dialog.value?.showModal()
  } else {
    dialog.value?.close()
    previousFocus?.focus()
  }
})
</script>

<template>
  <dialog
    ref="dialog"
    aria-label="Cara penilaian"
    class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/15"
    @click="event => handleDialogBackdropClick(event, store.closeMethodology)"
    @close="store.closeMethodology"
    @cancel="store.closeMethodology"
  >
    <!-- Sticky Header -->
    <header class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#244F87] border border-blue-100">
          <BookOpen class="h-4 w-4" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-900">Metodologi Riset & Penilaian</h2>
          <p class="text-xs text-slate-500">Prinsip evaluasi dan batas pembuktian data finansial</p>
        </div>
      </div>

      <button
        type="button"
        autofocus
        class="button-secondary"
        @click="store.closeMethodology"
      >
        <X class="h-4 w-4" />
        <span>Tutup metodologi</span>
      </button>
    </header>

    <!-- Modal Content -->
    <div class="p-2 sm:p-4">
      <MethodologyView />
    </div>
  </dialog>
</template>
