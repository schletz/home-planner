/**
 * Look of the plan itself. The CSS below is injected into the live canvas and
 * into the exported SVG file, so both always look identical.
 *
 * All numbers are user units, and one user unit is one centimetre. Line widths
 * are read from custom properties: the canvas overrides them depending on the
 * zoom level so that hair lines never become invisible on screen, while the
 * export keeps the plain values.
 */

/** Distance of the detail dimension row from the wall face, in cm. */
export const DIM_DETAIL_DISTANCE = 40

/** Distance of the overall dimension row from the wall face, in cm. */
export const DIM_TOTAL_DISTANCE = 85

/** Height of the dimension figures in cm. */
export const DIM_TEXT_SIZE = 16

/** Half length of the slanted tick at a dimension point, in cm. */
export const DIM_TICK = 7

/** Gap between the wall face and the start of an extension line, in cm. */
export const DIM_EXTENSION_GAP = 6

/** Overshoot of an extension line beyond its dimension line, in cm. */
export const DIM_EXTENSION_OVERSHOOT = 10

/** Height of the label of an installation symbol, in cm. */
export const LABEL_TEXT_SIZE = 13

export const PLAN_STYLE = `
svg {
  --plan-line: 1;
  --plan-hairline: 0.7;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}
.plan-wall-body {
  fill: #3f3f46;
  stroke: #18181b;
  stroke-width: var(--plan-hairline);
  stroke-linejoin: miter;
}
.plan-wall-body.is-selected {
  fill: #1d4ed8;
  stroke: #1e3a8a;
}
.plan-wall-hit {
  fill: none;
  stroke: transparent;
  pointer-events: stroke;
}
.plan-opening-reveal {
  fill: #ffffff;
  stroke: none;
}
.plan-jamb {
  fill: none;
  stroke: #18181b;
  stroke-width: var(--plan-hairline);
}
.plan-opening-frame {
  fill: #d4d4d8;
  stroke: #18181b;
  stroke-width: var(--plan-hairline);
}
.plan-leaf {
  fill: none;
  stroke: #18181b;
  stroke-width: var(--plan-line);
  stroke-linecap: round;
}
.plan-arc {
  fill: none;
  stroke: #52525b;
  stroke-width: var(--plan-hairline);
}
.plan-glass {
  fill: none;
  stroke: #18181b;
  stroke-width: var(--plan-hairline);
}
.plan-symbol {
  fill: #ffffff;
  stroke: #18181b;
  stroke-width: var(--plan-line);
  stroke-linecap: round;
  stroke-linejoin: round;
}
.plan-symbol-fill {
  fill: #18181b;
  stroke: none;
}
.plan-symbol-line {
  fill: none;
  stroke: #18181b;
  stroke-width: var(--plan-line);
  stroke-linecap: round;
}
.plan-object.is-selected .plan-symbol,
.plan-object.is-selected .plan-opening-frame {
  stroke: #1d4ed8;
  stroke-width: calc(var(--plan-line) * 2);
}
.plan-object.is-selected .plan-leaf,
.plan-object.is-selected .plan-symbol-line {
  stroke: #1d4ed8;
  stroke-width: calc(var(--plan-line) * 2);
}
.plan-dimension-line,
.plan-dimension-extension {
  fill: none;
  stroke: #18181b;
  stroke-width: var(--plan-hairline);
}
.plan-dimension-tick {
  fill: none;
  stroke: #18181b;
  stroke-width: var(--plan-line);
  stroke-linecap: round;
}
.plan-dimension-text,
.plan-label {
  fill: #18181b;
  stroke: none;
  text-anchor: middle;
  /* The anchor is the visual centre, so flipped labels stay in place. */
  dominant-baseline: central;
}
`
