<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ChevronDown, Search, Check, X } from '@lucide/vue'

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  badge?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    options: (SelectOption | string)[]
    placeholder?: string
    searchPlaceholder?: string
  }>(),
  {
    placeholder: 'Pilih...',
    searchPlaceholder: 'Cari...'
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

// Normalize options to SelectOption objects
const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => opt.value === props.modelValue)
})

const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return normalizedOptions.value
  return normalizedOptions.value.filter(opt => {
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(query)) ||
      opt.value.toLowerCase().includes(query)
    )
  })
})

const toggleDropdown = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    await nextTick()
    searchInputRef.value?.focus()
  }
}

const selectOption = (opt: SelectOption) => {
  emit('update:modelValue', opt.value)
  isOpen.value = false
  searchQuery.value = ''
}

const handleOutsideClick = (e: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div ref="containerRef" class="relative inline-block text-xs">
    <!-- Trigger Button -->
    <button
      type="button"
      class="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-all hover:border-slate-300 hover:bg-white focus:border-[#244F87] focus:bg-white focus:outline-hidden"
      :class="{ 'border-[#244F87] ring-1 ring-[#244F87]/20 bg-white shadow-xs': isOpen }"
      :aria-expanded="isOpen"
      @click="toggleDropdown"
    >
      <div class="flex items-center gap-1.5 min-w-0 truncate">
        <slot name="icon" />
        <span class="truncate font-semibold text-slate-800">
          {{ selectedOption?.label || placeholder }}
        </span>
      </div>
      <ChevronDown
        class="size-3.5 text-slate-400 shrink-0 transition-transform duration-150"
        :class="{ 'rotate-180 text-[#244F87]': isOpen }"
        aria-hidden="true"
      />
    </button>

    <!-- Floating Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute left-0 z-50 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-900/5 transition-all"
      role="listbox"
    >
      <!-- Search Input -->
      <div class="relative mb-1.5">
        <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" aria-hidden="true" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-7 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-[#244F87] focus:bg-white focus:outline-hidden"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label="Hapus pencarian"
          @click="searchQuery = ''; searchInputRef?.focus()"
        >
          <X class="size-3" aria-hidden="true" />
        </button>
      </div>

      <!-- Option List -->
      <div class="max-h-56 overflow-y-auto space-y-0.5">
        <button
          v-for="opt in filteredOptions"
          :key="opt.value"
          type="button"
          class="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors"
          :class="opt.value === modelValue ? 'bg-blue-50/80 text-[#1E4270] font-semibold' : 'text-slate-700 hover:bg-slate-100'"
          role="option"
          :aria-selected="opt.value === modelValue"
          @click="selectOption(opt)"
        >
          <div class="min-w-0 pr-2">
            <div class="truncate">{{ opt.label }}</div>
            <div v-if="opt.sublabel" class="text-[10px] text-slate-400 truncate">{{ opt.sublabel }}</div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span v-if="opt.badge" class="rounded bg-slate-100 px-1.5 py-0.2 font-mono text-[9px] font-bold text-slate-600">
              {{ opt.badge }}
            </span>
            <Check v-if="opt.value === modelValue" class="size-3.5 text-[#244F87]" aria-hidden="true" />
          </div>
        </button>

        <!-- Empty state when no matches -->
        <div v-if="filteredOptions.length === 0" class="py-3 text-center text-xs text-slate-400">
          Tidak ada hasil untuk "{{ searchQuery }}"
        </div>
      </div>
    </div>
  </div>
</template>
