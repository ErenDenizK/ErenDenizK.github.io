// An annotated screenshot frame, on a real capture of prototype F's log (contact sheet only).
import { frame, hand } from '../kit.mjs'

const SHOT = '../../../prototypes/f/shots/desktop-log.png'
export default {
  name: 'sample-frame',
  accent: 'log',
  sample: true,
  title: 'Annotated screenshot of the log index',
  desc: 'A crop of prototype F\'s log page with three notes: the date gutter, the entry kind, and the sample tag.',
  caption: 'The frame primitive: notes sit outside the image, joined to the spot by a hairline.',
  wide() {
    const body = [frame({ id: 'sf-w', x: 120, y: 8, w: 480, h: 300, href: SHOT, notes: [
      { at: [0.05, 0.6], label: 'Date gutter', side: 'left' },
      { at: [0.268, 0.513], label: 'Sample tag' },
      { at: [0.52, 0.6], label: 'Entry kind' },
    ] })]
    body.push(hand.circle({ cx: 120 + 0.523 * 480, cy: 8 + 0.6 * 300, rx: 26, ry: 14, seed: 3 }))
    return { height: 316, body }
  },
  narrow() {
    return { height: 166, body: [frame({ id: 'sf-n', x: 0, y: 8, w: 240, h: 150, href: SHOT, notes: [
      { at: [0.268, 0.513], label: 'Sample' }, { at: [0.52, 0.6], label: 'Kind' },
    ] })] }
  },
}
