import { computed, reactive, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { Plan, Point, Selection, Wall, WallObject } from '@/types/plan'
import type { ToolId } from '@/types/tools'
import { createId } from '@/utils/id'
import { createEmptyPlan, loadFromStorage, parsePlan, saveToStorage } from '@/utils/storage'

/**
 * Single source of truth for the plan, the selection and the active tool.
 *
 * Undo works on snapshots: every finished action calls `commit()`, which stores
 * a serialised copy of the plan. Live edits in the palette may change the plan
 * without committing; the next commit then closes that step. Snapshots are
 * cheap here because a floor plan holds a few dozen objects at most.
 */

const HISTORY_LIMIT = 100

interface PlannerState {
  plan: Plan
  selection: Selection | null
  tool: ToolId
}

const state = reactive<PlannerState>({
  plan: loadFromStorage() ?? createEmptyPlan(),
  selection: null,
  tool: 'select',
})

const history: string[] = [JSON.stringify(state.plan)]
const historyIndex = ref(0)
const historyLength = ref(1)

watch(
  () => state.plan,
  (plan) => saveToStorage(plan),
  { deep: true },
)

function snapshot(): string {
  return JSON.stringify(state.plan)
}

/** Stores the current plan as an undo step. */
function commit(): void {
  const current = snapshot()
  if (current === history[historyIndex.value]) return
  history.splice(historyIndex.value + 1)
  history.push(current)
  if (history.length > HISTORY_LIMIT) history.shift()
  historyIndex.value = history.length - 1
  historyLength.value = history.length
}

function applySnapshot(raw: string): void {
  state.plan = parsePlan(JSON.parse(raw))
  validateSelection()
}

/** Drops a selection that points to an object which no longer exists. */
function validateSelection(): void {
  const selection = state.selection
  if (!selection) return
  const wall = findWall(selection.wallId)
  if (!wall) {
    state.selection = null
    return
  }
  if (selection.objectId && !wall.objects.some((object) => object.id === selection.objectId)) {
    state.selection = { wallId: wall.id }
  }
}

function findWall(wallId: string): Wall | undefined {
  return state.plan.walls.find((wall) => wall.id === wallId)
}

function findObject(wallId: string, objectId: string): WallObject | undefined {
  return findWall(wallId)?.objects.find((object) => object.id === objectId)
}

/* -------------------------------------------------------------------------- */
/* Mutations                                                                   */
/* -------------------------------------------------------------------------- */

function addWall(input: Omit<Wall, 'id' | 'objects'>): Wall {
  const wall: Wall = { ...input, id: createId('wall'), objects: [] }
  state.plan.walls.push(wall)
  state.selection = { wallId: wall.id }
  commit()
  return wall
}

function updateWall(wallId: string, patch: Partial<Omit<Wall, 'id' | 'objects'>>): void {
  const wall = findWall(wallId)
  if (wall) Object.assign(wall, patch)
}

function removeWall(wallId: string): void {
  const index = state.plan.walls.findIndex((wall) => wall.id === wallId)
  if (index < 0) return
  state.plan.walls.splice(index, 1)
  if (state.selection?.wallId === wallId) state.selection = null
  commit()
}

function addObject(wallId: string, object: WallObject): void {
  const wall = findWall(wallId)
  if (!wall) return
  wall.objects.push(object)
  state.selection = { wallId, objectId: object.id }
  commit()
}

function updateObject(wallId: string, objectId: string, patch: Partial<WallObject>): void {
  const object = findObject(wallId, objectId)
  if (object) Object.assign(object, patch)
}

function removeObject(wallId: string, objectId: string): void {
  const wall = findWall(wallId)
  if (!wall) return
  const index = wall.objects.findIndex((object) => object.id === objectId)
  if (index < 0) return
  wall.objects.splice(index, 1)
  state.selection = { wallId }
  commit()
}

/** Deletes whatever is selected: a single object, otherwise the whole wall. */
function removeSelection(): void {
  const selection = state.selection
  if (!selection) return
  if (selection.objectId) removeObject(selection.wallId, selection.objectId)
  else removeWall(selection.wallId)
}

function setOrigin(point: Point): void {
  state.plan.origin = { x: point.x, y: point.y }
  commit()
}

function setTool(tool: ToolId): void {
  state.tool = tool
  if (tool !== 'select') state.selection = null
}

function select(selection: Selection | null): void {
  state.selection = selection
}

function loadPlan(plan: Plan): void {
  state.plan = plan
  state.selection = null
  history.splice(0, history.length, JSON.stringify(plan))
  historyIndex.value = 0
  historyLength.value = 1
}

function newPlan(): void {
  loadPlan(createEmptyPlan())
}

function undo(): void {
  // An uncommitted live edit is closed first so that it can be undone as well.
  commit()
  if (historyIndex.value <= 0) return
  historyIndex.value -= 1
  applySnapshot(history[historyIndex.value]!)
}

function redo(): void {
  if (historyIndex.value >= history.length - 1) return
  historyIndex.value += 1
  applySnapshot(history[historyIndex.value]!)
}

/* -------------------------------------------------------------------------- */
/* Public interface                                                            */
/* -------------------------------------------------------------------------- */

export interface PlanStore {
  state: PlannerState
  selectedWall: ComputedRef<Wall | undefined>
  selectedObject: ComputedRef<WallObject | undefined>
  canUndo: ComputedRef<boolean>
  canRedo: ComputedRef<boolean>
  historyLength: Ref<number>
  findWall: typeof findWall
  addWall: typeof addWall
  updateWall: typeof updateWall
  removeWall: typeof removeWall
  addObject: typeof addObject
  updateObject: typeof updateObject
  removeObject: typeof removeObject
  removeSelection: typeof removeSelection
  setOrigin: typeof setOrigin
  setTool: typeof setTool
  select: typeof select
  loadPlan: typeof loadPlan
  newPlan: typeof newPlan
  commit: typeof commit
  undo: typeof undo
  redo: typeof redo
}

const selectedWall = computed(() =>
  state.selection ? findWall(state.selection.wallId) : undefined,
)

const selectedObject = computed(() => {
  const selection = state.selection
  if (!selection?.objectId) return undefined
  return findObject(selection.wallId, selection.objectId)
})

const store: PlanStore = {
  state,
  selectedWall,
  selectedObject,
  canUndo: computed(() => historyIndex.value > 0),
  canRedo: computed(() => historyIndex.value < historyLength.value - 1),
  historyLength,
  findWall,
  addWall,
  updateWall,
  removeWall,
  addObject,
  updateObject,
  removeObject,
  removeSelection,
  setOrigin,
  setTool,
  select,
  loadPlan,
  newPlan,
  commit,
  undo,
  redo,
}

export function usePlanStore(): PlanStore {
  return store
}
