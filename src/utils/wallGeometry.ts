import { isOpening, type Opening, type Wall } from '@/types/plan'
import { clamp, round } from '@/utils/geometry'

/** A range along the wall in wall-local x coordinates. */
export interface Span {
  from: number
  to: number
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
 * Overlapping openings are merged so that no zero width piece is produced.
 */
export function bodySpans(wall: Wall): Span[] {
  const holes: Span[] = []
  for (const span of openingSpans(wall)) {
    const last = holes[holes.length - 1]
    if (last && span.from <= last.to) last.to = Math.max(last.to, span.to)
    else holes.push({ ...span })
  }

  const spans: Span[] = []
  let cursor = 0
  for (const hole of holes) {
    if (hole.from - cursor > 0.01) spans.push({ from: cursor, to: hole.from })
    cursor = Math.max(cursor, hole.to)
  }
  if (wall.length - cursor > 0.01) spans.push({ from: cursor, to: wall.length })
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
