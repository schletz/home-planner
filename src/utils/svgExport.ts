import { PLAN_STYLE } from '@/utils/planStyle'
import { round } from '@/utils/geometry'

/** Empty border around the drawing in the exported file, in cm. */
const MARGIN = 60

/**
 * Removes everything the renderer left behind: Vue's marker comments and the
 * scope attributes of scoped styles. They would only confuse a CAD program.
 */
function removeEditorArtefacts(root: Element): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
  const comments: Node[] = []
  while (walker.nextNode()) comments.push(walker.currentNode)
  comments.forEach((comment) => comment.parentNode?.removeChild(comment))

  for (const element of [root, ...Array.from(root.querySelectorAll('*'))]) {
    for (const name of Array.from(element.attributes)) {
      if (name.name.startsWith('data-v-')) element.removeAttribute(name.name)
    }
  }
}

/**
 * Scale of the exported document. The coordinates stay in centimetres, only the
 * paper size follows this scale: at 1:50 a wall of 400 cm is 80 mm wide, which
 * is the usual scale of a floor plan and keeps the file printable. Rescaling in
 * Illustrator or a CAD program is a single value in the import dialog.
 */
const EXPORT_SCALE = 50

/**
 * Builds a standalone SVG document from the live plan group. The group is
 * cloned instead of rebuilt, so the file always shows exactly what the screen
 * shows. Only the helpers that exist for interaction are removed.
 *
 * One user unit of the exported file is one centimetre of the building.
 */
export function buildSvgDocument(planGroup: SVGGElement): string {
  const box = planGroup.getBBox()
  const minX = round(box.x - MARGIN, 2)
  const minY = round(box.y - MARGIN, 2)
  const width = round(Math.max(box.width, 1) + MARGIN * 2, 2)
  const height = round(Math.max(box.height, 1) + MARGIN * 2, 2)

  const clone = planGroup.cloneNode(true) as SVGGElement
  clone.querySelectorAll('.plan-wall-hit').forEach((element) => element.remove())
  clone.querySelectorAll('.is-selected').forEach((element) => element.classList.remove('is-selected'))
  removeEditorArtefacts(clone)

  const paperWidth = round((width * 10) / EXPORT_SCALE, 2)
  const paperHeight = round((height * 10) / EXPORT_SCALE, 2)

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Wohnungsplan, Maßstab 1:${EXPORT_SCALE}, eine Einheit im viewBox entspricht 1 cm -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
     width="${paperWidth}mm" height="${paperHeight}mm"
     viewBox="${minX} ${minY} ${width} ${height}">
  <style>${PLAN_STYLE}</style>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#ffffff" />
${clone.outerHTML}
</svg>
`
}
