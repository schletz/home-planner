import {
  type Installation,
  type InstallationKind,
  type Opening,
  type OpeningKind,
  type Plan,
  type SwingDirection,
  type Wall,
  type WallObject,
  type WallSide,
} from '@/types/plan'
import { createId } from '@/utils/id'
import { DIM_DETAIL_DISTANCE, DIM_TOTAL_DISTANCE } from '@/utils/planStyle'

const PLAN_KEY = 'home-planner:plan'

const OPENING_KINDS: OpeningKind[] = ['door', 'window', 'doubleWindow']
const INSTALLATION_KINDS: InstallationKind[] = ['socket', 'water', 'radiator', 'shaft']
const SWING_DIRECTIONS: SwingDirection[] = ['start-above', 'start-below', 'end-above', 'end-below']

export function createEmptyPlan(): Plan {
  return { version: 1, name: 'Wohnungsplan', origin: { x: 0, y: 0 }, walls: [] }
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                     */
/* -------------------------------------------------------------------------- */

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

/**
 * Reads the signed distance of a dimension row. Plans written while the row was
 * still placed with `above`, `below` or `none` are translated to the default
 * distance of that row, so an older file keeps its look.
 */
export function parseDimensionOffset(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value === 'above') return -Math.abs(fallback)
  if (value === 'below') return Math.abs(fallback)
  if (value === 'none') return 0
  return fallback
}

function parseObject(raw: unknown): WallObject | null {
  if (typeof raw !== 'object' || raw === null) return null
  const source = raw as Record<string, unknown>
  const kind = typeof source.kind === 'string' ? source.kind : ''
  // Only an explicit `false` counts, so files without the flag keep every
  // object in the dimension row.
  const excluded = source.includeInDimension === false

  if ((OPENING_KINDS as string[]).includes(kind)) {
    const opening: Opening = {
      id: typeof source.id === 'string' ? source.id : createId('obj'),
      kind: kind as OpeningKind,
      offset: num(source.offset, 0),
      width: num(source.width, 90),
      frame: num(source.frame, 6),
      swing: oneOf(source.swing, SWING_DIRECTIONS, 'start-above'),
    }
    if (excluded) opening.includeInDimension = false
    if (typeof source.text === 'string' && source.text) opening.text = source.text
    return opening
  }

  if ((INSTALLATION_KINDS as string[]).includes(kind)) {
    const installation: Installation = {
      id: typeof source.id === 'string' ? source.id : createId('obj'),
      kind: kind as InstallationKind,
      offset: num(source.offset, 0),
      height: num(source.height, 30),
      side: oneOf<WallSide>(source.side, ['above', 'below'], 'above'),
    }
    if (typeof source.length === 'number') installation.length = num(source.length, 100)
    if (typeof source.depth === 'number') installation.depth = num(source.depth, 40)
    if (excluded) installation.includeInDimension = false
    if (typeof source.text === 'string' && source.text) installation.text = source.text
    return installation
  }

  return null
}

function parseWall(raw: unknown): Wall | null {
  if (typeof raw !== 'object' || raw === null) return null
  const source = raw as Record<string, unknown>

  return {
    id: typeof source.id === 'string' ? source.id : createId('wall'),
    x: num(source.x, 0),
    y: num(source.y, 0),
    length: Math.max(num(source.length, 100), 0),
    angle: num(source.angle, 0),
    thickness: Math.max(num(source.thickness, 25), 1),
    totalDimension: parseDimensionOffset(source.totalDimension, -DIM_TOTAL_DISTANCE),
    detailDimension: parseDimensionOffset(source.detailDimension, -DIM_DETAIL_DISTANCE),
    dimensionMarginStart: num(source.dimensionMarginStart, 0),
    dimensionMarginEnd: num(source.dimensionMarginEnd, 0),
    objects: Array.isArray(source.objects)
      ? source.objects.map(parseObject).filter((object): object is WallObject => object !== null)
      : [],
  }
}

/**
 * Reads a plan from arbitrary JSON input. Unknown or broken fields fall back to
 * defaults instead of throwing, so a damaged file never blocks the editor.
 */
export function parsePlan(raw: unknown): Plan {
  if (typeof raw !== 'object' || raw === null) return createEmptyPlan()
  const source = raw as Record<string, unknown>
  const origin = (source.origin ?? {}) as Record<string, unknown>

  return {
    version: 1,
    name: typeof source.name === 'string' && source.name ? source.name : 'Wohnungsplan',
    origin: { x: num(origin.x, 0), y: num(origin.y, 0) },
    walls: Array.isArray(source.walls)
      ? source.walls.map(parseWall).filter((wall): wall is Wall => wall !== null)
      : [],
  }
}

/* -------------------------------------------------------------------------- */
/* Local storage                                                               */
/* -------------------------------------------------------------------------- */

export function saveToStorage(plan: Plan): void {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan))
  } catch {
    // Private mode or a full storage must not break the editor.
  }
}

export function loadFromStorage(): Plan | null {
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    return raw ? parsePlan(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

/* -------------------------------------------------------------------------- */
/* Files                                                                       */
/* -------------------------------------------------------------------------- */

/** Turns a plan name into a file name without problematic characters. */
export function toFileName(name: string, extension: string): string {
  const cleaned = name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '')
  return `${cleaned || 'plan'}.${extension}`
}

export function downloadBlob(content: string, fileName: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function savePlanToFile(plan: Plan): void {
  downloadBlob(JSON.stringify(plan, null, 2), toFileName(plan.name, 'json'), 'application/json')
}

/** Opens the file picker and resolves with the parsed plan, or null on cancel. */
export function openPlanFromFile(): Promise<Plan | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.addEventListener('change', async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      try {
        resolve(parsePlan(JSON.parse(await file.text())))
      } catch {
        resolve(null)
      }
    })
    input.click()
  })
}
