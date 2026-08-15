# Wohnungsplaner — Referenz für Agenten

## Zweck

Editor für Wohnungsgrundrisse als Rohplan. Der Plan besteht ausschließlich aus
geraden Wänden mit Objekten darin, es gibt keine Flächen, keine Räume und keine
Flächenberechnung. Bearbeitet wird über Zahleneingaben in Dialogen und in der
Palette, nicht durch Ziehen mit der Maus. Ausgabe ist eine SVG-Datei zur
Weiterverarbeitung in Illustrator oder einem CAD-Programm.

Reine Client-Anwendung ohne Backend: Vue 3 mit `<script setup lang="ts">`, Vite,
Auslieferung als statisches Bundle auf GitHub Pages. Persistenz ausschließlich im
Local Storage und über heruntergeladene Dateien.

Nutzerdokumentation und Beschreibung des JSON-Formats stehen in
[README.md](README.md); diese Datei beschreibt den inneren Aufbau.

## Modulüberblick

Zeilenzahlen inklusive `<template>` und `<style>` der SFCs.

| Datei | Zeilen | Verantwortung |
| --- | --- | --- |
| [src/App.vue](src/App.vue) | 175 | Schale; verbindet Klick auf der Zeichenfläche mit dem passenden Dialog, Dateikommandos, Einpassen |
| [src/components/canvas/PlanCanvas.vue](src/components/canvas/PlanCanvas.vue) | 375 | Zeichenfläche: Layout mit Linealen, gesamte Zeigerinteraktion, Nullpunkt-Ziehen, Injektion von `PLAN_STYLE` |
| [src/components/canvas/CanvasGrid.vue](src/components/canvas/CanvasGrid.vue) | 73 | 10/50-cm-Raster und Achsenkreuz als je ein `<path>` |
| [src/components/canvas/CanvasRuler.vue](src/components/canvas/CanvasRuler.vue) | 130 | Lineal waagrecht/senkrecht, Beschriftungsraster abhängig vom Zoom |
| [src/components/plan/PlanView.vue](src/components/plan/PlanView.vue) | 70 | Wurzelgruppe der Zeichnung; genau dieses Element wird exportiert; Reihenfolge der drei Zeichendurchgänge |
| [src/components/plan/WallBody.vue](src/components/plan/WallBody.vue) | 51 | Körpersegmente einer Wand, je Durchgang als Kontur oder als Füllung |
| [src/components/plan/WallShape.vue](src/components/plan/WallShape.vue) | 82 | Alles über dem Wandkörper: Klickfläche, Objekte, zwei Bemaßungsreihen |
| [src/components/plan/OpeningShape.vue](src/components/plan/OpeningShape.vue) | 155 | Türe, Fenster, Doppelfenster inklusive Flügel und Bogen |
| [src/components/plan/InstallationShape.vue](src/components/plan/InstallationShape.vue) | 192 | Steckdose, Wasseranschluss, Heizkörper, Schacht mit Beschriftung |
| [src/components/plan/DimensionRow.vue](src/components/plan/DimensionRow.vue) | 92 | Eine Bemaßungsreihe: Maßhilfslinien, Maßlinie, Schrägstriche, Zahlen |
| [src/components/plan/ShaftDimensions.vue](src/components/plan/ShaftDimensions.vue) | 133 | Eigene Breiten- und Tiefenbemaßung eines Schachts |
| [src/components/ribbon/RibbonToolbar.vue](src/components/ribbon/RibbonToolbar.vue) | 112 | Symbolleiste, Gruppen Datei/Werkzeuge/Formen/Installation/Ansicht |
| [src/components/ribbon/RibbonButton.vue](src/components/ribbon/RibbonButton.vue) | 78 | Einzelner Ribbon-Knopf |
| [src/components/ribbon/RibbonIcon.vue](src/components/ribbon/RibbonIcon.vue) | 23 | Rendert Pfade aus `ICONS` |
| [src/components/ribbon/icons.ts](src/components/ribbon/icons.ts) | 26 | Pfaddaten aller Symbole auf 24×24-Raster |
| [src/components/palette/PropertiesPalette.vue](src/components/palette/PropertiesPalette.vue) | 155 | Rechte Palette, verteilt auf die drei Eigenschaftsblöcke, Shortcut-Legende |
| [src/components/palette/WallProperties.vue](src/components/palette/WallProperties.vue) | 168 | Wandeigenschaften, Objektliste der Wand |
| [src/components/palette/OpeningProperties.vue](src/components/palette/OpeningProperties.vue) | 86 | Eigenschaften einer Öffnung |
| [src/components/palette/InstallationProperties.vue](src/components/palette/InstallationProperties.vue) | 111 | Eigenschaften einer Installation |
| [src/components/dialogs/BaseDialog.vue](src/components/dialogs/BaseDialog.vue) | 133 | Modaler Rahmen, Tastaturbedienung, Fokus |
| [src/components/dialogs/WallDialog.vue](src/components/dialogs/WallDialog.vue) | 147 | Dialog für eine neue Wand |
| [src/components/dialogs/OpeningDialog.vue](src/components/dialogs/OpeningDialog.vue) | 107 | Dialog für eine neue Öffnung |
| [src/components/dialogs/InstallationDialog.vue](src/components/dialogs/InstallationDialog.vue) | 113 | Dialog für eine neue Installation |
| [src/components/dialogs/AnglePreview.vue](src/components/dialogs/AnglePreview.vue) | 115 | Winkelvorschau mit Pfeil, auch in der Palette verwendet |
| [src/components/form/NumberField.vue](src/components/form/NumberField.vue) | 124 | Zahlenfeld mit Einheit, `commit` beim Verlassen, optional mit Rechenausdruck |
| [src/components/form/ObjectOffsetFields.vue](src/components/form/ObjectOffsetFields.vue) | 65 | Die zwei gekoppelten Abstandsfelder eines Wandobjekts |
| [src/components/form/TextField.vue](src/components/form/TextField.vue) | 50 | Textfeld |
| [src/components/form/CheckField.vue](src/components/form/CheckField.vue) | 62 | Kontrollkästchen mit Erklärzeile, meldet `commit` sofort |
| [src/components/form/OptionGroup.vue](src/components/form/OptionGroup.vue) | 99 | Radiogruppe als Segmentschalter, generisch über `T extends string` |
| [src/components/StatusBar.vue](src/components/StatusBar.vue) | 63 | Cursorposition, Werkzeug, Zoom, Wandzahl |
| [src/composables/usePlanStore.ts](src/composables/usePlanStore.ts) | 244 | Plan, Auswahl, Werkzeug, Undo, Autospeichern |
| [src/composables/useViewport.ts](src/composables/useViewport.ts) | 118 | Pan und Zoom, Umrechnung Pixel ↔ Modell |
| [src/composables/useSnapping.ts](src/composables/useSnapping.ts) | 53 | Einrasten an Endpunkten und Raster |
| [src/composables/useShortcuts.ts](src/composables/useShortcuts.ts) | 119 | Globale Tastaturbedienung |
| [src/composables/useDefaults.ts](src/composables/useDefaults.ts) | 123 | Zuletzt benutzte Dialogwerte, eigener Storage-Key |
| [src/composables/useModalState.ts](src/composables/useModalState.ts) | 27 | Zähler offener Dialoge |
| [src/types/plan.ts](src/types/plan.ts) | 153 | Datenmodell und Typwächter |
| [src/types/tools.ts](src/types/tools.ts) | 28 | Werkzeugliste samt Kürzeln |
| [src/utils/geometry.ts](src/utils/geometry.ts) | 114 | Wandkoordinatensystem |
| [src/utils/wallGeometry.ts](src/utils/wallGeometry.ts) | 117 | Eckenüberstand, Öffnungsintervalle, Wandsegmente, Bogenpfad |
| [src/utils/objectSpacing.ts](src/utils/objectSpacing.ts) | 78 | Ausdehnung eines Objekts und Abstand zum vorigen Objekt |
| [src/utils/dimensions.ts](src/utils/dimensions.ts) | 77 | Maßketten |
| [src/utils/expression.ts](src/utils/expression.ts) | 127 | Rechenausdrücke in Eingabefeldern |
| [src/utils/planStyle.ts](src/utils/planStyle.ts) | 176 | Maße und CSS der Zeichnung |
| [src/utils/storage.ts](src/utils/storage.ts) | 198 | Parsen, Local Storage, Datei-Download und -Auswahl |
| [src/utils/svgExport.ts](src/utils/svgExport.ts) | 64 | Aufbau des SVG-Dokuments |
| [src/utils/id.ts](src/utils/id.ts) | 13 | Kurze IDs |

