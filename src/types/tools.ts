import type { WallObjectKind } from '@/types/plan'

/** Active tool of the ribbon. */
export type ToolId = 'select' | 'wall' | WallObjectKind

/** Description of a ribbon button. */
export interface ToolDefinition {
  id: ToolId
  label: string
  /** Single key that activates the tool without any modifier. */
  shortcut: string
  hint: string
}

export const TOOLS: ToolDefinition[] = [
  { id: 'select', label: 'Auswahl', shortcut: 'v', hint: 'Objekte auswählen und in der Palette bearbeiten' },
  { id: 'wall', label: 'Wand', shortcut: 'w', hint: 'Wand zeichnen: Startpunkt klicken, dann Maße eingeben' },
  { id: 'door', label: 'Türe', shortcut: 'd', hint: 'Türe in eine Wand einsetzen' },
  { id: 'window', label: 'Fenster', shortcut: 'f', hint: 'Fenster in eine Wand einsetzen' },
  { id: 'doubleWindow', label: 'Doppelfenster', shortcut: 'g', hint: 'Doppelfenster in eine Wand einsetzen' },
  { id: 'socket', label: 'Steckdose', shortcut: 's', hint: 'Steckdose auf eine Wand setzen' },
  { id: 'water', label: 'Wasser', shortcut: 'a', hint: 'Wasseranschluss auf eine Wand setzen' },
  { id: 'radiator', label: 'Heizkörper', shortcut: 'h', hint: 'Heizkörper auf eine Wand setzen' },
]

export const SHAPE_TOOLS: ToolId[] = ['door', 'window', 'doubleWindow']
export const INSTALLATION_TOOLS: ToolId[] = ['socket', 'water', 'radiator']
