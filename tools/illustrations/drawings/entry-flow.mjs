// How a log entry is made: the workflow in CLAUDE.md "Log entries" and brief §4.3.
// A box-and-arrow diagram: four steps, the review step in the accent (it is the gate),
// and one loop back for changes.
import { box, arrow, text } from '../kit.mjs'

export default {
  name: 'entry-flow',
  accent: 'log',
  title: 'How a log entry is made',
  desc: 'Four steps from left to right: dictated notes, a draft, the owner\'s review, and the published entry. A loop runs from the review back to the draft, labelled "changes".',
  caption: 'Every entry passes the same gate: nothing is published before I have read it.',

  wide() {
    const W = 144, H = 64, G = 48, Y = 16
    const names = [
      ['Dictated notes', 'raw, often Turkish'],
      ['Draft', 'edited into English'],
      ['Review', 'I read every draft'],
      ['Published', 'dated, in the log'],
    ]
    const b = names.map(([n, l], i) => box({ x: i * (W + G), y: Y, w: W, h: H, name: n, label: l, emph: i === 2 }))
    const body = [...b]
    for (let i = 0; i < 3; i++) body.push(arrow({ points: [b[i].right, b[i + 1].left], accent: i === 2 }))
    const [rv, dr] = [b[2], b[1]]
    body.push(arrow({ points: [rv.bottom, [rv.bottom[0], 128], [dr.bottom[0], 128], dr.bottom], label: 'changes', labelSide: 'below' }))
    return { height: 160, body }
  },

  narrow() {
    const W = 232, H = 56, G = 32
    const names = [
      ['Dictated notes', 'raw, often Turkish'],
      ['Draft', 'edited into English'],
      ['Review', 'I read every draft'],
      ['Published', 'dated, in the log'],
    ]
    const b = names.map(([n, l], i) => box({ x: 0, y: 8 + i * (H + G), w: W, h: H, name: n, label: l, emph: i === 2 }))
    const body = [...b]
    for (let i = 0; i < 3; i++) body.push(arrow({ points: [b[i].bottom, b[i + 1].top], accent: i === 2 }))
    const [rv, dr] = [b[2], b[1]]
    const lx = W + 32
    body.push(arrow({ points: [rv.right, [lx, rv.right[1]], [lx, dr.right[1]], dr.right], label: 'changes', labelSide: 'right' }))
    return { height: 8 + 4 * H + 3 * G + 8, body }
  },

  /** A text-free plate for the essay's row in the index (96 × 56). */
  plate() {
    const body = [0, 1, 2].map((i) => `<rect class="il-box${i === 1 ? ' il-a' : ''}" x="${4 + i * 32}" y="18.5" width="24" height="18" rx="4"/>`)
    body.push(arrow({ points: [[30, 27.5], [34, 27.5]], head: false }), arrow({ points: [[62, 27.5], [66, 27.5]], head: false, accent: true }))
    return { width: 96, height: 56, body }
  },
}
