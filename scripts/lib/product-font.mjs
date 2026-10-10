import { Readable } from 'node:stream';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';

export const FONT_UNITS_PER_GRID_UNIT = 64;

// Spec section 4: no centring flags (they move asymmetric glyphs off the grid). With viewBox 0 0 16 16,
// no width/height and usePathBounds off, normalize gives every glyph the same 64 units per grid unit.
export const FONT_STREAM_OPTIONS = Object.freeze({
  fixedWidth: true,
  normalize: true,
  preserveAspectRatio: true,
  fontHeight: 1024,
  descent: 0,
  round: 1e6,
});

export async function buildFont({ fontId, fontFamily, version, glyphs }) {
  if (!glyphs.length) throw new Error('Cannot build a product icon font without drawings');
  const stream = new SVGIcons2SVGFontStream({
    ...FONT_STREAM_OPTIONS,
    fontName: fontFamily,
    fontId,
    metadata: 'Original WitchyNibbles product icon artwork.',
    log: () => {},
  });
  const chunks = [];
  stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise((resolve, reject) => {
    stream.once('end', resolve);
    stream.once('error', reject);
  });
  for (const { name, codepoint, svg } of glyphs) {
    const glyph = Readable.from([svg]);
    glyph.metadata = { name, unicode: [String.fromCodePoint(Number.parseInt(codepoint, 16))] };
    stream.write(glyph);
  }
  stream.end();
  await done;
  const ttf = svg2ttf(Buffer.concat(chunks).toString('utf8'), {
    id: fontId,
    familyname: fontFamily,
    fullname: fontFamily,
    description: 'Original WitchyNibbles product icons for Visual Studio Code.',
    copyright: 'Copyright WitchyNibbles.',
    url: 'https://marketplace.visualstudio.com/publishers/EimiMartinez',
    version,
    ts: 0,
  });
  return Buffer.from(ttf2woff(new Uint8Array(ttf.buffer)).buffer);
}
