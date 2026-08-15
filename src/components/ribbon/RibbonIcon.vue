<script setup lang="ts">
import { ICONS, type IconName } from '@/components/ribbon/icons'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path v-for="(d, index) in ICONS[name]" :key="index" :d="d" />
  </svg>
</template>

<style scoped>
.icon {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
