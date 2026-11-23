# Full handoff — Shorts Studio continuous-flow engine

Pushed commit: **e2fbd13** (branches `main` and `master`, repo `N-A-I-T-I-K/shorts-studio`).
Copy in use: `D:\my-shorts-studio - Copy`.

## Goal
One strong, engaging, CONTINUOUS Shorts engine. One clip at a time (`script_rocket_fire`).
Bulk 10-clip rendering is postponed until the engine is proven.
GitHub Actions is the production base. Kaggle is a benchmark sandbox only.

---

## Commit history (all pushed)

| Commit | What it did |
|---|---|
| `23011b4` | Enhanced theme engine: palettes, photos, mascots, cards, count-ups, 4 music tracks; single-clip workflow |
| `37eb226` | Added `ENGINE.md` docs |
| `4408aa7` | Continuous-flow engine: one unbroken narration, crossfading visuals |
| `13c366d` | Story-driven rewrite: male voice, dated narration, brief date cards, rising visuals, no repeated "fire" |
| `90faa33` | Fixed lingering stat card; chapter streaks, breathing motion, cinematic bars, scanlines, whoosh transitions |
| `97d689b` | Word-synced visual cues and 3 crossfading photos per scene |
| `f1c85ee` | Full handoff summary |
| `4d27b81` | Beat pulses, 4 chapter transitions, data viz charts, reacting mascot, 3D-look hero object |
| `cc9e36c` | Kaggle render speed benchmark notebook |
| `47a0828` | Paste-in-one-cell Kaggle script + corrected upload instructions |
| `e2fbd13` | **Experimental sharded render workflow (new file; base `render.yml` untouched)** |

---

## Files and exactly what changed

### `src/themes.ts`
- `Theme` type: `id, label, palette, accent, secondary, glow, bgStyle, font, photoTint, photoOpacity, motion, character, card`.
- `getTheme(key)` deterministically hashes script `theme` string into palette, accent, secondary (`hsl(base+150,80,62)`), background style (0–7), font, motion (0–3), mascot shape (0–3), card skin (0–2), photo tint/opacity.

### `src/ThemeBG.tsx`
- 8 animated backgrounds: orbs, grid, beams, rings, embers, starfield, waves, dot-matrix. Props: `seed, variant, accent, lf`.

### `src/MotionKit.tsx`
- `MOTION` = 4 spring configs; `useEnter(lf, theme, delay)`.
- **`MUSIC_BPM = 128`; `beatPulse(f, fps, bpm)`** = `(1 - (f % period)/period)^4`. Matches `music_hype.mp3`.
- `Mascot`: 4 shapes, bobbing/blinking. **Gained `energy` and `shock` props** — jumps ~62px on a stat hit; tilts + eyes widen when `shock` is high.
- `ThemeBadge`: pops frame 8, fades frames 110–128.
- `CardFrame` / `Sparkles`: take `at`, fade with the stat (kills lingering box).
- **`BeatGlow`**: two pulsing rails, corner flare that changes colour every 2 seconds, three tick dots. No blur filters.
- **`HeroObject`**: vector SVG rocket (also planet/coin variants), floats and rotates, glowing corner. Driven by script `"hero"`. No WebGL.
- **`DataMoment`**: bar chart / drawing line graph / route with appearing dots, rotating by scene index. Appears for 82 frames around the stat hit.

### `src/Captions.tsx`
- Props `{words, accent?, font?}`; active word uses theme accent/font. `CHUNK = 3` words. Karaoke single-word highlight is still TODO.

### `src/Story.tsx`
- Exports `KineticTitle`, `Timeline`, `Hook`, `Stat` for reuse.
- `Scene` fields: `year, title, device, text, start, dur, audio?, words, photo?, photos?, photoCues?, dateSec?, statSec?, mood?, hook?, stat?, statLabel?`.
- `StoryProps`: `scenes, music?, sfx?, sfxPack?, theme?, narration?, hero?`.
- `Stat` takes `at`, includes numeric count-up. Render target is `StoryFlow`, not `Story`.

