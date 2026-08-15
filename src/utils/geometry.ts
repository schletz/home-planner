import type { Point, Wall, WallSide } from '@/types/plan'

/**
 * Geometry helpers for the wall coordinate system.
 *
 * World space uses SVG conventions: x to the right, y downwards. Wall angles
 * are given in degrees counter clockwise, so 90° points upwards on screen,
 * which is what a user expects when typing an angle.
 *
 * Wall-local space is what the SVG shapes are drawn in: the wall group carries
 * `translate(x, y) rotate(-angle)`, therefore local x runs along the wall and
 * local y grows towards the `below` side of the wall.
 */

export const DEG = Math.PI / 180

export function degToRad(degrees: number): number {
  return degrees * DEG
}

export function radToDeg(radians: number): number {
  return radians / DEG
}

/** Normalises an angle to [0, 360). */
export function normalizeAngle(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

/** Unit vector pointing from the wall start to the wall end. */
export function wallDirection(wall: Wall): Point {
  const a = degToRad(wall.angle)
  return { x: Math.cos(a), y: -Math.sin(a) }
}

/** Unit vector pointing to the `above` side of the wall. */
export function wallNormal(wall: Wall): Point {
  const d = wallDirection(wall)
  return { x: d.y, y: -d.x }
}

export function wallStart(wall: Wall): Point {
  return { x: wall.x, y: wall.y }
}

export function wallEnd(wall: Wall): Point {
  const d = wallDirection(wall)
  return { x: wall.x + d.x * wall.length, y: wall.y + d.y * wall.length }
}

/** SVG transform that maps the wall-local system to world coordinates. */
export function wallTransform(wall: Wall): string {
  return `translate(${wall.x} ${wall.y}) rotate(${-wall.angle})`
}

/** Sign of the local y axis for a wall side (`above` is negative local y). */
export function sideSign(side: WallSide): -1 | 1 {
  return side === 'above' ? -1 : 1
}

/** Converts a point of the wall-local system into world coordinates. */
export function localToWorld(wall: Wall, localX: number, localY: number): Point {
  const d = wallDirection(wall)
  const n = wallNormal(wall)
  return {
    x: wall.x + d.x * localX - n.x * localY,
    y: wall.y + d.y * localX - n.y * localY,
  }
}

/** Converts a world point into the wall-local system. */
export function worldToLocal(wall: Wall, point: Point): Point {
  const d = wallDirection(wall)
  const n = wallNormal(wall)
  const dx = point.x - wall.x
  const dy = point.y - wall.y
  return {
    x: dx * d.x + dy * d.y,
    y: -(dx * n.x + dy * n.y),
  }
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Shortest distance of a point to the wall centre line, limited to the wall
 * extent. Used for hit testing when a wall is clicked with an insert tool.
 */
export function distanceToWall(wall: Wall, point: Point): number {
  const local = worldToLocal(wall, point)
  const clampedX = clamp(local.x, 0, wall.length)
  return Math.hypot(local.x - clampedX, local.y)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Rounds to a given number of decimals, avoiding 0.30000000000000004 output. */
export function round(value: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * True when a wall label would appear upside down. Text of such walls is
 * rotated by 180° so that dimension figures stay readable.
 */
export function isTextFlipped(wall: Wall): boolean {
  const angle = normalizeAngle(wall.angle)
  return angle > 90 && angle <= 270
}
