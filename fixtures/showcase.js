// A small, dependency-free spellbook for the theme preview.
const coven = [
  { name: "Luna", affinity: "moon", power: 42 },
  { name: "Nova", affinity: "spark", power: 77 },
  { name: "Echo", affinity: "tide", power: 13 },
];

const MAX_POWER = 99;

export function greet(name = "witch") {
  return `${name}, the ${coven.length} stars are aligned.`;
}

export function strongestMember(members = coven) {
  return members.reduce((strongest, member) => (
    member.power > strongest.power ? member : strongest
  ));
}

export const spellSummary = coven.map(({ name, affinity, power }) => ({
  name,
  label: `${affinity} spell`,
  power: Math.min(power, MAX_POWER),
}));

console.log(greet(), strongestMember().name);
