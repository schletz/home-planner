/**
 * Line icons of the ribbon, drawn with strokes on a 24 x 24 grid so that they
 * stay legible on a bright construction site display.
 */
export const ICONS = {
  new: ['M6 3h8l4 4v14H6z', 'M14 3v4h4'],
  open: ['M3 6h6l2 2h10v11H3z'],
  save: ['M4 4h13l3 3v13H4z', 'M8 4v6h8V4', 'M8 20v-6h8v6'],
  export: ['M12 3v11', 'M8 10l4 4 4-4', 'M4 19h16'],
  select: ['M6 3l12 8-5 1 3 6-2 1-3-6-4 3z'],
  wall: ['M3 8h18v8H3z'],
  door: ['M5 20h14', 'M8 20V6h5v14', 'M13 6a11 11 0 0 1 4 14'],
  window: ['M3 9h18v6H3z', 'M3 12h18'],
  doubleWindow: ['M3 9h18v6H3z', 'M12 9v6', 'M3 12h18'],
  socket: ['M4 16h16', 'M6 16a6 6 0 0 1 12 0', 'M12 10V4'],
  water: ['M12 3c4 5 6 7.5 6 10a6 6 0 0 1-12 0c0-2.5 2-5 6-10z'],
  radiator: ['M4 7h16v10H4z', 'M8 7v10', 'M12 7v10', 'M16 7v10'],
  shaft: ['M3 7h18', 'M9 7v9h6V7', 'M9 7l6 9', 'M15 7l-6 9'],
  zoomIn: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M16 16l4 4', 'M8 11h6', 'M11 8v6'],
  zoomOut: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z', 'M16 16l4 4', 'M8 11h6'],
  fit: ['M4 9V4h5', 'M20 9V4h-5', 'M4 15v5h5', 'M20 15v5h-5'],
  undo: ['M4 9h9a5 5 0 0 1 0 10H8', 'M4 9l4-4', 'M4 9l4 4'],
  redo: ['M20 9h-9a5 5 0 0 0 0 10h5', 'M20 9l-4-4', 'M20 9l-4 4'],
} as const

export type IconName = keyof typeof ICONS
