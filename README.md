# JLud2D

JLud2D is an old-school 2D game engine, originally written in Java 8 and now being ported to **TypeScript + Phaser**. It is compatible with [Tiled](http://www.mapeditor.org) maps and drives an RPG-style demo (a Phantasy Star I engine remake), a platformer demo (Alex Kidd), an open-world demo, and a chiptune music player demo.

<img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Ak_1.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Ak_2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/JLud2D_Island.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Sully_2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/Sully_3.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_1.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_Battle3.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PS_Dungeon.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PSG1.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/PSG2.png" width="200" height="150"> <img src="https://github.com/rafael-esper/JLud2D/blob/master/screenshots/JLud2d_Warrior.png" width="200" height="150">

## From Java to TypeScript: why this port exists

The original engine (kept for reference in [`java/`](java/), with the Phantasy Star game data in [`public/ps/`](public/ps/)) is a Java 8 desktop application: you download a `.jar` and run it with the `java` command in a native window. That's fine if you have a JRE installed, but it means no browser and no mobile play.

The new engine, in [`src/`](src/), reimplements the same architecture — entity/camera system, script-driven map events, Tiled JSON maps, chiptune music — on top of **TypeScript + [Phaser 3](https://phaser.io/)**, so the same games run instantly in any modern browser, on desktop or mobile, with no install step. Porting is done demo-by-demo and map-by-map, cross-referencing the Java originals class-for-class (`Camineet.java` → `Camineet.ts`, `PSDungeon.java` → `PSDungeon.ts`, etc.) so behavior matches the original as closely as possible. See [`TASKS.md`](TASKS.md) for the live status of what's ported and what's still in progress.

| | Java version (legacy) | TypeScript version (this port) |
|---|---|---|
| Runtime | JRE 8, native window | Any modern browser |
| Distribution | Downloadable `.jar` files | Static site (Vite build) |
| Rendering | Java2D | Phaser 3 (WebGL/Canvas), pixel-art mode |
| Input | Keyboard | Keyboard, gamepad, and touch (with on-screen virtual controls) |
| Audio | MP3, MIDI, VGM, S3M, MOD, XM | VGM chiptune playback via a custom AudioWorklet emulator (see [`src/core/vgm2/`](src/core/vgm2/)); more formats planned |
| Status | Feature-complete, frozen | Actively being ported — Phantasy Star demo is the current focus |

## Features

- **2D tile-based engine** driven by [Tiled](http://www.mapeditor.org) JSON maps, with an entity/camera system (`MainEngine`) and a script/event hook system (`ScriptEngine`) for map triggers, NPC dialogue, and scene transitions.
- **Fixed low-resolution pixel-art rendering** (320×240 by default) that scales cleanly to any screen size while staying crisp.
- **Cross-platform input**: keyboard, gamepad, and touch, with rebindable keys and on-screen virtual d-pad/buttons for mobile.
- **VGM chiptune music playback** through a from-scratch AudioWorklet-based sound-chip emulator (no external audio libraries).
- **Multiple demos in one build**, selectable from an in-app menu:
  - **Island World** — open-world exploration demo (complete)
  - **Alex Kidd** — platformer demo (partial)
  - **Golden Axe Warrior** map demo (partial)
  - **Phantasy Star** — full RPG remake: title screen, overworld, city/world maps, first-person dungeons, shops, menus, and a battle system (in progress — see [`TASKS.md`](TASKS.md))
  - **VGM Player** — chiptune music player demo (complete)
- **In-browser settings UI**: volume, control remapping, fullscreen, and demo switching, without touching config files.
- **Internationalization**: language packs for the Phantasy Star demo (English, Brazilian Portuguese/TecToy script, and others) driven by `.properties`-style files.

## Getting started: play in the browser

Requires [Node.js](https://nodejs.org/) (18+) and npm.

```bash
npm install       # install dependencies (first time only)
npm run dev        # start the dev server
```

Then open **http://localhost:5173** in your browser. The boot screen lets you pick which demo to run.

To build a static, deployable site instead:

```bash
npm run build       # type-check + production build → dist/
npm run preview      # serve the production build locally
```

### Other useful commands

```bash
npm run type-check   # TypeScript type checking only, no build output
npm test             # run the Vitest test suite
```

### Controls

| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | Arrow keys / WASD | D-pad / left stick | Virtual d-pad |
| Button 1 (confirm/action) | Z or J | A | On-screen button |
| Button 2 (cancel/back) | X or K | B | On-screen button |
| Button 3 | C or L | X | On-screen button |
| Start | Enter | Start | On-screen button |
| Menu / Pause | Esc | — | On-screen button |
| Fullscreen | F11 | — | — |
| Screenshot | F12 | — | — |

Keys can be remapped at runtime from the in-app **Settings** menu; custom bindings are saved to `localStorage`.

## Configuration

Default settings live in [`config.json`](config.json) at the project root and are loaded at startup (bindings changed in the in-app Settings menu are then saved to `localStorage` and take precedence on future loads):

```json
{
  "xRes": 320,
  "yRes": 240,
  "windowMode": true,
  "fullscreen": false,
  "noSound": false,
  "masterVolume": 1.0,
  "musicVolume": 0.8,
  "sfxVolume": 1.0,
  "logConsole": true,
  "debug": false,
  "showFPS": false,
  "startupDemo": "demo1",
  "keyboardEnabled": true,
  "gamepadEnabled": true,
  "touchEnabled": true,
  "antialias": false,
  "pixelArt": true,
  "roundPixels": true
}
```

| Key | Meaning |
|---|---|
| `xRes` / `yRes` | Base game resolution in pixels (rendering is fixed at this size, then scaled to fit the browser window) |
| `windowMode` / `fullscreen` | Initial display mode |
| `noSound` | Disable all audio |
| `masterVolume` / `musicVolume` / `sfxVolume` | Volume levels, `0.0`–`1.0` |
| `logConsole` | Print engine logs to the browser console |
| `debug` | Enable Phaser physics debug overlay and verbose logging |
| `showFPS` | Show the FPS counter overlay |
| `startupDemo` | Which demo scene to boot into (`demo1`, `demo2`, `demo3`, `ak`, `ps`) |
| `keyboardEnabled` / `gamepadEnabled` / `touchEnabled` | Enable/disable each input source |
| `antialias` / `pixelArt` / `roundPixels` | Rendering mode — keep these as-is (`false`/`true`/`true`) for crisp pixel art |

## The legacy Java version

The original Java 8 engine source is still kept in [`java/`](java/) for reference (prebuilt demo `.jar` files are no longer distributed in this repository). Build it yourself with Maven ([`pom.xml`](pom.xml)) if you want to run it natively; in-game shortcuts there are **F5** sound off/on, **F6** full screen, **F7**/**F8** increase/decrease frame delay.

## Project layout

```
src/
  main.ts               # Entry point — registers all Phaser scenes
  core/                  # MainEngine, ScriptEngine, VGM music emulator
  config/                # GameConfig, Controls / InputManager
  domain/                # Entity, CHR, TiledMap, Sound
  utils/                 # FPSDisplay, ResponsiveScaler, DemoUI
  demos/
    demo1/               # Island World (complete)
    demo2/               # Golden Axe Warrior map (partial)
    demo3/               # VGM music player (complete)
    ak/                  # Alex Kidd platformer (partial)
    ps/                  # Phantasy Star RPG (partial — main focus)

public/ps/               # Original Java source + map JSON + art assets for the PS demo
java/                    # Full original Java engine source (reference only)
config.json              # Runtime config (resolution, volume, startup demo)
```

## Status and roadmap

The Phantasy Star demo is the current priority — the goal is a fully playable RPG from title screen to end credits, matching the original. See [`TASKS.md`](TASKS.md) for the detailed, up-to-date task breakdown (game loop, missing maps/dungeons, battle system, menus, save/load, etc.).

## License

JLud2D is licensed under the [GNU General Public License v3.0](LICENSE) or later. You are free to use, modify, and redistribute this code, including commercially — but any distributed modified version or derivative work must also be released under the GPL, with source code available. See the [`LICENSE`](LICENSE) file for the full text.
