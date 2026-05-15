# JLud2D — Phaser Port

Java game engine being converted to TypeScript + Phaser 3. The original Java engine lives in `java/` and `public/ps/` (Phantasy Star data); the Phaser port lives in `src/`.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # TypeScript compile + Vite build
npm run type-check # Type check only (no emit)
npm run preview    # Preview production build
```

## Tech Stack

- **Phaser 3.90.0** — game framework
- **TypeScript 5** — language
- **Vite 5** — dev server and bundler
- **Resolution**: 320×240 pixels, pixel art mode (`antialias: false`, `pixelArt: true`)

## Project Layout

```
src/
  main.ts               # Entry point — registers all Phaser scenes
  core/                 # MainEngine, ScriptEngine, VGM music
  config/               # GameConfig, Controls / InputManager
  domain/               # Entity, CHR, TiledMap, Sound
  utils/                # FPSDisplay, ResponsiveScaler, DemoUI
  demos/
    demo1/              # Island World (COMPLETE)
    demo2/              # Golden Axe Warrior map (PARTIAL)
    demo3/              # VGM music player (COMPLETE)
    ak/                 # Alex Kidd platformer (PARTIAL)
    ps/                 # Phantasy Star RPG (PARTIAL — main focus)
      TitleScene.ts     # Title screen + main menu
      GameScene.ts      # Main overworld scene
      PSGame.ts         # Central game state / logic
      PSMenu.ts         # Menu rendering engine
      PSMenuMain.ts     # In-game character/item/spell menus
      PSMenuShop.ts     # Shop buy/sell menus
      PSDungeon.ts      # First-person dungeon renderer
      game/             # Data: Party, Item, Enemy, Spell, Lib* classes
      battle/           # Battle system (framework only)
      menu/             # MenuStack, MenuPromptBox, MenuTextBox, etc.
      maps/             # City/world map classes (8 of 24 done)
      dungeons/         # Dungeon classes (1 of 36 done)
      utils/            # PropertiesParser, I18nManager

public/ps/              # All original Java source + map JSON + art assets
  oo/dungeons/          # 36 dungeon .map.json files + Java originals
  oo/cities/            # 24 city/world .map.json files + Java originals

java/                   # Full original Java engine source (reference only)
config.json             # Runtime config (resolution, volume, startup demo)
```

## Architecture

### Scene Registration (`src/main.ts`)
All Phaser scenes are registered in `main.ts`. To add a new scene, import it and add it to the scene array in `createGame()`.

### Demo Pattern
Each demo is a Phaser `Scene` subclass. Demos interact with `MainEngine` (entity/camera system) and `ScriptEngine` (callbacks/hooks). The `BootScene` → `MenuScene` flow lets users pick a demo at runtime.

### Map System
Maps are Tiled JSON files loaded by `TiledMap.ts`. Each city/dungeon has a companion TypeScript class (e.g., `Camineet.ts`) that defines zone events, NPC scripts, and map switches. The Java originals in `public/ps/oo/` are the reference for porting these.

### Menu System
`MenuStack` (in `src/demos/ps/menu/`) provides nested menus. `MenuPromptBox` shows option lists with a red cursor and circles — matching the Java original. Callbacks are registered on menu open/close/select.

### Phantasy Star Game State
`PSGame.ts` is the central singleton for the Phantasy Star demo. It holds party state, item inventory, game flags, map position, and coordinates scene transitions. All PS scenes go through it.

## Key Reference Files

- Original Phantasy Star main: `public/ps/Phantasy.java`
- Original title screen: `public/ps/Title.java`
- Original dungeon engine (24k lines): `public/ps/PSDungeon.java`
- Original battle engine (25k lines): `public/ps/PhantasyArena.java`
- All dungeon maps: `public/ps/oo/dungeons/*.map.json`
- All city maps: `public/ps/oo/cities/*.map.json`

## Conventions

- TypeScript port mirrors Java class names where possible (e.g., `PSDungeon`, `PSMenu`, `PartyMember`)
- All game data (enemies, items, spells, characters) is already ported in `game/PSLib*.ts` — do not re-port, just wire up
- Map JSON files from `public/ps/oo/` are used directly — no need to copy them, Vite serves `public/` as static assets
- Mobile controls are handled globally via `window.mobileControls` in `index.html`
