import { ref } from 'vue'

const show = ref(false)

export function useNewTask() {
  function open()  { show.value = true  }
  function close() { show.value = false }
  return { show, open, close }
}
