<script setup lang="ts">
import { ref, watch } from 'vue'
import { evaluateExpression } from '@/utils/expression'

/**
 * Number input with unit. Values are edited by typing, the arrow keys step by
 * `step`. `commit` fires when the field is left or Enter is pressed, which the
 * palette uses to close an undo step.
 *
 * With `expression` the field also takes a calculation such as `142/2+1` and
 * shows its result once the field is left. Such a field is a text input, so it
 * has no spin buttons and no arrow key stepping.
 */
const props = withDefaults(
  defineProps<{
    modelValue: number
    label: string
    unit?: string
    min?: number
    max?: number
    step?: number
    /** Accept arithmetic instead of a plain number, see {@link evaluateExpression}. */
    expression?: boolean
  }>(),
  { unit: 'cm', min: undefined, max: undefined, step: 1, expression: false },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void
  (event: 'commit'): void
}>()

const input = ref<HTMLInputElement | null>(null)
const text = ref(String(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    if (parse(text.value) !== value) text.value = String(value)
  },
)

function parse(raw: string): number {
  if (props.expression) return evaluateExpression(raw) ?? Number.NaN
  return Number.parseFloat(raw.replace(',', '.'))
}

function onInput(event: Event): void {
  text.value = (event.target as HTMLInputElement).value
  const value = parse(text.value)
  if (Number.isFinite(value)) emit('update:modelValue', value)
}

/** Leaving the field repairs an unparsable entry and closes the undo step. */
function onChange(): void {
  const value = parse(text.value)
  text.value = String(Number.isFinite(value) ? value : props.modelValue)
  emit('commit')
}

defineExpose({ focus: () => input.value?.select() })
</script>

<template>
  <label class="field">
    <span class="field-label">{{ label }}</span>
    <span class="field-input">
      <input
        ref="input"
        :value="text"
        :type="expression ? 'text' : 'number'"
        inputmode="decimal"
        :min="min"
        :max="max"
        :step="step"
        @input="onInput"
        @change="onChange"
        @focus="($event.target as HTMLInputElement).select()"
      />
      <span v-if="unit" class="field-unit">{{ unit }}</span>
    </span>
  </label>
</template>

<style scoped>
.field {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2px;
  min-width: 0;
}
.field-label {
  font-size: 12px;
  color: #4b5563;
}
.field-input {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  border: 1px solid #c7ccd4;
  border-radius: 4px;
  background: #fff;
  padding: 0 8px;
}
.field-input:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  padding: 8px 0;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  background: transparent;
}
.field-unit {
  font-size: 12px;
  color: #6b7280;
}
</style>