### `src/StoryFlow.tsx` — the main video
- `FlowBackground`: continuous gradient + drifting glow; photos from `sc.photos` via `photoCues`, 15-frame crossfades, slow push-in `1.04 → 1.13`.
- **`ChapterTransition`** (replaced `ChapterKick`): 4 kinds rotated by scene index — glitch cut, whip-pan with skew streak, zoom-through ring, light-leak flash. Cheap DOM/gradients.
- `FlowScene`: fades in/out; date card pops then clears via `dateEnd`; visual rises in; `breathe = 1 + sin(lf/22)*0.018 + beatPulse(f,30)*0.02`; device dispatch; stat + **`<DataMoment>`**; hook on first scene; impact SFX at `statAt`. Now takes global `f` prop.
- `FlowTimeline`: one continuous progress rail with year dots.
- Main computes `current`, then `energy` / `shock` from `statSec` and `scene.mood === 'shock'`. Renders `<Mascot energy shock>`, **`<HeroObject>`**, **`<BeatGlow>`**, badge, timeline, sweep, scanlines, vignette, ring, flash, bars, captions, narration + music + SFX.
- Cues: `dateEnd = clamp(((dateSec ?? first.end) - start)*fps + 8, 18, 44)`; `statAt = clamp((statSec - start)*fps, dateEnd+4, durF-22)`.

### `src/Root.tsx`
- Registers `StoryFlow` at 1080×1920, fps 30. `calculateMetadata` reads `public/story.json`, passes `scenes, music, sfx, sfxPack, theme, narration, hero`.

### `tools/build_story.py`
- One `edge_tts.Communicate` call for the whole script (`boundary="WordBoundary"`) → single `public/voice/narration.mp3`.
- Voice `en-US-AndrewMultilingualNeural`, fallback `en-US-GuyNeural`; rate/pitch from script.
- Splits words across scenes; extends each `dur` to next scene's `start` (no gaps); up to 3 photos per scene.
- `find_word` skips first word, exact / substring match. `auto_stat_word` maps `NUMWORDS`.
- Emits `dateSec`, `statSec`, `photoCues`; strips script-only `statWord`.
- **Writes `"hero": opts.get("hero")` into `public/story.json`.**

### `tools/fetch_assets.py`
- `PER_SCENE = 3`. Openverse API, licences `cc0,pdm,by`. Saves `photo{i}_{j}.jpg` + `.txt`, plus `photo{i}.jpg` alias. Credits to `out/CREDITS.txt`.

### `tools/make_audio.py`
- `[seconds] [chill|hype|dark|bright] [name]`. BPM 128/112/96/124. Original tracks `music*.mp3` + whoosh/impact/pop/click. Script uses `music_hype.mp3` (128 BPM — why `MUSIC_BPM=128`).

### `tools/script_rocket_fire.json`
- `voice: en-US-AndrewMultilingualNeural`, `rate +8%`, `pitch +0Hz`, `theme: ember_ascent`, `music: music_hype.mp3`.
- **`"hero": "rocket"`** added at top level; **`"mood": "shock"`** on the 2008 and 2015 scenes.
- 8 scenes: NOW/The Spark, 1961/First Human, 1969/Moon Landing, 1981/The Return, 2008/Private Orbit, 2015/Perfect Landing, 2022/The Giant, NEXT/What's Next?
- Date spoken first + joining words; punchline first; climax at 2015; no repeated "fire"; `statWord` + `photo_query` on every scene.

### `.github/workflows/render.yml` — BASE, do not disturb
- Manual dispatch; matrix = only `script_rocket_fire`.
- checkout → Node 20 → `npm ci` → `pip install edge-tts` → apt ffmpeg → fetch assets → build story → `npx remotion render StoryFlow out/script_rocket_fire.mp4 --gl=swangle --concurrency=4` → upload artifact → `package` job zips all.
- Run: Actions → **Render Shorts** → Run workflow → branch `main`. Never "Re-run jobs".

### `.github/workflows/render_sharded.yml` — EXPERIMENTAL (new in `e2fbd13`)
- Separate file, so base is unaffected. **Rollback = delete this file.**
- Manual dispatch with `concurrency` choice 2/4/8 (default 4). Env: `SCRIPT=script_rocket_fire`, `FPS=30`, `SHARDS=4`.
- Job `render`: matrix `part: [0,1,2,3]`. Each job does full setup in parallel, computes its range from `story.json` (`round(totalSec*30)`), renders `--frames=start-end --gl=swangle --concurrency=$CONCURRENCY --log=error`, prints `PART n RENDER SECONDS`, uploads `part-n`.
- Job `merge` (`needs: render`): downloads all parts, ffmpeg concat demuxer with re-encode (`libx264 -preset veryfast -crf 18`, `aac 192k`, `+faststart`), verifies with ffprobe, uploads `script_rocket_fire-sharded`.
- **Verified frame split for 1,579 frames:** 0–393, 394–788, 789–1183, 1184–1578 (394+395+395+395 = 1,579, no gaps/overlaps).
- **Risk to check:** audio continuity at the three joins (~13s, ~26s, ~39s). If broken, switch to silent parts + mux one full audio track at the end.
- Run: Actions → **Render Shorts (Sharded)** → Run workflow → branch `main`.

