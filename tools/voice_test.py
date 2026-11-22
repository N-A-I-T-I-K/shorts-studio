"""Makes short samples of several voices so you can listen and pick your favourite.
Run:  python tools\\voice_test.py     then open the voice_samples folder and play the files.
Then put the winner in your script json:  "voice": "NAME"  (and tune "rate" and "pitch")."""
import asyncio, os
import edge_tts

TEXT = "Two days ago, GTA 6 made three point eight billion dollars in just one day. Here is how it all started."
WANT = [
    "en-US-AndrewMultilingualNeural", "en-US-BrianMultilingualNeural", "en-US-ChristopherNeural", "en-US-GuyNeural",
    "en-US-EricNeural", "en-GB-RyanNeural", "en-AU-WilliamMultilingualNeural", "en-US-AriaNeural", "en-US-JennyNeural",
    "en-US-AvaMultilingualNeural", "en-US-EmmaMultilingualNeural",
]


async def main():
    os.makedirs("voice_samples", exist_ok=True)
    voices = await edge_tts.list_voices()
    have = {v["ShortName"] for v in voices}
    english = sorted(v["ShortName"] + " (" + v["Gender"] + ")" for v in voices if v["Locale"].startswith("en-"))
    print("English voices you can use:", len(english))
    for name in WANT:
        if name not in have:
            print("not available:", name)
            continue
        for label, rate, pitch in (("normal", "+0%", "+0Hz"), ("energetic", "+10%", "+0Hz")):
            path = f"voice_samples/{name}_{label}.mp3"
            await edge_tts.Communicate(TEXT, name, rate=rate, pitch=pitch).save(path)
        print("made samples for", name)
    open("voice_samples/ALL_VOICES.txt", "w", encoding="utf8").write("\n".join(english))
    print("Full list saved in voice_samples\\ALL_VOICES.txt")


asyncio.run(main())
