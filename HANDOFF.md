# Full handoff — Shorts Studio continuous-flow engine

Pushed commit: **97d689b** (branches `main` and `master`, repo `N-A-I-T-I-K/shorts-studio`).
Copy in use: `D:\my-shorts-studio - Copy`.

## Goal
One strong, engaging, CONTINUOUS Shorts engine. One clip at a time (`script_rocket_fire`).
Bulk 10-clip rendering is explicitly postponed until the engine is proven.

---

## Commit history (all pushed)

| Commit | What it did |
|---|---|
| `23011b4` | Enhanced theme engine: palettes, photos, mascots, cards, count-ups, 4 music tracks; single-clip workflow |
| `37eb226` | Added `ENGINE.md` docs |
| `4408aa7` | Continuous-flow engine: one unbroken narration, crossfading visuals, Ava voice |
| `13c366d` | Story-driven rewrite: male voice, dated narration, brief date cards, rising visuals, no repeated "fire" |
| `90faa33` | Fixed lingering stat card; chapter streaks, breathing motion, cinematic bars, scanlines, whoosh transitions |
| `97d689b` | Word-synced visual cues and 3 crossfading photos per scene |

---

## Files and exactly what changed

### `src/themes.ts` (new)
- `Theme` type: `id, label, palette, accent, secondary, glow, bgStyle, font, photoTint, photoOpacity, motion, character, card`.
- `getTheme(key)` deterministically hashes the script's `theme` string into 8-color palette, accent, secondary color (`hsl(base+150,80,62)`), background style (0–7), font, motion style (0–3), mascot shape (0–3), stat-card skin (0–2), photo tint/opacity.
- `ACCENTS`, `FONTS` arrays; `rgba`/`hsl` helpers.

### `src/ThemeBG.tsx` (new)
- 8 animated background variants: orbs, perspective grid, light beams, pulsing rings, embers, starfield, waves, dot-matrix.
- Props: `seed, variant, accent, lf`.

### `src/MotionKit.tsx` (new, later fixed)
- `MOTION` = 4 spring configs (snap / bounce / glide / punch); `useEnter(lf, theme, delay)`.
- `Mascot`: 4 shapes from `theme.character`, bobbing, blinking eyes, positioned `right:36 top:660`.
- `ThemeBadge`: pops in frame 8, fades out frames 110–128.
- `CardFrame`: 3 skins from `theme.card`. **Fix in `90faa33`:** added `at` prop (default 34) and fade-out `interpolate(lf, [at+62, at+76], [1,0])` applied to base opacity and corner accents. This killed the box that stayed after the stat text vanished.
- `Sparkles`: 16 particles; now takes `at` prop, `g = lf - at`, fades over 36 frames.

### `src/Captions.tsx` (modified)
- Props now `{words, accent?, font?}`; active word uses theme accent and theme font. `CHUNK = 3` words at a time (karaoke-style single-word highlighting is still TODO).

### `src/Story.tsx` (modified)
- Exported `KineticTitle`, `Timeline`, `Hook`, `Stat` for reuse in `StoryFlow`.
- `Scene` type fields: `year, title, device, text, start, dur, audio?, words, photo?, photos?, photoCues?, dateSec?, statSec?, hook?, stat?, statLabel?`.
- `StoryProps` gained `narration?: string | null`.
- `Stat` gained `at?: number` (default 34) and uses `const start = at`; includes numeric count-up.
- Old `Story` composition still exists; `scene.audio` is guarded with a null check. **Render target is now `StoryFlow`, not `Story`.**

### `src/StoryFlow.tsx` (new in `4408aa7`, rewritten through `97d689b`) — the main video
- `FlowBackground`: single continuous gradient + drifting glow; photos from `sc.photos` with `photoCues` (word-derived seconds → frames using `fps`), 15-frame crossfade overlap, per-photo slow push-in `1.04 → 1.13`. Props: `f, total, scenes, starts, ends, fps, theme`.
- `ChapterKick`: accent/secondary light streak sweeping at each new date (added `90faa33`).
- `FlowScene`: fade in/out; **date card pops then clears** using `dateEnd` (derived from spoken year end); visual rises in via `visualOp`/`visualY`; slow `breathe` scale; device dispatch for car/net/3D/GTA/flat; stat with `at={statAt}`; hook on first scene; impact SFX at `statAt`.
- `FlowTimeline`: one continuous progress rail with year dots that light up.
- `StoryFlow` main: global `narration` audio, `sfx`, whoosh at every `starts.slice(1)` scene boundary, music with fade envelope, `Mascot`, `ThemeBadge`, `Sweep`, `Scanlines`, `Vignette`, `Ring`, `Flash`, `CinematicBars`, themed `Captions` over all words.
- Cue computation in main: `dateEnd = clamp(((dateSec ?? first.end) - start)*fps + 8, 18, 44)`; `statAt = clamp((statSec - start)*fps, dateEnd+4, durF-22)`.

### `src/Root.tsx` (modified)
- Imported and registered `<Composition id="StoryFlow" ...>` with `width=1080 height=1920 fps=30`, `calculateMetadata` fetching `public/story.json` and passing `scenes, music, sfx, sfxPack, theme, narration`.

