<script setup lang="ts">
/** Single line text input, used for optional labels of plan objects. */
defineProps<{
  modelValue: string
  label: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'commit'): void
}>()
</script>

<template>
  <label class="field">
    <span class="field-label">{{ label }}</span>
    <input
      class="field-input"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @change="emit('commit')"
    />
  </label>
</template>

<style scoped>
.field {
  display: grid;
  gap: 2px;
}
.field-label {
  font-size: 12px;
  color: #4b5563;
}
.field-input {
  border: 1px solid #c7ccd4;
  border-radius: 4px;
  padding: 8px;
  font-size: 15px;
  background: #fff;
}
.field-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}
</style>
