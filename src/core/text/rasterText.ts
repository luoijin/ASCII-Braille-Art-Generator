export interface RasterTextOptions {
  text: string;
  fontFamily: string;
  fontWeight: number;
  fontSizePx: number;    // raster size, not visual size (default 96)
  lineHeight: number;    // multiplier, default 1.2
  align: 'left' | 'center' | 'right';
  paddingPx: number;     // default 16
}

export async function rasterizeText(o: RasterTextOptions): Promise<{width: number; height: number; data: ImageData}> {
  const font = `${o.fontWeight} ${o.fontSizePx}px "${o.fontFamily}"`;
  await document.fonts.load(font); // wait for the font before measuring

  const lines = o.text.split('\n');
  const probe = new OffscreenCanvas(1, 1).getContext('2d')!;
  probe.font = font;
  const widths = lines.map(l => probe.measureText(l).width);
  const lineH = o.fontSizePx * o.lineHeight;

  const w = Math.ceil(Math.max(...widths)) + o.paddingPx * 2;
  const h = Math.ceil(lines.length * lineH) + o.paddingPx * 2;

  const canvas = new OffscreenCanvas(w, h);
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);
  g.font = font;
  g.textBaseline = 'top';
  g.fillStyle = '#fff';

  lines.forEach((line, i) => {
    const free = w - o.paddingPx * 2 - widths[i];
    const x = o.paddingPx + (o.align === 'center' ? free / 2 : o.align === 'right' ? free : 0);
    g.fillText(line, x, o.paddingPx + i * lineH);
  });

  return { width: w, height: h, data: g.getImageData(0, 0, w, h) };
}