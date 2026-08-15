import { reactive, watch } from 'vue'
import type {
  DimensionOffset,
  InstallationKind,
  OpeningKind,
  SwingDirection,
  WallSide,
} from '@/types/plan'
import { DIM_DETAIL_DISTANCE, DIM_TOTAL_DISTANCE } from '@/utils/planStyle'
import { parseDimensionOffset } from '@/utils/storage'

/**
 * Values the insert dialogs are pre-filled with. They are updated whenever an
 * object is created, so placing ten identical sockets only needs one confirm
 * per socket. The values survive a reload.
 */
export interface PlannerDefaults {
  wall: {
    thickness: number
    length: number
    angle: number
    totalDimension: DimensionOffset
    detailDimension: DimensionOffset
    dimensionMarginStart: number
    dimensionMarginEnd: number
  }
  opening: Record<
    OpeningKind,
    { width: number; frame: number; swing: SwingDirection; includeInDimension: boolean }
  >
  installation: Record<
    InstallationKind,
    {
      height: number
      length: number
      depth: number
      side: WallSide
      includeInDimension: boolean
    }
  >
}

const DEFAULTS_KEY = 'home-planner:defaults'

function createDefaults(): PlannerDefaults {
  return {
    wall: {
      thickness: 25,
      length: 400,
      angle: 0,
      totalDimension: -DIM_TOTAL_DISTANCE,
      detailDimension: -DIM_DETAIL_DISTANCE,
      dimensionMarginStart: 0,
      dimensionMarginEnd: 0,
    },
    opening: {
      door: { width: 90, frame: 6, swing: 'start-above', includeInDimension: true },
      window: { width: 120, frame: 8, swing: 'start-above', includeInDimension: true },
      doubleWindow: { width: 240, frame: 8, swing: 'start-above', includeInDimension: true },
    },
    installation: {
      socket: { height: 30, length: 0, depth: 0, side: 'above', includeInDimension: true },
      water: { height: 60, length: 0, depth: 0, side: 'above', includeInDimension: true },
      radiator: { height: 20, length: 100, depth: 0, side: 'above', includeInDimension: true },
      shaft: { height: 0, length: 60, depth: 40, side: 'above', includeInDimension: true },
    },
  }
}

function restore(): PlannerDefaults {
  const fallback = createDefaults()
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY)
    if (!raw) return fallback
    const stored = JSON.parse(raw) as Partial<PlannerDefaults>
    return {
      wall: {
        ...fallback.wall,
        ...stored.wall,
        // Older versions stored `above`, `below` or `none` here.
        totalDimension: parseDimensionOffset(
          stored.wall?.totalDimension,
          fallback.wall.totalDimension,
        ),
        detailDimension: parseDimensionOffset(
          stored.wall?.detailDimension,
          fallback.wall.detailDimension,
        ),
      },
      opening: {
        door: { ...fallback.opening.door, ...stored.opening?.door },
        window: { ...fallback.opening.window, ...stored.opening?.window },
        doubleWindow: { ...fallback.opening.doubleWindow, ...stored.opening?.doubleWindow },
      },
      installation: {
        socket: { ...fallback.installation.socket, ...stored.installation?.socket },
        water: { ...fallback.installation.water, ...stored.installation?.water },
        radiator: { ...fallback.installation.radiator, ...stored.installation?.radiator },
        shaft: { ...fallback.installation.shaft, ...stored.installation?.shaft },
      },
    }
  } catch {
    return fallback
  }
}

const defaults = reactive<PlannerDefaults>(restore())

watch(
  defaults,
  (value) => {
    try {
      localStorage.setItem(DEFAULTS_KEY, JSON.stringify(value))
    } catch {
      // Storage is optional, ignore failures.
    }
  },
  { deep: true },
)

export function useDefaults(): PlannerDefaults {
  return defaults
}