### `tools/kaggle_render.py` + `KAGGLE.md` (benchmark only)
- Paste the whole `.py` into ONE Kaggle code cell. Do **not** paste the `.ipynb` JSON as text (`NameError: name 'null' is not defined`).
- Installs Node 20, ffmpeg, edge-tts; clones repo; `npm ci`; fetch assets; build story; renders with `--gl=swangle --concurrency=4`; prints timings.
- `tools/kaggle_render.ipynb` is the notebook version — use **File → Import Notebook**, not paste-as-text.

### Generated outputs (never hand-edit)
- `public/story.json`: totalSec 52.63, 129 words, 23 photos, `hero: rocket`, word cues.
- `public/voice/narration.mp3`: 52.63s. `public/assets/rocket_fire/`: 23 photos. `out/CREDITS.txt`.

---

## Kaggle benchmark result (why we stayed on GitHub)

```
install Node 20     2.6s     npm ci          58.6s
pip edge-tts        3.4s     fetch photos   14.1s
clone repo          1.8s     build story     2.0s
render c=4        355.9s     TOTAL         438.4s
```
Render = 81% of total. Kaggle is **not** faster; `--gl=swangle` is software rendering so GPU/RAM don't help. "fastest render: concurrency 4" was misleading — only one candidate was tested. GitHub's render time has **never been measured**; the `214s` seen in docs was an illustrative example, not a measurement.

Decision: keep GitHub as base; the win is sharding, not platform switching. Lambda only after the engine is locked and dozens of videos are needed.

---

## Verified state at `e2fbd13`
- `tsc --noEmit` clean.
- Local build: 52.6s, 129 words, 23 photos.
- All 8 `statSec` hits exact: `flame, first, three, burned, reached, stood, tallest, watching`.
- YAML of `render_sharded.yml` parses; frame ranges cover exactly 1,579 frames.

## Engine sprint — complete at `4b3e42c`
All commits pushed to `main` and `master`. Checks after **every** step: `tsc --noEmit` clean; build still 52.63s / 1,579 frames / 129 words / 23 photos; all 8 `statSec` hits exact.
1. `6fee004` Karaoke captions — one spoken word at a time, neon pop, no blur (cloud-fast). `StoryFlow` only; `Short`/`Story` unchanged.
2. `52b6a05` Beat-driven camera — push-in on stat, shake on `mood: shock`, pull-back on the closing question, scale never below 1 (safe at shard joins).
3. `a0db2bb` Sound design — date ticks, count-up pops, riser into the twist. Uses existing SFX, no new assets.
4. `b92640f` Loop bridge — final 0.5s becomes the exact frame-0 gradient; captions fade, so Shorts wraps without a cut.
5. `520cb02` End card — "COMMENT YOUR GUESS" + "NEXT VIDEO →" in the last 1.4s.
6. `c7ab388` Chapter counter `01 / 08` on the timeline; viral research table added below.
7. `bc4d2d4` Opening snap-in zoom (first 26 frames) + 10% white flash on every stat hit.
8. `4b3e42c` `tools/make_meta.py` — generates title, description, pinned comment from any script. Output `out/meta_<topic>.txt` (gitignored, local only).

Sharded workflow remains separately testable: delete `.github/workflows/render_sharded.yml` to roll back. Base `render.yml` untouched.

## Second sprint — 20 more additions, complete at `1ab905e`
Checks after each batch: `tsc --noEmit` clean; build 1,552 frames / 130 words / 23 photos; all 8 `statSec` hits exact; shard cover exact.

**Visual / motion (StoryFlow.tsx)**
1. Photos drift sideways slowly, alternating direction per scene.
2. Photos get a tiny Ken Burns tilt.
3. Photo crossfades now ease in/out instead of linear.
4. Floating embers via the existing `Particles` component (18, looped).
5. Quick RGB chromatic glitch at the start of every `mood: shock` twist.
6. Beat-reactive vignette (subtle opacity pulse).
7. Date text jitters on shock scenes.
8. Accent underline sweeps under the date/title.
9. Persistent animated corner frame — recurring series signature.
10. Giant translucent ghost year drifting behind the visuals.
11. 12-bar beat waveform in the lower-left.
12. Music ducks 45% for 0.4s on every stat hit (sidechain).
13. Rising whoosh into the loop seam.

**Tooling / project**
14. `tools/check_story.py` — validates device names, word count, 8 scenes, `statWord`, year/title length, ending question. Use `--all`.
15. `tools/make_meta.py` — added thumbnail text (≤5 words) and `--all`.
16. `tools/template_script.json` — safe template (not `script_*`, so never rendered).
17. `tools/check_shards.py` — verifies shard frame ranges exactly cover story.json.
18. `tools/build_all.py` — validate + build every script, saving `public/story_<topic>.json`.
19. `SHORTS_CHECKLIST.md` — pre-publish and after-publish checklist from the viral research.
20. Script text tightened to 130 words so it passes the new validator; regenerated story is 51.74s / 1,552 frames.

