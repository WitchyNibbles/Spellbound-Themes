const potions = ['moonwater', 'nightshade'];
let brewed = 0;
for (const potion of potions) {
  brewed += potion.length;
}
console.log(brewed);
