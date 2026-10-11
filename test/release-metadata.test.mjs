// Spec 8 and 9: the release metadata of Spellbound Themes 2.0.0.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const json = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

test('package.json and package-lock.json carry the version of the top CHANGELOG entry, 2.0.0 or later, with the #0D0916 dark gallery banner (spec 8, 9)', () => {
  // Final review M7: tied to the CHANGELOG rather than pinned to 2.0.0, so a later release bumps one place in each file.
  const pkg = json('package.json');
  const lock = json('package-lock.json');
  const [, top] = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8').match(/^## (\S+) — /m);
  assert.equal(pkg.version, top);
  assert.match(pkg.version, /^([2-9]|[1-9]\d+)\.\d+\.\d+$/);
  assert.deepEqual(pkg.galleryBanner, { color: '#0D0916', theme: 'dark' });
  assert.deepEqual([lock.version, lock.packages[''].version], [pkg.version, pkg.version]);
});

test('the description and keywords name Moonlit Candle and its candle-gold look, and drop pastel (spec 9)', () => {
  const { description, keywords } = json('package.json');
  assert.equal(description, 'Moonlit Candle: candle-gold accents and lavender light on a moonlit night, plus Moonlit, Daydream and Coven Contrast, with original file and product icons.');
  assert.deepEqual(keywords, ['theme', 'dark theme', 'light theme', 'high contrast', 'witchy', 'moonlit candle', 'candle', 'gold', 'purple', 'file icons', 'product icons', 'icon theme']);
  assert.ok(keywords.length <= 30, 'the Marketplace takes at most 30 keywords');
  assert.doesNotMatch(`${description} ${keywords.join(' ')}`, /pastel/i);
});
