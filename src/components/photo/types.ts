/* What every presentation of an About photograph is given (components/Photo.astro). */
export interface PhotoProps {
  /** the photo's file stem in content/photos/ */
  stem: string;
  /** which photograph on the page this is, from 0 */
  index: number;
  src: string;
  srcset: string;
  avif: string;
  sizes: string;
  /** the original's pixels (the derivatives are never drawn larger than their own) */
  width: number;
  height: number;
  /** the smallest webp, for light and for small copies */
  small: string;
  /** the whole photograph at its own width, when it is wider than the largest derivative */
  full?: { avif: string; webp: string; width: number; height: number };
  /** the painted depth map (tools/photos/depth.py), when there is one */
  depth?: string;
  /** the photo's measured light colour (tools/photos/postcards.mjs) */
  tone: string;
  alt: string;
  note: string;
  place: string;
  date?: Date | string;
  rest?: number;
  hint?: boolean;
}

/** "Bostancı, Istanbul" as its first part and the rest */
export function splitPlace(place: string): [string, string] {
  const [a, ...b] = place.split(',').map((s) => s.trim()).filter(Boolean);
  return [a ?? place, b.join(', ')];
}

/** pixels as a museum label gives dimensions: width × height */
export const dims = (w: number, h: number) => `${w} × ${h} px`;
