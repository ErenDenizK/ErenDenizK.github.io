// SAMPLE DATA: shows the bar primitive on the contact sheet. Not a claim about the log.
import { bars } from '../kit.mjs'

const DATA = [
  { label: 'May', value: 2 }, { label: 'Jun', value: 3 }, { label: 'Jul', value: 1 },
  { label: 'Aug', value: 4 }, { label: 'Sep', value: 3 }, { label: 'Oct', value: 5 },
]
export default {
  name: 'sample-chart',
  accent: 'recto',
  sample: true,
  title: 'Sample chart: entries per month',
  desc: 'Sample data. Six bars, May to October; October, the highest at 5, is in the accent.',
  caption: 'Sample data, to show the bar primitive. One series, labelled directly, one bar in the accent.',
  wide() { return { height: 200, body: [bars({ x: 8, y: 8, w: 464, h: 160, data: DATA, highlight: 5 })] } },
  narrow() { return { height: 200, body: [bars({ x: 0, y: 8, w: 358, h: 160, data: DATA, highlight: 5 })] } },
}
