<script setup lang="ts" generic="T extends string">
import { createId } from '@/utils/id'

/**
 * Radio group rendered as a segmented control. Real radio inputs are used so
 * that the arrow keys select an option without touching the mouse.
 */
withDefaults(
  defineProps<{
    modelValue: T
    options: ReadonlyArray<{ value: T; label: string; title?: string }>
    label: string
    columns?: number
  }>(),
  { columns: 2 },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: T): void
  (event: 'commit'): void
}>()

const name = createId('group')

function select(value: T): void {
  emit('update:modelValue', value)
  emit('commit')
}
</script>

<template>
  <fieldset class="options">
    <legend>{{ label }}</legend>
    <div class="options-grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
      <label
        v-for="option in options"
        :key="option.value"
        class="option"
        :class="{ 'is-active': option.value === modelValue }"
        :title="option.title"
      >
        <input
          type="radio"
          :name="name"
          :value="option.value"
          :checked="option.value === modelValue"
          @change="select(option.value)"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
.options {
  border: none;
  padding: 0;
  margin: 0;
  min-width: 0;
}
legend {
  padding: 0;
  font-size: 12px;
  color: #4b5563;
  margin-bottom: 2px;
}
.options-grid {
  display: grid;
  gap: 4px;
}
.option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px 6px;
  border: 1px solid #c7ccd4;
  border-radius: 4px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
}
.option:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
.option.is-active {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
</style>
