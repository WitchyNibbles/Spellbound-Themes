export function checkPackage({ packageJson, exists, readFile }, report) {
  const fail = (message) => report.fail('base', message);
  const relative = (contributionPath) => contributionPath.replace(/^\.\//, '');
  for (const contribution of packageJson.contributes?.themes ?? []) {
    if (!exists(relative(contribution.path))) fail(`Missing theme contribution: ${contribution.path}`);
  }
  for (const contribution of packageJson.contributes?.iconThemes ?? []) {
    if (!exists(relative(contribution.path))) fail(`Missing icon theme contribution: ${contribution.path}`);
  }
  if (!packageJson.icon) return;
  if (!exists(packageJson.icon)) {
    fail(`Missing extension icon: ${packageJson.icon}`);
    return;
  }
  const icon = readFile(packageJson.icon);
  if (icon.readUInt32BE(0) !== 0x89504e47 || icon.readUInt32BE(16) < 128 || icon.readUInt32BE(20) < 128) {
    fail('Extension icon must be a PNG at least 128x128');
  }
}

export function checkReleaseMetadata(packageJson, report) {
  if (packageJson.version !== '2.0.0') report.fail('release', `package.json version must be 2.0.0 at release (found ${packageJson.version})`);
  const banner = packageJson.galleryBanner?.color;
  if (banner?.toUpperCase() !== '#0D0916') report.fail('release', `package.json galleryBanner.color must be #0D0916 at release (found ${banner})`);
}
