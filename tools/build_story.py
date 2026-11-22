import asyncio, json, os, subprocess, sys
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


def duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]
    )
    return float(out.decode().strip())


async def make_narration(voice):
    # One single TTS call for the whole script = natural, unbroken speech.
    full = " ".join(sc["text"].strip() for sc in scenes)
    comm = edge_tts.Communicate(full, voice, rate=RATE, pitch=PITCH, boundary="WordBoundary")
    words = []
    with open(NARRATION, "wb") as f:
        async for ch in comm.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
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


async def main():
    try:
        words = await make_narration(VOICE)
    except Exception as e:
        print(f"voice {VOICE} failed ({e}); using en-US-GuyNeural instead")
        words = await make_narration("en-US-GuyNeural")

    total = duration(NARRATION)
    out = []
    wi = 0
    for i, sc in enumerate(scenes):
        need = len(sc["text"].split())
        chunk = words[wi:wi + need]
        wi += need
        st = chunk[0]["start"] if chunk else (words[-1]["end"] if words else 0.0)
        en = chunk[-1]["end"] if chunk else st
        photo = f"{ASSET_DIR}/photo{i}.jpg" if os.path.exists(f"public/{ASSET_DIR}/photo{i}.jpg") else None
        out.append({**sc, "start": round(st, 3), "dur": round(max(0.5, en - st + 0.4), 3),
                    "words": chunk, "photo": photo})

    # Extend each scene to the next scene's start so the timeline never gaps.
    for i in range(len(out) - 1):
        out[i]["dur"] = round(max(0.5, out[i + 1]["start"] - out[i]["start"]), 3)
    out[-1]["dur"] = round(max(0.5, total - out[-1]["start"]), 3)

    tracks = ["music.mp3", "music_hype.mp3", "music_dark.mp3", "music_bright.mp3"]
    pick = sum(ord(c) for c in THEME) % len(tracks)
    ordered = ([opts["music"]] if opts.get("music") else []) + [tracks[pick]] + tracks
    music = next((m for m in ordered if os.path.exists("public/" + m)), None)
    sfx = "whoosh.mp3" if os.path.exists("public/whoosh.mp3") else None
    pack = {k: (f"{k}.mp3" if os.path.exists(f"public/{k}.mp3") else None) for k in ("impact", "pop", "click")}

    print("voice:", VOICE, RATE, PITCH, "| script:", script_path, "| music:", music, "| words:", len(words))
    print("photos found:", sum(1 for s in out if s["photo"]))
    json.dump(
        {"totalSec": round(total, 2), "theme": THEME, "music": music, "sfx": sfx,
         "sfxPack": pack, "narration": "voice/narration.mp3", "scenes": out},
        open("public/story.json", "w", encoding="utf8"),
        ensure_ascii=False,
        indent=1,
    )
    print("Total seconds:", round(total, 1))


asyncio.run(main())
