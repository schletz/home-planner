import { onBeforeUnmount, onMounted } from 'vue'
import { useModalState } from '@/composables/useModalState'
import { usePlanStore } from '@/composables/usePlanStore'
import { useViewport } from '@/composables/useViewport'
import { TOOLS } from '@/types/tools'

/** Actions the shortcuts trigger which are not part of the store. */
export interface ShortcutHandlers {
  open: () => void
  save: () => void
  exportSvg: () => void
  fit: () => void
}

/** Pan step of the arrow keys in pixels. */
const PAN_STEP = 60

function isTextInput(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  const tag = element?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Keyboard control of the whole application. The editor is used on a laptop on
 * a building site, so every frequent action has a key: tools on single letters,
 * panning on the arrow keys and zooming on Ctrl plus/minus.
 */
export function useShortcuts(handlers: ShortcutHandlers): void {
  const store = usePlanStore()
  const viewport = useViewport()
  const modal = useModalState()

  function onKeyDown(event: KeyboardEvent): void {
    // An open dialog brings its own keyboard handling.
    if (modal.isModalOpen.value) return
    const typing = isTextInput(event.target)

    if (event.key === 'Escape') {
      if (typing) return
      store.setTool('select')
      store.select(null)
      return
    }

    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 's':
          event.preventDefault()
          handlers.save()
          return
        case 'o':
          event.preventDefault()
          handlers.open()
          return
        case 'e':
          event.preventDefault()
          handlers.exportSvg()
          return
        case 'z':
          event.preventDefault()
          store.undo()
          return
        case 'y':
          event.preventDefault()
          store.redo()
          return
        case '0':
          event.preventDefault()
          handlers.fit()
          return
        case '+':
        case '=':
          event.preventDefault()
          viewport.zoomIn()
          return
        case '-':
        case '_':
          event.preventDefault()
          viewport.zoomOut()
          return
        default:
          return
      }
    }

    if (typing) return

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault()
        const step = event.shiftKey ? PAN_STEP * 4 : PAN_STEP
        const x = event.key === 'ArrowLeft' ? step : event.key === 'ArrowRight' ? -step : 0
        const y = event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0
        viewport.panBy(x, y)
        return
      }
      case 'Delete':
      case 'Backspace':
        event.preventDefault()
        store.removeSelection()
        return
      default:
        break
    }

    const tool = TOOLS.find((definition) => definition.shortcut === event.key.toLowerCase())
    if (tool) {
      event.preventDefault()
      store.setTool(tool.id)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}
