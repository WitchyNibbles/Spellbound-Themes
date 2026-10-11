"""Assemble the Marketplace images of spec 9 from real captures.

Nothing is drawn: every pixel comes from a VS Code capture of the release run (review/jobs/release.json) or from the
Windows Terminal capture (scripts/review/windows-terminal.ps1). The script copies, crops away trailing background, and
places captures next to each other on the Moonlit Candle background, then saves plain PNGs (no text chunks).

Inputs are checked before anything is written: every capture must be a PNG in opaque RGB (RGBA only when every alpha is
255), not a single colour; the four theme captures must share one size; a page must trim to real content. Any failure
exits non-zero with a message naming the file and writes nothing. Each input prints its provenance (path relative to the
run directory, sha256, size and the crop taken) for docs/qa/2.0.0-release/.

Usage:
  python3 scripts/release/release-images.py themes <run-dir> <out-dir>        one workbench per color theme
  python3 scripts/release/release-images.py sheet <run-dir> <out.png>         the three icon-sheet pages, stacked
  python3 scripts/release/release-images.py terminal <run-dir> <wt.png> <out.png>   VS Code's terminal beside Windows Terminal
"""
import hashlib
import sys
from pathlib import Path

from PIL import Image

BACKGROUND = (0x0D, 0x09, 0x16)  # Moonlit Candle's editor and terminal background (spec 3.1)
GUTTER = 24  # between VS Code and Windows Terminal
MARGIN = 8  # background kept below and right of the content when trimming
MIN_CONTENT = 16  # a trimmed page must hold content at least this wide and this high (an icon), else the capture is broken
RULE_SHARE = 0.9  # a row or column is a rule (a border or a view separator) when one colour fills this share of it in one
# run, its length taken without MARGIN at each end (where a rounded corner bends the border away from the line)
THEMES = ("moonlit-candle", "moonlit", "daydream", "coven-contrast")
SHEET_THEME = "moonlit-candle"
SHEET_SCENES = ("icon-sheet", "icon-sheet-2", "icon-sheet-3")
RUN_DIR = Path(".")  # set by the commands: provenance paths are printed relative to the run directory


def shown(path):
    """The path as provenance prints it: relative to the run directory when inside it, else the file name only."""
    try:
        return Path(path).resolve().relative_to(RUN_DIR.resolve()).as_posix()
    except ValueError:
        return Path(path).name


def load(path):
    """Opens a capture and returns it as opaque RGB with no metadata. Nothing is converted silently: an RGBA capture is
    accepted only when every alpha is 255 (the alpha is then dropped, the colours are untouched); every other mode is refused."""
    path = Path(path)
    try:
        data = path.read_bytes()
        image = Image.open(path)
        image.load()
    except FileNotFoundError:
        raise SystemExit(f"missing capture: {path}")
    except OSError as error:
        raise SystemExit(f"cannot read capture {path}: {error}")
    if image.format != "PNG":
        raise SystemExit(f"{path}: not a PNG ({image.format})")
    if image.mode == "RGBA":
        if image.getchannel("A").getextrema() != (255, 255):
            raise SystemExit(f"{path}: the capture is not opaque (alpha below 255); refusing to flatten it")
        image = image.convert("RGB")
    elif image.mode != "RGB":
        raise SystemExit(f"{path}: unsupported mode {image.mode}; expected opaque RGB")
    if image.getcolors(1) is not None:
        raise SystemExit(f"{path}: the capture is a single colour")
    # A fresh image from the pixels alone: no ICC profile, text chunk or other metadata of the source is carried over.
    plain = Image.frombytes("RGB", image.size, image.tobytes())
    plain.info["source"] = (shown(path), hashlib.sha256(data).hexdigest())
    return plain


def capture_path(scene, crop, theme=SHEET_THEME):
    return RUN_DIR / "captures" / "main" / "1" / scene / theme / "default" / f"{crop}.png"


def provenance(image, box):
    name, digest = image.info["source"]
    print(f"input {name} sha256 {digest} size {image.width}x{image.height} crop {','.join(str(v) for v in box)}")


def longest_run(values, background):
    """The length of the longest run of one non-background colour along a row or column (background: a set of colours)."""
    best = run = 0
    previous = None
    for value in values:
        run = run + 1 if value == previous else 1
        previous = value
        if value not in background:
            best = max(best, run)
    return best


