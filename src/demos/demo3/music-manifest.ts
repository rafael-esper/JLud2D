/**
 * Demo3 VGM Player Music Manifest
 * Demo3 is a VGM file browser, so it loads music on-demand rather than preloading
 */

import { MusicManifest } from '../../core/vgm/VGMMusicManager';

export const DEMO3_MUSIC_MANIFEST: MusicManifest = {
  name: 'Demo3 VGM Player',
  assets: [
    // Demo3 loads VGM files dynamically from its file list
    // No preloading needed as it's a music player/browser demo
    // Files are loaded on user selection for testing purposes
  ]
};