Current shard ranges (51.74s story): `0-387`, `388-775`, `776-1163`, `1164-1551`. They are computed dynamically, so they update automatically with any script change.

## Feedback fix — `StoryFlow` continuity
User reported: background photos looked missing, voice changed partway, and new pop-in effects broke the continuous feel.
1. Photos restored: effective opacity `theme.photoOpacity + 0.3` (cap 0.92), tint lightened from `55/cc` to `33/99`. 23 photos still present.
2. Voice locked: `en-US-AndrewNeural` instead of `...MultilingualNeural` (multilingual can switch accent mid-script). `build_story.py` now retries the same voice before the Guy fallback.
3. Removed the new pop-ins: giant ghost year, shock RGB jitter, shock chromatic glitch, and the particle layer that reset every 8s. Kept the smooth eased crossfades, parallax/tilt, corner frame, beat waveform, underline sweep and beat vignette.
4. Current build: 48.12s / 1,444 frames / 130 words / 23 photos; all 8 stat hits exact; shard ranges `0-360`, `361-721`, `722-1082`, `1083-1443`.

## Open thread — pick this up first
1. Run **Render Shorts (Sharded)** once on the new commit and check the joins at ~13s / ~26s / ~39s. User reported the previous run's joins were perfect and total wall time ~4 min.
2. Download `script_rocket_fire-sharded`, watch the loop seam and end card, listen for audio glitches.
3. If clean, optionally test concurrency 2 vs 4, then apply timing to the base workflow.
4. Do **not** switch to Remotion Lambda yet.

## Not yet done
1. Upgrade the other 27 scripts to new arc + `statWord` + 3 `photo_query` before bulk rendering.
2. Apply the new engine to the other scripts (they currently use the older `Story` composition).
3. Refresh `ENGINE.md` with the new components if needed.

## Conventions / constraints
- Only touch `src/` when the user explicitly asks for engine work. They have approved all changes above, but ask first for new ones.
- `AGENTS.md` hard rule says only edit `tools\script_*.json`; the user has repeatedly overridden this with explicit requests. Follow explicit user instructions, but keep base files untouched when told to.
- Never run `npm run dev`, `npm install`, `npx remotion render`, or any `.bat` file locally — the user runs those.
- Never hand-edit `public/story.json`; regenerate with `build_story.py`. Never run `pip install` unless asked.
- Never delete files. If a command fails twice, stop and show the exact error. No keys/tokens anywhere.
- `AGENTS.md`, `CLAUDE.md`, `PROMPTS.txt`, `.bat` files and `opencode.json` are **untracked local files** — leave them alone.

## Local workspace state (not pushed)
- `public/voice/scene*.mp3` and `narration.mp3` show as modified from a local `build_story.py` run; harmless — GitHub regenerates them.
- Many untracked local files exist (`public/assets/`, `public/clip.mp4`, `voice_samples/`, `skills/`, `.agents/`, etc.). Do not delete or commit them.

---

## Viral Shorts research — top 10 (Nov 2026)
Sources: Metricool 2026 YouTube Study (799,718 videos / 71,177 accounts; Shorts views +127%), Later "10 Proven Tips", Sprout Social. Only engine-relevant items are implemented; posting/analytics ones are channel-side.

| # | What makes Shorts spread | Status in this engine |
|---|---|---|
| 1 | Hook in the **first 1.5s** — 61% of views come from the swipe feed; no logo, no greeting | ✓ hook card + impact hit on frame 0 |
| 2 | **Seamless loop** — last frame flows into the first; YouTube rewards watch-time-to-length ratio | → adding loop bridge |
| 3 | **Bold high-contrast captions** — 69% watch muted in public | ✓ karaoke single-word captions |
| 4 | Short runtime — avg view 15.6s, sharp drop-off after 45s | ⚠ story is 52.6s; hook front-loaded, data moments keep pace |
| 5 | On-screen text carries the point with sound off | ✓ date card, stat, title all burned in |
| 6 | Beat-synced motion + SFX hits | ✓ pulses, camera push/shake, ticks, pops, riser |
| 7 | Pattern interrupt every ~2s | ✓ 23 crossfading photos, 4 chapter transitions |
| 8 | **Pinned-comment question** — engagement down 62.6%; replies pause the loop | → adding end prompt |
| 9 | Related-video tease — Short feeds the long-form/channel | → adding "NEXT" tag at the end |
| 10 | Consistent series identity + "you are here" progress | ✓ theme badge, mascot, timeline → adding chapter counter |
