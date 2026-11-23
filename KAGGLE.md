# Render speed test on Kaggle

Two ways to run it. **Method A is the reliable one.**

## Method A — paste one script into one cell (recommended)

1. Kaggle → **New Notebook** → **Python**.
2. Right sidebar: turn **Internet: On**.
3. Open `tools/kaggle_render.py` from this folder in a text editor, copy **all** of it.
4. Paste into the single empty code cell.
5. **Run** (Shift+Enter).

It prints a timing table for every step, then shows the video with a download link.

## Method B — use the .ipynb as an actual notebook

Do **not** paste the `.ipynb` text into a cell — that causes `NameError: name 'null' is not defined` because JSON `null` isn't Python.

Instead:
1. Kaggle → **New Notebook** → **Python**.
2. Create the notebook, then use **File → Import Notebook** (or upload `tools/kaggle_render.ipynb` through the Kaggle file browser as a notebook file, not as text).
3. Run all cells.

If Method B is awkward, just use Method A — it does exactly the same thing.

## Switches (top of the script / setup cell)

- `SCRIPT = 'script_rocket_fire'` — point to any `tools/script_*.json`.
- `CONCURRENCIES = [2, 4, 8]` — renders 3 times and reports which is fastest.
- Change `--gl=swangle` to `--gl=angle` in the render command to try the GPU path.

## Example output

```
========================================
SPEED SUMMARY
========================================
install Node 20           8.2s
install ffmpeg           14.1s
pip edge-tts              6.4s
clone repo                1.1s
npm ci                   24.7s
fetch photos             31.0s
build story              12.5s
render c=4              214.3s
TOTAL                   312.3s
```

## Notes

- **GPU doesn't help with `--gl=swangle`** — that's Chrome's software renderer. Kaggle's free T4 only matters with `--gl=angle`, and headless ANGLE in a Kaggle container may need extra setup. Keep `swangle` for a clean comparison against GitHub Actions first.
- **Internet must be on** for the Node download, `git clone`, `pip`, `npm ci` and Openverse photos.
- Everything is written under `/kaggle/working/shorts-studio/out/` and is downloadable from Kaggle's output panel.
- The script clones the **pushed** GitHub version, so local uncommitted changes won't appear in the Kaggle run.
