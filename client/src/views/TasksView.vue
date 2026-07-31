<template>
  <div class="space-y-6">

    <TaskToolbar
      :total="store.pagination.total"
      :filtered="hasFilters"
      :search="store.filters.search"
      :status-filter="store.filters.status"
      :priority-filter="store.filters.priority"
      :category-filter="store.filters.category_id"
      :categories="store.categories"
      :view="view"
      @update:search="onSearch"
      @update:status-filter="applyFilter('status', $event)"
      @update:priority-filter="applyFilter('priority', $event)"
      @update:category-filter="applyFilter('category_id', $event)"
      @update:view="onViewChange"
      @clear-filters="clearAllFilters"
    />

    <TaskTable
      v-if="view === 'table'"
      :tasks="store.tasks"
      :loading="store.loading"
      :has-filters="hasFilters"
      :sort-field="store.filters.sort"
      :sort-dir="store.filters.direction"
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @sort="toggleSort"
      @new="openForm()"
      @edit="openForm"
      @duplicate="handleDuplicate"
      @toggle-complete="toggleComplete"
      @change-status="changeStatus"
      @delete="handleDelete"
      @page="store.fetchTasks"
    />

    <TaskGrid
      v-else
      :tasks="store.tasks"
      :loading="store.loading"
      :has-filters="hasFilters"
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @new="openForm()"
      @edit="openForm"
      @duplicate="handleDuplicate"
      @toggle-complete="toggleComplete"
      @delete="handleDelete"
      @page="store.fetchTasks"
    />

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 z-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="editing ? 'task-modal-title-edit' : 'task-modal-title-new'"
          aria-describedby="task-modal-desc"
          @keydown.escape.stop="closeForm"
        >
          <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60" @click="closeForm" aria-hidden="true" />

          <Transition name="scale-up" appear>
            <div
              v-if="showModal"
              ref="modalPanel"
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-[480px] max-h-[90vh] flex-col bg-white rounded-2xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700/80"
              style="box-shadow: var(--shadow-modal);"
            >
              <!-- Header -->
              <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-700/80 px-5">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60" aria-hidden="true">
                    <Pencil v-if="editing" class="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <Plus v-else class="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2
                    :id="editing ? 'task-modal-title-edit' : 'task-modal-title-new'"
                    class="text-sm font-semibold text-slate-900 dark:text-slate-100"
                  >
                    {{ editing ? 'Edit task' : 'New task' }}
                  </h2>
                  <span
                    v-if="editing"
                    class="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full px-2 py-0.5 text-xs font-medium"
                    aria-hidden="true"
                  >editing</span>
                </div>
                <button
                  ref="modalCloseBtn"
                  @click="closeForm"
                  class="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Close dialog"
                >
                  <X class="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <!-- Body -->
              <div class="flex-1 overflow-y-auto">
                <p id="task-modal-desc" class="sr-only">
                  {{ editing ? 'Edit the task details below.' : 'Fill in the details to create a new task.' }}
                </p>
                <form @submit.prevent="saveTask" id="taskForm" novalidate>

                  <!-- Title + Description -->
                  <div class="px-6 pt-6 pb-4 space-y-4">
                    <div>
                      <label class="label" for="task-title">
                        <span>Title <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></span>
                      </label>
                      <input
                        id="task-title"
                        ref="titleInput"
                        v-model="form.title"
                        @blur="touch('title')"
                        @input="touched.title && validateField('title')"
                        placeholder="What needs to get done?"
                        autocomplete="off"
                        maxlength="150"
                        class="input"
                        :class="errors.title
                          ? 'input-error'
                          : (touched.title && !errors.title && form.title.trim() ? 'input-success' : '')"
                        :aria-invalid="!!errors.title"
                        :aria-describedby="errors.title ? 'task-title-err' : undefined"
                      />
                      <div class="mt-1.5 flex items-center justify-between min-h-[20px]">
                        <p v-if="errors.title" id="task-title-err" role="alert" class="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                          <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {{ errors.title }}
                        </p>
                        <span v-else />
                        <span
                          class="text-2xs tabular-nums font-medium"
                          :class="form.title.length > 130 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'"
                          aria-live="polite"
                        >{{ form.title.length }}/150</span>
                      </div>
                    </div>

                    <div>
                      <label class="label" for="task-desc">
                        <span>Description <span class="label-hint ml-1">(optional)</span></span>
                      </label>
                      <textarea
                        id="task-desc"
                        v-model="form.description"
                        @blur="touch('description')"
                        @input="touched.description && validateField('description')"
                        placeholder="Add notes or details…"
                        class="input resize-none leading-relaxed"
                        :class="errors.description ? 'input-error' : ''"
                        rows="3"
                        maxlength="1000"
                        :aria-invalid="!!errors.description"
                        :aria-describedby="errors.description ? 'task-desc-err' : undefined"
                      />
                      <div class="mt-1.5 flex items-center justify-between min-h-[20px]">
                        <p v-if="errors.description" id="task-desc-err" role="alert" class="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                          <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {{ errors.description }}
                        </p>
                        <span v-else />
                        <span
                          class="text-2xs tabular-nums font-medium"
                          :class="form.description.length > 900 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'"
                          aria-live="polite"
                        >{{ form.description.length }}/1000</span>
                      </div>
                    </div>
                  </div>

                  <div class="h-px bg-slate-100 dark:bg-slate-800" role="separator" />

                  <!-- Dates -->
                  <div class="px-6 py-4 grid grid-cols-2 gap-4">
                    <div>
                      <label class="label" for="task-start">Start date</label>
                      <input
                        id="task-start"
                        v-model="form.start_date"
                        type="date"
                        @change="touch('start_date'); validateField('start_date'); touched.end_date && validateField('end_date')"
                        class="input"
                        :class="errors.start_date ? 'input-error' : ''"
                      />
                      <p v-if="errors.start_date" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                        <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{{ errors.start_date }}
                      </p>
                    </div>
                    <div>
                      <label class="label" for="task-end">Due date &amp; time</label>
                      <input
                        id="task-end"
                        v-model="form.end_date"
                        type="datetime-local"
                        @change="touch('end_date'); validateField('end_date')"
                        class="input"
                        :class="errors.end_date ? 'input-error' : (touched.end_date && !errors.end_date && form.end_date ? 'input-success' : '')"
                        :aria-invalid="!!errors.end_date"
                        :aria-describedby="errors.end_date ? 'task-end-err' : undefined"
                      />
                      <p v-if="errors.end_date" id="task-end-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                        <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{{ errors.end_date }}
                      </p>
                    </div>
                  </div>

                  <div class="h-px bg-slate-100 dark:bg-slate-800" role="separator" />

                  <!-- Priority + Category -->
                  <div class="px-6 py-4 space-y-4">
                    <fieldset>
                      <legend class="label mb-2">Priority</legend>
                      <div class="grid grid-cols-4 gap-2">
                        <button
                          v-for="p in PRIORITIES"
                          :key="p.value"
                          type="button"
                          @click="form.priority = p.value"
                          class="rounded-xl border px-2 py-2 text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 cursor-pointer"
                          :class="form.priority === p.value
                            ? p.activeClass
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'"
                          :aria-pressed="form.priority === p.value"
                        >{{ p.label }}</button>
                      </div>
                    </fieldset>
                    <div>
                      <label class="label" for="task-category">Category</label>
                      <div class="relative" ref="categoryDropdownRef">
                        <div class="relative">
                          <input
                            id="task-category"
                            v-model="categorySearch"
                            @focus="showCategoryDropdown = true"
                            @input="showCategoryDropdown = true"
                            placeholder="Search category…"
                            autocomplete="off"
                            class="input pr-9"
                          />
                          <button
                            v-if="categorySearch || form.category_id"
                            type="button"
                            @click="clearCategory"
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            aria-label="Clear category"
                            title="Clear category"
                          >
                            <X class="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            v-else
                            type="button"
                            @click="showCategoryDropdown = !showCategoryDropdown"
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            aria-label="Toggle category list"
                          >
                            <ChevronDown
                              class="h-4 w-4 transition-transform duration-150"
                              :class="showCategoryDropdown ? 'rotate-180' : ''"
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        <Transition name="fade">
                          <div
                            v-if="showCategoryDropdown"
                            class="absolute left-0 right-0 z-dropdown mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                            role="listbox"
                          >
                            <button
                              type="button"
                              @click="selectCategory(null)"
                              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer"
                              :class="form.category_id === null
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                            >
                              <span>No category</span>
                              <Check v-if="form.category_id === null" class="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            <div v-if="filteredCategories.length === 0" class="px-3 py-3 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                              No categories found
                            </div>

                            <button
                              v-for="c in filteredCategories"
                              :key="c.id"
                              type="button"
                              @click="selectCategory(c.id)"
                              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer"
                              :class="form.category_id === c.id
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                            >
                              <div class="flex items-center gap-2 min-w-0">
                                <span
                                  class="h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
                                  :style="{ background: c.color }"
                                  aria-hidden="true"
                                />
                                <span class="truncate">{{ c.name }}</span>
                              </div>
                              <Check v-if="form.category_id === c.id" class="h-3.5 w-3.5 shrink-0 ml-2" aria-hidden="true" />
                            </button>
                          </div>
                        </Transition>
                      </div>

                      <Transition name="fade">
                        <div v-if="selectedCategory" class="mt-2 flex items-center gap-2">
                          <span
                            class="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                            :style="{ background: selectedCategory.color }"
                            aria-hidden="true"
                          />
                          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {{ selectedCategory.name }}
                          </span>
                        </div>
                      </Transition>
                    </div>
                  </div>

                  <template v-if="editing">
                    <div class="h-px bg-slate-100 dark:bg-slate-800" role="separator" />
                    <div class="px-6 py-4">
                      <fieldset>
                        <legend class="label mb-2">Status</legend>
                        <div class="grid grid-cols-3 gap-2">
                          <button
                            v-for="s in STATUSES"
                            :key="s.value"
                            type="button"
                            @click="form.status = s.value"
                            class="rounded-xl border px-2 py-2 text-xs font-semibold transition-all text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 cursor-pointer"
                            :class="form.status === s.value
                              ? s.activeClass
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200'"
                            :aria-pressed="form.status === s.value"
                          >{{ s.label }}</button>
                        </div>
                      </fieldset>
                    </div>
                  </template>
                </form>
              </div>

              <!-- Footer -->
              <div class="shrink-0 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/80 px-5 py-3.5 flex gap-3">
                <button type="button" @click="closeForm" class="btn-secondary flex-1">Cancel</button>
                <button
                  type="submit"
                  form="taskForm"
                  :disabled="saving"
                  class="btn-primary flex-1"
                >
                  <Loader2 v-if="saving" class="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>{{ saving ? (editing ? 'Saving…' : 'Creating…') : (editing ? 'Save changes' : 'Create task') }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirmation ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="deleteTarget"
          class="fixed inset-0 z-dialog flex items-center justify-center bg-black/30 dark:bg-black/50 px-4"
          @click.self="deleteTarget = null"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
          @keydown.escape.stop="deleteTarget = null"
        >
          <Transition name="scale-up" appear>
            <div
              v-if="deleteTarget"
              class="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-xl"
            >
              <div class="flex items-start gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60" aria-hidden="true">
                  <Trash2 class="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p id="delete-dialog-title" class="text-sm font-semibold text-slate-900 dark:text-slate-100">Delete task?</p>
                  <p id="delete-dialog-desc" class="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    <span class="font-medium text-slate-700 dark:text-slate-300">"{{ deleteTarget.title }}"</span>
                    will be permanently removed. This can't be undone.
                  </p>
                </div>
              </div>
              <div class="mt-4 flex gap-2.5">
                <button
                  ref="deleteKeepBtn"
                  @click="deleteTarget = null"
                  class="btn-secondary flex-1 btn-sm"
                >Keep it</button>
                <button @click="confirmDelete" class="btn-danger flex-1 btn-sm">Delete</button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '../stores/tasks'
