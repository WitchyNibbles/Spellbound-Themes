import { byPower } from "../src/familiars.js";

const ranked = byPower([{ power: 1 }, { power: 3 }]);
if (ranked[0].power !== 3) throw new Error("the strongest familiar comes first");
