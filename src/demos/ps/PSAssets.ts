/**
 * PSAssets - Phantasy Star asset preloader
 *
 * On localhost every lazy `scene.load.start()` completes in ~1ms, so the demo
 * was written to fetch sounds, maps, tilesets and music on first use. Served
 * from a remote host each of those is a network round-trip, so the game visibly
 * hangs the first time it touches any asset (a menu beep, a map switch, a music
 * change...).
 *
 * This module warms the caches up-front, during Phaser's preload phase, using
 * the EXACT keys the lazy loaders look up — so those paths become instant cache
 * hits instead of re-fetching:
 *   - sounds       -> audio cache, key = filename without ".wav"  (see PSGame.playSound)
 *   - city maps    -> json  cache, key = "<name>-map"             (see TiledMap.loadMap)
 *   - dungeon maps -> json  cache, key = "<name>-map"             (see PSGame.mapswitchToDungeon)
 *   - tilesets     -> texture,     key = "tileset-<img w/o .png>" (see TiledMap.loadTilesets)
 *   - monsters     -> texture,     key = "chr-<img w/o .png>"     (see CHR.loadChr / Enemy.getChr)
 *   - music        -> VGM path cache                              (see VGMMusicManager)
 *
 * Every queue call is guarded by an `exists` check, so calling this from more
 * than one scene's preload() (Title then Game) never re-downloads anything.
 *
 * Dungeon *graphics* (the ~121 wall/door images per theme) are deliberately NOT
 * warmed here: they're big, there are 12 themes, and PSDungeon already covers the
 * first entry to each theme with its "Loading" box (createOneLabelBox /
 * Dungeon_Loading). They stay cached globally after that first entry.
 *
 * Monster/CHR *objects* stay lazy — a CHR object caches the scene that built it,
 * so building one in Title and reusing it in Game (after Title is destroyed)
 * would be unsafe. But the expensive part over a remote host is the shared
 * texture (and the anim.json fetch), which are scene-independent. We warm those
 * so the lazy CHR loader hits cache and builds the object with no network stall.
 */

import { PS1Sound } from './game/PSLibSound';
import { PS1Music } from './game/PSLibMusic';
import { VGMPlayerAPI } from '../../core/vgm2/VGMPlayerAPI';

const MAP_BASE = 'src/demos/ps/maps';
const DUNGEON_BASE = 'src/demos/ps/dungeons';
/** Folder holding every enemy CHR sprite (Enemy .chr paths resolve here). */
const ENEMY_BASE = 'src/demos/ps/battle/enemy_ps1';

/** All 24 overworld/city map basenames (companion .map.json files in maps/). */
const CITY_MAPS = [
  'Abion', 'Aukba', 'Aukba_entrance', 'Bortevo', 'Camineet', 'Casba',
  'Dezoris', 'Drasgow', 'Eppi', 'Gothic', 'Loar', 'Motavia', 'Palma',
  'Parolit', 'Paseo', 'Scion', 'Skure', 'Skure_entrance', 'Sky_castle',
  'Sopia', 'Spaceport1', 'Spaceport2', 'Tonoe', 'Uzo'
];

/**
 * All 32 dungeon map basenames (companion .map.json files in dungeons/). The
 * dungeon loader (DungeonHelper.getPath -> "<name>.map") resolves the same
 * "<name>-map" JSON cache key TiledMap.loadMap derives, so warming these makes
 * dungeon entry instant (the graphics still load per-theme behind the Loading box).
 */
const DUNGEON_MAPS = [
  'Abion_dungeon', 'Aukba_tunnel', 'Baya_cave', 'Baya_malay', 'Blueberry',
  'Bortevo_cave', 'Casba_cave', 'Corona', 'Darkfalz', 'Dezo_cave1', 'Dezo_cave2',
  'Dezo_cave3', 'Dezo_cave4', 'Dezo_cave_aukba', 'Drasgow_dungeon', 'Frost_cave',
  'Gothic_passageway', 'Governor', 'Guaron_morgue', 'Iala', 'Lassic_castle',
  'Lost_island', 'Medusa_tower', 'Naharu', 'Naula', 'Odin_cave', 'Prism_cave',
  'Prison', 'Skure_tunnel', 'Tajima_cave', 'Triada', 'Warehouse'
];

/** Tileset images shared by every city map (see the map JSON "image" fields). */
const TILESET_IMAGES = ['PS1.png', 'default.meta.png'];

/**
 * All 74 PS1 monster sprite basenames (battle/enemy_ps1/<name>.chr in PSLibEnemy).
 * Each enemy's anim.json imageName is `<name>.png` in the same folder, and
 * CHR.loadChr keys its texture "chr-<name>", so warming `chr-<name>` -> that png
 * makes the first battle vs. each enemy instant. Hardcoded (like CITY_MAPS /
 * DUNGEON_MAPS) so PSAssets stays free of the PSGame/PSLibEnemy import cycle —
 * importing PSLibEnemy here reorders module eval and TDZ-crashes PSGame.
 */