import { useToast } from '../composables/useToast'
import type { Task } from '../stores/tasks'
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants'
import { Plus, Pencil, Trash2, X, AlertCircle, Loader2, ChevronDown, Check } from '@lucide/vue'
import TaskToolbar from '../components/tasks/TaskToolbar.vue'
import TaskTable from '../components/tasks/TaskTable.vue'
import TaskGrid from '../components/tasks/TaskGrid.vue'

const route  = useRoute()
const router = useRouter()
const store  = useTaskStore()
const toast  = useToast()

const VIEW_KEY = 'tasks_view'
const view = ref<'table' | 'grid'>(
  (localStorage.getItem(VIEW_KEY) as 'table' | 'grid') ?? 'table',
)

function onViewChange(newView: 'table' | 'grid') {
  view.value = newView
  localStorage.setItem(VIEW_KEY, newView)
}

const showModal = ref(false)
const saving = ref(false)
const editing = ref<Task | null>(null)
const deleteTarget = ref<Task | null>(null)
const modalPanel = ref<HTMLElement>()
const titleInput = ref<HTMLInputElement>()
const modalCloseBtn = ref<HTMLButtonElement>()
const deleteKeepBtn = ref<HTMLButtonElement>()

let modalTriggerEl: HTMLElement | null = null
let deleteTriggerEl: HTMLElement | null = null

