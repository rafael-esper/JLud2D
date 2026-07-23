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
 *   - sounds   -> audio cache, key = filename without ".wav"  (see PSGame.playSound)
 *   - maps     -> json  cache, key = "<name>-map"             (see TiledMap.loadMap)
 *   - tilesets -> texture,     key = "tileset-<img w/o .png>" (see TiledMap.loadTilesets)
 *   - music    -> VGM path cache                              (see VGMMusicManager)
 *
 * Every queue call is guarded by an `exists` check, so calling this from more
 * than one scene's preload() (Title then Game) never re-downloads anything.
 *
 * CHR sprites are intentionally left lazy: a CHR object stores the scene that
 * built it, so warming one in the Title scene and reusing it in the Game scene
 * (after Title is destroyed) would be unsafe.
 */

import { PS1Sound } from './game/PSLibSound';
import { PS1Music } from './game/PSLibMusic';
import { VGMPlayerAPI } from '../../core/vgm2/VGMPlayerAPI';

const MAP_BASE = 'src/demos/ps/maps';

/** All 24 overworld/city map basenames (companion .map.json files in maps/). */
const CITY_MAPS = [
  'Abion', 'Aukba', 'Aukba_entrance', 'Bortevo', 'Camineet', 'Casba',
  'Dezoris', 'Drasgow', 'Eppi', 'Gothic', 'Loar', 'Motavia', 'Palma',
  'Parolit', 'Paseo', 'Scion', 'Skure', 'Skure_entrance', 'Sky_castle',
  'Sopia', 'Spaceport1', 'Spaceport2', 'Tonoe', 'Uzo'
];

/** Tileset images shared by every city map (see the map JSON "image" fields). */
const TILESET_IMAGES = ['PS1.png', 'default.meta.png'];

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

    // Tileset images — TiledMap.loadTilesets looks them up as "tileset-<img>".
    for (const img of TILESET_IMAGES) {
      const key = `tileset-${img.replace('.png', '')}`;
      if (!scene.textures.exists(key)) {
        scene.load.image(key, `${MAP_BASE}/${img}`);
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
