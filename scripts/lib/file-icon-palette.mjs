// Spec section 6: the one colour table of the file icons. Sources carry role tokens (`fill="{code}"`) instead of hex
// values; the build resolves each source into the dark (Moonlit Candle and Moonlit), light (Daydream) and highContrast
// (Coven Contrast) sets (section 6.1, F3, F6). Assets is each theme's blue role (F8); muted takes the config values.
const freezeAll = (sets) => Object.freeze(Object.fromEntries(Object.entries(sets).map(([set, roles]) => [set, Object.freeze(roles)])));

export const ROLES = Object.freeze(['code', 'data', 'style', 'tests', 'config', 'docs', 'assets', 'muted']);
export const SETS = Object.freeze(['dark', 'light', 'highContrast']);
export const SET_DIRS = Object.freeze({ dark: 'dark', light: 'light', highContrast: 'high-contrast' });
export const PALETTE = freezeAll({
  dark: { code: '#B99AFF', data: '#FFD477', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#F3EAF7', assets: '#77D9FF', muted: '#A99AB9' },
  light: { code: '#7042B2', data: '#8A4D00', style: '#B52776', tests: '#0E7553', config: '#735F7D', docs: '#3B2A47', assets: '#176B9A', muted: '#735F7D' },
  highContrast: { code: '#D0B8FF', data: '#FFE38A', style: '#FF67B7', tests: '#74E8B8', config: '#A99AB9', docs: '#FFFFFF', assets: '#77D9FF', muted: '#A99AB9' },
});

// Every `{…}` in the source is a role token; anything that is not one of the eight roles is an error, never left in.
export function resolveSource(svg, set) {
  const colours = PALETTE[set];
  if (!colours) throw new Error(`Unknown file-icon set ${set}`);
  return svg.replace(/\{([^{}]*)\}/g, (token, role) => {
    if (!ROLES.includes(role)) throw new Error(`Unknown file-icon role ${token}`);
    return colours[role];
  });
}
