import asyncio, json, os, re, subprocess, sys
import edge_tts

script_path = "tools/script.json"
VOICE = "en-US-AndrewMultilingualNeural"
for a in sys.argv[1:]:
    if a.endswith(".json"):
        script_path = a
    else:
        VOICE = a

data = json.load(open(script_path, encoding="utf8"))
opts = {}
if isinstance(data, dict):
    opts = {k: v for k, v in data.items() if k != "scenes"}
    scenes = data["scenes"]
else:
    scenes = data
CLI_VOICE = any(not a.endswith(".json") for a in sys.argv[1:])
if not CLI_VOICE and opts.get("voice"):
    VOICE = opts["voice"]
RATE = opts.get("rate", "+5%")
PITCH = opts.get("pitch", "+0Hz")
SLUG = os.path.splitext(os.path.basename(script_path))[0].replace("script_", "")
THEME = opts.get("theme") or SLUG
ASSET_DIR = f"assets/{SLUG}"
os.makedirs("public/voice", exist_ok=True)

NARRATION = "public/voice/narration.mp3"
NUMWORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "twice": 2,
    "first": 1, "second": 2, "third": 3, "fourth": 4,
}
PUNCT = '.,!?;:"()'


def duration(path, words=None):
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]
        )
        return float(out.decode().strip())
    except (FileNotFoundError, subprocess.CalledProcessError, ValueError):
        # Sharded render runners have no ffprobe. WordBoundary offsets give the
        # end of spoken audio; add the small tail the mixer leaves after it.
        return round((words[-1]["end"] if words else 0.0) + 0.35, 3)


async def make_narration(voice):
    # One single TTS call for the whole script = natural, unbroken speech.
    full = " ".join(sc["text"].strip() for sc in scenes)
    comm = edge_tts.Communicate(full, voice, rate=RATE, pitch=PITCH, boundary="WordBoundary")
    words = []
    prev_chunk = None
    with open(NARRATION, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                data = ch["data"]
                # edge-tts can resend a chunk after a network retry. Writing it
                # twice makes a phrase sound repeated in the final video.
                if data == prev_chunk:
                    continue
                prev_chunk = data
                f.write(data)
            elif ch["type"] == "WordBoundary":
                s = ch["offset"] / 1e7
                words.append({
                    "text": ch["text"],
                    "start": round(s, 3),
                    "end": round(s + ch["duration"] / 1e7, 3),
                })
    if not words:
        raise RuntimeError("no audio received")
    return words


def clean(s):
    return str(s).lower().strip(PUNCT)


def find_word(words, needle):
    """Find a spoken word by its text, skipping the opening date word."""
    if not needle or not words:
        return None
    want = clean(needle)
    for w in words[1:]:
        got = clean(w["text"])
        if got == want or (len(want) >= 4 and want in got):
            return w
    return None


def auto_stat_word(words, stat):
    """Fallback: match a number in the stat to a spoken number word."""
    if not words:
        return None
    m = re.match(r"^(\d+)", stat or "")
    if not m:
        return find_word(words, (stat or "").split()[0] if stat else None)
    target = int(m.group(1))
    for w in words[1:]:
        got = clean(w["text"])
        if got.isdigit() and int(got) == target:
            return w
        if got in NUMWORDS and NUMWORDS[got] == target:
            return w
    return None


async def main():
    # Retry the same voice first. A Multilingual Neural voice can switch accent
    # mid-script, and an immediate Guy fallback would sound like a different
    # narrator halfway through the video.
    last_error = None
    for attempt_voice in (VOICE, VOICE, "en-US-GuyNeural"):
        try:
            words = await make_narration(attempt_voice)
            if attempt_voice != VOICE:
                print(f"warning: voice fell back to {attempt_voice}")
            break
        except Exception as e:
            last_error = e
    else:
        raise RuntimeError(f"all TTS attempts failed: {last_error}")

    total = duration(NARRATION, words)
    out = []
    wi = 0
    for i, sc in enumerate(scenes):
        need = len(sc["text"].split())
        chunk = words[wi:wi + need]
        wi += need
        st = chunk[0]["start"] if chunk else (words[-1]["end"] if words else 0.0)
        en = chunk[-1]["end"] if chunk else st
        photos = []
        for j in range(4):
            p = f"{ASSET_DIR}/photo{i}_{j}.jpg"
            if os.path.exists("public/" + p):
                photos.append(p)
        if not photos:
            p = f"{ASSET_DIR}/photo{i}.jpg"
            if os.path.exists("public/" + p):
                photos.append(p)
        out.append({**sc, "start": round(st, 3), "dur": round(max(0.5, en - st + 0.4), 3),
                    "words": chunk, "photo": photos[0] if photos else None, "photos": photos})

    # Extend each scene to the next scene's start so the timeline never gaps.
    for i in range(len(out) - 1):
        out[i]["dur"] = round(max(0.5, out[i + 1]["start"] - out[i]["start"]), 3)
    out[-1]["dur"] = round(max(0.5, total - out[-1]["start"]), 3)

    # Precise visual cues, all relative to real spoken word times.
    for sc in out:
        chunk = sc["words"]
        st, en = sc["start"], sc["start"] + sc["dur"]
        sc["dateSec"] = round(chunk[0]["end"] if chunk else st, 3)
        sw = find_word(chunk, sc.get("statWord")) or auto_stat_word(chunk, sc.get("stat"))
        if not sw and chunk:
            sw = chunk[int(len(chunk) * 0.6)]
        sc["statSec"] = round(min(en - 0.2, sw["start"]) if sw else st + sc["dur"] * 0.55, 3)

        cues = []
        photos = sc["photos"]
        if photos:
            n = len(photos)
            for j in range(n):
                lo = int(j * len(chunk) / n)
                hi = min(len(chunk), int((j + 1) * len(chunk) / n))
                a = chunk[lo]["start"] if lo < len(chunk) else st
                b = chunk[hi - 1]["end"] if hi - 1 < len(chunk) and hi > lo else en
                cues.append({"from": round(a, 3), "to": round(b, 3)})
            cues[-1]["to"] = round(en, 3)
        sc["photoCues"] = cues
        sc.pop("statWord", None)  # script-only hint, not needed at render time

    tracks = ["music.mp3", "music_hype.mp3", "music_dark.mp3", "music_bright.mp3"]
    pick = sum(ord(c) for c in THEME) % len(tracks)
    ordered = ([opts["music"]] if opts.get("music") else []) + [tracks[pick]] + tracks
    music = next((m for m in ordered if os.path.exists("public/" + m)), None)
    sfx = "whoosh.mp3" if os.path.exists("public/whoosh.mp3") else None
    pack = {k: (f"{k}.mp3" if os.path.exists(f"public/{k}.mp3") else None) for k in ("impact", "pop", "click")}

    print("voice:", VOICE, RATE, PITCH, "| script:", script_path, "| music:", music, "| words:", len(words))
    print("photos found:", sum(len(s["photos"]) for s in out), "across", sum(1 for s in out if s["photos"]), "scenes")
    json.dump(
        {"totalSec": round(total, 2), "theme": THEME, "music": music, "sfx": sfx,
         "sfxPack": pack, "narration": "voice/narration.mp3", "hero": opts.get("hero"), "scenes": out},
        open("public/story.json", "w", encoding="utf8"),
        ensure_ascii=False,
        indent=1,
    )
    print("Total seconds:", round(total, 1))


asyncio.run(main())
