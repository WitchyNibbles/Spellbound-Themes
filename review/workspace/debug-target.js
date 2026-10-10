const potions = ['moonwater', 'nightshade'];
let brewed = 0;
for (const potion of potions) {
  brewed += potion.length;
}
console.log(brewed);
function stir(potion) {
  const swirl = potion.toUpperCase();
  return swirl.length;
}
const strength = stir(potions[0]);
console.log(strength);
// Keeps the program alive after Continue, so the debug toolbar shows Pause. Stop ends the process; the timer also ends
// when the inspector closes (the debugger is gone) and after ten minutes at most, so nothing outlives a missed Stop.
const inspector = require('node:inspector');
const started = Date.now();
const alive = setInterval(() => { if (!inspector.url() || Date.now() - started > 10 * 60 * 1000) clearInterval(alive); }, 1000);
