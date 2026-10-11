"""Check that every image the packaged README shows equals the committed file, and is live on GitHub (spec 9).

The Marketplace page and VS Code's extension page load the README images from raw.githubusercontent.com/.../main,
because the VSIX does not ship them. Run it with --offline before the push (the files are compared with the index),
and without it after the release commit is on origin/main and before `vsce publish` (it runs `git fetch origin main`,
stops unless HEAD is origin/main, then compares with HEAD and fetches each image).
It prints a JSON report; every problem is listed under "failures". Exit 0: every image matches. Exit 1: a one-line
summary on stderr. raw.githubusercontent.com caches for about five minutes: if a fetch still returns 1.2.1's image,
run it again after that.
Usage: python3 scripts/verify-live-readme-images.py [--offline]
"""
from datetime import datetime, timezone
from hashlib import sha256
from http.client import HTTPException
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.error import HTTPError, URLError
from urllib.request import urlopen
from zipfile import BadZipFile, ZipFile

if sys.argv[1:] not in ([], ["--offline"]):
    raise SystemExit(__doc__)
OFFLINE = sys.argv[1:] == ["--offline"]
ROOT = Path(__file__).resolve().parent.parent
IMAGE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)\)")


def digest(data: bytes) -> str:
    return sha256(data).hexdigest()


def git(*args: str) -> bytes:
    try:
        return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True).stdout
    except FileNotFoundError:
        stop("git is not installed or not on PATH")


def git_error(error: subprocess.CalledProcessError) -> str:
    lines = error.stderr.decode(errors="replace").strip().splitlines()
    return lines[-1] if lines else f"git exited with {error.returncode}"


def private(text: str) -> str:
    """Keep absolute paths (they hold the home directory) out of every message."""
    return text.replace(str(ROOT), ".").replace(str(Path.home()), "~")


report = {"invocation": "python3 scripts/verify-live-readme-images.py" + (" --offline" if OFFLINE else ""),
          "checked_at_utc": datetime.now(timezone.utc).isoformat(), "results": [], "failures": []}


def finish() -> None:
    failures = report["failures"]
    for failure in failures:
        failure["problem"] = private(failure["problem"])
    print(json.dumps(report, indent=2))
    if failures:
        first = failures[0]
        where = first.get("url") or first.get("path")
        count = f"{len(failures)} problem{'s' if len(failures) != 1 else ''}"
        print(f"FAILED, {count}; first: {where + ': ' if where else ''}{first['problem']}", file=sys.stderr)
        sys.exit(1)
    sys.exit(0)


def stop(problem: str, **where: str) -> None:
    report["failures"].append({**where, "problem": problem})
    finish()


def unexpected(kind, error, trace) -> None:
    """Any error not handled below still ends in the JSON report and one line, never a traceback (it holds paths)."""
    if issubclass(kind, KeyboardInterrupt):
        sys.__excepthook__(kind, error, trace)
        return
    stop(f"unexpected {kind.__name__}: {error}")


sys.excepthook = unexpected


try:
    package_json = json.loads((ROOT / "package.json").read_text())
    vsix = ROOT / f"{package_json['name']}-{package_json['version']}.vsix"
    base = re.search(r"--baseImagesUrl (\S+)", package_json["scripts"]["package"]).group(1) + "/"
except (OSError, ValueError, KeyError, AttributeError) as error:
    stop(f"package.json has no name, version or --baseImagesUrl in scripts.package ({type(error).__name__})")
report["vsix"] = vsix.name

# Online, the live images are those of origin/main: fetch it first, and stop unless HEAD is that commit.
try:
    report["commit"] = git("rev-parse", "--verify", "HEAD").decode().strip()
except subprocess.CalledProcessError as error:
    report["commit"] = None
    if not OFFLINE:
        stop(f"there is no HEAD commit ({git_error(error)})")
if not OFFLINE:
    try:
        git("fetch", "--quiet", "origin", "main")
        report["origin_main"] = git("rev-parse", "--verify", "origin/main").decode().strip()
    except subprocess.CalledProcessError as error:
        stop(f"git fetch origin main failed: {git_error(error)}")
    if report["origin_main"] != report["commit"]:
        stop("HEAD is not origin/main: push the release commit first")

try:
    vsix_bytes = vsix.read_bytes()
    with ZipFile(vsix) as package:
        readme = package.read("extension/readme.md")
except FileNotFoundError:
    stop(f"{vsix.name} is missing: run npm run package")
except (BadZipFile, KeyError) as error:
    stop(f"{vsix.name} is not a VSIX with extension/readme.md ({type(error).__name__})")
report["vsix_sha256"] = digest(vsix_bytes)
report["packed_readme_sha256"] = digest(readme)
try:
    packed = IMAGE.findall(readme.decode("utf-8"))
except UnicodeDecodeError:
    stop(f"{vsix.name}: extension/readme.md is not UTF-8 (run npm run package)")
try:
    expected = [base + path for path in IMAGE.findall((ROOT / "README.md").read_text(encoding="utf-8"))]
except FileNotFoundError:
    stop("README.md is missing")
except (OSError, UnicodeDecodeError) as error:
    stop(f"README.md cannot be read as UTF-8 text ({type(error).__name__})")
if not expected or packed != expected:
    stop(f"the packaged README shows {packed}; README.md shows {expected} (run npm run package)")

for url in packed:
    path = url.removeprefix(base)
    try:
        committed = git("show", f"{'' if OFFLINE else 'HEAD'}:{path}")
    except subprocess.CalledProcessError as error:
        report["failures"].append({"path": path, "problem": f"not in the {'index' if OFFLINE else 'HEAD commit'} ({git_error(error)})"})
        continue
    try:
        if (ROOT / path).read_bytes() != committed:
            report["failures"].append({"path": path, "problem": f"differs from its {'staged' if OFFLINE else 'committed'} version"})
            continue
    except OSError:
        report["failures"].append({"path": path, "problem": "missing from the working tree"})
        continue
    result = {"url": url, "path": path, "sha256": digest(committed)}
    if not OFFLINE:
        try:
            with urlopen(url, timeout=15) as response:
                body = response.read()
                result |= {"http_status": response.status, "remote_sha256": digest(body), "body_match": body == committed}
        except HTTPError as error:
            report["failures"].append({"url": url, "path": path, "problem": f"HTTP {error.code} {error.reason}"})
            continue
        except (URLError, OSError, HTTPException) as error:
            # HTTPException covers a body cut short (IncompleteRead), which is not an OSError.
            report["failures"].append({"url": url, "path": path, "problem": f"could not fetch it ({getattr(error, 'reason', error)})"})
            continue
        if result["http_status"] != 200 or not result["body_match"]:
            report["failures"].append({"url": url, "path": path, "problem": f"the live image differs from the committed file (HTTP {result['http_status']})"})
            continue
    report["results"].append(result)
finish()
