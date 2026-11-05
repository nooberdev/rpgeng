# HermesFord

A standalone HD-2D pixel-art village game: walk the lanes, talk to sixteen villagers, and watch the light, weather and seasons change.

HermesFord is a fork of [XpycT/hermesford](https://github.com/XpycT/hermesford). All Hermes Desktop, AI agent and chat integration from the original project has been removed. What remains is the village itself, running on the vendored [Lumina](vendor/lumina) engine as an ordinary static web game: no accounts, no backend and no AI features.

![The village square at golden hour, with the Library, the Town Hall and the Forge beyond the campfire](assets/banner.jpg)

*The village at golden hour. The banner predates this standalone fork.*

## Play

Requirements: **Node.js 20 or newer** and a WebGL-capable browser.

```bash
npm install
npm run dev
```

`npm run dev` builds the development bundle to `dev/dev.js` and serves the project at <http://127.0.0.1:5199/dev/>.

To play the built game:

```bash
npm start
```

`npm start` builds the production bundle and serves the game at <http://127.0.0.1:5199/>.

`npm run build` on its own only writes `dist/hermesford.js`; it does not start a server. Serve the project root with `node tools/serve.mjs` (or any static file server) after building.

## Controls

| Key | Action |
| --- | --- |
| WASD | Move |
| Shift | Run |
| Space | Talk / examine |
| F / Enter | Choose an answer |
| Q / E | Rotate camera |
| Z / X | Zoom (or mouse wheel) |
| N / Tab | World map |
| T | Time of day |
| R | Weather |
| Y | Season |
| P | Photo mode |
| M | Music |
| ` / F1 | Debug panel |
| H | Hide controls |

## What is in the village

Sixteen named villagers live in HermesFord, each with a portrait, a trade and a few lines of dialogue. Wren, Mabel, Corin, Hal, Fleet and Alma live along the western lane and Willow End. Bram, Lyra, Nora, Rowan and Garrick keep the square and the roads around it. Esme, Aldric, Tamsin, Odo and Iris live over the river on Eastbank.

The village square has the Town Hall, the Forge with its embers and smoke, the Library, market stalls, the well and a campfire. Carpentry sits on the lane below. From the square, lanes run west to Willow End, east across River Hermes to Eastbank, north to the wooded terrace and the windmill, and south to the fields, Mirror Lake and the hay hill. River Hermes runs the length of the map, falling from the upper terrace and passing under two bridges.

Time of day, weather, seasons and photo mode are engine features. The game is single-player and entirely local.

## Project layout

- `index.html` - the page that loads the built game.
- `src/main.js` - boots the Lumina `Game` with `levels/village.json`.
- `levels/village.json` - the village level: terrain, objects, regions, villagers and their dialogue.
- `vendor/lumina/` - the vendored Lumina engine (MIT).
- `tools/build.mjs` - the esbuild bundle step.
- `tools/serve.mjs` - the small static server used by `npm run dev` and `npm start`.
- `tools/make-village.mjs` - the deterministic village generator.
- `assets/` - the banner and other screenshots.
- `dev/` and `dist/` - generated output, not source.

## Development

`npm test` validates `levels/village.json` with the vendored strict checker (`vendor/lumina/tools/check-level.mjs --strict`).

`node tools/make-village.mjs` regenerates `levels/village.json`. The generator is deterministic: running it twice produces byte-identical output. To verify that the checked-in level matches the generator, run:

```bash
node tools/make-village.mjs --check
```

That command exits non-zero when the level differs from the generator output. Rebuild after changing source files with `npm run build` (or use `npm run dev` for the development bundle).

## Credits and license

HermesFord is released under the MIT License; see [LICENSE](LICENSE). Copyright (c) 2026 XpycT.

The original HermesFord concept and code are by XpycT. This fork removes the Hermes integration and keeps only the standalone village game.

The Lumina engine is by its authors, licensed under the MIT License; see [vendor/lumina/LICENSE](vendor/lumina/LICENSE).