const form = reactive({
  title: '',
  description: '',
  status: 'pending' as Task['status'],
  priority: 'medium' as Task['priority'],
  start_date: '',
  end_date: '',
  category_id: null as number | null,
})

const categorySearch = ref('')
const showCategoryDropdown = ref(false)
const categoryDropdownRef = ref<HTMLElement>()

const touched = reactive<Record<string, boolean>>({})
const errors = reactive<Record<string, string>>({})

const selectedCategory = computed(() =>
  form.category_id
    ? store.categories.find(c => c.id === form.category_id) ?? null
    : null,
)

const filteredCategories = computed(() => {
  const q = categorySearch.value.trim().toLowerCase()
  if (!q) return store.categories
  return store.categories.filter(c => c.name.toLowerCase().includes(q))
})

function selectCategory(id: number | null) {
  form.category_id = id
  showCategoryDropdown.value = false
  const category = store.categories.find(c => c.id === id)
  categorySearch.value = category?.name ?? ''
}

function clearCategory() {
  form.category_id = null
  categorySearch.value = ''
  showCategoryDropdown.value = false
}

function onClickOutsideCategory(e: MouseEvent) {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(e.target as Node)) {
    showCategoryDropdown.value = false
  }
}

const hasFilters = computed(() =>
  !!(store.filters.search || store.filters.status || store.filters.priority || store.filters.category_id),
)

