import { isOpening, type Opening, type Point, type Wall } from '@/types/plan'
import { clamp, distanceToWall, round, wallEnd, wallStart } from '@/utils/geometry'

/** A range along the wall in wall-local x coordinates. */
export interface Span {
  from: number
  to: number
}

/** How far a wall body is drawn beyond its two end points, in cm. */
export interface Overhang {
  start: number
  end: number
}

/** No overhang at all, used wherever junctions do not matter. */
export const NO_OVERHANG: Overhang = { start: 0, end: 0 }

/** Distance up to which a wall end counts as touching another wall, in cm. */
const JUNCTION_TOLERANCE = 0.5

/**
 * Half thickness of the thickest wall that the given point sits on. A wall end
 * drawn that much further reaches the far face of the wall it runs into, which
 * closes the corner instead of leaving the notch that two centre line
 * rectangles produce.
 */
function junctionOverhang(point: Point, wall: Wall, walls: Wall[]): number {
  let overhang = 0
  for (const other of walls) {
    if (other.id === wall.id) continue
    if (distanceToWall(other, point) > JUNCTION_TOLERANCE) continue
    overhang = Math.max(overhang, other.thickness / 2)
  }
  return overhang
}

/**
 * Overhang of a wall at both ends. Only ends that actually meet another wall
 * are extended; a free standing end keeps its exact length, otherwise the
 * drawing would no longer match the dimension figures.
 */
export function wallOverhang(wall: Wall, walls: Wall[]): Overhang {
  return {
    start: junctionOverhang(wallStart(wall), wall, walls),
    end: junctionOverhang(wallEnd(wall), wall, walls),
  }
}

/** Openings of a wall, clipped to the wall and sorted by position. */
export function openingSpans(wall: Wall): Span[] {
  return wall.objects
    .filter(isOpening)
    .map((opening) => ({
      from: clamp(opening.offset, 0, wall.length),
      to: clamp(opening.offset + opening.width, 0, wall.length),
    }))
    .filter((span) => span.to - span.from > 0.01)
    .sort((a, b) => a.from - b.from)
}

/**
 * The solid parts of a wall, i.e. everything that is not covered by an opening.
 * Overlapping openings are merged so that no zero width piece is produced. The
 * overhang stretches the outermost pieces past the wall ends into the walls
 * they are joined to; openings keep their exact position.
 */
export function bodySpans(wall: Wall, overhang: Overhang = NO_OVERHANG): Span[] {
  const holes: Span[] = []
  for (const span of openingSpans(wall)) {
    const last = holes[holes.length - 1]
    if (last && span.from <= last.to) last.to = Math.max(last.to, span.to)
    else holes.push({ ...span })
  }

  const spans: Span[] = []
  const end = wall.length + overhang.end
  let cursor = -overhang.start
  for (const hole of holes) {
    if (hole.from - cursor > 0.01) spans.push({ from: cursor, to: hole.from })
    cursor = Math.max(cursor, hole.to)
  }
  if (end - cursor > 0.01) spans.push({ from: cursor, to: end })
  return spans
}

/**
 * SVG path of a circular arc from `from` to `to` around `center`. The sweep
 * direction is derived from the cross product, so the arc always takes the
 * short way around.
 */
export function arcPath(
  center: { x: number; y: number },
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const radius = Math.hypot(from.x - center.x, from.y - center.y)
  const cross =
    (from.x - center.x) * (to.y - center.y) - (from.y - center.y) * (to.x - center.x)
  const sweep = cross > 0 ? 1 : 0
  return `M ${round(from.x, 2)} ${round(from.y, 2)} A ${round(radius, 2)} ${round(radius, 2)} 0 0 ${sweep} ${round(to.x, 2)} ${round(to.y, 2)}`
}

/** Clear width of an opening, i.e. the width between the two frames. */
export function clearWidth(opening: Opening): number {
  return Math.max(opening.width - 2 * opening.frame, 1)
}

/** True when the leaf is hinged at the jamb closer to the wall start. */
export function isHingedAtStart(opening: Opening): boolean {
  return opening.swing.startsWith('start')
}

/** Side of the wall the leaf swings to. */
export function swingSide(opening: Opening): 'above' | 'below' {
  return opening.swing.endsWith('above') ? 'above' : 'below'
}