Externe Abhängigkeiten: ausschließlich `vue` zur Laufzeit. Build über `vite` und
`@vitejs/plugin-vue`, Typprüfung über `vue-tsc`. Keine UI-Bibliothek, kein Pinia,
kein Router, keine Icon-Bibliothek, kein Testframework.

Die drei Singleton-Composables (`usePlanStore`, `useViewport`, `useDefaults`)
halten ihren Zustand auf Modulebene und geben bei jedem Aufruf dasselbe Objekt
zurück — es gibt keine Instanziierung pro Komponente und keine Provide/Inject-Kette.

## Kernkonzept: die zwei Koordinatensysteme

Das ist die eine Sache, die man verstanden haben muss. Fast jeder Fehler in
diesem Projekt entsteht durch Verwechslung der beiden Systeme oder der
Vorzeichen.

**Weltsystem.** Zentimeter, x nach rechts, y nach **unten** (SVG-Konvention). Der
Ursprung des Weltsystems ist nicht der Nullpunkt der Lineale; letzterer ist ein
reiner Anzeigewert in `plan.origin` und verschiebt nur Beschriftungen, Raster und
Rasterfangpunkte.

**Winkel.** Grad, gegen den Uhrzeigersinn, 0° nach rechts, 90° nach **oben**.
Weil y nach unten zeigt, steht in [wallDirection](src/utils/geometry.ts#L31) das
Minus: `d = (cos a, −sin a)`. Die Normale zur `above`-Seite ist
`n = (d.y, −d.x)` [geometry.ts:37](src/utils/geometry.ts#L37) — für eine Wand mit
0° also `(0, −1)`, auf dem Bildschirm nach oben.

**`above` und `below`** sind keine Bildschirmrichtungen, sondern Seiten relativ
zur Laufrichtung der Wand: `above` ist links, wenn man vom Wandanfang zum
Wandende geht. Bei einem im Uhrzeigersinn gezeichneten Raum liegt `above` damit
auf allen vier Wänden außen — daher stimmen Bemaßungen und Symbole ohne
Sonderfall.

**Wandlokales System.** Die Wandgruppe trägt
`translate(x y) rotate(−angle)` aus
[wallTransform](src/utils/geometry.ts#L52). Darin gilt:

- lokales x läuft von `0` am Wandanfang bis `length` am Wandende,
- lokales y ist `0` auf der Mittellinie und wird zur **`below`**-Seite positiv,
- die Wand füllt `y ∈ [−thickness/2, +thickness/2]`.

Das negative Vorzeichen in `rotate(−angle)` gleicht den Richtungssinn aus: SVG
dreht bei positiven Winkeln im Bildschirmsinn, das Modell zählt gegen den
Uhrzeigersinn.

Deshalb genügt in allen Formkomponenten reine Rechteck- und Liniengeometrie ohne
eine einzige Winkelfunktion. Die Umrechnung machen
[localToWorld](src/utils/geometry.ts#L62),
[worldToLocal](src/utils/geometry.ts#L72) und
[sideSign](src/utils/geometry.ts#L57) (`above → −1`, `below → +1`).

**Invarianten dieses Konzepts.** Wer eine davon bricht, bekommt gespiegelte oder
verdrehte Pläne, ohne dass etwas abstürzt:

1. `sideSign('above') === -1` muss zum Vorzeichen in `wallNormal` und zur
   Drehrichtung in `wallTransform` passen. Diese drei Stellen sind nur gemeinsam
   änderbar. Dasselbe Vorzeichen steckt in den Bemaßungsabständen einer Wand:
   negativ ist die `above`-Seite.
2. `worldToLocal(wall, localToWorld(wall, u, v)) === (u, v)` für alle Wände.
3. Objekte speichern ihren Ort ausschließlich als `offset` entlang der Wand.
   Es gibt keine Weltkoordinate an einem Objekt; das Verschieben einer Wand darf
   deshalb nie Objektdaten anfassen.
4. Beschriftungen werden bei `angle ∈ (90°, 270°]` um 180° gedreht
   ([isTextFlipped](src/utils/geometry.ts#L111)). Damit das punktgenau bleibt,
   liegen die Textanker auf der optischen Mitte, `PLAN_STYLE` setzt dafür
   `dominant-baseline: central` ([planStyle.ts:174](src/utils/planStyle.ts#L174)).
   Wird die Baseline geändert, verspringen alle gedrehten Zahlen um eine halbe
   Textzeile.

## Datenfluss

### Objekt einfügen

```
pointerdown auf der Zeichenfläche
 ├─ [Treffer auf Wand]  WallShape emittiert pick-wall     WallShape.vue:55
 │    └─ onPickWall(event, wallId)                        PlanCanvas.vue:163
 │         ├─ [Werkzeug select]   store.select({wallId})
 │         ├─ [Werkzeug wall]     emit place-wall
 │         └─ [Einfügewerkzeug]   worldToLocal → offset (auf ganze cm gerundet)
 │                                emit place-object(wallId, offset)
 ├─ [Treffer auf Objekt] onPickObject(...)                PlanCanvas.vue:187
 │    └─ [Werkzeug ≠ select] delegiert an onPickWall
 └─ [kein Treffer]      onPointerDown                     PlanCanvas.vue:125
      ├─ [Werkzeug wall] snapPoint → emit place-wall
      └─ [Werkzeug select] store.select(null)

App.vue setzt pendingWallStart bzw. pendingObject             App.vue:42/46
 └─ v-if wählt den Dialog nach dem aktiven Werkzeug            App.vue:127-155
      └─ confirm → store.addWall / store.addObject → commit()
```

Reihenfolgeabhängigkeiten:

1. `updateCursor` [PlanCanvas.vue:105](src/components/canvas/PlanCanvas.vue#L105)
   muss vor jedem `emit('place-wall')` laufen, denn der Wandstartpunkt wird aus
   `cursor.value.model` gelesen, also aus dem **gefangenen** Punkt.
2. Welcher Dialog erscheint, hängt am aktiven Werkzeug, nicht am ausgelösten
   Ereignis. Ein Werkzeugwechsel bei offenem Dialog würde den Dialogtyp
   umschalten — genau deshalb sperrt `useShortcuts` alle Tasten, solange ein
   Dialog offen ist ([useShortcuts.ts:36](src/composables/useShortcuts.ts#L36)).
3. `event.preventDefault()` in den beiden Zweigen, die einen Dialog öffnen
   ([PlanCanvas.vue:139](src/components/canvas/PlanCanvas.vue#L139) und
   [PlanCanvas.vue:181](src/components/canvas/PlanCanvas.vue#L181)), unterdrückt
   die Kompatibilitäts-Mausereignisse. Ohne das zieht der nachfolgende
   `mousedown` den Fokus aus dem gerade fokussierten Dialogfeld zurück auf den
   Body, und die Eingabe landet nirgends.

### Zeichnen und Export

```
PlanCanvas <svg>                                    PlanCanvas.vue:266
 ├─ <style> mit PLAN_STYLE, per Skript eingefügt     PlanCanvas.vue:60-73
 ├─ <g transform="translate(pan) scale(scale)">
 │    ├─ CanvasGrid (pointer-events: none)
 │    └─ <g ref="planGroup">        ← einziges Exportobjekt
 │         └─ PlanView, drei Durchgänge über alle Wände
 │              ├─ WallBody pass="outline"  je Segment aus bodySpans()
 │              ├─ WallBody pass="fill"     dieselben Segmente, ohne Kontur
 │              └─ WallShape je Wand
 │                   ├─ plan-wall-hit (transparente Klicklinie)
 │                   ├─ OpeningShape / InstallationShape je Objekt
 │                   │    └─ ShaftDimensions nur beim Schacht
 │                   └─ DimensionRow für Detail- und Gesamtbemaßung
 └─ canvas-crosshair (pointer-events: none)          PlanCanvas.vue:280

exportSvg()                                         App.vue:81
 └─ buildSvgDocument(planGroup)                      svgExport.ts:39
      ├─ getBBox() → Ausschnitt in Zentimetern
      ├─ cloneNode(true), .plan-wall-hit entfernen,
      │  .is-selected entfernen, removeEditorArtefacts()
      └─ Dokument mit PLAN_STYLE + weißem Hintergrundrechteck
```

Reihenfolgeabhängigkeiten:

1. `planGroup` darf **kein eigenes Transform** bekommen. `getBBox()` liefert
   Koordinaten im eigenen Benutzersystem des Elements; nur weil die Gruppe
   untransformiert unter der Zoomgruppe hängt, sind Exportausschnitt und
   `fitToPlan` [App.vue:95](src/App.vue#L95) direkt in Zentimetern.
2. `PLAN_STYLE` wird in `onMounted` per `createElementNS` eingehängt, weil der
   Vue-Compiler `<style>`-Elemente aus Templates entfernt. Der Stil muss
   innerhalb des SVG liegen, damit die exportierte Datei dieselben Regeln trägt.
3. Bildschirm und Datei können nur deshalb nicht auseinanderlaufen, weil
   exportiert wird, was gerendert ist. Wer den Export durch einen zweiten
   Renderpfad ersetzt, verliert diese Eigenschaft.
4. Die Klicklinie `.plan-wall-hit` liegt über den Wandkörpern, aber unter allen
   Objekten, und wird vor dem Export gelöscht. Objekte liegen darüber und fangen
   ihre Klicks selbst ab; die Konturen der Wandkörper sind mit
   `pointer-events: none` von der Trefferprüfung ausgenommen.
5. Die drei Durchgänge in `PlanView` sind nicht vertauschbar. Erst alle
   Konturen, dann alle Füllungen — nur so verdeckt die Füllung einer Wand die
   Kontur der Nachbarwand, die durch sie hindurchläuft. Objekte und Bemaßung
   kommen zuletzt, weil das weiße Leibungsrechteck einer Öffnung sonst unter dem
   Wandkörper läge. Eine einzelne Wand lässt sich daher nicht mehr für sich
   allein zeichnen.

### Undo

`commit()` [usePlanStore.ts:45](src/composables/usePlanStore.ts#L45) legt den
Plan als JSON-Schnappschuss ab und wird von jeder strukturellen Aktion am Ende
selbst aufgerufen. Feldweise Bearbeitung in der Palette schreibt dagegen direkt
in den Store und meldet `commit` erst im `change`-Ereignis des Feldes, also beim
Verlassen oder bei Enter ([NumberField.vue:55](src/components/form/NumberField.vue#L55)).

Daraus folgt: zwischen zwei Commits liegt beliebig viel Tipparbeit, und
`undo()` ruft deshalb zuerst selbst `commit()` auf
([usePlanStore.ts:164](src/composables/usePlanStore.ts#L164)), damit die
angefangene Änderung überhaupt einen Schritt bildet, den man zurücknehmen kann.

`applySnapshot` ersetzt `state.plan` durch ein frisch geparstes Objekt und ruft
`validateSelection` [usePlanStore.ts:61](src/composables/usePlanStore.ts#L61),
weil die Auswahl sonst auf eine gelöschte ID zeigt.

## Schnittstelle

### Store

`usePlanStore()` [usePlanStore.ts:242](src/composables/usePlanStore.ts#L242)
liefert das Singleton mit der in
[PlanStore](src/composables/usePlanStore.ts#L182) deklarierten Fläche.

| Aufruf | Zeile | Commit | Anmerkung |
| --- | --- | --- | --- |
| `addWall(input)` | [86](src/composables/usePlanStore.ts#L86) | ja | vergibt ID, wählt die Wand aus, gibt sie zurück |
| `updateWall(id, patch)` | [94](src/composables/usePlanStore.ts#L94) | **nein** | für Livebearbeitung; Aufrufer muss `commit()` melden |
| `removeWall(id)` | [99](src/composables/usePlanStore.ts#L99) | ja | löscht Auswahl mit |
| `addObject(wallId, object)` | [107](src/composables/usePlanStore.ts#L107) | ja | Objekt kommt fertig samt ID aus dem Dialog |
| `updateObject(wallId, objectId, patch)` | [115](src/composables/usePlanStore.ts#L115) | **nein** | wie `updateWall` |
| `removeObject(wallId, objectId)` | [120](src/composables/usePlanStore.ts#L120) | ja | Auswahl fällt auf die Wand zurück |
| `removeSelection()` | [131](src/composables/usePlanStore.ts#L131) | ja | Objekt falls gewählt, sonst ganze Wand |
| `setOrigin(point)` | [138](src/composables/usePlanStore.ts#L138) | ja | Nullpunkt der Lineale |
| `setTool(tool)` | [143](src/composables/usePlanStore.ts#L143) | – | löscht die Auswahl bei jedem Werkzeug außer `select` |
| `loadPlan(plan)` / `newPlan()` | [152](src/composables/usePlanStore.ts#L152) | – | setzen die Historie zurück, nicht rücknehmbar |
| `undo()` / `redo()` | [164](src/composables/usePlanStore.ts#L164) | – | siehe oben |

### Ereignisse der Zeichenfläche

`PlanCanvas` emittiert `place-wall(point)`, `place-object(wallId, offset)` und
`cursor(point | null)` und exponiert `planElement()`
([PlanCanvas.vue:217](src/components/canvas/PlanCanvas.vue#L217)) als einzigen
Zugriff auf die Zeichnungsgruppe.

### Persistenz

| Schlüssel | Ort | Inhalt |
| --- | --- | --- |
| `home-planner:plan` | [storage.ts:15](src/utils/storage.ts#L15) | aktueller Plan, geschrieben von einem `deep`-Watcher [usePlanStore.ts:34](src/composables/usePlanStore.ts#L34) |
| `home-planner:defaults` | [useDefaults.ts:43](src/composables/useDefaults.ts#L43) | zuletzt bestätigte Dialogwerte, `deep`-Watcher [useDefaults.ts:109](src/composables/useDefaults.ts#L109) |

`parsePlan` [storage.ts:117](src/utils/storage.ts#L117) ist die einzige Grenze zur
Außenwelt und toleriert alles: unbekannte Felder fallen weg, fehlende oder
falsch typisierte Werte werden durch Vorgaben ersetzt, Objekte mit unbekanntem
`kind` verschwinden. Ein Plan gelangt nie ungeprüft in den Store — auch der
Schnappschuss beim Undo läuft durch diese Funktion.

## Konstanten-Referenz

### Zeichnungsmaße — [src/utils/planStyle.ts](src/utils/planStyle.ts)

Alle Werte in Zentimetern, weil eine Benutzereinheit des SVG ein Zentimeter ist.

| Konstante | Zeile | Wert | Bedeutung |
| --- | --- | --- | --- |
| `DIM_DETAIL_DISTANCE` | [16](src/utils/planStyle.ts#L16) | 40 | Vorgabe der Detailmaßlinie, gemessen ab **Wandaußenkante**, nicht ab Mittellinie |
| `DIM_TOTAL_DISTANCE` | [19](src/utils/planStyle.ts#L19) | 85 | Vorgabe der Gesamtmaßlinie, ebenfalls ab Außenkante |
| `DIM_SHAFT_DISTANCE` | [26](src/utils/planStyle.ts#L26) | 18 | Abstand der beiden eigenen Maßlinien eines Schachts von dessen Kanten |
| `DIM_TEXT_SIZE` | [29](src/utils/planStyle.ts#L29) | 16 | Höhe der Maßzahlen |
| `DIM_ROW_HEIGHT` | [36](src/utils/planStyle.ts#L36) | 21,6 | Platzbedarf einer Maßreihe hinter ihrer Linie, also bis zur Außenkante der Zahl |
| `DIM_TICK` | [39](src/utils/planStyle.ts#L39) | 7 | halbe Länge des 45°-Schrägstrichs |
| `DIM_EXTENSION_GAP` | [42](src/utils/planStyle.ts#L42) | 6 | Luft zwischen Wandkante und Maßhilfslinie |
| `DIM_EXTENSION_OVERSHOOT` | [45](src/utils/planStyle.ts#L45) | 10 | Überstand der Maßhilfslinie über die Maßlinie |
| `LABEL_TEXT_SIZE` | [48](src/utils/planStyle.ts#L48) | 13 | Höhe der Objektbeschriftungen |

Die beiden ersten Werte sind **nur noch Vorgaben**: jede Wand trägt ihren
eigenen vorzeichenbehafteten Abstand in `totalDimension` und `detailDimension`
(negativ = `above`, positiv = `below`, 0 = keine Reihe). Sie gelten für neue
Wände und als Ersatzwert beim Laden alter Pläne
([parseDimensionOffset](src/utils/storage.ts#L44)).

`DIM_ROW_HEIGHT` ist abgeleitet: die Maßzahl sitzt `0,85 × DIM_TEXT_SIZE` hinter
der Maßlinie und ist dort zentriert, ihre Außenkante liegt also `1,35 ×
DIM_TEXT_SIZE` dahinter. Wer etwas hinter einer Maßreihe zeichnet, muss diesen
Abstand einhalten; genau dafür braucht ihn die Beschriftung des Schachts.

Beide Reihen dürfen auf derselben Seite liegen. Damit sie sich nicht überlagern,
muss ihr Abstandsunterschied größer bleiben als
`DIM_TEXT_SIZE + DIM_EXTENSION_OVERSHOOT`, also größer als 26; bei den Vorgaben
sind es 45. Wer die Werte in der Palette frei setzt, kann sie überlappen lassen —
das wird nicht geprüft.

`PLAN_STYLE` [planStyle.ts:50](src/utils/planStyle.ts#L50) definiert `--plan-line`
(1) und `--plan-hairline` (0,7) auf dem `svg`-Element. Die Zeichenfläche
überschreibt beide inline aus dem Zoom
([PlanCanvas.vue:47](src/components/canvas/PlanCanvas.vue#L47)):
`max(1, 1.2 px)` bzw. `max(0.7, 1 px)` in Zentimetern, damit Haarlinien am
Bildschirm nie unter ein Pixel fallen. Der Export übernimmt die Variablen nicht,
weil nur die Gruppe geklont wird — die Datei bekommt dadurch feste Strichstärken.

### Symbole — [src/components/plan/InstallationShape.vue](src/components/plan/InstallationShape.vue)

| Konstante | Zeile | Wert | Bedeutung |
| --- | --- | --- | --- |
| `SYMBOL_RADIUS` | [19](src/components/plan/InstallationShape.vue#L19) | 9 | Radius von Steckdosenhalbkreis und Wasserkreis |
| `RADIATOR_DEPTH` | [22](src/components/plan/InstallationShape.vue#L22) | 12 | Tiefe des Heizkörperrechtecks |
| `SHAFT_WIDTH` / `SHAFT_DEPTH` | [25](src/components/plan/InstallationShape.vue#L25) | 60 / 40 | Ersatzmaße eines Schachts ohne eigene Angabe |

Abgeleitet: Stiel der Steckdose `SYMBOL_RADIUS × 1.9 = 17,1`; Beschriftungsabstand
`RADIATOR_DEPTH + LABEL_TEXT_SIZE = 25` beim Heizkörper,
`Tiefe + DIM_SHAFT_DISTANCE + DIM_ROW_HEIGHT + LABEL_TEXT_SIZE` beim Schacht,
sonst `SYMBOL_RADIUS × 2.6 = 23,4`
([Zeile 83](src/components/plan/InstallationShape.vue#L83)).
Bis auf den Schacht bleiben alle unter der Vorgabe `DIM_DETAIL_DISTANCE = 40`,
sonst schneidet ein Symbol die Maßlinie. Der Schacht überschreitet sie in jedem
Fall, weil seine Beschriftung hinter seiner eigenen Breitenbemaßung sitzt — bei
Vorgabetiefe 40 sind es 92,6 cm. Liegt er auf derselben Seite wie eine
Wandbemaßung, ist deren Abstand an der Wand zu erhöhen.

### Ansicht — [src/composables/useViewport.ts](src/composables/useViewport.ts)

| Konstante | Zeile | Wert | Bedeutung |
| --- | --- | --- | --- |
| `MIN_SCALE` / `MAX_SCALE` | [13](src/composables/useViewport.ts#L13) | 0,04 / 12 | Pixel je Zentimeter |
| `ZOOM_STEP` | [15](src/composables/useViewport.ts#L15) | 1,25 | Faktor der Zoomknöpfe und Tastenkürzel |
| `RULER_SIZE` | [18](src/composables/useViewport.ts#L18) | 26 | Linealbreite in Pixel, auch Rastermaß des CSS-Grids der Zeichenfläche |
| Startwerte | [29](src/composables/useViewport.ts#L29) | 0,6 / 120 / 120 | Maßstab und Verschiebung beim Kaltstart |
| `fitTo(..., padding)` | [78](src/composables/useViewport.ts#L78) | 80 | Rand in Pixel beim Einpassen |

Das Mausrad zoomt mit dem abweichenden Faktor 1,12
([PlanCanvas.vue:159](src/components/canvas/PlanCanvas.vue#L159)), damit sich
Rasten des Rads feiner anfühlen als Tastendrücke.

### Einrasten, Raster, Lineal

| Wert | Ort | Bedeutung |
| --- | --- | --- |
| `SNAP_GRID = 50` | [useSnapping.ts:7](src/composables/useSnapping.ts#L7) | Fangraster, an `plan.origin` ausgerichtet |
| `SNAP_RADIUS_PX = 12` | [useSnapping.ts:10](src/composables/useSnapping.ts#L10) | Fangradius in Pixel; in Modelleinheiten also zoomabhängig |
| `FINE = 10`, `COARSE = 50` | [CanvasGrid.vue:16](src/components/canvas/CanvasGrid.vue#L16) | Rasterweiten |
| Schwelle feines Raster | [CanvasGrid.vue:20](src/components/canvas/CanvasGrid.vue#L20) | `scale × 10 ≥ 4 px`, also ab Maßstab 0,4 |
| `STEPS` | [CanvasRuler.vue:23](src/components/canvas/CanvasRuler.vue#L23) | Kandidaten für den Beschriftungsabstand |
| Schwellen des Lineals | [CanvasRuler.vue:31](src/components/canvas/CanvasRuler.vue#L31) | Beschriftung ab 55 px Abstand, Zwischenstriche ab 5 px |
| `PAN_STEP = 60` | [useShortcuts.ts:16](src/composables/useShortcuts.ts#L16) | Pixel je Pfeiltastendruck, mit Shift das Vierfache |
| `HISTORY_LIMIT = 100` | [usePlanStore.ts:16](src/composables/usePlanStore.ts#L16) | Schnappschüsse, ältester fällt heraus |
| `SNAP_DECIMALS = 1` | [useSnapping.ts:20](src/composables/useSnapping.ts#L20) | Nachkommastellen eines gefangenen Punktes |
| `JUNCTION_TOLERANCE = 0.5` | [wallGeometry.ts:20](src/utils/wallGeometry.ts#L20) | ab wann ein Wandende auf einer anderen Wand liegt |
| Klickbreite dünner Wände | [PlanCanvas.vue:44](src/components/canvas/PlanCanvas.vue#L44) | 14 px, in Zentimeter umgerechnet |

Die Fangreihenfolge ist fest: erst der nächste Wandendpunkt über alle Wände, nur
wenn keiner im Radius liegt der nächste Rasterpunkt, sonst der auf ganze
Zentimeter gerundete Zeigerpunkt
([useSnapping.ts:36](src/composables/useSnapping.ts#L36)).

Endpunkte und Rasterpunkte werden auf `SNAP_DECIMALS` gerundet. Ein Wandende
entsteht aus Sinus und Kosinus, ohne die Rundung fängt die angesetzte Wand sonst
bei 615,9999999999999 statt bei 616 an.

### Export — [src/utils/svgExport.ts](src/utils/svgExport.ts)

| Konstante | Zeile | Wert | Bedeutung |
| --- | --- | --- | --- |
| `MARGIN` | [5](src/utils/svgExport.ts#L5) | 60 cm | Rand rings um die Zeichnung |
| `EXPORT_SCALE` | [30](src/utils/svgExport.ts#L30) | 50 | Maßstab des Blattes |

Papiermaß in Millimetern ist `(Ausschnitt_cm × 10) / EXPORT_SCALE`. Ein Plan mit
967 cm Ausschnittbreite ergibt 193,4 mm. Die `viewBox` bleibt in Zentimetern; ein
anderer Maßstab ändert nur die beiden Attribute `width` und `height`, nie die
Koordinaten. Ein Maßstab 1:1 ist möglich, erzeugt aber Dokumente von mehreren
Metern Kantenlänge, die Browser und Viewer beim Rastern blockieren.

## Details zur Zeichnung

**Wandkörper.** [bodySpans](src/utils/wallGeometry.ts#L68) liefert die massiven
Abschnitte zwischen den Öffnungen; überlappende Öffnungen werden vorher
verschmolzen, Abschnitte unter 0,01 cm entfallen. Jeder Abschnitt wird ein
eigenes Rechteck. Eine Wand ohne Öffnungen ergibt genau ein Rechteck.

**Ecken.** [wallOverhang](src/utils/wallGeometry.ts#L43) prüft für beide
Wandenden, ob ein anderes Wandstück durch diesen Punkt läuft — über
[distanceToWall](src/utils/geometry.ts#L91), das auch T-Stöße erfasst, nicht nur
gemeinsame Endpunkte. Trifft es zu, wird der Körper um die **halbe Stärke der
getroffenen Wand** verlängert und reicht damit bis an deren Außenkante. Freie
Wandenden bleiben auf ihrer exakten Länge, sonst würde die Zeichnung nicht mehr
zur Maßzahl passen.

Die Verlängerung betrifft ausschließlich den Körper. `wall.length`, alle
`offset`-Werte und beide Bemaßungsreihen bleiben unberührt. Die überlappenden
Rechtecke sehen nur deshalb wie ein durchgehender Körper aus, weil `PlanView`
erst alle Konturen und danach alle Füllungen zeichnet; die Füllung deckt jede
Kontur ab, die durch sie hindurchläuft. Weil sie dabei auch die innere Hälfte
der eigenen Kontur deckt, ist `.plan-wall-outline` doppelt so breit gesetzt wie
die Linie erscheinen soll ([planStyle.ts:60](src/utils/planStyle.ts#L60)).

**Schacht.** Ein Rechteck, das mit `length` entlang der Wand und mit `depth` in
den Raum ragt, gezeichnet als ein einziger offener Pfad
([InstallationShape.vue:63](src/components/plan/InstallationShape.vue#L63)): SVG
füllt einen offenen Pfad, als wäre er geschlossen, zeichnet aber nur die
angegebenen Segmente. So bekommt der Schacht seine Kontur auf den drei freien
Seiten, und die vierte, die in der Wandfläche liegt, bleibt strichlos — sonst
zerschnitte eine Linie die Wand. Der Schacht hat keine sinnvolle Montagehöhe;
`height` wird auf 0 gesetzt und die Beschriftung zeigt nur den freien Text.

Als einziges Objekt hat er eine Ausdehnung in beide Richtungen, und seine Tiefe
zeigt von der Wand weg — eine Reihe entlang der Wand kann sie nie zeigen. Er
bringt deshalb seine eigene Bemaßung mit
([ShaftDimensions](src/components/plan/ShaftDimensions.vue)): die Breite hinter
der Außenkante, die Tiefe neben der rechten Kante, beide mit den Klassen von
`DimensionRow`. Die Tiefenzahl steht um 90° gedreht und folgt derselben
Umkehrung wie alle anderen Beschriftungen. Das Kästchen *in Bemaßung
berücksichtigen* steuert beim Schacht nur, ob er **zusätzlich** in der
Detailbemaßung der Wand auftaucht; seine eigenen Maßpfeile bleiben immer.

**Öffnung.** Reihenfolge im DOM und damit von hinten nach vorne:
weißes Leibungsrechteck ohne Kontur, die zwei Laibungslinien, die beiden
Stockrechtecke, bei Fenstern zwei Glaslinien bei `±thickness/6` und beim
Doppelfenster ein Mittelstock, dann Flügel und Bogen
([OpeningShape.vue:84](src/components/plan/OpeningShape.vue#L84)). Das weiße
Rechteck ist nötig, damit das Raster nicht durch die Öffnung scheint.

`clearWidth = max(width − 2 × frame, 1)`
([wallGeometry.ts:105](src/utils/wallGeometry.ts#L105)) ist die lichte Weite und
zugleich der Bogenradius. `frame` wird beim Zeichnen auf höchstens
`(Öffnungsbreite / 2) − 0,5` begrenzt
([OpeningShape.vue:28](src/components/plan/OpeningShape.vue#L28)).

Flügelzahl nach Art: Türe und Fenster einer, Doppelfenster zwei mit je halber
lichter Weite, außen angeschlagen
([OpeningShape.vue:40](src/components/plan/OpeningShape.vue#L40)). Beim
Doppelfenster wertet die Darstellung nur die Seite aus `swing` aus, der
Anschlagteil bleibt ohne Wirkung.

**Bogenrichtung.** [arcPath](src/utils/wallGeometry.ts#L92) bestimmt das
`sweep-flag` aus dem Kreuzprodukt der beiden Radiusvektoren und nimmt damit immer
den kurzen Weg. Für genau 180° ist das Kreuzprodukt null und die Richtung
unbestimmt — der Halbkreis der Steckdose wird deshalb als eigener Pfad mit
explizitem Flag gebaut
([InstallationShape.vue:35](src/components/plan/InstallationShape.vue#L35)).

**Maßkette.** [detailTicks](src/utils/dimensions.ts#L24) sammelt für jedes Objekt
beide Kanten aus [objectExtent](src/utils/objectSpacing.ts#L30) — bei Öffnungen
die Leibungskanten, bei Heizkörper und Schacht die Enden ihrer `length`, bei
allem anderen zweimal die Mitte —, klemmt alles auf `[0, length]` und wirft
Punkte weg, die weniger als `EPSILON = 0.05` auseinander liegen. Ergibt die Kette
nur ein Segment, liefert [detailSegments](src/utils/dimensions.ts#L72) eine leere
Liste, damit eine objektlose Wand nicht zweimal dasselbe Maß trägt.

Objekte mit `includeInDimension: false` liefern gar keine Punkte
([isDimensioned](src/types/plan.ts#L140)). Damit bleibt die Kette lesbar, wenn
zwei Objekte übereinander liegen — ein Heizkörper unter einem Fenster ergäbe
sonst zwei Zahlenreihen im selben Maßstrang.

**Bemaßungsrand.** [applyMargins](src/utils/dimensions.ts#L56) rückt in beiden
Reihen nur den ersten und den letzten Strich um `dimensionMarginStart` bzw.
`dimensionMarginEnd` nach innen. Das ist der einzige Ort, an dem gezeichnete
Lage und gemessener Wert auseinanderfallen: `from`/`to` eines Segments sind
Zeichenkoordinaten, `length` bleibt der Modellwert. Gemessen wird im
Rauminneren, gespeichert wird die Mittellinie — die Ränder schließen diese
Lücke, ohne eine einzige Maßzahl zu verändern. Objektstriche bleiben unberührt.

**Objektabstände.** Dieselbe Ausdehnung ist die Grundlage der zweiten
Positionsangabe in Dialog und Palette. [previousEnd](src/utils/objectSpacing.ts#L50)
sucht das Objekt mit der größten Startkante vor dem eigenen Start und liefert
dessen Endkante, sonst 0 für den Wandanfang;
[gapBefore](src/utils/objectSpacing.ts#L62) ist die Differenz dazu und damit
genau die Zahl, die in der Detailbemaßung zwischen beiden Objekten steht.
[startForGap](src/utils/objectSpacing.ts#L71) rechnet zurück. Der Vorgänger wird
dabei aus der **aktuellen** Lage bestimmt, nicht aus der neuen, sonst wanderte
der Bezugspunkt beim Tippen mit. Objekte ohne Bemaßung kommen als Vorgänger
nicht in Frage, sonst zeigte das Feld eine Zahl, die im Plan nirgends steht.
[ObjectOffsetFields](src/components/form/ObjectOffsetFields.vue) hält beide
Felder zusammen; `leading` gibt an, wie weit das Objekt vor seinem `offset`
beginnt (halbe Länge bei Heizkörper und Schacht, 0 bei Öffnungen).

**Rechenausdrücke.** Beide Abstandsfelder setzen `expression` an
[NumberField](src/components/form/NumberField.vue) und lassen damit Eingaben wie
`142/2+1` zu, ausgewertet von
[evaluateExpression](src/utils/expression.ts) mit Punkt-vor-Strich, Klammern und
Vorzeichen. Ein solches Feld ist ein `input type="text"`, hat also keine
Pfeiltasten-Schrittweite mehr. Während des Tippens meldet es jeden auswertbaren
Zwischenstand, beim Verlassen ersetzt es den Ausdruck durch sein Ergebnis; ist
er unvollständig, bleibt der letzte gültige Wert stehen.

**Auswahl.** Die Hervorhebung ist reines CSS über die Klasse `is-selected`
([planStyle.ts:67](src/utils/planStyle.ts#L67) und
[planStyle.ts:146](src/utils/planStyle.ts#L146)); der Export entfernt die Klasse an
allen geklonten Elementen.

## Fehlerbehandlung

| Situation | Verhalten | Ort |
| --- | --- | --- |
| Kaputtes JSON im Local Storage | `catch` liefert `null`, Anwendung startet mit leerem Plan | [storage.ts:149](src/utils/storage.ts#L149) |
| Local Storage nicht schreibbar (privater Modus, voll) | still ignoriert, Arbeit läuft ohne Persistenz weiter | [storage.ts:140](src/utils/storage.ts#L140) |
| Datei ohne gültiges JSON geöffnet | `openPlanFromFile` liefert `null`, `openPlan` bricht **wortlos** ab — der Nutzer sieht keinen Hinweis | [storage.ts:193](src/utils/storage.ts#L193), [App.vue:70](src/App.vue#L70) |
| Datei mit gültigem JSON, aber fremdem Aufbau | `parsePlan` erzeugt einen Plan aus Vorgabewerten, Wände können verschwinden | [storage.ts:117](src/utils/storage.ts#L117) |
| Export bei leerem Plan | `window.alert`, kein Download | [App.vue:84](src/App.vue#L84) |
| Neuer Plan bei vorhandenen Wänden | `window.confirm`, Abbruch möglich | [App.vue:66](src/App.vue#L66) |
| Auswahl zeigt nach Undo auf gelöschtes Objekt | `validateSelection` fällt auf die Wand oder auf `null` zurück | [usePlanStore.ts:61](src/composables/usePlanStore.ts#L61) |
| Unlesbare Zahl oder unvollständiger Rechenausdruck im Eingabefeld | beim Verlassen auf den letzten gültigen Wert zurückgesetzt | [NumberField.vue:55](src/components/form/NumberField.vue#L55) |
| Objekt ragt über das Wandende hinaus | Darstellung und Bemaßung klemmen den Wert, die Daten bleiben unverändert | [wallGeometry.ts:51](src/utils/wallGeometry.ts#L51) |
| Plan mit `above`/`below`/`none` als Bemaßungsangabe | wird beim Laden in den vorzeichenbehafteten Abstand umgerechnet | [storage.ts:44](src/utils/storage.ts#L44) |
| Objekt ohne `includeInDimension`, Wand ohne Bemaßungsränder | gelten als bemaßt bzw. als Rand 0, alte Dateien bleiben damit lesbar | [storage.ts:52](src/utils/storage.ts#L52) |

Es gibt keinen `errorCaptured`-Hook, kein Logging und keine Meldung an den
Nutzer außer den beiden genannten `window`-Dialogen. Ein Fehler in einer
Formkomponente reißt den Renderbaum ab, ohne dass etwas sichtbar wird.

## Erweiterungspunkte

**Neue Objektart in einer Wand** (etwa Lichtschalter, Abfluss). Reihenfolge:

1. `InstallationKind` oder `OpeningKind` in
   [types/plan.ts:18](src/types/plan.ts#L18) ergänzen — daraus fällt `ToolId`
   automatisch an.
2. Beschriftung in `OBJECT_LABELS` [types/plan.ts:145](src/types/plan.ts#L145).
3. Werkzeug samt freiem Tastenkürzel in `TOOLS`
   [types/tools.ts:15](src/types/tools.ts#L15) und in die passende Liste
   `SHAPE_TOOLS`/`INSTALLATION_TOOLS` [types/tools.ts:27](src/types/tools.ts#L27)
   — ohne diesen Eintrag öffnet App.vue keinen Dialog. Die Legende in
   `SHORTCUTS` [PropertiesPalette.vue:22](src/components/palette/PropertiesPalette.vue#L22)
   ist handgeschrieben und muss mit.
4. Symbolpfade in `ICONS` [ribbon/icons.ts](src/components/ribbon/icons.ts) unter
   demselben Schlüsselnamen wie die `ToolId`; die Symbolleiste castet die
   Werkzeug-ID direkt auf `IconName`
   ([RibbonToolbar.vue:48](src/components/ribbon/RibbonToolbar.vue#L48)). Das
   Werkzeug zusätzlich in eine Gruppe von `TOOL_GROUPS` aufnehmen, sonst
   erscheint kein Knopf.
5. Vorgabewerte in `createDefaults`
   [useDefaults.ts:45](src/composables/useDefaults.ts#L45) **und** im
   Zusammenbau in `restore` [useDefaults.ts:70](src/composables/useDefaults.ts#L70)
   — die Dialoge greifen ungeprüft auf `defaults.opening[kind]` bzw.
   `defaults.installation[kind]` zu.
6. Zeichnung im passenden Zweig von
   [InstallationShape.vue:108](src/components/plan/InstallationShape.vue#L108) bzw.
   [OpeningShape.vue:84](src/components/plan/OpeningShape.vue#L84).
7. `parseObject` [storage.ts:52](src/utils/storage.ts#L52) kennt die neue Art
   über die Listen in [storage.ts:17](src/utils/storage.ts#L17); fehlt sie dort,
   verschwindet das Objekt beim Laden **und bei jedem Undo**.
8. Hat das Objekt eine Ausdehnung entlang der Wand, `objectExtent`
   [objectSpacing.ts:30](src/utils/objectSpacing.ts#L30) erweitern. Daraus
   folgen Detailbemaßung und Abstand zum vorigen Objekt gemeinsam; `detailTicks`
   selbst braucht keine Änderung.

**Neues Feld an einem bestehenden Objekt.** Typ in
[types/plan.ts](src/types/plan.ts), Übernahme in `parseObject`
[storage.ts:52](src/utils/storage.ts#L52), Feld im Dialog, Feld in der
Palette, Auswertung in der Formkomponente. Der Dialog schreibt den Wert
zusätzlich in `useDefaults` zurück, wenn er beim nächsten Einfügen vorbelegt sein
soll.

**Aussehen der Zeichnung ändern** (Farben, Strichstärken, Schrift):
ausschließlich `PLAN_STYLE` [planStyle.ts:50](src/utils/planStyle.ts#L50). Weil
derselbe String in die Datei wandert, wirkt jede Änderung sofort auch im Export.
Klassennamen dort und in den Formkomponenten sind nur über die Zeichenkette
gekoppelt, nicht über den Compiler. Bei `.plan-wall-outline` daran denken, dass
die Füllung die halbe Strichbreite abdeckt.

**Position der Bemaßung ändern:** an einer einzelnen Wand über
`totalDimension`/`detailDimension` in der Palette, die Lage der äußeren Striche
zusätzlich über `dimensionMarginStart`/`dimensionMarginEnd`. Die Vorgabe für neue Wände
sind `DIM_TOTAL_DISTANCE` und `DIM_DETAIL_DISTANCE`
[planStyle.ts:16-19](src/utils/planStyle.ts#L16-L19) zusammen mit den
Startwerten in `createDefaults`; das Aussehen der Reihe selbst steckt in den
übrigen `DIM_*`-Konstanten. Auf den Mindestabstand der beiden Reihen achten
(siehe Konstantentabelle).

**Weiteres Tastenkürzel:** `useShortcuts`
[useShortcuts.ts:29](src/composables/useShortcuts.ts#L29). Kürzel mit Strg gehören
in den `switch` ab [Zeile 46](src/composables/useShortcuts.ts#L46), einzelne
Buchstaben laufen über `TOOLS` und brauchen dort nur einen Eintrag. Legende in
`SHORTCUTS` [PropertiesPalette.vue:22](src/components/palette/PropertiesPalette.vue#L22)
mitpflegen, sie ist handgeschrieben und wird nicht aus `TOOLS` erzeugt.

**Weiterer modaler Dialog:** `BaseDialog` verwenden, sonst fehlen Fokus,
Enter/Escape und die Sperre der globalen Tastatur. Der Rahmen ist bewusst ein
`div` und kein `form`: mit einem Formular würde Enter zusätzlich implizit
absenden und den Dialog doppelt bestätigen
([BaseDialog.vue:30](src/components/dialogs/BaseDialog.vue#L30)).

**Wände mit der Maus verschiebbar machen.** Nicht vorgesehen und gegen die
Grundidee; falls doch, ist der Angriffspunkt `onPointerMove`
[PlanCanvas.vue:113](src/components/canvas/PlanCanvas.vue#L113) plus ein
Zugstatus analog zu `draggingOrigin`. Objekte müssen dabei unangetastet bleiben,
sie hängen über `offset` an der Wand.

**Mehrfachauswahl.** `Selection` [types/plan.ts:120](src/types/plan.ts#L120) ist
bewusst ein einzelner Verweis; alle Komponenten vergleichen direkt gegen
`selection.wallId`/`selection.objectId`. Eine Liste zöge Änderungen durch
`WallShape`, beide Formkomponenten, die Palette und `removeSelection`.

## Fallstricke

- **Keine Tests.** Kein Testframework installiert, keine Testdateien. Die
  einzige automatische Prüfung ist `npm run typecheck` (`vue-tsc`), die im
  Build-Skript vor `vite build` läuft.
- **`window.confirm` und `window.alert` blockieren.** Sie halten den gesamten
  Browserthread an und brechen jede Browserautomatisierung, bis der Dialog
  quittiert ist.
- **Undo kopiert den ganzen Plan.** Jeder Commit serialisiert den kompletten
  Plan; bei bis zu 100 Schnappschüssen ist das für Wohnungsgrundrisse
  unproblematisch, skaliert aber nicht auf große Modelle.
- **`loadPlan` und `newPlan` löschen die Historie.** Öffnen und Neu sind nicht
  rücknehmbar; `newPlan` fragt deshalb nach, `loadPlan` nicht.
- **Objektdaten können außerhalb der Wand liegen.** Wird eine Wand gekürzt,
  bleiben `offset` und `width` der Objekte stehen. Zeichnung und Bemaßung klemmen
  die Werte, die JSON-Datei enthält sie unverändert. Wer die Daten säubern will,
  braucht einen ausdrücklichen Schritt beim Ändern der Wandlänge.
- **Die Klickfläche einer Wand umfasst auch ihre Öffnungen.** `.plan-wall-hit`
  läuft über die volle Länge; in einer Öffnung trifft man je nach Stelle die
  Öffnung oder die darunterliegende Wandlinie.
- **Wände haben keine echte Verbindungslogik.** `wallOverhang` erkennt nur, dass
  ein Wandende auf einer anderen Wand liegt, und verlängert den Körper dorthin.
  Es gibt kein Trimmen, keine Vereinigung der Rechtecke und kein
  Verbindungsobjekt im Datenmodell; die Ecke sieht nur deshalb geschlossen aus,
  weil in zwei Durchgängen gezeichnet wird. Wer auf einen einzelnen Renderpfad
  je Wand zurückgeht, bekommt die Konturen quer durch die Ecke zurück.
- **Die Erkennung ist rein geometrisch.** Zwei Wände, die zufällig auf 0,5 cm
  genau übereinander liegen, gelten als verbunden; zwei Wände, die um 1 cm
  auseinanderliegen, nicht. Das Einrasten beim Zeichnen ist der einzige Grund,
  warum das in der Praxis trifft.
- **Der Eckenüberstand ist O(n²).** Für jede Wand wird gegen alle anderen
  geprüft, bei jedem Neuzeichnen des Plans. Für Wohnungsgrundrisse belanglos,
  für hunderte Wände nicht mehr.
- **`dominant-baseline: central`** wird von manchen SVG-Importern nicht
  unterstützt. Dort verspringen alle Zahlen und Beschriftungen um eine halbe
  Zeilenhöhe. Betroffen ist nur die exportierte Datei, nicht der Bildschirm.
- **Kein Schutz gegen gleichzeitige Nutzung in zwei Tabs.** Beide schreiben
  denselben Storage-Schlüssel, der zuletzt schreibende gewinnt; es gibt keinen
  `storage`-Ereignis-Abgleich.
- **Unbenutzt im Code:** `radToDeg` [geometry.ts:21](src/utils/geometry.ts#L21),
  `localToWorld` [geometry.ts:62](src/utils/geometry.ts#L62), `isInstallation`
  [types/plan.ts:129](src/types/plan.ts#L129) und die CSS-Klasse
  `.plan-symbol-fill` [planStyle.ts:119](src/utils/planStyle.ts#L119) werden
  nirgends aufgerufen. `localToWorld` ist der naheliegende Baustein, sobald
  Bearbeitung mit der Maus dazukommt.
