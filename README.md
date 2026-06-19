# Coinato – Münz-Roguelite-Prototyp

Ein lauffähiger erster Web-App-Prototyp für einen gedanklichen Balatro-/CloverPit-verwandten Nachfolger auf Münzbasis.

## Kernidee

- Start: 8 einfache Münzen
- Kopf = 0 Punkte
- Zahl = Münzwert, am Anfang 1
- Pro Runde: maximal 3 Würfe
- Zielwert erreichen
- Überschüssige Punkte werden zur Bank
- Bankpunkte im Shop in Münzen und Glücksbringer investieren
- Kein Echtgeld, keine Todes-/Debt-Mechanik
- Optik: blaues, düsteres Pixel-Casino mit pseudo-3D Münztisch

## Enthalten

- `index.html`
- `style.css`
- `src/main.js`
- `data.js` mit 150 Münzen und 25 Glücksbringern

## Lokal starten

Am einfachsten:

```bash
python3 -m http.server 5173
```

Dann öffnen:

```text
http://localhost:5173
```

Alternativ mit VS Code: Extension „Live Server“.

## Auf GitHub Pages deployen

1. Neues Repository erstellen, z. B. `coinato`
2. Dateien aus diesem Ordner in das Repo kopieren
3. Commit + Push
4. In GitHub: Settings → Pages
5. Source: `Deploy from a branch`
6. Branch: `main`, Folder: `/root`
7. Speichern

## Nächste sinnvolle Schritte

- Münzgrafiken als echte Pixel-Sprites ersetzen
- 3D-Raum mit Three.js oder Godot-Web-Export bauen
- Münzeffekte balancen
- Bossrunden ergänzen
- Münzen verkaufen/verschmelzen
- Runs speichern
- Soundeffekte und CRT-Shader
