// Spec section 6 keys a file icon theme can express. fileNames match case-insensitively; keys are lower case here.
const TEST_BASES = ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'];

export const REQUIRED_FILE_EXTENSIONS = [
  'js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'tsx', 'jsx', 'py', 'pyw', 'html', 'htm', 'css', 'scss', 'less', 'sql', 'sh',
  'fish', 'ps1', 'json', 'jsonc', 'jsonl', 'yaml', 'yml', 'toml', 'env', 'lock', 'db', 'md', 'mdx', 'txt', 'svg',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf', 'woff', 'woff2',
  ...TEST_BASES.flatMap((base) => [`test.${base}`, `spec.${base}`]),
];

export const REQUIRED_FILE_NAMES = [
  '.env', '.env.local', '.env.development', '.env.production', '.env.example',
  'readme.md', 'license', 'license.md', 'changelog.md', 'package.json', 'pyproject.toml', 'requirements.txt',
  'tsconfig.json', 'jsconfig.json', 'dockerfile', '.gitignore', 'conftest.py', 'pytest.ini',
  'jest.config.js', 'jest.config.ts', 'jest.config.mjs', 'jest.config.cjs', 'jest.config.json',
  'package-lock.json', 'yarn.lock', 'cargo.lock', 'poetry.lock',
];

export const REQUIRED_FOLDER_NAMES = [
  'src', 'source', 'tests', 'test', '__tests__', 'docs', 'scripts', 'assets', 'dist', 'lib', 'bin', 'fixtures', '.github', 'workflows',
  '.claude', '.venv', 'node_modules', 'cache', '__pycache__',
];

// D11 keeps the 1.2.1 languageIds block (spec 6, 6.1); these are its keys, pointed at the new drawings as they land.
export const REQUIRED_LANGUAGE_IDS = [
  'python', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'css', 'scss', 'json', 'jsonc', 'yaml', 'markdown',
];

export const SIDEBARS = Object.freeze({ dark: '#120C1F', light: '#F8F0FB', highContrast: '#000000' });
