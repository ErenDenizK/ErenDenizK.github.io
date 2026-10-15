/* A project without screens shows its glass object turning (spec 3.3.3: the spin loop) once its page
   is up. The loop is added only with motion; the poster stays under it and is the still twin. */
import { motion } from './bus';
import { onFirstFrame } from './frame';

type Src = { src: string; type: string }[];
export function spin(o: HTMLElement | null, phone: boolean) {
  if (!o || motion() !== 'full' || o.querySelector('video')) return;
  const v = JSON.parse(o.dataset.videos || '{}') as { wide?: Src; phone?: Src };
  const list = (phone ? v.phone : v.wide) ?? v.wide;
  if (!list?.length) return;
  const vid = document.createElement('video');
  vid.muted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('aria-hidden', 'true');
  for (const s of list) { const so = document.createElement('source'); so.src = s.src; so.type = s.type; vid.append(so); }
  onFirstFrame(vid, () => vid.classList.add('on'));
  o.append(vid);
  vid.play().catch(() => {});
}
