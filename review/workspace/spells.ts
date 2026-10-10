// Review fixture: missing functions (quick-fix light bulb inline on line 11, in the gutter on line 16), a type error (status bar error count), foldable blocks.
export interface Potion {
  name: string;
  strength: number;
}

export function brew(potion: Potion): string {
  if (potion.strength > 3) {
    return `${potion.name} glows`;
  }
  return stirCauldron(potion);
}

export const moonwater: Potion = { name: 'moonwater', strength: 'five' };
export const wand = 'oak';
export const charm = summonCharm();
export const robe = 'night';
