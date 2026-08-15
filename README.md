# Wohnungsplaner

Webapplikation zum Zeichnen von Wohnungsgrundrissen als Rohplan. Der Plan kennt
keine Flächen, sondern nur Wände mit Objekten darin – gedacht für die Aufnahme
vor Ort und die Weitergabe als SVG an Illustrator oder ein CAD-Programm.

Alle Eingaben erfolgen über Zahlen in Dialogen und in der Palette, nicht über
Ziehen mit der Maus. Die Anwendung läuft ohne Backend, der aktuelle Plan liegt im
Local Storage des Browsers.

Der innere Aufbau — Koordinatensysteme, Datenfluss, Konstanten und
Erweiterungspunkte — steht in [DOCUMENTATION.md](DOCUMENTATION.md).

## Bedienung

| Taste | Funktion |
| --- | --- |
| `V` / `W` | Auswahl / Wand zeichnen |
| `D` / `F` / `G` | Türe / Fenster / Doppelfenster |
| `S` / `A` / `H` | Steckdose / Wasseranschluss / Heizkörper |
| Pfeiltasten (mit `Shift` größere Schritte) | Zeichenfläche verschieben |
| `Strg` `+` / `Strg` `-` / `Strg` `0` | Zoom hinein, hinaus, alles einpassen |
| `Strg` `S` / `Strg` `O` / `Strg` `E` | Speichern, Öffnen, SVG-Export |
| `Strg` `Z` / `Strg` `Y` | Rückgängig / Wiederholen |
| `Entf` | Auswahl löschen |
| `Esc` | Werkzeug abbrechen |
| Mausrad | Zoom an der Cursorposition |
| Mittlere Maustaste oder `Leertaste` + Ziehen | Zeichenfläche verschieben |

Beim Zeichnen rastet der Cursor an Wandendpunkten und am 50-cm-Raster ein. Die
Ecke links oben zwischen den Linealen lässt sich auf einen Punkt im Plan ziehen
und legt damit den Nullpunkt der Bemaßung fest.

## Modell

Ein Plan ist eine Liste von Wänden, jede Wand trägt ihre Objekte. Eine Wand wird
als Mittellinie gespeichert: Startpunkt, Länge, Winkel und Stärke. Objekte liegen
in Wandkoordinaten, also als Abstand vom Wandanfang, und bleiben dadurch an der
Wand kleben, wenn diese später verschoben oder gedreht wird.

Alle Längen sind Zentimeter. Winkel zählen gegen den Uhrzeigersinn, 0° zeigt nach
rechts, 90° nach oben. `above` bzw. „darüber“ ist immer die linke Seite in
Laufrichtung der Wand.

```jsonc
{
  "version": 1,
  "name": "Wohnungsplan",
  "origin": { "x": 0, "y": 0 },      // Nullpunkt der Lineale
  "walls": [
    {
      "id": "wall-1", "x": 0, "y": 0,
      "length": 600, "angle": 0, "thickness": 30,
      "totalDimension": "above",      // above | below | none
      "detailDimension": "above",
      "objects": [
        { "id": "obj-1", "kind": "window", "offset": 120, "width": 140,
          "frame": 8, "swing": "start-above", "text": "Küche" },
        { "id": "obj-2", "kind": "socket", "offset": 320, "height": 30,
          "side": "above" }
      ]
    }
  ]
}
```

`kind` ist `door`, `window`, `doubleWindow`, `socket`, `water` oder `radiator`.
`swing` beschreibt den Anschlag (`start`/`end`) und die Öffnungsseite
(`above`/`below`); beim Doppelfenster zählt nur die Seite.

## SVG-Export

Der Export klont die gezeichnete SVG-Gruppe, deshalb entspricht die Datei exakt
dem Bildschirm. Eine Einheit im `viewBox` ist ein Zentimeter, das Dokument ist im
Maßstab 1:50 bemaßt.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm run typecheck  # vue-tsc
npm run build      # Produktionsbuild nach dist/
```

Ein Push auf `main` baut die Anwendung und veröffentlicht sie über den Workflow
`.github/workflows/deploy.yml` auf GitHub Pages. Dafür muss in den
Repository-Einstellungen unter *Pages* als Quelle *GitHub Actions* eingestellt
sein. Die Basis-URL ist relativ, das Repository kann daher beliebig heißen.

## Aufbau

```
src/
  components/
    canvas/     Zeichenfläche, Lineale, Raster
    dialogs/    Einfüge-Dialoge und Winkelvorschau
    form/       Zahlen-, Text- und Optionsfelder
    palette/    Eigenschaftenpalette je Objekttyp
    plan/       Darstellung von Wand, Öffnung, Installation, Bemaßung
    ribbon/     Symbolleiste
  composables/  Store, Viewport, Snapping, Shortcuts, Dialogzustand
  types/        Datenmodell und Werkzeuge
  utils/        Geometrie, Bemaßung, Stil, Speichern, SVG-Export
```
