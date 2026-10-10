// Colour math shared by the theme generator and the validator (WCAG 2.x relative luminance).
export const hexes = (text) => text.match(/#[0-9a-f]{6}(?:[0-9a-f]{2})?/gi) ?? [];

export const rgba = (hex) => [1, 3, 5]
  .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
  .concat(hex.length >= 9 ? parseInt(hex.slice(7, 9), 16) / 255 : 1);

export const composite = (foreground, background) => {
  const fg = rgba(foreground);
  const bg = rgba(background);
  const alpha = fg[3] + bg[3] * (1 - fg[3]);
  return fg.slice(0, 3).map((channel, index) => ((channel * fg[3]) + (bg[index] * bg[3] * (1 - fg[3]))) / alpha);
};

export const luminance = (color) => {
  const rgb = (Array.isArray(color) ? color : rgba(color)).slice(0, 3);
  return rgb.reduce((sum, channel, index) => {
    const linear = channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
};

export const contrast = (first, second) => {
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

export const compositedContrast = (foreground, background, surface) =>
  contrast(composite(foreground, surface), composite(background, surface));

export function hsv(hex) {
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const chroma = max - min;
  let hue = 0;
  if (chroma) {
    const [r, g, b] = rgb;
    let sector;
    if (max === r) sector = (g - b) / chroma;
    else if (max === g) sector = 2 + (b - r) / chroma;
    else sector = 4 + (r - g) / chroma;
    hue = (sector * 60 + 360) % 360;
  }
  return { hue, chroma, max };
}

// The 1.2.1 green-accent rule: hue 75-165, visibly saturated, not near-black.
export const isGreenAccent = (hex) => {
  const { hue, chroma, max } = hsv(hex);
  return hue >= 75 && hue <= 165 && chroma > 24 && max > 95;
};
