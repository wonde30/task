<template>
  <div class="space-y-4">

    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {{ store.catPagination.total }}
        {{ store.catPagination.total === 1 ? 'category' : 'categories' }}
      </p>
      <div class="flex items-center gap-2">
        <div class="flex h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <button
            @click="view = 'grid'"
            class="flex w-8 items-center justify-center rounded-l-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            :class="view === 'grid'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
            title="Grid view"
            aria-label="Grid view"
            :aria-pressed="view === 'grid'"
          >
            <LayoutGrid class="h-3.5 w-3.5" />
          </button>
          <button
            @click="view = 'table'"
            class="flex w-8 items-center justify-center rounded-r-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
            :class="view === 'table'
              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
            title="Table view"
            aria-label="Table view"
            :aria-pressed="view === 'table'"
          >
            <List class="h-3.5 w-3.5" />
          </button>
        </div>

        <button @click="openForm()" class="btn-primary btn-sm">
          <Plus class="h-3.5 w-3.5" />
          New category
        </button>
      </div>
    </div>

    <div
      v-if="!store.categories.length"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-20 text-center"
    >
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
        <Tag class="h-6 w-6 text-slate-400 dark:text-slate-500" :stroke-width="1.5" />
      </div>
      <p class="text-sm font-medium text-slate-700 dark:text-slate-300">No categories yet</p>
      <p class="mt-1 text-xs text-slate-400 dark:text-slate-500 max-w-[220px]">
        Categories help you group tasks by theme or project.
      </p>
      <button @click="openForm()" class="btn-primary btn-sm mt-4">
        <Plus class="h-3.5 w-3.5" />
        Create category
      </button>
    </div>

    <!-- ── Grid view ─────────────────────────────────────────────── -->
    <div v-else-if="view === 'grid'" class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="cat in store.categories"
        :key="cat.id"
        class="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors overflow-hidden"
      >
        <div class="absolute left-0 inset-y-0 w-1" :style="{ background: cat.color }" />
        <div class="flex items-center justify-between pl-3">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              :style="{ background: cat.color }"
            >
              {{ cat.name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <input
                v-if="isEditing(`cat-name-${cat.id}`)"
                :ref="setInputRef"
                v-model="editValue"
                @keydown.enter.prevent="saveEdit(`cat-name-${cat.id}`, cat.name, newName => store.patchCategoryName(cat.id, newName))"
                @keydown.escape.prevent="cancelEdit"
                @blur="saveEdit(`cat-name-${cat.id}`, cat.name, newName => store.patchCategoryName(cat.id, newName))"
                class="w-full text-sm font-medium rounded border border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <p
                v-else
                @dblclick="startEdit(`cat-name-${cat.id}`, cat.name)"
                class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer"
                title="Double click to edit category name"
              >
                {{ cat.name }}
              </p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {{ cat.tasks_count || 0 }}
                {{ cat.tasks_count === 1 ? 'task' : 'tasks' }}
              </p>
            </div>
          </div>
          <div class="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <button @click="openForm(cat)" class="btn-ghost btn-sm p-1.5" title="Edit">
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button
              @click="handleDelete(cat)"
              class="btn-ghost btn-sm p-1.5 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Delete"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Table view ─────────────────────────────────────────────── -->
    <div v-else class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <table class="w-full text-sm" role="table" aria-label="Categories">
        <thead>
          <tr class="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 w-10">#</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400">Color</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400">Tasks</th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 w-24">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
          <tr
            v-for="(cat, idx) in store.categories"
            :key="cat.id"
            class="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
          >
            <td class="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
              {{ (currentPage - 1) * store.catPagination.per_page + idx + 1 }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
                  :style="{ background: cat.color }"
                >
                  {{ cat.name.charAt(0).toUpperCase() }}
                </div>
                <input
                  v-if="isEditing(`cat-name-table-${cat.id}`)"
                  :ref="setInputRef"
                  v-model="editValue"
                  @keydown.enter.prevent="saveEdit(`cat-name-table-${cat.id}`, cat.name, newName => store.patchCategoryName(cat.id, newName))"
                  @keydown.escape.prevent="cancelEdit"
                  @blur="saveEdit(`cat-name-table-${cat.id}`, cat.name, newName => store.patchCategoryName(cat.id, newName))"
                  class="px-2 py-0.5 text-sm font-medium rounded border border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span
                  v-else
                  @dblclick="startEdit(`cat-name-table-${cat.id}`, cat.name)"
                  class="font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
                  title="Double click to edit category name"
                >
                  {{ cat.name }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="h-4 w-4 rounded-full border border-black/10 dark:border-white/10 shrink-0" :style="{ background: cat.color }" />
                <span class="text-xs font-mono text-slate-400 dark:text-slate-500">{{ cat.color }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-right">
              <span class="inline-flex items-center justify-center min-w-[2rem] rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                {{ cat.tasks_count || 0 }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openForm(cat)"
                  class="btn-ghost btn-sm p-1.5"
                  title="Edit"
                  :aria-label="`Edit ${cat.name}`"
                >
                  <Pencil class="h-3.5 w-3.5" />
                </button>
                <button
                  @click="handleDelete(cat)"
                  class="btn-ghost btn-sm p-1.5 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete"
                  :aria-label="`Delete ${cat.name}`"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Pagination ─────────────────────────────────────────────── -->
    <div
      v-if="store.catPagination.last_page > 1"
      class="flex items-center justify-between pt-2"
    >
      <p class="text-xs text-slate-400 dark:text-slate-500">
        Page {{ store.catPagination.current_page }} of {{ store.catPagination.last_page }}
        · {{ store.catPagination.total }} total
      </p>
      <div class="flex gap-1">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn-secondary btn-sm px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === store.catPagination.last_page"
          class="btn-secondary btn-sm px-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <!-- ── Create / Edit Modal ───────────────────────────────────── -->
    <Transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 z-modal flex items-center justify-center bg-black/20 dark:bg-black/50 px-4"
        @click.self="closeForm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cat-modal-title"
      >
        <div class="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xl animate-slide-up">
          <div class="flex items-center justify-between mb-4">
            <h2 id="cat-modal-title" class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {{ editing ? 'Edit category' : 'New category' }}
            </h2>
            <button
              @click="closeForm"
              class="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <form @submit.prevent="saveCategory" novalidate class="space-y-4">
            <div>
              <label class="label" for="cat-name">
                Name <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span>
              </label>
              <input
                id="cat-name"
                v-model="form.name"
                @blur="touch('name')"
                @input="touched.name && validateName()"
                class="input"
                :class="errors.name
                  ? 'input-error'
                  : (touched.name && !errors.name && form.name.trim()
                      ? 'input-success'
                      : '')"
                placeholder="e.g. Work, Personal, Health"
                autocomplete="off"
                maxlength="50"
                :aria-invalid="!!errors.name"
                :aria-describedby="errors.name ? 'cat-name-err' : undefined"
              />
              <div class="mt-1.5 flex items-center justify-between min-h-[20px]">
                <p v-if="errors.name" id="cat-name-err" role="alert" class="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                  <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {{ errors.name }}
                </p>
                <span v-else />
                <span
                  class="text-2xs tabular-nums font-medium"
                  :class="form.name.length > 40 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'"
                >{{ form.name.length }}/50</span>
              </div>
            </div>

            <div>
              <label class="label">Color</label>
              <div class="flex flex-wrap gap-2 mt-1.5">
                <button
                  v-for="color in CATEGORY_COLORS"
                  :key="color"
                  type="button"
                  @click="form.color = color"
                  class="h-7 w-7 rounded-md border-2 transition-all hover:scale-105"
                  :class="form.color === color
                    ? 'border-slate-800 dark:border-slate-200 scale-110 ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-800'
                    : 'border-transparent'"
                  :style="{ background: color }"
                  :aria-label="`Select color ${color}`"
                />
              </div>
            </div>

            <div class="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 px-3 py-2.5">
              <div
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white transition-colors"
                :style="{ background: form.color }"
              >
                {{ form.name.trim().charAt(0).toUpperCase() || '?' }}
              </div>
              <span class="text-sm text-slate-600 dark:text-slate-300">{{ form.name.trim() || 'Category name' }}</span>
            </div>

            <div class="flex gap-2.5 pt-1">
              <button type="button" @click="closeForm" class="btn-secondary flex-1">Cancel</button>
              <button type="submit" :disabled="saving" class="btn-primary flex-1">
                <Loader2 v-if="saving" class="h-3.5 w-3.5 animate-spin" />
                {{ editing ? 'Save changes' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirmation ───────────────────────────────────── -->
    <Transition name="fade">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-dialog flex items-center justify-center bg-black/20 dark:bg-black/50 px-4"
        @click.self="deleteTarget = null"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cat-delete-title"
      >
        <div class="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xl animate-slide-up">
          <div class="flex items-start gap-3">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60">
              <Trash2 class="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p id="cat-delete-title" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Delete "{{ deleteTarget.name }}"?</p>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                <template v-if="deleteTarget.tasks_count > 0">
                  {{ deleteTarget.tasks_count }}
                  linked {{ deleteTarget.tasks_count === 1 ? 'task' : 'tasks' }}
                  will become uncategorized.
                </template>
                <template v-else>This can't be undone.</template>
              </p>
            </div>
          </div>
          <div class="mt-4 flex gap-2.5">
            <button @click="deleteTarget = null" class="btn-secondary flex-1 btn-sm">Cancel</button>
            <button @click="confirmDelete" class="btn-danger flex-1 btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'
import type { Category } from '../stores/tasks'
import { useToast } from '../composables/useToast'
import { CATEGORY_COLORS } from '../constants'
import { Plus, Tag, Pencil, Trash2, X, AlertCircle, Loader2, LayoutGrid, List } from '@lucide/vue'
import { useInlineEdit } from '../composables/useInlineEdit'

const store = useTaskStore()
const toast = useToast()
const { editValue, isEditing, startEdit, cancelEdit, saveEdit, setInputRef } = useInlineEdit()

const view = ref<'grid' | 'table'>('grid')
const showModal = ref(false)
const saving = ref(false)
const editing = ref<Category | null>(null)
const deleteTarget = ref<Category | null>(null)
const currentPage = ref(1)

const form = reactive({ name: '', color: '#6366f1' })
const touched = reactive<Record<string, boolean>>({})
const errors = reactive<Record<string, string>>({})

function touch(field: string) {
  touched[field] = true
  if (field === 'name') validateName()
}

function validateName(): boolean {
  const value = form.name.trim()
  if (!value) {
    errors.name = 'Category name is required'
  } else if (value.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (form.name.length > 50) {
    errors.name = 'Name cannot exceed 50 characters'
  } else if (isDuplicateName(value)) {
    errors.name = 'A category with this name already exists'
  } else {
    delete errors.name
  }
  return !errors.name
}

function isDuplicateName(name: string): boolean {
  const lower = name.toLowerCase()
  return store.categories.some(c => c.name.toLowerCase() === lower && c.id !== editing.value?.id)
}

function openForm(cat: Category | null = null) {
  editing.value = cat
  Object.keys(touched).forEach(k => { touched[k] = false })
  Object.keys(errors).forEach(k => { delete errors[k] })
  Object.assign(form, cat ? { name: cat.name, color: cat.color } : { name: '', color: '#6366f1' })
  showModal.value = true
}

function closeForm() {
  showModal.value = false
  editing.value = null
}

async function saveCategory() {
  touched.name = true
  if (!validateName()) return

  saving.value = true
  try {
    if (editing.value) {
      await store.updateCategory(editing.value.id, form)
      toast.success('Category updated')
    } else {
      await store.createCategory(form)
      toast.success('Category created')
    }
    closeForm()
  } catch (err: unknown) {
    const apiErr = err as { response?: { data?: { message?: string } } }
    const msg = apiErr?.response?.data?.message
    if (msg) errors.name = msg
    else toast.error('Something went wrong. Try again.')
  } finally {
    saving.value = false
  }
}

function handleDelete(cat: Category) {
  deleteTarget.value = cat
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  await store.deleteCategory(deleteTarget.value.id)
  toast.success('Category deleted')
  deleteTarget.value = null
}

function goToPage(page: number) {
  currentPage.value = page
  store.fetchCategories(page)
}

onMounted(() => store.fetchCategories(1))
</script>