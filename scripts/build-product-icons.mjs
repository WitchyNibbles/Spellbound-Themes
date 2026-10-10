import path from 'node:path';
import { buildProductIcons } from './lib/product-icons-build.mjs';

const root = path.resolve(import.meta.dirname, '..');
const { drawings, ids, fontPath } = await buildProductIcons({ root });
console.log(`Built ${drawings} product icon drawings for ${ids} icon IDs in ${path.relative(root, fontPath)}`);
