import asyncio, json, os, subprocess, sys
import edge_tts

script_path = "tools/script.json"
VOICE = "en-US-GuyNeural"
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
RATE = opts.get("rate", "+0%")
PITCH = opts.get("pitch", "+0Hz")
os.makedirs("public/voice", exist_ok=True)


def duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]
    )
    return float(out.decode().strip())


async def make(i, sc):
    path = f"public/voice/scene{i}.mp3"
    async def run(voice):
        comm = edge_tts.Communicate(sc["text"], voice, rate=sc.get("rate", RATE), pitch=sc.get("pitch", PITCH), boundary="WordBoundary")
        words = []
        with open(path, "wb") as f:
            async for ch in comm.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    s = ch["offset"] / 1e7
                    words.append({"text": ch["text"], "start": s, "end": s + ch["duration"] / 1e7})
        if not words:
            raise RuntimeError("no audio received")
        return words

    try:
        words = await run(VOICE)
    except Exception as e:
        print(f"voice {VOICE} failed ({e}); using en-US-GuyNeural instead")
        words = await run("en-US-GuyNeural")
    return path, words


async def main():
    t = 0.0
    out = []
    for i, sc in enumerate(scenes):
        path, words = await make(i, sc)
        d = duration(path) + 0.5
        photo = f"assets/photo{i}.jpg" if os.path.exists(f"public/assets/photo{i}.jpg") else None
        out.append({**sc, "start": round(t, 3), "dur": round(d, 3), "audio": f"voice/scene{i}.mp3", "words": words, "photo": photo})
        t += d
        print("scene", i, "done", round(d, 1), "s")
    music = "music.mp3" if os.path.exists("public/music.mp3") else None
    sfx = "whoosh.mp3" if os.path.exists("public/whoosh.mp3") else None
    pack = {k: (f"{k}.mp3" if os.path.exists(f"public/{k}.mp3") else None) for k in ("impact", "pop", "click")}
    print("voice:", VOICE, RATE, PITCH, "| script:", script_path, "| music:", music, "| whoosh:", sfx, "| extra sfx:", pack)
    print("photos found:", sum(1 for s in out if s["photo"]))
    json.dump(
        {"totalSec": round(t, 2), "music": music, "sfx": sfx, "sfxPack": pack, "scenes": out},
        open("public/story.json", "w", encoding="utf8"),
        ensure_ascii=False,
        indent=1,
    )
    print("Total seconds:", round(t, 1))


asyncio.run(main())
