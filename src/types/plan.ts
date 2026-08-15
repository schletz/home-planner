/**
 * Domain model of a floor plan.
 *
 * All lengths are centimetres. A wall is stored as its centre line: a start
 * point, a length and an angle. Everything that sits inside a wall (openings,
 * installations) is stored in wall-local coordinates, i.e. as a distance from
 * the wall start. This keeps objects glued to their wall when the wall is moved
 * or rotated later on.
 */

/** A point in model space (centimetres, y pointing down as in SVG). */
export interface Point {
  x: number
  y: number
}

/** Openings punch a hole into the wall body. */
export type OpeningKind = 'door' | 'window' | 'doubleWindow'

/** Installations are drawn on top of the wall body. */
export type InstallationKind = 'socket' | 'water' | 'radiator'

export type WallObjectKind = OpeningKind | InstallationKind

/**
 * Side of a wall, seen while walking from the wall start to the wall end:
 * `above` is the left-hand side, `below` the right-hand side.
 */
export type WallSide = 'above' | 'below'

/**
 * The four possible opening directions of a door or window leaf. The first
 * part names the jamb the leaf is hinged at, the second the side the leaf
 * swings to.
 */
export type SwingDirection = 'start-above' | 'start-below' | 'end-above' | 'end-below'

/** Placement of a dimension row, `none` hides the row for that wall. */
export type DimensionPlacement = WallSide | 'none'

/** Door, window or double window sitting inside a wall. */
export interface Opening {
  id: string
  kind: OpeningKind
  /** Distance of the opening start from the wall start, in cm. */
  offset: number
  /** Rough opening width in cm (frame included). */
  width: number
  /** Depth of the door/window frame on each side in cm. */
  frame: number
  swing: SwingDirection
  text?: string
}

/** Socket, water connection or radiator mounted on a wall. */
export interface Installation {
  id: string
  kind: InstallationKind
  /** Distance of the symbol centre from the wall start, in cm. */
  offset: number
  /** Mounting height above finished floor in cm. */
  height: number
  /** Length along the wall in cm. Only used by radiators. */
  length?: number
  /** Wall face the installation is mounted on. */
  side: WallSide
  text?: string
}

export type WallObject = Opening | Installation

/** A straight wall segment carrying its openings and installations. */
export interface Wall {
  id: string
  /** Start point of the centre line. */
  x: number
  y: number
  /** Length of the centre line in cm. */
  length: number
  /** Angle in degrees, 0 = to the right, positive = counter clockwise. */
  angle: number
  /** Wall thickness in cm, extruded symmetrically around the centre line. */
  thickness: number
  totalDimension: DimensionPlacement
  detailDimension: DimensionPlacement
  objects: WallObject[]
}

/** Everything that gets saved to a file or to the local storage. */
export interface Plan {
  version: 1
  name: string
  /** Zero point of the rulers in model coordinates. */
  origin: Point
  walls: Wall[]
}

/** Reference to the currently selected wall or wall object. */
export interface Selection {
  wallId: string
  objectId?: string
}

export function isOpening(object: WallObject): object is Opening {
  return object.kind === 'door' || object.kind === 'window' || object.kind === 'doubleWindow'
}

export function isInstallation(object: WallObject): object is Installation {
  return !isOpening(object)
}

/** Human readable German names, used in the palette and in dialog titles. */
export const OBJECT_LABELS: Record<WallObjectKind, string> = {
  door: 'Türe',
  window: 'Fenster',
  doubleWindow: 'Doppelfenster',
  socket: 'Steckdose',
  water: 'Wasseranschluss',
  radiator: 'Heizkörper',
}
