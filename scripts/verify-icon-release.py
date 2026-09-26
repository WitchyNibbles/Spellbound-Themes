"""Check the 1.2.1 icon revision against its frozen pre-edit snapshot and VSIX."""

from hashlib import sha1, sha256
import json
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parent.parent
BASELINE = json.loads((ROOT / "icons/product-icon-baseline-1.2.1.json").read_text())
BASELINE_ARCHIVE = ROOT / "docs/qa/witchynibbles-pre-edit-icons-1.2.1.zip"
CHANGED = {"explorer-view-icon.svg", "extensions-view-icon.svg", "settings-gear.svg"}
SCREENSHOTS = {"product-icons.png", "moonlit.png", "daydream.png", "coven-contrast.png"}
PUBLIC_IMAGE_PROOF = ROOT / "docs/qa/public-image-verification.json"
LIVE_IMAGE_PROOF = ROOT / "docs/qa/live-packed-image-verification.json"
VSIX = ROOT / "witchynibbles-theme-collection-1.2.1.vsix"


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(message)


source_dir = ROOT / "icons/product-src"
current = {path.name: digest(path.read_bytes()) for path in source_dir.glob("*.svg")}
before = BASELINE["svg_sha256"]
require(BASELINE_ARCHIVE.is_file(), "Verified pre-edit icon snapshot is missing")
with ZipFile(BASELINE_ARCHIVE) as snapshot:
    expected_names = {"product-icon-map.json"} | {
        f"product-src/{name}" for name in before
    }
    require(set(snapshot.namelist()) == expected_names, "Pre-edit archive source set changed")
    for name, baseline_hash in before.items():
        require(
            digest(snapshot.read(f"product-src/{name}")) == baseline_hash,
            f"Pre-edit archive does not match manifest: {name}",
        )
    require(
        digest(snapshot.read("product-icon-map.json"))
        == BASELINE["product_icon_map_sha256"],
        "Pre-edit archive map does not match manifest",
    )
print(f"Pre-edit archive {digest(BASELINE_ARCHIVE.read_bytes())}")
require(set(current) == set(before) and len(before) == 48, "SVG source set changed")
actual_changes = {name for name in before if before[name] != current[name]}
require(actual_changes == CHANGED, f"Unexpected source changes: {sorted(actual_changes)}")
require(
    digest((ROOT / "icons/product-icon-map.json").read_bytes())
    == BASELINE["product_icon_map_sha256"],
    "Product icon codepoint map changed",
)

require(VSIX.is_file(), "1.2.1 VSIX is missing")
require(PUBLIC_IMAGE_PROOF.is_file(), "Public image URL evidence is missing")
public_proof = json.loads(PUBLIC_IMAGE_PROOF.read_text())
require(
    public_proof["repository"] == "https://github.com/WitchyNibbles/Spellbound-Themes"
    and public_proof["published_project_root"] == ".",
    "Public repository layout is not the project root",
)
base = "https://raw.githubusercontent.com/WitchyNibbles/Spellbound-Themes/main/assets/screenshots/"
image_proofs = {Path(item["path"]).name: item for item in public_proof["screenshots"]}
require(set(image_proofs) == SCREENSHOTS, "Public screenshot evidence set changed")
for name in SCREENSHOTS:
    item = image_proofs[name]
    data = (ROOT / "assets/screenshots" / name).read_bytes()
    git_blob = sha1(f"blob {len(data)}\0".encode() + data).hexdigest()
    require(item["path"] == f"assets/screenshots/{name}", f"Public path wrong: {name}")
    require(item["raw_url"] == base + name, f"Public URL wrong: {name}")
    require(item["http_status"] == 200, f"Public image did not load: {name}")
    require(item["sha256"] == digest(data), f"Public image bytes differ: {name}")
    require(item["git_blob_sha"] == git_blob, f"Public tree blob differs: {name}")
    require(item["incorrect_nested_http_status"] == 404, f"Nested-path control changed: {name}")
print(f"Public image URL evidence {digest(PUBLIC_IMAGE_PROOF.read_bytes())}")
with ZipFile(VSIX) as package:
    names = set(package.namelist())
    assets = [
        *[f"icons/product-src/{name}" for name in sorted(CHANGED)],
        "icons/witchynibbles-product-icons.woff",
        *[f"assets/screenshots/{name}" for name in sorted(SCREENSHOTS)],
    ]
    for relative in assets:
        packed = f"extension/{relative}"
        require(packed in names, f"Missing packaged asset: {packed}")
        local_hash = digest((ROOT / relative).read_bytes())
        packed_hash = digest(package.read(packed))
        require(local_hash == packed_hash, f"Packaged asset mismatch: {packed}")
        print(f"{packed} {packed_hash}")

    readme = package.read("extension/readme.md")
    for name in SCREENSHOTS:
        require((base + name).encode() in readme, f"Packaged README image path wrong: {name}")
    require(b"raw.githubusercontent.com/WitchyNibbles/pastel-princess/" not in readme, "Old broken screenshot path remains")
    print(f"extension/readme.md {digest(readme)}")
    require(LIVE_IMAGE_PROOF.is_file(), "Independent live packed-image check is missing")
    live = json.loads(LIVE_IMAGE_PROOF.read_text())
    require(live["invocation"] == "python3 scripts/verify-live-readme-images.py", "Live invocation missing")
    require(
        live["vsix_sha256"] == digest(VSIX.read_bytes()),
        "Live evidence was generated from a different VSIX",
    )
    require(live["packed_readme_sha256"] == digest(readme), "Live README differs")
    results = {Path(item["packed_path"]).name: item for item in live["results"]}
    require(set(results) == SCREENSHOTS, "Live check did not cover every image")
    for name in SCREENSHOTS:
        item = results[name]
        packed_path = f"extension/assets/screenshots/{name}"
        packed_hash = digest(package.read(packed_path))
        require(item["url"] == base + name, f"Live URL differs: {name}")
        require(item["packed_path"] == packed_path, f"Live packed path differs: {name}")
        require(item["http_status"] == 200 and item["body_match"], f"Live fetch failed: {name}")
        require(item["packed_sha256"] == packed_hash == item["remote_sha256"], f"Live bytes differ: {name}")
    print(f"External live packed-image evidence {digest(LIVE_IMAGE_PROOF.read_bytes())}")

print(f"VSIX {digest(VSIX.read_bytes())}")
qa_render = ROOT / "docs/qa/witchynibbles-1.2.1-icon-comparison.png"
require(qa_render.is_file(), "16px before/after visual comparison is missing")
print(f"16px comparison {digest(qa_render.read_bytes())}")
print("Verified: only three source SVGs changed; map and 45 others match baseline; VSIX assets match source")
