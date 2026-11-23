"""Downloads free, openly licensed photos from Openverse for scenes that have a "photo_query".
Only licences that allow commercial use and changes without share-alike: CC0, public domain mark, CC BY.
Each scene gets several distinct photos that crossfade during narration.
If Openverse has no usable result, the slot is filled with a deterministic Picsum
photo so a fresh CI checkout never renders a scene without background art.
Usage: python tools\\fetch_assets.py tools\\script_xxx.json"""
import json, os, sys, time, urllib.parse, urllib.request

script = sys.argv[1] if len(sys.argv) > 1 else "tools/script.json"
_d = json.load(open(script, encoding="utf8"))
scenes = _d["scenes"] if isinstance(_d, dict) else _d
slug = os.path.splitext(os.path.basename(script))[0].replace("script_", "")
asset_dir = f"public/assets/{slug}"
os.makedirs(asset_dir, exist_ok=True)
os.makedirs("out", exist_ok=True)
HEADERS = {"User-Agent": "ShortsStudio/1.0 (personal video project)"}
LICENSES = "cc0,pdm,by"
PER_SCENE = 3


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=40) as r:
        data = r.read()
    return data if binary else json.loads(data.decode("utf8"))


def credit_line(res):
    text = res.get("attribution") or "{} by {} ({})".format(
        res.get("title", "Untitled"), res.get("creator", "unknown"),
        str(res.get("license", "")).upper())
    return "{} | {}".format(text, res.get("foreign_landing_url", ""))


def save(i, j, img, credit):
    with open(f"{asset_dir}/photo{i}_{j}.jpg", "wb") as f:
        f.write(img)
    with open(f"{asset_dir}/photo{i}_{j}.txt", "w", encoding="utf8") as f:
        f.write(credit)
    if j == 0:
        with open(f"{asset_dir}/photo{i}.jpg", "wb") as f:
            f.write(img)
        with open(f"{asset_dir}/photo{i}.txt", "w", encoding="utf8") as f:
            f.write(credit)


def complete(i):
    return all(os.path.exists(f"{asset_dir}/photo{i}_{j}.jpg") for j in range(PER_SCENE))


for i, sc in enumerate(scenes):
    q = sc.get("photo_query")
    if not q:
        continue
    if complete(i):
        print(f"scene {i + 1}: photos already there, skipping")
        continue
    seen, saved = set(), 0
    params = urllib.parse.urlencode({"q": q, "license": LICENSES, "page_size": 20})
    try:
        data = fetch("https://api.openverse.org/v1/images/?" + params)
    except Exception as e:
        print(f"scene {i + 1}: search failed ({e})")
        data = {}
    for res in data.get("results", []):
        if saved >= PER_SCENE:
            break
        link = res.get("thumbnail") or res.get("url")
        if not link or link in seen:
            continue
        seen.add(link)
        try:
            img = fetch(link, True)
        except Exception:
            continue
        if len(img) < 5000:
            continue
        save(i, saved, img, credit_line(res))
        saved += 1

    # Openverse often has nothing for a narrow query. Fill the rest from Picsum
    # so every scene keeps its crossfading backgrounds on a fresh runner.
    while saved < PER_SCENE:
        link = f"https://picsum.photos/seed/{slug}-{i}-{saved}/1080/1920"
        try:
            img = fetch(link, True)
        except Exception:
            break
        if len(img) < 5000:
            break
        save(i, saved, img, f"Picsum photo (seed {slug}-{i}-{saved}), free to use | {link}")
        saved += 1
    print(f"scene {i + 1}: saved {saved} photo(s) for '{q}'")
    time.sleep(0.4)

lines = []
for i in range(len(scenes)):
    for j in range(PER_SCENE):
        t = f"{asset_dir}/photo{i}_{j}.txt"
        if os.path.exists(t):
            lines.append(f"Scene {i + 1}, photo {j + 1}: " + open(t, encoding="utf8").read())
with open("out/CREDITS.txt", "w", encoding="utf8") as f:
    f.write("Photos from Openverse (openly licensed) and Picsum. Paste this in your video description:\n\n" + "\n".join(lines) + "\n")
print("Credits written to out\\CREDITS.txt (", len(lines), "photos )")
