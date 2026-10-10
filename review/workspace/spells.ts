// Review fixture: a missing function (quick-fix light bulb on line 11), a type error (status bar error count), foldable blocks.
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
