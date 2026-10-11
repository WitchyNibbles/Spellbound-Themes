// The rows a file icon is drawn on in VS Code 1.141, per color theme (spec 6.3, 8, F9): the side bar, the active
// (focused) selection, and the focused quick-input row. A colour with alpha is composited over the surface it is
// drawn on: the list selection over the side bar, the quick-input focus over the quick input's own background.
import { composite } from '../../src/color.mjs';

// contributes.themes uiTheme -> file-icon set.
export const THEME_SETS = Object.freeze({ 'vs-dark': 'dark', vs: 'light', 'hc-black': 'highContrast' });

const toHex = (rgb) => `#${rgb.map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const over = (colour, surface) => toHex(composite(colour, surface));

// quickInputList.focusBackground defaults to list.activeSelectionBackground in dark and light themes (VS Code's colour
// registry); high-contrast themes default to none, and Coven Contrast sets it (G29). The quick-input list sits on
// quickInput.background, not on the side bar; a theme that sets none falls back to the side bar here.
export function themeBackdrops(colors) {
  const sidebar = colors['sideBar.background'];
  const selection = colors['list.activeSelectionBackground'];
  return {
    sidebar: over(sidebar, sidebar),
    selection: over(selection, sidebar),
    quickInputFocus: over(colors['quickInputList.focusBackground'] ?? selection, colors['quickInput.background'] ?? sidebar),
  };
}
