"""A tiny spellbook used to preview the WitchyNibbles palette."""

from dataclasses import dataclass, field
from typing import Final

MAX_POWER: Final[int] = 99
DEFAULT_AFFINITY: Final[str] = "moon"


@dataclass
class Spell:
    """A named spell with a bounded power level."""

    name: str
    power: int = 13
    affinity: str = DEFAULT_AFFINITY
    tags: list[str] = field(default_factory=list)

    def cast(self, target: str = "the night") -> str:
        power = min(self.power, MAX_POWER)
        return f"{self.name} ({self.affinity}) -> {target}: {power=}"


def prepare_coven(names: list[str]) -> dict[str, Spell]:
    """Give every witch a small starter spell."""
    return {name: Spell(f"{name}'s spark", 21, tags=["starter"]) for name in names}


if __name__ == "__main__":
    coven = prepare_coven(["Luna", "Nova", "Echo"])
    for witch, spell in coven.items():
        print(witch, spell.cast())
