"""Finds sound effects by NAME on Openverse, checks them with measurements (length, sharp start,
bass or treble content, loudness, clipping) and picks the best one for each job automatically.
You do not need to listen to hundreds of files. Runner-ups are saved in sfx_candidates in case you want to swap.
Run:  python tools\\auto_sounds.py"""
import json, os, shutil, subprocess, sys, tempfile, time, urllib.parse, urllib.request, wave
import numpy as np

SR = 22050
HEADERS = {"User-Agent": "ShortsStudio/1.0 (personal video project)"}
TYPES = {
    "whoosh": {"queries": ["whoosh", "swoosh", "transition whoosh"], "dur": (0.5, 2.0)},
    "impact": {"queries": ["impact hit", "cinematic hit", "boom"], "dur": (0.5, 3.0)},
    "pop": {"queries": ["pop", "bubble pop"], "dur": (0.04, 0.5)},
    "click": {"queries": ["click", "mouse click"], "dur": (0.02, 0.3)},
}


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else json.loads(data.decode("utf8"))


def decode(path):
    out = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True)
    if out.returncode != 0 or not out.stdout:
        return None
    return np.frombuffer(out.stdout, dtype=np.float32).copy()


def trim(x):
    a = np.abs(x)
    peak = float(a.max()) if len(a) else 0.0
    if peak < 1e-3:
        return None
    idx = np.where(a > 0.04 * peak)[0]
    start, end = int(idx[0]), int(idx[-1])
    # keep the tail until the sound fades below 2 percent
    tail = np.where(a > 0.02 * peak)[0]
    end = max(end, int(tail[-1]))
    return x[start : end + int(0.02 * SR)]


def features(y):
    n = len(y)
    a = np.abs(y)
    peak = float(a.max())
    attack = float(np.argmax(a >= 0.9 * peak)) / SR
    block = max(1, int(SR * 0.01))
    env = np.array([a[i : i + block].max() for i in range(0, n, block)])
    peak_frac = float(np.argmax(env)) / max(1, len(env))
    seg = y[: SR * 2]
    spec = np.abs(np.fft.rfft(seg))
    freqs = np.fft.rfftfreq(len(seg), 1 / SR)
    tot = float(spec.sum()) + 1e-9
    return {
        "dur": n / SR,
        "attack": attack,
        "peak_frac": peak_frac,
        "low": float(spec[freqs < 200].sum()) / tot,
        "high": float(spec[freqs > 2000].sum()) / tot,
        "clip": float((a > 0.99).mean()),
        "tonal": float(spec.max()) / (float(spec.mean()) + 1e-9),
    }


def score(kind, f):
    lo, hi = TYPES[kind]["dur"]
    d = f["dur"]
    s = 3.0 if lo <= d <= hi else -min(4.0, abs(d - (lo if d < lo else hi)) * 2)
    if f["clip"] > 0.01:
        s -= 2
    if kind == "whoosh":
        s += 3 if 0.3 <= f["peak_frac"] <= 0.75 else 0
        s += 1 if f["low"] < 0.6 else 0
        s -= 2 if f["attack"] < 0.05 else 0
        s += 2 if f["tonal"] < 60 else -3  # whooshes are noise, not a steady tone
    elif kind == "impact":
        s += 3 if f["attack"] < 0.08 else -1
        s += 3 * min(1.0, f["low"] / 0.4)
    elif kind == "pop":
        s += 3 if f["attack"] < 0.03 else 0
    elif kind == "click":
        s += 3 if f["attack"] < 0.02 else 0
        s += 3 * min(1.0, f["high"] / 0.3)
    return s


def finish(y, out_mp3):
    y = y.copy()
    fade = min(len(y), int(0.03 * SR))
    y[-fade:] *= np.linspace(1, 0, fade)
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
    tmp = out_mp3 + ".wav"
    with wave.open(tmp, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.check_call(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-b:a", "192k", out_mp3])
    os.remove(tmp)


def candidates(kind):
    """Search by name, download, measure. Returns a list of dicts."""
    found = []
    seen = set()
    for q in TYPES[kind]["queries"]:
        params = urllib.parse.urlencode({"q": q, "license": "cc0,by", "category": "sound_effect", "page_size": 12})
        try:
            data = fetch("https://api.openverse.org/v1/audio/?" + params)
        except Exception as e:
            print(f"  search '{q}' failed ({e})")
            continue
        for res in data.get("results", []):
            link = res.get("url")
            if not link or link in seen:
                continue
            seen.add(link)
            dur = res.get("duration") or 0
            if dur and dur > 8000:
                continue
            try:
                blob = fetch(link, True)
            except Exception:
                continue
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(urllib.parse.urlparse(link).path)[1] or ".mp3") as t:
                t.write(blob)
                tmp = t.name
            try:
                x = decode(tmp)
            finally:
                os.remove(tmp)
            if x is None:
                continue
            y = trim(x)
            if y is None:
                continue
            f = features(y)
            found.append({"y": y, "f": f, "score": score(kind, f), "res": res})
            if len(found) >= 14:
                return found
        time.sleep(1.0)
    return found


def main():
    os.makedirs("public", exist_ok=True)
    os.makedirs("out", exist_ok=True)
    credits = []
    for kind in TYPES:
        print(f"{kind}: searching...")
        found = candidates(kind)
        if not found:
            print(f"  nothing usable found, keeping the current {kind}")
            continue
        found.sort(key=lambda c: c["score"], reverse=True)
        best = found[0]
        if best["score"] < 4:
            print(f"  best match scored {best['score']:.1f}, not good enough, keeping the current {kind}")
            continue
        target = f"public/{kind}.mp3"
        if os.path.exists(target):
            os.makedirs("public/sfx_backup", exist_ok=True)
            shutil.copy(target, f"public/sfx_backup/{kind}.mp3")
        finish(best["y"], target)
        os.makedirs(f"sfx_candidates/{kind}", exist_ok=True)
        for i, c in enumerate(found[1:4], start=2):
            finish(c["y"], f"sfx_candidates/{kind}/{kind}_runnerup{i - 1}.mp3")
        res = best["res"]
        print(f"  picked '{res.get('title', '?')}' (score {best['score']:.1f}, {best['f']['dur']:.2f}s, license {res.get('license')})")
        if str(res.get("license", "")).lower() == "by":
            credits.append(res.get("attribution") or "{} by {} (CC BY)".format(res.get("title", ""), res.get("creator", "")))
    with open("out/SOUND_CREDITS.txt", "w", encoding="utf8") as f:
        f.write("Sound effects from Openverse. Paste CC BY credits in your video description:\n\n" + "\n".join(credits) + "\n")
    print("Done. Credits (if any) are in out\\SOUND_CREDITS.txt. Old sounds are backed up in public\\sfx_backup.")


if __name__ == "__main__":
    main()
