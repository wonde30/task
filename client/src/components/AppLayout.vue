<template>
  <div class="flex h-screen bg-white dark:bg-slate-900">

    <Transition name="fade">
      <div
        v-if="mobileOpen"
        @click="mobileOpen = false"
        class="fixed inset-0 z-elevated bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs lg:hidden"
        aria-hidden="true"
      />
    </Transition>

    <aside
    class="fixed inset-y-0 left-0 z-sidebar flex w-64 flex-col bg-white border-r border-slate-200/80 transition-transform duration-250 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:bg-slate-900 dark:border-slate-800"
      :class="mobileOpen ? 'translate-x-0' : '-translate-x-full'"
      :inert="!mobileOpen && isMobileViewport ? true : undefined"
      aria-label="Application sidebar"
    >
      <!-- Brand Header -->
      <div class="flex h-16 shrink-0 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800/80">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-2xs ring-1 ring-indigo-600/20" aria-hidden="true">
            <CheckSquare class="h-4.5 w-4.5 text-white" :stroke-width="2.5" />
          </div>
          <div>
            <span class="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">TaskFlow</span>
            <span class="block text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">Workspace</span>
          </div>
        </div>
        <button
          @click="mobileOpen = false"
          class="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
          aria-label="Close sidebar"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3.5 py-4 space-y-1" aria-label="Main navigation">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="group relative flex items-center gap-3.5 rounded-xl px-3.5 h-11 text-xs sm:text-[13px] font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
          :class="isActive(item.to)
            ? 'bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-2xs'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span
            v-if="isActive(item.to)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
            aria-hidden="true"
          />
          <component
            :is="item.icon"
            class="h-4.5 w-4.5 shrink-0 transition-transform duration-150 group-hover:scale-105"
            :class="isActive(item.to)
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'"
            :stroke-width="isActive(item.to) ? 2.5 : 2"
          />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Sidebar Footer (Appearance + User Profile) -->
      <div class="shrink-0 border-t border-slate-100 dark:border-slate-800/80 px-3.5 py-3 space-y-2">
        <div class="relative" ref="appearanceRoot">
          <button
            ref="appearanceTrigger"
            @click="toggleAppearance"
            @keydown.escape.stop="closeAppearance"
            class="flex w-full items-center gap-3.5 rounded-xl px-3.5 h-11 text-xs sm:text-[13px] font-semibold text-slate-600 dark:text-slate-400 transition-all duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
            :aria-expanded="appearanceOpen"
            aria-haspopup="menu"
            aria-label="Appearance settings"
          >
            <component
              :is="currentThemeIcon"
              class="h-4.5 w-4.5 shrink-0 text-slate-400 dark:text-slate-500"
              :stroke-width="2"
              aria-hidden="true"
            />
            <span class="flex-1 text-left">Appearance</span>
            <ChevronDown
              class="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200"
              :class="appearanceOpen ? 'rotate-180' : ''"
              aria-hidden="true"
            />
          </button>

          <Transition name="appear-menu">
            <div
              v-if="appearanceOpen"
              ref="appearanceMenu"
              class="absolute bottom-full left-0 right-0 mb-2 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-1.5 overflow-hidden shadow-lg"
              role="menu"
              aria-label="Theme options"
              @keydown.escape.stop="closeAppearance"
              @keydown.tab.prevent="onAppearanceMenuTab"
            >
              <p class="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none" aria-hidden="true">
                Theme
              </p>
              <button
                v-for="(opt, idx) in THEME_OPTIONS"
                :key="opt.value"
                :ref="el => setMenuItemRef(el, idx)"
                @click="selectTheme(opt.value)"
                class="flex w-full items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-700"
                :class="theme === opt.value
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/70'"
                role="menuitemradio"
                :aria-checked="theme === opt.value"
                :tabindex="appearanceOpen ? 0 : -1"
              >
                <component
                  :is="opt.icon"
                  class="h-4 w-4 shrink-0"
                  :class="theme === opt.value
                    ? 'text-indigo-500 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'"
                  :stroke-width="theme === opt.value ? 2.5 : 2"
                  aria-hidden="true"
                />
                <span class="flex-1 text-left font-medium">{{ opt.label }}</span>
                <span
                  v-if="theme === opt.value"
                  class="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0"
                  aria-hidden="true"
                />
              </button>
            </div>
          </Transition>
        </div>

        <router-link
          to="/profile"
          class="group flex items-center gap-3 rounded-xl p-2 transition-all duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset"
          :aria-current="route.path === '/profile' ? 'page' : undefined"
          :aria-label="`Settings — ${auth.user?.name ?? 'Profile'}`"
        >
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-xs font-bold text-white uppercase select-none ring-2 ring-indigo-500/20 shadow-2xs"
            aria-hidden="true"
          >
            {{ initials }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">{{ auth.user?.name }}</p>
            <p class="truncate text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{{ auth.user?.email }}</p>
          </div>
          <ChevronRight class="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" aria-hidden="true" />
        </router-link>
      </div>
    </aside>

    <div class="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">

      <header
        class="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 dark:border-slate-800"
        role="banner"
      >
        <div class="flex items-center gap-4">
          <button
            @click="mobileOpen = true"
            class="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu class="h-5 w-5" />
          </button>
          <div>
            <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">{{ pageTitle }}</h1>
            <p v-if="pageSubtitle" class="hidden text-xs text-slate-500 dark:text-slate-400 lg:block leading-tight mt-0.5">{{ pageSubtitle }}</p>
          </div>
        </div>
        <button
          ref="newTaskTrigger"
          @click="openNewTaskModal"
          class="btn-primary btn-sm shadow-2xs"
          title="New task (N)"
          aria-label="Create new task"
          aria-keyshortcuts="n"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          New task
        </button>
      </header>

      <main
        id="main-content"
        class="flex-1 min-h-0 overflow-y-auto bg-slate-50/70 dark:bg-slate-950"
        :aria-label="pageTitle"
      >
        <div
          class="mx-auto"
          :class="isProfileRoute
            ? 'max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 '
            : 'max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8'"
        >
          <router-view />
        </div>
      </main>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="newTask.show.value"
          class="fixed inset-0 z-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-modal-title"
          aria-describedby="global-modal-desc"
          @keydown.escape.stop="newTask.close()"
        >
          <div class="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60" @click="newTask.close()" aria-hidden="true" />

          <Transition name="scale-up" appear>
            <div
              v-if="newTask.show.value"
              ref="modalPanel"
              class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-lg max-h-[90vh] flex-col bg-white rounded-2xl border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700/80"
              style="box-shadow: var(--shadow-modal);"
            >
              <div class="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-700/80 px-6">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60" aria-hidden="true">
                    <Plus class="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 id="global-modal-title" class="text-base font-semibold text-slate-900 dark:text-slate-100">New task</h2>
                </div>
                <button
                  ref="modalCloseBtn"
                  @click="newTask.close()"
                  class="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  aria-label="Close new task dialog"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>

              <div class="flex-1 overflow-y-auto">
                <p id="global-modal-desc" class="sr-only">Create a new task. Fill in the title and optional details then click Create task.</p>
                <form @submit.prevent="saveNewTask" id="globalTaskForm" novalidate>

                  <div class="px-6 pt-6 pb-4 space-y-4">
                    <div>
                      <label class="label" for="g-task-title">
                        <span>Title <span class="text-rose-500 font-bold ml-0.5" aria-hidden="true">*</span><span class="sr-only">(required)</span></span>
                      </label>
                      <input
                        id="g-task-title"
                        ref="modalFirstInput"
                        v-model="gForm.title"
                        @blur="gTouch('title')"
                        @input="gTouched.title && gValidate('title')"
                        placeholder="What needs to get done?"
                        autocomplete="off"
                        maxlength="150"
                        class="input"
                        :class="gErrors.title
                          ? 'input-error'
                          : (gTouched.title && !gErrors.title && gForm.title.trim() ? 'input-success' : '')"
                        :aria-invalid="!!gErrors.title"
                        :aria-describedby="gErrors.title ? 'g-title-err' : undefined"
                      />
                      <div class="mt-1.5 flex items-center justify-between min-h-[20px]">
                        <p v-if="gErrors.title" id="g-title-err" role="alert" class="flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                          <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {{ gErrors.title }}
                        </p>
                        <span v-else />
                        <span
                          class="text-2xs tabular-nums font-medium"
                          :class="gForm.title.length > 130 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'"
                          aria-live="polite"
                        >{{ gForm.title.length }}/150</span>
                      </div>
                    </div>

                    <div>
                      <label class="label" for="g-task-desc">
                        <span>Description <span class="label-hint ml-1">(optional)</span></span>
                      </label>
                      <textarea
                        id="g-task-desc"
                        v-model="gForm.description"
                        placeholder="Add notes or details…"
                        class="input resize-none leading-relaxed"
                        rows="3"
                        maxlength="1000"
                      />
                    </div>
                  </div>

                  <div class="h-px bg-slate-100 dark:bg-slate-800" role="separator" />

                  <div class="px-6 py-4 grid grid-cols-2 gap-4">
                    <div>
                      <label class="label" for="g-task-start">Start date</label>
                      <input id="g-task-start" v-model="gForm.start_date" type="date" class="input" />
                    </div>
                    <div>
                      <label class="label" for="g-task-end">Due date &amp; time</label>
                      <input
                        id="g-task-end"
                        v-model="gForm.end_date"
                        type="datetime-local"
                        @change="gTouched.end_date = true; gValidate('end_date')"
                        class="input"
                        :class="gErrors.end_date ? 'input-error' : (gTouched.end_date && !gErrors.end_date && gForm.end_date ? 'input-success' : '')"
                        :aria-invalid="!!gErrors.end_date"
                        :aria-describedby="gErrors.end_date ? 'g-end-err' : undefined"
                      />
                      <p v-if="gErrors.end_date" id="g-end-err" role="alert" class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">
                        <AlertCircle class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {{ gErrors.end_date }}
                      </p>
                    </div>
                  </div>

                  <div class="h-px bg-slate-100 dark:bg-slate-800" role="separator" />

                  <div class="px-6 py-4 space-y-4">
                    <div class="w-full">
                      <label class="label mb-2 block">Priority</label>
                      <select
                      v-model="gForm.priority"
                      class="input"
                      >
                      <option
                      v-for="p in PRIORITIES"
                      :key="p.value"
                      :value="p.value"
                      >{{ p.label }}
                    </option>
                  </select>
                </div>

                    <div>
                      <label class="label" for="g-task-category">Category</label>
                      <div class="relative" ref="gCategoryDropdownRef">
                        <div class="relative">
                          <input
                            id="g-task-category"
                            v-model="gCategorySearch"
                            @focus="gShowCategoryDropdown = true"
                            @input="gShowCategoryDropdown = true"
                            placeholder="Search category…"
                            autocomplete="off"
                            class="input pr-9"
                          />
                          <button
                            v-if="gCategorySearch || gForm.category_id"
                            type="button"
                            @click="gClearCategory"
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            aria-label="Clear category"
                            title="Clear category"
                          >
                            <X class="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            v-else
                            type="button"
                            @click="gShowCategoryDropdown = !gShowCategoryDropdown"
                            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            aria-label="Toggle category list"
                          >
                            <ChevronDown
                              class="h-4 w-4 transition-transform duration-150"
                              :class="gShowCategoryDropdown ? 'rotate-180' : ''"
                              aria-hidden="true"
                            />
                          </button>
                        </div>

                        <Transition name="fade">
                          <div
                            v-if="gShowCategoryDropdown"
                            class="absolute left-0 right-0 z-dropdown mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                            role="listbox"
                          >
                            <button
                              type="button"
                              @click="gSelectCategory(null)"
                              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer"
                              :class="gForm.category_id === null
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'"
                            >
                              <span>No category</span>
                              <Check v-if="gForm.category_id === null" class="h-3.5 w-3.5" aria-hidden="true" />
                            </button>

                            <div v-if="gFilteredCategories.length === 0" class="px-3 py-3 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                              No categories found
                            </div>

                            <button
                              v-for="c in gFilteredCategories"
                              :key="c.id"
                              type="button"
                              @click="gSelectCategory(c.id)"
                              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors cursor-pointer"
                              :class="gForm.category_id === c.id
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
                              <Check v-if="gForm.category_id === c.id" class="h-3.5 w-3.5 shrink-0 ml-2" aria-hidden="true" />
                            </button>
                          </div>
                        </Transition>
                      </div>

                      <Transition name="fade">
                        <div v-if="gSelectedCategory" class="mt-2 flex items-center gap-2">
                          <span
                            class="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900"
                            :style="{ background: gSelectedCategory.color }"
                            aria-hidden="true"
                          />
                          <span class="text-xs font-medium text-slate-600 dark:text-slate-300">
                            {{ gSelectedCategory.name }}
                          </span>
                        </div>
                      </Transition>
                    </div>
                  </div>

                </form>
              </div>

              <div class="shrink-0 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/80 px-6 py-4 flex gap-3">
                <button type="button" @click="newTask.close()" class="btn-secondary flex-1">Cancel</button>
                <button type="submit" form="globalTaskForm" :disabled="gSaving" class="btn-primary flex-1">
                  <Loader2 v-if="gSaving" class="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  <span>{{ gSaving ? 'Creating…' : 'Create task' }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTaskStore } from '../stores/tasks'
import { useNewTask } from '../composables/useNewTask'
import { useToast } from '../composables/useToast'
import { useTheme } from '../composables/useTheme'
import { getInitials } from '../utils/format'
import { TASK_PRIORITIES } from '../constants'
import type { TaskPayload } from '../stores/tasks'
import {
  CheckSquare, LayoutDashboard, ListTodo, Tag, BarChart2,
  X, Menu, Plus, ChevronRight, ChevronDown, AlertCircle, Loader2,
  Sun, Moon, Monitor, Check,
} from '@lucide/vue'

const route = useRoute()
const auth = useAuthStore()
const taskStore = useTaskStore()
const newTask = useNewTask()
const toast = useToast()
const { theme, setTheme } = useTheme()
const mobileOpen = ref(false)
const isMobileViewport = ref(window.innerWidth < 1024)

function onResize() { isMobileViewport.value = window.innerWidth < 1024 }

const isProfileRoute = computed(() => route.path === '/profile')

const nav = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'My Tasks', to: '/tasks', icon: ListTodo },
  { label: 'Categories', to: '/categories', icon: Tag },
  { label: 'Reports', to: '/reports', icon: BarChart2 },
] as const

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
] as const

