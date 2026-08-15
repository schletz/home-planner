# Webapplikation für das Zeichnen von Wohnungsplänen

Ich möchte eine Applikation entwickeln, mit deren Hilfe ich einen Wohnungsplan erstellen kann.

## Technologische Basis

* Webapplikation, die auf github Pages bereitgestellt werden kann.
* Vue.js (neueste Version) mit Typescript.
* Speicherung im Local Storage, daher kein Backend erforderlich.

## Grundsätzliches

Modifikationen von Objekten sollen ausschließlich über die Palette erfolgen.
Es ist keine Mauseingabe (also verkleinern oder vergrößern mit der Maus) erforderlich.
Grund: Eingabe von Zahlen ist exakter und schneller.

Der Einsatzzweck macht es noch klarer: Ich verwende das Programm auf einem Laptop auf der Baustelle.
Dies ist keine Büroumgebung, sondern eine staubige Umgebung bei der der Laotop oft auf ein paar Ziegelsteinen steht.
Die Bedienung soll daher über Tasten gut möglich sein.

Die Pläne werden als SVG weitergegeben und sind nur Rohpläne für weitere Verarbeitungen z. B. in Illustrator oder CAD Programmen.
Daher müssen sie nicht "schön" aussehen, sondern funktionell.

Das Programm kennt keine Flächen, sondern nur einzelne Wände (also Linien einer gewissen Stärke) mit Objekten darin.

Auf https://cedreo.com/wp-content/uploads/2023/03/US_Kitchen_09_2D_332px.jpg ist ein Bild eines Planes, wie er mir gefallen würde.
Die Möbel brauche ich natürlich nicht, auch keine Quadratmeder oder Beschriftungen.
Achte auf die Bemaßung, sie würde mir so gefallen.

## Features

### GUI

Die GUI soll oben eine Symbolleiste im Ribbon Stil zeigen.
Folgende Buttons werden angeboten (ergänze sinnvolle Optionen)
* Öffnen
* Speichern
* SVG Export
* Auswahlwerkzeug
* Wand zeichen
* Gruppe "Formen"
    * Türe
    * Fenster
    * Doppelfenster
* Gruppe "Installation"
    * Steckdose
    * Wasseranschluss
    * Heizkörper

Darunter soll die Zeichenfläche mit Lineal (horizontal und vertikal) angezeigt werden.
Die Einheiten sind immer Zentimeter, es muss keine Option zur Umstellung angeboten werden.
Die Zeichenfläche zeigt ein dickeres Raster in 50cm und ein feineres in 10cm Schritten.

Rechts ist eine Palette mit den objektspezifischen Eigenschaften.

### Spezifikationen der einzelnen Elemente

#### Speichern

Speichert die Grafik als JSON mit den Objekten.
Das Format muss keinem vorhandenen standardisiertem Format entsprechen.
Sinnvoll wäre hier als oberste Ebene ein Array von Wänden, und die Wand hat dann die Objekte.

#### Öffnen

Liest die JSON Datei ein und baut den Plan wieder auf.

#### SVG Export

Exportiert die erstellte Grafik als SVG Datei.

#### Auswahlwerkzeug

Ist dieses Werkzeug gewählt, können Objekte ausgewählt und bearbeitet werden.

#### Wand zeichnen

Klicke ich auf dieses Symbol, bin ich im Zustand "Wand zeichnen".
Danach möchte ich auf einen Punkt in der Zeichenfläche klicken, die den Start der Wand angibt.
Als Mauszeiger erscheint ein kleines Kreuz in der Zeichenfläche zur exakteren Positionierung.
Snap ins sollen helfen, das nahtlose Zeichnen zu ermöglichen (Einrasten an Endpunkten)
Klicke ich auf einen Punkt, soll ein Dialogfeld folgende Punkte abfragen:

* Wandstärke
* X und Y Koordinate Beginn (wird von der Klickposition übernommen)
* Länge
* Winkel
* Position der Gesamtbemaßung (darüber, darunter)
* Position der Detailbemaßung (darüber, darunter)

Ein kleines Vorschaubild mit einem Strich soll die Eingabe des Winkels erleichtern, um zu sehen, ob die Wand bei 90° nach oben oder unten geht.

#### Formen einfügen

Eine Form ist ein Objekt in einer Wand, keine eigenständiges Objekt.

Fenster, Türen und Doppelfenster sollen mit dem klassischen Bogen, der die Öffnungsrichtung angibt, gezeichnet werden.
Die GUI soll dies konsistent umsetzen: Ich kann an eine Stelle in einer Wand klicken.
Es öffnet sich ein Dialog mit folgenden Attributen:

* Abstand zum Wandanfang (von der Klickposition übernehmen)
* Breite
* Rand (also die Breite des Türstockes oder Fensterstockes, die Größe ist für die Zeichnung des Bogens wichtig)
* Text (Optional)

Um eingeben zu können, in welche Richtung das Fenster oder die Türe aufgeht, sollen die 4 Möglichkeiten als Radiobutton ausgewählt werden können.

#### Installation einfügen

Entspricht dem selben Prinzip wie "Formen einfügen".
Installationen sind ein Bestandteil der Wand.
Nach dem Klicken auf eine Wand können in einem Dialog die folgenden Punkte angegeben werden:
* Abstand zum Wandanfang (von der Klickposition übernehmen)
* Höhe

#### Nullpunkt und snap in

Wie in Photoshop mochte ich die Ecke des Liniales z. B. auf einen Endpunkt einer Wand ziehen können, um den Nullpunkt festlegen zu können.
Snap ins sollen das exakte Positionieren an bestehenden Objekten ermöglichen.
Snap ins sollen nur an den Endpunkten einer Wand und bei 50cm Rasterpunkten möglich sein.

#### Markieren und nachträgliches Bearbeiten

Das Auswahlwerkzeug markiert eine Wand oder ein Objekt der Wand.
In der Palette erscheinen die objektspezifischen Eigenschaften, die editiert werden können.

#### Bemaßung

Es sollen automatisch folgende Bemaßungen in 2 Reihen erstellt werden:

* Bemaßung der gesamten Wand außen (Gesamtbemaßung)
* Bemaßung mit den Abständen zwischen den Objekten, vom Beginn der Wand an (Detailbemaßung)

#### Shortcuts

Die Pfeiltasten sollen Pan ermöglichen (verschieben der Zeichenfläche).
STRG + Plus (+) soll hineinzoomen.
STRG + Minus (-) soll hinauszoomen.

## Abgrenzung

Das Programm soll nur ein einfaches Werkzeug sein, kein vollständiger Einrichtungsplaner.
Er setzt daher folgende Punkte bewusst NICHT um:
* Innenausstattung
* Gruppieren, Verschieben mit der Maus, Bearbeiten mit Mehrfachauswahl.
* Berechnung von Flächenwerten

Dies sind die Grundspezifikationen, die erfüllt werden müssen.
Weitere sinnvolle Ergänzungen können nach eigenem Ermessen hinzugefügt werden.
