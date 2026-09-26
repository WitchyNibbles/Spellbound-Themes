"""Fetch every image in the packaged README and compare it with its VSIX asset."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
from urllib.request import urlopen
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parent.parent
VSIX = ROOT / "witchynibbles-theme-collection-1.2.1.vsix"
BASE = "https://raw.githubusercontent.com/WitchyNibbles/Spellbound-Themes/main/assets/screenshots/"
EXPECTED = {"product-icons.png", "moonlit.png", "daydream.png", "coven-contrast.png"}


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


with ZipFile(VSIX) as package:
    readme = package.read("extension/readme.md")
    urls = re.findall(rb"!\[[^]]*\]\((https://[^)]+)\)", readme)
    image_urls = [url.decode() for url in urls]
    names = {url.removeprefix(BASE) for url in image_urls}
    if len(image_urls) != 4 or names != EXPECTED or any(not url.startswith(BASE) for url in image_urls):
        raise SystemExit(f"Unexpected packaged README images: {image_urls}")
    results = []
    for url in image_urls:
        name = url.removeprefix(BASE)
        packed = package.read(f"extension/assets/screenshots/{name}")
        with urlopen(url, timeout=15) as response:
            body = response.read()
            status = response.status
        result = {
            "url": url,
            "packed_path": f"extension/assets/screenshots/{name}",
            "http_status": status,
            "packed_sha256": digest(packed),
            "remote_sha256": digest(body),
            "body_match": body == packed,
        }
        results.append(result)
        if status != 200 or not result["body_match"]:
            raise SystemExit(f"Public image does not match packaged asset: {url}")

report = {
    "invocation": "python3 scripts/verify-live-readme-images.py",
    "checked_at_utc": datetime.now(timezone.utc).isoformat(),
    "vsix_sha256": digest(VSIX.read_bytes()),
    "packed_readme_sha256": digest(readme),
    "results": results,
}
print(json.dumps(report, indent=2))
