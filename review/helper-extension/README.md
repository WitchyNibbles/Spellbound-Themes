# Spellbound review helper

A throwaway extension installed only into the isolated review VS Code that `npm run review:gate` launches. It lists every mapped product-icon drawing at 16px in a panel tree, registers a fake test controller so the Testing view shows pass and fail icons, and raises a long notification for the toast screenshots. It is never published, never referenced from the root `package.json`, and excluded from the Spellbound VSIX by `.vscodeignore`.
