// Typed familiars demonstrate interfaces, generics, unions, and modifiers.
type Affinity = "moon" | "spark" | "tide";

interface Familiar {
  readonly id: number;
  name: string;
  affinity: Affinity;
  power: number;
  metadata?: Record<string, string>;
}

const familiars: Familiar[] = [
  { id: 1, name: "Miso", affinity: "moon", power: 42 },
  { id: 2, name: "Pixel", affinity: "spark", power: 77 },
  { id: 3, name: "Orbit", affinity: "tide", power: 13 },
];

export function byPower<T extends { power: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.power - left.power);
}

export const names: string[] = byPower(familiars).map(({ name }) => name);
export const strongest: Familiar = byPower(familiars)[0];
