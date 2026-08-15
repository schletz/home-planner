import { reactive, watch } from 'vue'
import type {
  DimensionPlacement,
  InstallationKind,
  OpeningKind,
  SwingDirection,
  WallSide,
} from '@/types/plan'

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
    totalDimension: DimensionPlacement
    detailDimension: DimensionPlacement
  }
  opening: Record<OpeningKind, { width: number; frame: number; swing: SwingDirection }>
  installation: Record<InstallationKind, { height: number; length: number; side: WallSide }>
}

const DEFAULTS_KEY = 'home-planner:defaults'

function createDefaults(): PlannerDefaults {
  return {
    wall: {
      thickness: 25,
      length: 400,
      angle: 0,
      totalDimension: 'above',
      detailDimension: 'above',
    },
    opening: {
      door: { width: 90, frame: 6, swing: 'start-above' },
      window: { width: 120, frame: 8, swing: 'start-above' },
      doubleWindow: { width: 240, frame: 8, swing: 'start-above' },
    },
    installation: {
      socket: { height: 30, length: 0, side: 'above' },
      water: { height: 60, length: 0, side: 'above' },
      radiator: { height: 20, length: 100, side: 'above' },
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
      wall: { ...fallback.wall, ...stored.wall },
      opening: {
        door: { ...fallback.opening.door, ...stored.opening?.door },
        window: { ...fallback.opening.window, ...stored.opening?.window },
        doubleWindow: { ...fallback.opening.doubleWindow, ...stored.opening?.doubleWindow },
      },
      installation: {
        socket: { ...fallback.installation.socket, ...stored.installation?.socket },
        water: { ...fallback.installation.water, ...stored.installation?.water },
        radiator: { ...fallback.installation.radiator, ...stored.installation?.radiator },
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