### `tools/build_story.py` (fully rewritten) — current behavior
- One `edge_tts.Communicate` call for the whole script with `boundary="WordBoundary"` → single natural `public/voice/narration.mp3`.
- Voice default `en-US-AndrewMultilingualNeural`, fallback `en-US-GuyNeural`; rate/pitch from script.
- Splits WordBoundary words across scenes by `len(text.split())`; verified exact for all 8 scenes.
- Extends each `dur` to the next scene's `start` → no gaps.
- Gathers up to 4 photos `photo{i}_{j}.jpg`, fallback `photo{i}.jpg`.
- `find_word(words, needle)`: skips first word, accepts exact match or `len(want)>=4 and want in got`. **Bug fixed:** previously `got in want` made "reached" match the word "a".
- `auto_stat_word`: `NUMWORDS` map (one→1, three→3, twice→2, first→1, …) fallback.
- Emits per scene: `dateSec` (end of first spoken word), `statSec` (start of `statWord` word), `photoCues` (word-evenly-split from/to, last `to` = scene end). Removes script-only `statWord` from output.
- Music pick order: `opts["music"]`, then theme-hashed track, then all tracks. SFX pack: impact/pop/click.
- Writes `public/story.json` with `totalSec, theme, music, sfx, sfxPack, narration, scenes`.

### `tools/fetch_assets.py` (rewritten)
- `PER_SCENE = 3`. Openverse API `page_size=20`, licenses `cc0,pdm,by`.
- Saves `photo{i}_{j}.jpg` + `.txt` for j=0,1,2, plus `photo{i}.jpg`/`.txt` alias of the first.
- Skips scene if `photo{i}_2.jpg` exists. Credits all photos to `out/CREDITS.txt`.

### `tools/make_audio.py` (modified)
- Args: `[seconds] [chill|hype|dark|bright] [name]`. BPM 128/112/96/124 respectively; distinct chord progressions for dark/bright.
- Outputs `music.mp3`, `music_hype.mp3`, `music_dark.mp3`, `music_bright.mp3` (all original, licence-safe), plus whoosh/impact/pop/click (existing kept).
- `script_rocket_fire.json` uses `music_hype.mp3`.

### `tools/apply_themes.py` + `tools/check_themes.py` (new)
- 28 unique theme strings; fixed `script_cpu` collision: `silicon_pulse` → `silicon_foundry`. `check_themes.py` verified no identical looks.

### `tools/script_rocket_fire.json` (rewritten)
- `voice: en-US-AndrewMultilingualNeural`, `rate: +8%`, `pitch: +0Hz`, `music: music_hype.mp3`, `theme: ember_ascent`.
- 8-scene story arc with narration: NOW/The Spark, 1961/First Human, 1969/Moon Landing, 1981/The Return, 2008/Private Orbit, 2015/Perfect Landing, 2022/The Giant, NEXT/What's Next?
- Narrator says each date first with joining words: "Then came…", "Eight years later…", "But…", "Then…", "And then…", "Now…", closing question.
- Punchline first ("Forget the rockets. One tiny flame…"), climax at the 2015 landing. All "fire" repetitions removed from titles/text.
- Every scene has `statWord` for precise stat triggering and `photo_query`.

### `.github/workflows/render.yml` (modified)
- Manual `workflow_dispatch`; matrix = **only `script_rocket_fire`**.
- Steps: checkout → Node 20 → `npm ci` → `pip install edge-tts` → apt ffmpeg → `python tools/fetch_assets.py tools/${{ matrix.script }}.json` → `python tools/build_story.py tools/${{ matrix.script }}.json` → **`npx remotion render StoryFlow out/${{ matrix.script }}.mp4 --gl=swangle --concurrency=4`** → upload artifact → `package` job zips all into `all-shorts.zip`.
- Cloud run instructions: Actions → Render Shorts → Run workflow → branch `main`. Never "Re-run jobs".

### `ENGINE.md` (new, commit `37eb226`)
- Documents script format, theme engine, build flow, cloud render, music generation.

### Generated outputs (not hand-edited)
- `public/story.json`: totalSec 52.63, 23 photos, word-level cues.
- `public/voice/narration.mp3`: 52.63s, ~316 KB.
- `public/assets/rocket_fire/`: 23 photos + credit txt files.
- `out/CREDITS.txt`: 23 photo credits.

---

## User feedback → fixes (chronological)

1. Single clip only, not 10 → matrix reduced to one script.
2. Wanted continuous video, not scene cuts → `StoryFlow` composition.
3. Wanted more human voice → AvaMultilingualNeural, then male AndrewMultilingualNeural on request.
4. Date card stayed too long, hid background → `dateEnd` from spoken year end; fades in ~1.5s.
5. Narrator should say date then story → dates + joining words added to script text.
6. "Fire" repeated in every title → full script rewrite.
7. Box remained after stat text vanished → `CardFrame`/`Sparkles` fade with the stat.
8. "Enhance further" → ChapterKick, breathing scale, whoosh per scene, CinematicBars, Scanlines.
9. Chose #1 + #5 → word-synced cues and 3 crossfading photos per scene.

---

## Verified state at `97d689b`
- `npx tsc --noEmit` → clean.
- Local build: 52.6s, 129 words, 23 photos, exact word-to-scene alignment.
- All 8 `statSec` hits verified: `flame, first, three, burned, reached, stood, tallest, watching`.

## Not yet done (offered, awaiting user choice)
1. Karaoke captions (highlight single spoken word instead of 3-word chunks).
2. Beat-driven camera (push-in on number, shake on climax, pull-back on final question).
3. Sound design layer (riser before 2015 landing, date ticks, count-up ticks).
4. Upgrade the other 27 scripts to the new story arc + `statWord` + 3 `photo_query` format before bulk rendering.

## Conventions / constraints
- Never edit `src/` unless the user explicitly asks for engine work (they have, repeatedly, and approved all changes above).
- Never run `npm run dev`, `npm install`, `npx remotion render`, or any `.bat` file locally — user runs those.
- Never hand-edit `public/story.json`; regenerate via `build_story.py`.
- No keys/tokens in any file or reply.
- If a command fails twice, stop and show the exact error.
