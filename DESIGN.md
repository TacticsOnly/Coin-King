# Coinato – Designentwurf

## Elevator Pitch

Coinato ist ein Singleplayer-Münz-Roguelite: Der Spieler startet mit acht wertlosen Münzen, wirft sie dreimal pro Runde und baut aus Münzwerten, Wahrscheinlichkeiten, Glücksbringern und Synergien eine eskalierende Punkte-Engine.

## Abgrenzung

Inspiriert von der Struktur moderner Roguelite-Scorebuilder:
- Balatro: bekannte Glücksstruktur + Synergieobjekte + Shop
- CloverPit: düster-blauer Automatenraum + Charms + Luck-Manipulation

Coinato nutzt aber:
- keine Karten
- keine Würfel
- keine Echtgeld-Mechanik
- keine Todes-/Schuldenmechanik
- keine Slot-Maschine als Kernsystem

## Grundregeln

- Der Spieler besitzt immer bis zu 8 aktive Münzen.
- Jede Münze hat:
  - Wert
  - Kopf-Effekt
  - Zahl-Effekt
  - Seltenheit
  - Kosten
- Jede Runde besteht aus bis zu 3 Würfen.
- Kopf ist am Anfang 0.
- Zahl ist am Anfang 1.
- Zielwert pro Runde steigt.
- Überschuss wird als Bankpunkte gespeichert.
- Zwischen Runden wird gekauft.

## Designprinzip

Der Spieler soll nicht „Glück haben“, sondern Glück umbauen.

Wichtige Manipulationsachsen:
- Zahl-Wahrscheinlichkeit erhöhen
- Kopf wertvoll machen
- einzelne Münzen spezialisieren
- Nachwürfe erzeugen
- Nachbarschaftseffekte
- Setboni
- Multiplikatoren
- Überschuss verzinsen
- Shop-Wahrscheinlichkeiten verändern

## MVP

Der Prototyp enthält bereits:
- 8 Startmünzen
- 3-Wurf-Runden
- Zielwerte
- Bank/Überschuss
- Shop
- 150 Münzen
- 25 Glücksbringer
- pseudo-3D Pixel-Look
- GitHub-Pages-kompatible statische Web-App
