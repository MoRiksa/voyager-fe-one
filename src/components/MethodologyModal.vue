<script setup lang="ts">
import { defineAsyncComponent, nextTick, ref, watch } from 'vue'
import { useResearchStore } from '../stores/researchStore'
const MethodologyView = defineAsyncComponent(() => import('../views/MethodologyView.vue'))
const store = useResearchStore()
const dialog = ref<HTMLDialogElement>()
let previousFocus: HTMLElement | null = null
watch(() => store.isMethodologyModalOpen, async open => {
  if (open) { previousFocus = document.activeElement as HTMLElement; await nextTick(); dialog.value?.showModal() }
  else { dialog.value?.close(); previousFocus?.focus() }
})
</script>
<template><dialog ref="dialog" aria-label="Cara penilaian" class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-2xl bg-white p-4 text-slate-900 backdrop:bg-slate-900/60" @close="store.closeMethodology" @cancel="store.closeMethodology"><button type="button" autofocus class="button-secondary" @click="store.closeMethodology">Tutup metodologi</button><MethodologyView /></dialog></template>
