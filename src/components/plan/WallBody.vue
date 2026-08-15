<script setup lang="ts">
import { computed } from 'vue'
import type { Wall } from '@/types/plan'
import { wallTransform } from '@/utils/geometry'
import { bodySpans, type Overhang } from '@/utils/wallGeometry'

/**
 * The solid parts of one wall.
 *
 * Walls that meet in a corner overlap, because each of them is drawn past its
 * end into the wall it runs into. Two overlapping rectangles would show the
 * outline of one wall crossing the body of the other, so the whole plan is
 * drawn in two passes: `outline` for every wall first, then `fill` for every
 * wall on top. The fill of a wall covers every outline running through it, and
 * the joint reads as one solid body — without computing the union of the
 * rectangles.
 *
 * Because the fill also covers the inner half of the wall's own outline, the
 * outline is drawn at twice the intended width; what remains visible is exactly
 * one line width outside the wall face.
 */
const props = defineProps<{
  wall: Wall
  overhang: Overhang
  selected: boolean
  pass: 'outline' | 'fill'
}>()

const emit = defineEmits<{
  (event: 'pick-wall', payload: PointerEvent): void
}>()

const transform = computed(() => wallTransform(props.wall))
const spans = computed(() => bodySpans(props.wall, props.overhang))
const half = computed(() => props.wall.thickness / 2)
</script>

<template>
  <g :transform="transform">
    <rect
      v-for="span in spans"
      :key="`${span.from}-${span.to}`"
      :class="[pass === 'fill' ? 'plan-wall-body' : 'plan-wall-outline', { 'is-selected': selected }]"
      :x="span.from"
      :y="-half"
      :width="span.to - span.from"
      :height="wall.thickness"
      @pointerdown="emit('pick-wall', $event)"
    />
  </g>
</template>
