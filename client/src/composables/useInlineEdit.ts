import { ref, nextTick } from 'vue'

const activeEditingKey = ref<string | null>(null)

export function useInlineEdit() {
  const editValue = ref('')
  const inputRef = ref<HTMLInputElement | null>(null)
  const isSaving = ref(false)

  const isEditing = (key: string) => activeEditingKey.value === key

  const startEdit = (key: string, initialValue: string) => {
    if (isSaving.value) return
    activeEditingKey.value = key
    editValue.value = initialValue
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
        inputRef.value.select()
      }
    })
  }

  const cancelEdit = () => {
    if (isSaving.value) return
    activeEditingKey.value = null
    editValue.value = ''
  }

  const setInputRef = (el: any) => {
    if (el) {
      inputRef.value = el as HTMLInputElement
    }
  }

  const saveEdit = async (
    key: string,
    originalValue: string,
    onSave: (newValue: string) => Promise<void>
  ) => {
    if (activeEditingKey.value !== key || isSaving.value) return

    const trimmed = editValue.value.trim()
    if (!trimmed || trimmed === originalValue.trim()) {
      cancelEdit()
      return
    }

    isSaving.value = true
    try {
      await onSave(trimmed)
      activeEditingKey.value = null
      editValue.value = ''
    } catch {
      // Error handling & rollback handled by store/caller
    } finally {
      isSaving.value = false
    }
  }

  return {
    activeEditingKey,
    editValue,
    isSaving,
    isEditing,
    startEdit,
    cancelEdit,
    saveEdit,
    setInputRef,
  }
}
