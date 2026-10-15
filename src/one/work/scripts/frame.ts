/* Calls back once a video has presented its first frame, so a clip never fades in over a blank (black)
   frame: requestVideoFrameCallback where it exists, else the playing event. */
export function onFirstFrame(v: HTMLVideoElement, fn: () => void) {
  const rv = v as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };
  if (typeof rv.requestVideoFrameCallback === 'function') rv.requestVideoFrameCallback(() => fn());
  else v.addEventListener('playing', fn, { once: true });
}
