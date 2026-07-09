/**
 * Phantasy Star Music Manifest
 * Defines all VGM music files for preloading to eliminate gameplay interruptions
 */

import { MusicManifest } from '../../core/vgm2/VGMMusicManager';

export const PS_MUSIC_MANIFEST: MusicManifest = {
  name: 'Phantasy Star',
  assets: [
    // Core game music (always preloaded)
    {
      key: 'title',
      path: 'src/demos/ps/music/Title.vgz',
      preload: true
    },
    {
      key: 'palma',
      path: 'src/demos/ps/music/Palma.vgz',
      preload: true
    },
    {
      key: 'town',
      path: 'src/demos/ps/music/Town.vgz',
      preload: true
    },
    {
      key: 'village',
      path: 'src/demos/ps/music/Village.vgz',
      preload: true
    },
    {
      key: 'battle',
      path: 'src/demos/ps/music/Battle.vgz',
      preload: true
    },
    {
      key: 'cave',
      path: 'src/demos/ps/music/Cave.vgz',
      preload: true
    },

    // Common interactive music
    {
      key: 'church',
      path: 'src/demos/ps/music/Church.vgz',
      preload: true
    },
    {
      key: 'shop',
      path: 'src/demos/ps/music/Shop.vgz',
      preload: true
    },
    {
      key: 'vehicle',
      path: 'src/demos/ps/music/Vehicle.vgz',
      preload: true
    },

    // Extended game music (loaded on-demand to save memory)
    {
      key: 'motavia',
      path: 'src/demos/ps/music/Motavia.vgz',
      preload: false
    },
    {
      key: 'dezoris',
      path: 'src/demos/ps/music/Dezoris.vgz',
      preload: false
    }/*,
    {
      key: 'dungeon',
      path: 'src/demos/ps/music/Dungeon.vgz',
      preload: false
    },
    {
      key: 'tower',
      path: 'src/demos/ps/music/Tower.vgz',
      preload: false
    },
    {
      key: 'intro',
      path: 'src/demos/ps/music/Intro.vgz',
      preload: false
    },
    {
      key: 'story',
      path: 'src/demos/ps/music/Story.vgz',
      preload: false
    },
    {
      key: 'ending',
      path: 'src/demos/ps/music/Ending.vgz',
      preload: false
    }/

    // Boss battle music
    {
      key: 'lassic',
      path: 'src/demos/ps/music/Lassic.vgz',
      preload: false
    },
    {
      key: 'darkfalz',
      path: 'src/demos/ps/music/DarkFalz.vgz',
      preload: false
    },
    {
      key: 'gameover',
      path: 'src/demos/ps/music/GameOver.vgz',
      preload: false
    }*/
  ]
};