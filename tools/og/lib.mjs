// Encodes a PNG screenshot in the browser (Chromium's own JPEG and WebP encoders), stepping
// the quality down until the file fits the budget.
export async function encode(page, png, type, startQ, max) {
  return page.evaluate(async ({ b64, type, startQ, max }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
    c.getContext('2d').drawImage(img, 0, 0);
    for (let q = startQ; q >= 0.5; q -= 0.04) {
      const blob = await c.convertToBlob({ type, quality: q });
      if (blob.size <= max || q - 0.04 < 0.5) {
        const buf = new Uint8Array(await blob.arrayBuffer());
        let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        return { b64: btoa(s), q: Math.round(q * 100) };
      }
    }
  }, { b64: png.toString('base64'), type, startQ, max });
}