const appearanceOpen = ref(false)
const appearanceRoot = ref<HTMLElement>()
const appearanceTrigger = ref<HTMLButtonElement>()
const menuItemRefs = ref<HTMLButtonElement[]>([])

function setMenuItemRef(el: unknown, idx: number) {
  if (el instanceof HTMLButtonElement) menuItemRefs.value[idx] = el
}

const currentThemeIcon = computed(
  () => THEME_OPTIONS.find(o => o.value === theme.value)?.icon ?? Monitor,
)

function toggleAppearance() {
  appearanceOpen.value = !appearanceOpen.value
  if (appearanceOpen.value) {
    nextTick(() => {
      const active = menuItemRefs.value.find((_, i) => THEME_OPTIONS[i]?.value === theme.value)
      ;(active ?? menuItemRefs.value[0])?.focus()
    })
  }
}

function closeAppearance() {
  appearanceOpen.value = false
  appearanceTrigger.value?.focus()
}

function onAppearanceMenuTab(e: KeyboardEvent) {
  const items = menuItemRefs.value.filter(Boolean)
  if (!items.length) return
  const idx = items.indexOf(document.activeElement as HTMLButtonElement)
  const next = e.shiftKey
    ? items[(idx - 1 + items.length) % items.length]
    : items[(idx + 1) % items.length]
  next?.focus()
}

