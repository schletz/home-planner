<script setup lang="ts">
/**
 * Single check box for a boolean property. A click is a finished edit, so the
 * field reports `commit` right away and does not wait for the focus to leave.
 */
defineProps<{
  modelValue: boolean
  label: string
  /** Explaining line below the box, used for options that are not obvious. */
  hint?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'commit'): void
}>()

function onChange(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
  emit('commit')
}
</script>

<template>
  <div class="field">
    <label class="field-row">
      <input type="checkbox" :checked="modelValue" @change="onChange" />
      <span class="field-label">{{ label }}</span>
    </label>
    <p v-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
input {
  width: 16px;
  height: 16px;
  accent-color: #2563eb;
  cursor: pointer;
}
.field-label {
  font-size: 13px;
  color: #1f2937;
}
.field-hint {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}
</style>