def content_box(image):
    """The bounding box of the content: pixels unlike the background, leaving out the
    panel's rules, the rows and columns one colour fills in one run for at least RULE_SHARE of their length less MARGIN
    at each end (its 1-px border and the view separators that run down to it), and the anti-aliased rounded corners
    where a rule row meets a rule column (any pixel within MARGIN of both). None when nothing else is left."""
    width, height = image.size
    # Two background colours: the panel's (the bottom-right pixel, outside the rounded border: the panel and its tab
    # strip) and the capture's most frequent colour (the field: the icon sheet's panel, the terminal's #0D0916). With the
    # corner colour alone, a terminal's whole field read as rules and its last rows (the cursor) were cut.
    background = {image.getpixel((width - 1, height - 1)), max(image.getcolors(width * height))[1]}
    pixels = image.load()
    columns = {x for x in range(width) if longest_run((pixels[x, y] for y in range(height)), background) >= RULE_SHARE * (height - 2 * MARGIN)}
    rows = {y for y in range(height) if longest_run((pixels[x, y] for x in range(width)), background) >= RULE_SHARE * (width - 2 * MARGIN)}
    near = lambda value, rules: any(abs(value - rule) <= MARGIN for rule in rules)
    mask = Image.new("1", image.size, 0)
    marks = mask.load()
    for y in range(height):
        if y in rows:
            continue
        for x in range(width):
            if x not in columns and pixels[x, y] not in background and not (near(x, columns) and near(y, rows)):
                marks[x, y] = 1
    return mask.getbbox()


def trim(image, name):
    """Cuts the rows below and the columns right of the content, keeping MARGIN (content_box says what content is)."""
    box = content_box(image)
    if box is None:
        raise SystemExit(f"{name}: a capture holds nothing but background")
    if box[2] - box[0] < MIN_CONTENT or box[3] - box[1] < MIN_CONTENT:
        raise SystemExit(f"{name}: the content is only {box[2] - box[0]}x{box[3] - box[1]} px; expected at least {MIN_CONTENT}x{MIN_CONTENT}")
    crop = (0, 0, min(image.width, box[2] + MARGIN), min(image.height, box[3] + MARGIN))
    return image.crop(crop), crop


def save(image, out):
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    image.save(out, "PNG", optimize=True)
    print(f"{out}: {image.width}x{image.height}")


def themes(run, out_dir):
    global RUN_DIR
    RUN_DIR = Path(run)
    images = {theme: load(capture_path("showcase", "full", theme)) for theme in THEMES}
    sizes = {theme: image.size for theme, image in images.items()}
    if len(set(sizes.values())) != 1:
        raise SystemExit("the four theme captures differ in size: " + ", ".join(f"{theme} {w}x{h}" for theme, (w, h) in sizes.items()))
    for theme, image in images.items():
        provenance(image, (0, 0, image.width, image.height))
    for theme, image in images.items():
        save(image, Path(out_dir) / f"{theme}.png")


def sheet(run, out):
    global RUN_DIR
    RUN_DIR = Path(run)
    loaded = [load(capture_path(scene, "panel")) for scene in SHEET_SCENES]
    trimmed = [trim(image, shown(capture_path(scene, "panel"))) for image, scene in zip(loaded, SHEET_SCENES)]
    for image, (_, crop) in zip(loaded, trimmed):
        provenance(image, crop)
    pages = [page for page, _ in trimmed]
    image = Image.new("RGB", (max(page.width for page in pages), sum(page.height for page in pages)), BACKGROUND)
    top = 0
    for page in pages:
        image.paste(page, (0, top))
        top += page.height
    save(image, out)


def terminal(run, windows_terminal, out):
    global RUN_DIR
    RUN_DIR = Path(run)
    right = load(windows_terminal)
    vscode = load(capture_path("terminal", "panel"))
    left, crop = trim(vscode, shown(capture_path("terminal", "panel")))
    left = left.crop((0, 0, min(left.width, right.width), left.height))
    crop = (0, 0, left.width, left.height)
    provenance(vscode, crop)
    provenance(right, (0, 0, right.width, right.height))
    image = Image.new("RGB", (left.width + GUTTER + right.width, max(left.height, right.height)), BACKGROUND)
    image.paste(left, (0, 0))
    image.paste(right, (left.width + GUTTER, 0))
    save(image, out)
    print(f"VS Code {left.width} px | gutter {GUTTER} px | Windows Terminal {right.width} px")


COMMANDS = {"themes": (themes, 2), "sheet": (sheet, 2), "terminal": (terminal, 3)}
if __name__ == "__main__":
    command, arguments = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else (None, [])
    if command not in COMMANDS or len(arguments) != COMMANDS[command][1]:
        raise SystemExit(__doc__)
    COMMANDS[command][0](*arguments)
