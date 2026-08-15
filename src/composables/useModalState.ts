import { computed, ref, type ComputedRef } from 'vue'

/**
 * Counts the open modal dialogs. The global shortcuts ask for this so that a
 * key press never changes the tool while a dialog waits for input.
 */
const openDialogs = ref(0)

export interface ModalState {
  isModalOpen: ComputedRef<boolean>
  register: () => void
  unregister: () => void
}

const state: ModalState = {
  isModalOpen: computed(() => openDialogs.value > 0),
  register: () => {
    openDialogs.value += 1
  },
  unregister: () => {
    openDialogs.value = Math.max(0, openDialogs.value - 1)
  },
}

export function useModalState(): ModalState {
  return state
}
