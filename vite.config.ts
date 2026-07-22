import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

// Scene code loads demo assets (tilemaps, images, audio) at runtime via plain
// relative URLs like 'src/demos/ps/maps/Camineet.map.json', resolved against
// the page. `npm run dev` works because Vite's dev server serves the whole
// project tree raw, but `vite build` only ships files that are either
// imported as modules or placed under publicDir — so those runtime-fetched
// assets are silently missing from a production build. This plugin copies
// every non-code file under src/demos/** into dist/src/demos/** so the same
// relative URLs keep resolving after a real build/deploy.
function copyDemoAssets(): Plugin {
  const skipExt = new Set(['.ts', '.tsx', '.java']);
  return {
    name: 'copy-demo-assets',
    apply: 'build',
    closeBundle() {
      const srcRoot = path.resolve(__dirname, 'src/demos');
      const outRoot = path.resolve(__dirname, 'dist/src/demos');

      const copyDir = (dir: string) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const from = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            copyDir(from);
            continue;
          }
          if (skipExt.has(path.extname(entry.name))) continue;
          const rel = path.relative(srcRoot, from);
          const to = path.join(outRoot, rel);
          fs.mkdirSync(path.dirname(to), { recursive: true });
          fs.copyFileSync(from, to);
        }
      };

      copyDir(srcRoot);
    }
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [copyDemoAssets()],
  server: {
    port: 3080,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});