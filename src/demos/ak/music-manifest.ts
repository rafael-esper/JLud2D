/**
 * Alex Kidd Music Manifest
 * Defines all VGM music files for preloading to eliminate gameplay interruptions
 */

import { MusicManifest } from '../../core/vgm2/VGMMusicManager';

export const AK_MUSIC_MANIFEST: MusicManifest = {
  name: 'Alex Kidd',
  assets: [
    {
      key: 'intro',
      path: 'src/demos/ak/res/music/intro.vgz',
      preload: true,
      loop: false
    },
    {
      key: 'field',
      path: 'src/demos/ak/res/music/field.vgz',
      preload: true
    },
    {
      key: 'swim',
      path: 'src/demos/ak/res/music/swim.vgz',
      preload: true
    },
    {
      key: 'moto',
      path: 'src/demos/ak/res/music/moto.vgz',
      preload: true
    }
  ]
};