<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useModalState } from '@/composables/useModalState'

/**
 * Modal dialog. Enter confirms, Escape cancels and the first input is focused
 * and preselected, so a whole object can be entered without the mouse.
 *
 * Both keys are handled on the window instead of relying on the form, because
 * the click that opens the dialog can move the focus back to the document body
 * before the user starts typing.
 */
withDefaults(
  defineProps<{
    title: string
    confirmLabel?: string
  }>(),
  { confirmLabel: 'Übernehmen' },
)

const emit = defineEmits<{
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()

const form = ref<HTMLElement | null>(null)
const modal = useModalState()

/** Enter on a button must keep its own meaning, everything else confirms. */
function onKeyDown(event: KeyboardEvent): void {
  const tag = (event.target as HTMLElement | null)?.tagName
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
    return
  }
  if (event.key === 'Enter' && tag !== 'BUTTON' && tag !== 'TEXTAREA') {
    event.preventDefault()
    emit('confirm')
  }
}

onMounted(async () => {
  modal.register()
  window.addEventListener('keydown', onKeyDown)
  await nextTick()
  const first = form.value?.querySelector<HTMLInputElement>('input:not([type="radio"])')
  first?.focus()
  first?.select()
})

onBeforeUnmount(() => {
  modal.unregister()
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <Teleport to="body">
    <div class="dialog-backdrop" @pointerdown.self="emit('cancel')">
      <div ref="form" class="dialog" role="dialog" aria-modal="true">
        <h2 class="dialog-title">{{ title }}</h2>
        <div class="dialog-body">
          <slot />
        </div>
        <div class="dialog-footer">
          <button type="button" class="button" @click="emit('cancel')">Abbrechen</button>
          <button type="button" class="button is-primary" @click="emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: grid;
  place-items: center;
  z-index: 100;
}
.dialog {
  width: min(460px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
  display: flex;
  flex-direction: column;
}
.dialog-title {
  margin: 0;
  padding: 14px 18px;
  font-size: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.dialog-body {
  padding: 16px 18px;
  display: grid;
  gap: 12px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}
.button {
  padding: 9px 18px;
  border: 1px solid #c7ccd4;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
}
.button.is-primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  font-weight: 600;
}
.button:focus-visible {
  outline: 2px solid #1d4ed8;
  outline-offset: 2px;
}
</style>
