"""Downloads candidate sound effects from Openverse so YOU can listen and pick the best ones.
Only CC0 and CC BY sounds under 6 seconds. Files go to sfx_candidates\\<name>\\ with a credit file.
Run:  python tools\\fetch_sfx.py     then listen, and copy your favourites into the public folder as
whoosh.mp3, impact.mp3, pop.mp3, click.mp3 (they replace the built in ones)."""
import json, os, time, urllib.parse, urllib.request

HEADERS = {"User-Agent": "ShortsStudio/1.0 (personal video project)"}
QUERIES = {"whoosh": "whoosh", "impact": "impact hit", "pop": "pop", "click": "click", "riser": "riser", "bass_drop": "bass drop"}


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else json.loads(data.decode("utf8"))


for name, q in QUERIES.items():
    folder = f"sfx_candidates/{name}"
    os.makedirs(folder, exist_ok=True)
    params = urllib.parse.urlencode({"q": q, "license": "cc0,by", "category": "sound_effect", "page_size": 15})
    try:
        data = fetch("https://api.openverse.org/v1/audio/?" + params)
    except Exception as e:
        print(f"{name}: search failed ({e})")
        continue
    got, credits = 0, []
    for res in data.get("results", []):
        dur = res.get("duration") or 0
        if dur and dur > 6000:
            continue
        link = res.get("url")
        if not link:
            continue
        ext = os.path.splitext(urllib.parse.urlparse(link).path)[1] or ".mp3"
        try:
            blob = fetch(link, True)
        except Exception:
            continue
        got += 1
        with open(f"{folder}/{name}_{got}{ext}", "wb") as f:
            f.write(blob)
        text = res.get("attribution") or "{} by {} ({})".format(res.get("title", ""), res.get("creator", ""), str(res.get("license", "")).upper())
        credits.append(f"{name}_{got}{ext}: {text} | {res.get('foreign_landing_url', '')}")
        if got >= 4:
            break
    open(f"{folder}/CREDITS.txt", "w", encoding="utf8").write("\n".join(credits) + "\n")
    print(f"{name}: saved {got} candidates")
    time.sleep(1.0)
print("Done. Listen to the files in sfx_candidates and copy your favourites into public as whoosh.mp3, impact.mp3, pop.mp3, click.mp3.")
print("If you use a CC BY sound, copy its credit line into your video description.")