const PRIORITIES = TASK_PRIORITIES
const STATUSES = TASK_STATUSES

function touch(field: string) {
  touched[field] = true
  validateField(field)
}

function validateField(field: string): boolean {
  switch (field) {
    case 'title': {
      const v = form.title.trim()
      if (!v)                errors.title = 'Title is required'
      else if (v.length < 2) errors.title = 'Title must be at least 2 characters'
      else if (form.title.length > 150) errors.title = 'Title cannot exceed 150 characters'
      else                   delete errors.title
      break
    }
    case 'description':
      if (form.description.length > 1000) errors.description = 'Description cannot exceed 1000 characters'
      else                                delete errors.description
      break
    case 'start_date':
      delete errors.start_date
      break
    case 'end_date':
      if (form.end_date && form.start_date && new Date(form.end_date) <= new Date(form.start_date)) {
        errors.end_date = 'Due date must be after start date'
      } else {
        delete errors.end_date
      }
      break
  }
  return !errors[field]
}

function validateAll(): boolean {
  const fields = ['title', 'description', 'end_date']
  fields.forEach(f => { touched[f] = true; validateField(f) })
  return Object.keys(errors).length === 0
}

function openForm(task: Task | null = null) {
  modalTriggerEl = document.activeElement as HTMLElement
  editing.value = task
  Object.keys(touched).forEach(k => { touched[k] = false })
  Object.keys(errors).forEach(k => { delete errors[k] })
  categorySearch.value = task?.category?.name ?? ''
  showCategoryDropdown.value = false

  Object.assign(form, task ? {
    title:       task.title,
    description: task.description ?? '',
    status:      task.status,
    priority:    task.priority,
    start_date:  task.start_date ?? '',
    end_date:    task.end_date ?? '',
    category_id: task.category?.id ?? null,
  } : {
    title: '', description: '', status: 'pending', priority: 'medium',
    start_date: '', end_date: '', category_id: null,
  })

  showModal.value = true
  nextTick(() => titleInput.value?.focus())
}

