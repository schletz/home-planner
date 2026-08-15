<script setup lang="ts">
import { computed } from 'vue'
import { usePlanStore } from '@/composables/usePlanStore'
import { useViewport } from '@/composables/useViewport'
import type { Point } from '@/types/plan'
import { TOOLS } from '@/types/tools'
import { round } from '@/utils/geometry'

/** Bottom line with cursor position, active tool and zoom level. */
const props = defineProps<{ cursor: Point | null }>()

const store = usePlanStore()
const viewport = useViewport()

/** Coordinates are shown relative to the ruler origin, like on the rulers. */
const position = computed(() => {
  if (!props.cursor) return '–'
  const origin = store.state.plan.origin
  return `X ${round(props.cursor.x - origin.x)} | Y ${round(props.cursor.y - origin.y)} cm`
})

const toolLabel = computed(
  () => TOOLS.find((tool) => tool.id === store.state.tool)?.label ?? '',
)

const zoom = computed(() => `${Math.round(viewport.state.scale * 100)} %`)
</script>

<template>
  <footer class="status">
    <span class="status-item">{{ position }}</span>
    <span class="status-item">Werkzeug: {{ toolLabel }}</span>
    <span class="status-item">Zoom: {{ zoom }}</span>
    <span class="status-item">Wände: {{ store.state.plan.walls.length }}</span>
    <span class="status-hint">
      Mausrad zoomt, Leertaste oder mittlere Maustaste verschiebt, Pfeiltasten scrollen
    </span>
  </footer>
</template>

<style scoped>
.status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 4px 12px;
  border-top: 1px solid #d6dae1;
  background: #f3f5f8;
  font-size: 12px;
  color: #4b5563;
}
.status-item {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.status-hint {
  margin-left: auto;
  color: #8a94a3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
