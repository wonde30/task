<template>
  <div ref="referenceEl">
    <button
      ref="triggerBtn"
      @click.stop="open ? close() : openMenu()"
      @keydown.enter.stop.prevent="open ? close() : openMenu()"
      @keydown.space.stop.prevent="open ? close() : openMenu()"
      class="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      :aria-label="`Actions for ${task.title}`"
      :aria-expanded="open"
      aria-haspopup="menu"
    >
      <MoreHorizontal class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>

  <Teleport to="body">
    <Transition name="dropdown">
      <div
        v-if="open"
        ref="floatingEl"
        :style="floatingStyles"
        class="z-dropdown w-44 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-lg"
        role="menu"
        :aria-label="`Actions for ${task.title}`"
        @click.stop
        @keydown="onMenuKeydown"
      >
        <button
          v-for="item in menuItems"
          :key="item.key"
          :ref="el => setItemRef(el, item.key)"
          @click="item.action(); close()"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors focus:outline-none"
          :class="item.danger
            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus-visible:bg-rose-50 dark:focus-visible:bg-rose-950/40'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:bg-slate-50 dark:focus-visible:bg-slate-700'"
          role="menuitem"
          :tabindex="open ? 0 : -1"
        >
          <Pencil       v-if="item.icon === 'Pencil'"        class="h-3.5 w-3.5 shrink-0" :class="item.danger ? '' : 'text-slate-400 dark:text-slate-500'" aria-hidden="true" />
          <Copy         v-else-if="item.icon === 'Copy'"         class="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <CheckCircle2 v-else-if="item.icon === 'CheckCircle2'" class="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <RotateCcw    v-else-if="item.icon === 'RotateCcw'"    class="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          <Trash2       v-else-if="item.icon === 'Trash2'"       class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {{ item.label }}
        </button>

        <!-- Separator before Delete -->
        <div class="my-1 h-px bg-slate-100 dark:bg-slate-700" role="separator" />

        <button
          ref="deleteItemRef"
          @click="emit('delete'); close()"
          class="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:outline-none focus-visible:bg-rose-50 dark:focus-visible:bg-rose-950/40 transition-colors"
          role="menuitem"
          :tabindex="open ? 0 : -1"
        >
          <Trash2 class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Delete
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useFloating, flip, shift, offset, autoUpdate } from '@floating-ui/vue'
import { MoreHorizontal, Pencil, Copy, CheckCircle2, RotateCcw, Trash2 } from '@lucide/vue'

const props = defineProps<{
  task: { title: string; status: string }
}>()

const emit = defineEmits<{
  edit: []
  duplicate: []
  'toggle-complete': []
  delete: []
}>()

const open = ref(false)
const referenceEl = ref<HTMLElement>()
const floatingEl = ref<HTMLElement>()
const triggerBtn = ref<HTMLButtonElement>()
const deleteItemRef = ref<HTMLButtonElement>()

const itemRefs = ref<Record<string, HTMLButtonElement>>({})
function setItemRef(el: unknown, key: string) {
  if (el instanceof HTMLButtonElement) itemRefs.value[key] = el
}

const menuItems = computed(() => [
  { key: 'edit', icon: 'Pencil', label: 'Edit', danger: false, action: () => emit('edit') },
  { key: 'dup', icon: 'Copy', label: 'Duplicate', danger: false, action: () => emit('duplicate') },
  {
    key: 'toggle',
    icon: props.task.status === 'completed' ? 'RotateCcw' : 'CheckCircle2',
    label: props.task.status === 'completed' ? 'Reopen' : 'Mark done',
    danger: false,
    action: () => emit('toggle-complete'),
  },
])

function getFocusableItems(): HTMLButtonElement[] {
  const items = menuItems.value
    .map(m => itemRefs.value[m.key])
    .filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement)
  if (deleteItemRef.value) items.push(deleteItemRef.value)
  return items
}

const { floatingStyles, update } = useFloating(referenceEl, floatingEl, {
  placement: 'bottom-end',
  middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
})

function openMenu() {
  document.dispatchEvent(new CustomEvent('close-all-menus'))
  open.value = true
  requestAnimationFrame(() => {
    update()
    nextTick(() => getFocusableItems()[0]?.focus())
  })
}

function close(restoreFocus = true) {
  const wasOpen = open.value
  open.value = false
  if (wasOpen && restoreFocus) {
    triggerBtn.value?.focus()
  }
}

function onMenuKeydown(e: KeyboardEvent) {
  const items = getFocusableItems()
  const idx = items.indexOf(document.activeElement as HTMLButtonElement)

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    items[(idx + 1) % items.length]?.focus()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    items[(idx - 1 + items.length) % items.length]?.focus()
  } else if (e.key === 'Escape') {
    e.stopPropagation()
    close(true)
  } else if (e.key === 'Tab') {
    e.preventDefault()
    if (e.shiftKey) {
      items[(idx - 1 + items.length) % items.length]?.focus()
    } else {
      items[(idx + 1) % items.length]?.focus()
    }
  }
}

function onClickOutside(e: MouseEvent) {
  if (!open.value) return
  const t = e.target as Node
  if (referenceEl.value?.contains(t) || floatingEl.value?.contains(t)) return
  close(false)
}

function onCloseAll() {
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, { capture: true })
  document.addEventListener('close-all-menus', onCloseAll)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, { capture: true })
  document.removeEventListener('close-all-menus', onCloseAll)
})
</script>

<style scoped>
.dropdown-enter-active {
  transition: opacity 0.1s ease, transform 0.12s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-leave-active {
  transition: opacity 0.08s ease, transform 0.08s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