const ENEMY_SPRITES = [
  'ammonite', 'amundsen', 'androcop', 'ant_lion', 'barbarian', 'batalion',
  'bigclub', 'blue_dragon', 'blueslime', 'centaur', 'crawler', 'darkfalz',
  'deadtree', 'dezorian', 'dr_mad', 'efarmer', 'elephant', 'evildead',
  'evilhead', 'executer', 'fishman', 'frostman', 'ghoul', 'giant',
  'giantfly', 'golden_dragon', 'goldlens', 'golem', 'green_dragon',
  'greenslime', 'gscorpion', 'horseman', 'lassic', 'leech', 'lich',
  'magician', 'mammoth', 'maneater', 'manticore', 'marauder', 'marshman',
  'medusa', 'nessie', 'nfarmer', 'octopus', 'owlbear', 'reaper',
  'red_dragon', 'redslime', 'robotcop', 'saccubus', 'sandworm', 'scorpion',
  'scorpius', 'serpent', 'shadow', 'shelfish', 'skeleton', 'skullen',
  'sorcerer', 'sphinx', 'stalker', 'sworm', 'tarantul', 'tarzimal',
  'tentacle', 'titan', 'vampire', 'werebat', 'white_dragon', 'wight',
  'wingeye', 'wyvern', 'zombie'
];

export class PSAssets {
  /**
   * Queue every Phaser-loadable PS asset into `scene.load`. Call from a scene's
   * preload() — Phaser runs the loader (with its progress bar) before create(),
   * so everything is cached before gameplay starts. Idempotent: already-cached
   * assets are skipped.
   */
  static queuePhaserAssets(scene: Phaser.Scene): void {
    // Sound effects — key matches PSGame.playSound's audioKey derivation.
    for (const path of Object.values(PS1Sound) as string[]) {
      const key = path.split('/').pop()?.replace('.wav', '') || path;
      if (!scene.cache.audio.exists(key)) {
        scene.load.audio(key, path);
      }
    }

    // City/world maps — TiledMap.loadMap reads cache.json under "<name>-map".
    for (const name of CITY_MAPS) {
      const key = `${name}-map`;
      if (!scene.cache.json.exists(key)) {
        scene.load.json(key, `${MAP_BASE}/${name}.map.json`);
      }
    }

    // Dungeon maps — same "<name>-map" JSON-cache scheme (loadMap mirrors the
    // JSON into the tilemap cache itself, so warming the JSON alone suffices).
    for (const name of DUNGEON_MAPS) {
      const key = `${name}-map`;
      if (!scene.cache.json.exists(key)) {
        scene.load.json(key, `${DUNGEON_BASE}/${name}.map.json`);
      }
    }

    // Tileset images — TiledMap.loadTilesets looks them up as "tileset-<img>".
    for (const img of TILESET_IMAGES) {
      const key = `tileset-${img.replace('.png', '')}`;
      if (!scene.textures.exists(key)) {
        scene.load.image(key, `${MAP_BASE}/${img}`);
      }
    }

    // Monster battle sprites. Enemy.getChr -> CHR.loadChr keys the texture as
    // "chr-<name>" and loads battle/enemy_ps1/<name>.png, then fetches the tiny
    // anim.json. We warm the texture (the bulk) directly and prime the anim.json
    // fetch; only the shared texture/json are warmed, the CHR object stays lazy.
    for (const base of ENEMY_SPRITES) {
      const texKey = `chr-${base}`;
      if (!scene.textures.exists(texKey)) {
        scene.load.image(texKey, `${ENEMY_BASE}/${base}.png`);
      }
      const animKey = `enemyanim-${base}`;
      if (!scene.cache.json.exists(animKey)) {
        scene.load.json(animKey, `${ENEMY_BASE}/${base}.anim.json`);
      }
    }
  }

  /**
   * Warm the VGM music cache in the background. Music isn't loaded through the
   * Phaser loader (it's the custom vgm2 system), so this can't live in preload()
   * — call it fire-and-forget from create(). Each track is tiny (~1-3 KB) and
   * the whole set is ~80 KB, so fetching all of them costs almost nothing and
   * removes the stall on the first play of every track. VGMMusicManager keys its
   * cache by path, and PSGame plays tracks by their path, so we register each
   * track under its own path.
   */
  static async warmMusic(): Promise<void> {
    const paths = Object.values(PS1Music) as string[];
    await Promise.all(
      paths.map(path =>
        VGMPlayerAPI.loadVGM(path, path).catch(err =>
          console.warn(`PSAssets: failed to prewarm music ${path}:`, err)
        )
      )
    );
  }
}
