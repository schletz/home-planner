<script setup lang="ts">
import RibbonIcon from '@/components/ribbon/RibbonIcon.vue'
import type { IconName } from '@/components/ribbon/icons'

/** Single ribbon button with icon, caption and an optional shortcut badge. */
withDefaults(
  defineProps<{
    icon: IconName
    label: string
    shortcut?: string
    hint?: string
    active?: boolean
    disabled?: boolean
  }>(),
  { shortcut: '', hint: '', active: false, disabled: false },
)

defineEmits<{ (event: 'click'): void }>()
</script>

<template>
  <button
    type="button"
    class="ribbon-button"
    :class="{ 'is-active': active }"
    :disabled="disabled"
    :title="hint ? `${label} – ${hint}` : label"
    @click="$emit('click')"
  >
    <RibbonIcon :name="icon" />
    <span class="ribbon-label">{{ label }}</span>
    <span v-if="shortcut" class="ribbon-shortcut">{{ shortcut.toUpperCase() }}</span>
  </button>
</template>

<style scoped>
.ribbon-button {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 2px;
  min-width: 62px;
  padding: 6px 8px 4px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: #1f2937;
  cursor: pointer;
}
.ribbon-button:hover:not(:disabled) {
  background: #e8eef8;
  border-color: #c7d7f0;
}
.ribbon-button:disabled {
  opacity: 0.4;
  cursor: default;
}
.ribbon-button.is-active {
  background: #2563eb;
  border-color: #1d4ed8;
  color: #fff;
}
.ribbon-label {
  font-size: 11px;
  line-height: 1.2;
  text-align: center;
}
.ribbon-shortcut {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 9px;
  color: #94a3b8;
}
.ribbon-button.is-active .ribbon-shortcut {
  color: rgba(255, 255, 255, 0.8);
}
</style>
