<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { X } from '@lucide/vue'
import { handleDialogBackdropClick } from '../utils/dialog'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    description?: string
    maxWidthClass?: string
    showCloseButton?: boolean
    ariaLabel?: string
  }>(),
  {
    title: '',
    description: '',
    maxWidthClass: 'max-w-lg',
    showCloseButton: true,
    ariaLabel: 'Modal dialog'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)
let previousFocus: HTMLElement | null = null

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

watch(
  () => props.modelValue,
  async isOpen => {
    if (isOpen) {
      previousFocus = document.activeElement as HTMLElement | null
      await nextTick()
      dialogRef.value?.showModal()
    } else {
      dialogRef.value?.close()
      previousFocus?.focus?.()
    }
  }
)

const onBackdropClick = (event: MouseEvent) => {
  handleDialogBackdropClick(event, close)
}
</script>

<template>
  <dialog
    ref="dialogRef"
    :aria-label="ariaLabel"
    class="m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-0 text-slate-900 shadow-2xl shadow-slate-900/15"
    :class="maxWidthClass"
    @click="onBackdropClick"
    @cancel="close"
  >
    <div v-if="title || showCloseButton" class="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
      <div class="min-w-0">
        <h3 v-if="title" class="text-lg font-bold text-slate-900">{{ title }}</h3>
        <p v-if="description" class="mt-1 text-xs text-slate-600">{{ description }}</p>
      </div>
      <button
        v-if="showCloseButton"
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Tutup modal"
        @click="close"
      >
        <X class="size-4" />
      </button>
    </div>
    <div class="p-6">
      <slot :close="close" />
    </div>
  </dialog>
</template>