function selectTheme(value: 'light' | 'dark' | 'system') {
  setTheme(value)
  closeAppearance()
}

function onClickOutsideAppearance(e: MouseEvent) {
  if (appearanceRoot.value && !appearanceRoot.value.contains(e.target as Node)) {
    appearanceOpen.value = false
  }
}

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '': { title: 'Dashboard', subtitle: "Here's what's happening today" },
  tasks: { title: 'My Tasks', subtitle: 'Manage and track your work' },
  categories: { title: 'Categories', subtitle: 'Organize tasks into groups' },
  reports: { title: 'Reports', subtitle: 'Trends and completion stats' },
  profile: { title: 'Settings', subtitle: 'Account and security settings' },
}

const pageMeta = computed(() => PAGE_META[route.path.split('/')[1] || ''] ?? { title: 'Dashboard', subtitle: '' })
const pageTitle = computed(() => pageMeta.value.title)
const pageSubtitle = computed(() => pageMeta.value.subtitle)

const initials = computed(() => getInitials(auth.user?.name ?? 'U'))

const newTaskTrigger = ref<HTMLButtonElement>()
const modalFirstInput = ref<HTMLInputElement>()

function openNewTaskModal() { newTask.open() }

const PRIORITIES = TASK_PRIORITIES

const gForm = reactive<TaskPayload>({
  title: '', description: '', priority: 'medium',
  start_date: '', end_date: '', category_id: null,
})

