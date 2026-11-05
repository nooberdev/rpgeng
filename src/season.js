// Seasons: the level re-dressed with Lumina's season kit (vendor/lumina:
// pixel/textures/seasons.js, world/props/SeasonTrees.js). The level file itself stays as drawn;
// the game applies a copy at boot and whenever the player presses Y.
export const SEASONS = ['winter', 'spring', 'summer', 'autumn']

/** The season of a date (northern hemisphere: Dec–Feb winter …). */
export const seasonOn = (date) => SEASONS[Math.floor(((date.getMonth() + 1) % 12) / 3)]

const LOOK = {
  spring: {
    tops: { grass: 'spring_grass', grass_dark: 'spring_grass', grass_flowers: 'blossom_grass' },
    lip: 'spring_grass_side',
    trees: { autumn: 'blossom', maple: 'blossom' },
    drop: ['leaves'],
  },
  summer: { tops: {}, trees: { autumn: 'oak', maple: 'oak' }, drop: [] },
  autumn: {
    tops: { grass: 'autumn_grass', grass_dark: 'autumn_grass', grass_flowers: 'fallen_leaves', farmland: 'stubble' },
    lip: 'autumn_grass_side',
    trees: { oak: 'maple', birch: 'goldbirch' },
    drop: ['petals'],
  },
  winter: {
    tops: {
      grass: 'snow_top', grass_dark: 'snow_top', grass_flowers: 'snow_top', farmland: 'snow_top',
      dirt: 'snow_path', dirt_path: 'snow_path', cobblestone: 'frost_cobble',
    },
    lip: 'snow_side',
    trees: { pine: 'snowpine', oak: 'bare', birch: 'bare', autumn: 'bare', maple: 'bare' },
    drop: ['leaves', 'petals', 'fireflies'],
    house: { icicles: true },
    weather: 'snow',
  },
}

/** What the banner says when a season comes (Latin only: Lumina's pixel fonts have no Cyrillic). */
export const SEASON_BANNER = {
  winter: ['Winter', 'Snow falls on the village'],
  spring: ['Spring', 'The snow melts, the cherries bloom'],
  summer: ['Summer', 'Long warm days'],
  autumn: ['Autumn', 'The leaves turn gold'],
}

/** A copy of a raw level dressed for a season (the level itself is untouched). */
export function seasonal(level, season) {
  const look = LOOK[season]
  const legend = Object.fromEntries(Object.entries(level.legend).map(([k, d]) => [k, {
    ...d,
    ...(look.tops[d.top] && { top: look.tops[d.top] }),
    ...(look.lip && d.lip === 'grass_side' && { lip: look.lip }),
  }]))
  const objects = level.objects
    .filter((o) => !(o.type === 'emitter' && look.drop.includes(o.preset)))
    .map((o) => (
      o.type === 'tree' && look.trees[o.opts?.kind]
        ? { ...o, opts: { ...o.opts, kind: look.trees[o.opts.kind] } }
        : o.type === 'house' && look.house ? { ...o, opts: { ...o.opts, ...look.house } } : o
    ))
  // (no `season` in summer: Lumina's summer raises limestone headlands at the map's water edge)
  const environment = {
    ...level.environment,
    ...(season !== 'summer' && { season }),
    ...(look.weather && { weather: look.weather }),
  }
  return { ...level, legend, objects, environment }
}
