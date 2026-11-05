#!/usr/bin/env node
// Builds the standalone game (one JS file, no chunks) or the dev page.
//   node tools/build.mjs          → dist/hermesford.js (open index.html from a static server)
//   node tools/build.mjs --dev    → dev/dev.js (open dev/index.html)
// Lumina's UI CSS (vendor) is bundled with its Latin pixel fonts inlined and injected as a <style>.
import * as esbuild from 'esbuild'
import fs from 'node:fs'

const dev = process.argv.includes('--dev')

const inlineCss = {
  name: 'inline-css',
  setup(b) {
    // Japanese / Chinese faces: the game UI is English only
    b.onResolve({ filter: /^@fontsource\/(dotgothic16|noto-sans-(jp|sc))\// }, () => ({ path: 'cjk', namespace: 'empty' }))
    b.onLoad({ filter: /.*/, namespace: 'empty' }, () => ({ contents: '' }))
    b.onLoad({ filter: /\.css$/ }, async ({ path }) => {
      const r = await esbuild.build({ entryPoints: [path], bundle: true, write: false, minify: !dev, loader: { '.woff2': 'dataurl', '.woff': 'dataurl' } })
      const css = JSON.stringify(r.outputFiles[0].text)
      return { contents: `const s=document.createElement('style');s.dataset.village='';s.textContent=${css};document.head.append(s)`, loader: 'js' }
    })
  },
}

// Water's shore-bake worker (shoreWorker.js) isn't shipped next to the single bundle: no worker,
// Water bakes the shore on the main thread (its own fallback for `_newShoreWorker() === null`).
const WORKER = "new Worker(new URL('./shoreWorker.js', import.meta.url), { type: 'module' })"
const noShoreWorker = {
  name: 'no-shore-worker',
  setup(b) {
    b.onLoad({ filter: /engine[\\/]world[\\/]Water\.js$/ }, async ({ path }) => {
      const src = await fs.promises.readFile(path, 'utf8')
      if (!src.includes(WORKER)) throw new Error(`no-shore-worker: the Worker line moved in ${path}`)
      return { contents: src.replace(WORKER, 'null'), loader: 'js' }
    })
  },
}

await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  minify: !dev,
  sourcemap: dev,
  outfile: dev ? 'dev/dev.js' : 'dist/hermesford.js',
  plugins: [inlineCss, noShoreWorker],
  logLevel: 'warning',
})
console.log(dev ? 'built → dev/dev.js' : 'built → dist/hermesford.js')