const gCategorySearch = ref('')
const gShowCategoryDropdown = ref(false)
const gCategoryDropdownRef = ref<HTMLElement>()

const gTouched = reactive<Record<string, boolean>>({})
const gErrors = reactive<Record<string, string>>({})
const gSaving = ref(false)

const gSelectedCategory = computed(() =>
  gForm.category_id
    ? taskStore.categories.find(c => c.id === gForm.category_id) ?? null
    : null,
)

const gFilteredCategories = computed(() => {
  const q = gCategorySearch.value.trim().toLowerCase()
  if (!q) return taskStore.categories
  return taskStore.categories.filter(c => c.name.toLowerCase().includes(q))
})

function gSelectCategory(id: number | null) {
  gForm.category_id = id
  gShowCategoryDropdown.value = false
  const category = taskStore.categories.find(c => c.id === id)
  gCategorySearch.value = category?.name ?? ''
}

function gClearCategory() {
  gForm.category_id = null
  gCategorySearch.value = ''
  gShowCategoryDropdown.value = false
}

function gOnClickOutsideCategory(e: MouseEvent) {
  if (gCategoryDropdownRef.value && !gCategoryDropdownRef.value.contains(e.target as Node)) {
    gShowCategoryDropdown.value = false
  }
}

function gTouch(field: string) { gTouched[field] = true; gValidate(field) }

