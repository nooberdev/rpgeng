// HermesFord — standalone: the village level played on the Lumina engine.
// No host, no chat, no agents: a normal browser game with a player, NPCs, weather and seasons.
import { Game } from '../vendor/lumina/src/game/Game.js'
import { normalizeLevel } from '../vendor/lumina/src/engine/level/LevelFormat.js'
import { startFonts } from '../vendor/lumina/src/engine/ui/FontLoader.js'
import { SEASONS, seasonOn, seasonal } from './season.js'
import village from '../levels/village.json'

const $ = (id) => document.getElementById(id)
const params = new URLSearchParams(location.search)
const loading = $('loading')
const bar = $('loading-bar')
const label = $('loading-label')

const season = SEASONS.includes(params.get('season')) ? params.get('season') : seasonOn(new Date())

const progress = (fraction, text) => {
  if (bar) bar.style.width = `${Math.round(Math.max(0, Math.min(1, fraction)) * 100)}%`
  if (label && text) label.textContent = text
}

const fail = (err) => {
  console.error('[HermesFord]', err)
  loading?.classList.add('is-error')
  if (label) label.textContent = `The village could not load: ${err?.message ?? err}`
}

const finish = () => {
  progress(1, 'Ready')
  loading?.classList.add('is-done')
  setTimeout(() => loading?.remove(), 700)
}

try {
  const { level, warnings } = normalizeLevel(seasonal(village, season))
  for (const warning of warnings) console.warn('[level]', warning)

  // A season change reloads the page (the engine's season kit rebuilds the world): keep the
  // player where they stood, so the next season starts under the same roof.
  const atX = Number.parseFloat(params.get('x') ?? '')
  const atZ = Number.parseFloat(params.get('z') ?? '')
  if (Number.isFinite(atX) && Number.isFinite(atZ)) {
    const facing = params.get('facing')
    const facings = ['down', 'up', 'left', 'right']
    level.spawn = { x: atX, z: atZ, facing: facings.includes(facing) ? facing : level.spawn.facing }
  }

  const game = new Game({
    container: $('game'),
    level,
    autostart: true,
    source: 'levels/village.json',
    lang: 'en',
    fonts: startFonts({ lang: 'en', mode: 'local' }),
  })

  await game.init(progress)
  if (params.has('mute')) game.audio.muted = true
  game.start()
  finish()

  // ---- Y: the next season (a fresh page, the loading screen covers the rebuild) ----
  const rows = game._controls()
  const at = rows.findIndex((r) => r.id === 'weather')
  rows.splice(at >= 0 ? at + 1 : rows.length, 0, { id: 'season', keys: 'Y', label: 'Season' })
  game.ui.hud.setControls(rows)

  const typing = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
  window.addEventListener('keydown', (event) => {
    if (event.code !== 'KeyY' || event.repeat || typing(event.target)) return
    if (game.mode !== 'play' || game.ui.dialog.isOpen) return
    const next = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length]
    const url = new URL(location.href)
    url.searchParams.set('season', next)
    url.searchParams.set('x', game.player.position.x.toFixed(2))
    url.searchParams.set('z', game.player.position.z.toFixed(2))
    url.searchParams.set('facing', game.player.sprite.direction)
    if (params.has('mute')) url.searchParams.set('mute', '1')
    location.assign(url)
  })
} catch (err) {
  fail(err)
}
