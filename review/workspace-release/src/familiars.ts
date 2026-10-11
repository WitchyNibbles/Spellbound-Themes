// Familiars of the coven, strongest first. A review fixture for the Spellbound Themes screenshots.
type Affinity = "moon" | "candle" | "tide";

/** A familiar bound to one witch; `power` runs from 0 to 99. */
export interface Familiar {
  readonly id: number;
  name: string;
  affinity: Affinity;
  power: number;
  awake?: boolean;
}

const familiars: Familiar[] = [
  { id: 1, name: "Miso", affinity: "moon", power: 42, awake: true },
  { id: 2, name: "Pixel", affinity: "candle", power: 77 },
  { id: 3, name: "Orbit", affinity: "tide", power: 13, awake: false },
];

export class Coven {
  private readonly members = new Map<number, Familiar>();

  summon(familiar: Familiar): this {
    this.members.set(familiar.id, familiar);
    return this;
  }

  get strongest(): Familiar | undefined {
    return byPower([...this.members.values()])[0];
  }
}

export function byPower<T extends { power: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.power - left.power);
}

export const names: string[] = byPower(familiars).map(({ name }) => `${name} the familiar`);
