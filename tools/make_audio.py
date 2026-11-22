"""Makes original royalty-free music (public/music.mp3) and a whoosh (public/whoosh.mp3).
Usage: python tools\\make_audio.py [seconds] [chill|hype]   (default 75 chill)"""
import os, subprocess, sys, wave
import numpy as np

SR = 44100
STYLE = sys.argv[2] if len(sys.argv) > 2 else "chill"
NAME = sys.argv[3] if len(sys.argv) > 3 else STYLE
HYPE = STYLE == "hype"
DARK = STYLE == "dark"
BRIGHT = STYLE == "bright"
BPM = 128 if HYPE else (124 if BRIGHT else (96 if DARK else 112))
SECS = float(sys.argv[1]) if len(sys.argv) > 1 else 75.0
rng = np.random.default_rng(7)
beat = 60.0 / BPM
n_total = int(SECS * SR)
mix = np.zeros(n_total)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t):
    i = int(t * SR)
    if i >= n_total:
        return
    j = min(n_total, i + len(sig))
    mix[i:j] += sig[: j - i]


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def kick():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.9


def snare():
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n) * np.exp(-t * 22)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28)
    return (noise * 0.5 + tone * 0.4) * 0.6


def clap():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    e = np.exp(-t * 26) + 0.7 * np.exp(-np.maximum(t - 0.012, 0) * 26) * (t > 0.012) + 0.5 * np.exp(-np.maximum(t - 0.024, 0) * 26) * (t > 0.024)
    return np.diff(x, prepend=0) * e * 0.35


def hat():
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    x = np.diff(x, prepend=0)  # crude high-pass
    return x * np.exp(-t * 70) * 0.18


def pluck(m, dur=0.22):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t)
    return s * env(n, 0.003, 0.09) * 0.18


def bass(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)
    return s * env(n, 0.01, dur * 0.7) * 0.42


def pad(notes, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in notes:
        for d in (-0.15, 0.0, 0.15):
            f = hz(m) * 2 ** (d / 12)
            s += np.sin(2 * np.pi * f * t)
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.5)
    return s * a * 0.035


# Am - F - C - G, 2 bars each (8 beats), root notes and chord tones
prog = [
    (45, [57, 60, 64]),  # A minor
    (41, [53, 57, 60]),  # F
    (48, [55, 60, 64]),  # C
    (43, [55, 59, 62]),  # G
]
if DARK:
    prog = [
        (45, [57, 60, 64]),  # A minor
        (41, [53, 57, 60]),  # F
        (38, [50, 53, 57]),  # D minor
        (40, [52, 56, 59]),  # E
    ]
elif BRIGHT:
    prog = [
        (48, [55, 60, 64]),  # C
        (43, [55, 59, 62]),  # G
        (45, [57, 60, 64]),  # A minor
        (41, [53, 57, 60]),  # F
    ]
bar_beats = 4
chord_len = 2 * bar_beats * beat
n_chords = int(SECS / chord_len) + 1
for c in range(n_chords):
    root, notes = prog[c % 4]
    t0 = c * chord_len
    add(pad(notes, chord_len), t0)
    # bass: eighth-note pulse
    for k in range(16):
        add(bass(root, beat * 0.5) * (1.3 if HYPE else 1.0), t0 + k * beat * 0.5)
    # arpeggio: sixteenth notes up and down through chord tones
    arp = notes + [notes[1] + 12, notes[2] + 12, notes[1] + 12, notes[2]]
    for k in range(32):
        m = arp[k % len(arp)] + 12
        add(pluck(m), t0 + k * beat * 0.25)
    # drums (start after 1 chord for an intro build)
    if c >= (0 if HYPE else 1):
        for b in range(8):
            tb = t0 + b * beat
            add(kick(), tb)
            if b % 2 == 1:
                add(snare(), tb)
                if HYPE:
                    add(clap(), tb)
            add(hat(), tb + beat * 0.5)
            add(hat(), tb)
            if HYPE:
                add(hat(), tb + beat * 0.25)
                add(hat(), tb + beat * 0.75)
                add(kick(), tb + beat * 0.75) if b % 4 == 3 else None

# simple master: fade, normalise, soft clip
fade_in, fade_out = int(1.5 * SR), int(3 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)
mix[-fade_out:] *= np.linspace(1, 0, fade_out)
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.9
mix = np.tanh(mix * 1.3) / np.tanh(1.3) * 0.9


def write_wav(path, data):
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def whoosh():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    y = np.zeros(n)
    prev = 0.0
    for i in range(n):
        a = 0.02 + 0.5 * (i / n) ** 2
        prev += a * (x[i] - prev)
        y[i] = prev
    e = np.sin(np.pi * np.clip(t / 0.9, 0, 1)) ** 2
    y = y * e
    return y / (np.max(np.abs(y)) + 1e-9) * 0.8


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def impact_fx():
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 14)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)
    noise = rng.standard_normal(n) * np.exp(-t * 30) * 0.25
    return norm(body + noise)


def pop_fx():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 18) + 200
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38))


def click_fx():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = np.diff(rng.standard_normal(n), prepend=0)
    return norm(x * np.exp(-t * 140) * 0.6 + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 160) * 0.4)


os.makedirs("public", exist_ok=True)
music_name = "music" if NAME == "chill" else f"music_{NAME}"
outputs = {music_name: mix, "whoosh": whoosh(), "impact": impact_fx(), "pop": pop_fx(), "click": click_fx()}
# keep any sound effects you already chose: only music is always remade
outputs = {k: v for k, v in outputs.items() if k == music_name or not os.path.exists(f"public/{k}.mp3")}
for name, data in outputs.items():
    write_wav(f"public/_{name}.wav", data)
for name in outputs:
    subprocess.check_call(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", f"public/_{name}.wav", "-b:a", "192k", f"public/{name}.mp3"]
    )
    os.remove(f"public/_{name}.wav")
print("Made music, whoosh, impact, pop and click in the public folder")