function gValidate(field: string): boolean {
  if (field === 'title') {
    const v = gForm.title.trim()
    if (!v) gErrors.title = 'Title is required'
    else if (v.length < 2) gErrors.title = 'At least 2 characters'
    else delete gErrors.title
  }
  if (field === 'end_date') {
    if (gForm.end_date && gForm.start_date && new Date(gForm.end_date) <= new Date(gForm.start_date)) {
      gErrors.end_date = 'Due date must be after start date'
    } else {
      delete gErrors.end_date
    }
  }
  return !gErrors[field]
}
async function saveNewTask() {
  gTouched.title = true
  gValidate('title')
  if (gForm.end_date) { gTouched.end_date = true; gValidate('end_date') }
  if (Object.keys(gErrors).length) return

  gSaving.value = true
  try {
    await taskStore.createTask({
      title: gForm.title.trim(),
      description: gForm.description?.trim() || null,
      priority: gForm.priority,
      start_date: gForm.start_date || null,
      end_date: gForm.end_date || null,
      category_id: gForm.category_id ?? null,
    })
    toast.success('Task created')
    newTask.close()
  } catch (err: unknown) {
    const apiErr = err as { response?: { data?: { message?: string } } }
    toast.error(apiErr?.response?.data?.message ?? 'Failed to create task')
  } finally {
    gSaving.value = false
  }
}
watch(newTask.show, async (open) => {
  if (open) {
    Object.assign(gForm, { title: '', description: '', priority: 'medium', start_date: '', end_date: '', category_id: null })
    Object.keys(gTouched).forEach(k => { gTouched[k] = false })
    Object.keys(gErrors).forEach(k => { delete gErrors[k] })
    gCategorySearch.value = ''
    gShowCategoryDropdown.value = false
    taskStore.fetchCategories()
    await nextTick()
    modalFirstInput.value?.focus()
  } else {
    newTaskTrigger.value?.focus()
  }
})

onMounted(() => {
  document.addEventListener('click', onClickOutsideAppearance)
  document.addEventListener('click', gOnClickOutsideCategory)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutsideAppearance)
  document.removeEventListener('click', gOnClickOutsideCategory)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.scale-up-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
.scale-up-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.scale-up-enter-from   { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }
.scale-up-leave-to     { opacity: 0; transform: translate(-50%, -50%) scale(0.97); }

.appear-menu-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
.appear-menu-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.appear-menu-enter-from   { opacity: 0; transform: translateY(6px) scale(0.98); }
.appear-menu-leave-to     { opacity: 0; transform: translateY(4px) scale(0.99); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>