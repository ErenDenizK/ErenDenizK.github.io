// The site's levels (docs/ROADMAP.md) on a four-year line (brief §2.3). Levels, not dates:
// only the start is dated; the rest are placed in order, drawn as not yet happened.
import { timeline, hand, text } from '../kit.mjs'
import { textWidth } from '../rules.mjs'

const EVENTS = [
  { at: 0, name: 'Level 0', label: 'Foundation', state: 'done', anchor: 'start' },
  { at: 0.28, name: 'Level 1', label: 'Concept prototypes', state: 'now' },
  { at: 0.54, name: 'Level 2', label: 'The content site', state: 'later' },
  { at: 0.8, name: 'Level 3', label: 'The world', state: 'later' },
]

export default {
  name: 'levels',
  accent: 'log',
  title: 'The site grows level by level',
  desc: 'A line from October 2026 to year five. Level 0, foundation, is done; Level 1, concept prototypes, is current and circled by hand; Level 2, the content site, and Level 3, the world, are still ahead, on a dotted line.',
  caption: 'Levels, not dates. Only the start is dated; the line after the current level is dotted because it has not happened yet.',

  wide() {
    const x = 8, y = 48, L = 704
    const body = [timeline({ x, y, length: L, events: EVENTS, start: 'Oct 2026', end: 'Year five' })]
    const nx = x + 0.28 * L
    const w = textWidth('Level 1', 15, 500)
    body.push(hand.underline({ x0: nx - w / 2 - 4, x1: nx + w / 2 + 6, y: y + 32 + 3, seed: 7 }))
    return { height: 124, body }
  },

  narrow() {
    const x = 96, y = 16, L = 320
    const body = [timeline({ x, y, length: L, events: EVENTS, vertical: true, start: 'Oct 2026', end: 'Year five' })]
    const ny = y + 0.28 * L
    const w = textWidth('Level 1', 15, 500)
    body.push(hand.underline({ x0: x + 24 - 3, x1: x + 24 + w + 6, y: ny + 5 + 3, seed: 7 }))
    return { height: y + L + 24, body }
  },
}