function closeForm() {
  showModal.value = false
  editing.value   = null
  nextTick(() => modalTriggerEl?.focus())
}

async function saveTask() {
  if (!validateAll()) {
    await nextTick()
    titleInput.value?.focus()
    return
  }
  saving.value = true
  try {
    const payload = { ...form, category_id: form.category_id || null }
    if (editing.value) {
      await store.updateTask(editing.value.id, payload)
      toast.success('Task updated')
    } else {
      await store.createTask(payload)
      toast.success('Task created')
    }
    closeForm()
  } catch {
    toast.error('Something went wrong. Please try again.')
  } finally {
    saving.value = false
  }
}

async function toggleComplete(task: Task) {
  const status = task.status === 'completed' ? 'pending' : 'completed'
  await store.updateStatus(task.id, status)
  toast.success(status === 'completed' ? 'Marked as done' : 'Reopened')
}

async function changeStatus(task: Task, status: string) {
  await store.updateStatus(task.id, status as Task['status'])
  toast.success('Status updated')
}

async function handleDuplicate(task: Task) {
  try {
    await store.duplicateTask(task)
    toast.success('Task duplicated')
  } catch {
    toast.error('Could not duplicate task.')
  }
}

function handleDelete(task: Task) {
  deleteTriggerEl = document.activeElement as HTMLElement
  deleteTarget.value = task
  nextTick(() => deleteKeepBtn.value?.focus())
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  const deleted = deleteTarget.value
  deleteTarget.value = null
  nextTick(() => deleteTriggerEl?.focus())
  await store.deleteTask(deleted.id)
  toast.undo('Task deleted', deleted)
}

let searchTimer: ReturnType<typeof setTimeout>

function onSearch(value: string) {
  store.filters.search = value
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { pushQuery(); store.fetchTasks() }, 350)
}

function applyFilter(key: 'status' | 'priority' | 'category_id', value: string) {
  store.filters[key] = value
  pushQuery()
  store.fetchTasks()
}

function clearAllFilters() {
  clearTimeout(searchTimer)
  store.filters.search = ''
  store.filters.status = ''
  store.filters.priority = ''
  store.filters.category_id = ''
  router.replace({ query: {} })
  store.fetchTasks()
}

function toggleSort(field: string) {
  store.filters.direction = store.filters.sort === field && store.filters.direction === 'asc' ? 'desc' : 'asc'
  store.filters.sort = field
  store.fetchTasks()
}

function pushQuery() {
  router.replace({
    query: {
      ...(store.filters.search && { search: store.filters.search }),
      ...(store.filters.status && { status: store.filters.status }),
      ...(store.filters.priority && { priority: store.filters.priority }),
      ...(store.filters.category_id && { category_id: store.filters.category_id }),
    },
  })
}

function hydrateFiltersFromQuery() {
  const q = route.query
  if (q.search) store.filters.search = String(q.search)
  if (q.status) store.filters.status = String(q.status)
  if (q.priority) store.filters.priority = String(q.priority)
  if (q.category_id) store.filters.category_id = String(q.category_id)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'n' && e.key !== 'N') return
  const tag = (e.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  e.preventDefault()
  openForm()
}

onMounted(() => {
  hydrateFiltersFromQuery()
  store.fetchTasks()
  store.fetchCategories()
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutsideCategory)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutsideCategory)
})
</script>

<style scoped>
.scale-up-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
.scale-up-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.scale-up-enter-from   { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
.scale-up-leave-to     { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
