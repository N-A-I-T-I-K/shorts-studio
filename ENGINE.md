# Shorts Studio engine (this copy only)

## One video = one script
`tools/script_<name>.json` holds:
- `voice`, `rate`, `pitch`
- `theme` — any unique string, e.g. `red_dust`
- `music` — optional: `music.mp3`, `music_hype.mp3`, `music_dark.mp3`, `music_bright.mp3`
- `scenes[8]` — `year`, `title`, `device`, `text`, `hook`, `stat`, `statLabel`, `photo_query`

## How themes work
`src/themes.ts` turns the `theme` string into a deterministic identity:
8-scene color palette, accent, secondary color, background style (8 variants),
font, motion style (4), mascot type (4), stat-card skin (3), photo tint/opacity.
No two current themes share the same look (`python tools/check_themes.py` verifies).

New visual pieces: `src/ThemeBG.tsx`, `src/MotionKit.tsx`.
Stats count up automatically when they start with a number.

## Build one clip
```
python tools/fetch_assets.py tools/script_<name>.json
python tools/build_story.py tools/script_<name>.json
```
Photos go to `public/assets/<name>/` (one folder per script, no collisions).
Check: `python tools/validate_new.py` and `npx tsc --noEmit`.

## Cloud render
`.github/workflows/render.yml` currently renders ONE script (matrix = `script_rocket_fire`).
To bulk render later, add script names back to the matrix. The `package` job
downloads everything into one `all-shorts` zip.

Music tracks are generated locally (original, no licence issues):
```
python tools/make_audio.py 75 chill chill
python tools/make_audio.py 75 hype hype
python tools/make_audio.py 75 dark dark
python tools/make_audio.py 75 bright bright
```
