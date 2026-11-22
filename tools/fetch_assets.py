"""Downloads free, openly licensed photos from Openverse for scenes that have a "photo_query".
Only licences that allow commercial use and changes without share-alike: CC0, public domain mark, CC BY.
Usage: python tools\\fetch_assets.py tools\\script_xxx.json"""
import json, os, sys, time, urllib.parse, urllib.request

script = sys.argv[1] if len(sys.argv) > 1 else "tools/script.json"
_d = json.load(open(script, encoding="utf8"))
scenes = _d["scenes"] if isinstance(_d, dict) else _d
os.makedirs("public/assets", exist_ok=True)
os.makedirs("out", exist_ok=True)
HEADERS = {"User-Agent": "ShortsStudio/1.0 (personal video project)"}
LICENSES = "cc0,pdm,by"


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=40) as r:
        data = r.read()
    return data if binary else json.loads(data.decode("utf8"))


def credit_line(res):
    text = res.get("attribution") or "{} by {} ({})".format(res.get("title", "Untitled"), res.get("creator", "unknown"), str(res.get("license", "")).upper())
    return "{} | {}".format(text, res.get("foreign_landing_url", ""))


for i, sc in enumerate(scenes):
    q = sc.get("photo_query")
    if not q:
        continue
    dest = f"public/assets/photo{i}.jpg"
    if os.path.exists(dest):
        print(f"scene {i + 1}: photo already there, skipping")
        continue
    params = urllib.parse.urlencode({"q": q, "license": LICENSES, "page_size": 8})
    try:
        data = fetch("https://api.openverse.org/v1/images/?" + params)
    except Exception as e:
        print(f"scene {i + 1}: search failed ({e})")
        continue
    saved = False
    for res in data.get("results", []):
        link = res.get("thumbnail") or res.get("url")
        if not link:
            continue
        try:
            img = fetch(link, True)
        except Exception:
            continue
        if len(img) < 5000:
            continue
        with open(dest, "wb") as f:
            f.write(img)
        with open(f"public/assets/photo{i}.txt", "w", encoding="utf8") as f:
            f.write(credit_line(res))
        saved = True
        print(f"scene {i + 1}: saved photo for '{q}'")
        break
    if not saved:
        print(f"scene {i + 1}: no usable photo found for '{q}'")
    time.sleep(1.0)

lines = []
for i in range(len(scenes)):
    t = f"public/assets/photo{i}.txt"
    if os.path.exists(t):
        lines.append(f"Scene {i + 1}: " + open(t, encoding="utf8").read())
with open("out/CREDITS.txt", "w", encoding="utf8") as f:
    f.write("Photos from Openverse (openly licensed). Paste this in your video description:\n\n" + "\n".join(lines) + "\n")
print("Credits written to out\\CREDITS.txt (", len(lines), "photos )")
