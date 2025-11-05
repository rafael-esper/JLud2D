/**
 * VGM Core Module
 * Video Game Music player for multiple sound chips
 */

// Dynamic script loader for VGM dependencies
let scriptsLoaded = false;

async function loadVGMScripts(): Promise<void> {
  if (scriptsLoaded) return;

  const scripts = [
    'src/core/vgm/pako.js',
    'src/core/vgm/vgm.js',
    'src/core/vgm/vgm_reader.js',
    'src/core/vgm/ay8910.js',
    'src/core/vgm/ym2612.js',
    'src/core/vgm/ym2413.js',
    'src/core/vgm/sn76489.js',
    'src/core/vgm/c6280.js'
  ];

  const promises = scripts.map(src => {
    return new Promise<void>((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  });

  await Promise.all(promises);
  scriptsLoaded = true;
}

export { VGMPlayer } from './VGMPlayer';
export type { VGMPlayerOptions, VGMInfo } from './VGMPlayer';
export { loadVGMScripts };