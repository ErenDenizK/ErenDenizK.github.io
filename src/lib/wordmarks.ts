/* The faces a product's wordmark may be set in (docs/research/2026-10-wordmarks.md; family.md §2.5:
   Newsreader is the maker's voice, each product's face is the product's voice). Each face is a
   self-hosted subset (tools/fonts/subset.py) declared in styles/wordmarks.css; the weights listed are
   the ones the subset contains, and the content schema refuses any other. Adding a face is the one
   step that is not content: subset it, add its @font-face and a row here. */
export const WORDMARK_FACES = {
  /** Recto (craft audit pairing 4's display face, wordmarks §2.1). Static 600. */
  'Funnel Display': { stack: '"Funnel Display", "Funnel Display Fallback", sans-serif', weights: [600] },
  /** Eat Map, beside SF Pro (wordmarks §2.3). Static 800. */
  Nunito: { stack: '"Nunito", "Nunito Fallback", ui-rounded, sans-serif', weights: [800] },
  /** English Prep's own signature face (its js/brand.js); the house subset already carries it. */
  Inter: { stack: 'var(--f-ui)', weights: [400, 500, 600] },
} as const;

export type WordmarkFace = keyof typeof WORDMARK_FACES;
export const WORDMARK_FACE_NAMES = Object.keys(WORDMARK_FACES) as [WordmarkFace, ...WordmarkFace[]];
