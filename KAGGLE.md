# Render speed test on Kaggle

`tools/kaggle_render.ipynb` is a ready-to-upload notebook. It installs Node 20 + all dependencies, clones this repo, builds the sample clip and prints a timing table for every step (including the render), then shows the finished video.

## Steps

1. Go to https://www.kaggle.com/code → **New Notebook** → **Python**.
2. Right sidebar: turn **Internet: On**. (GPU is optional — see note below.)
3. In the Kaggle file browser, upload `tools/kaggle_render.ipynb` from this folder, or paste its cells into the new notebook.
4. Run all cells (**Run All**).
5. The last cell prints a table like:

| step | seconds |
|---|---|
| install Node 20 | 8.2 |
| pip edge-tts | 6.4 |
| clone repo | 1.1 |
| npm ci | 24.7 |
| fetch photos | 31.0 |
| build story | 12.5 |
| render c=4 | 214.3 |

and shows the video plus a download link.

## Useful switches (setup cell)

- `SCRIPT = 'script_rocket_fire'` — point to any `tools/script_*.json`.
- `CONCURRENCIES = [2, 4, 8]` — renders 3 times and reports which is fastest.
- Change `--gl=swangle` to `--gl=angle` in the render cell to try the GPU path.

## Notes

- **GPU doesn't help with `--gl=swangle`** — that's Chrome's software renderer. Kaggle's free T4 will only matter with `--gl=angle`, and headless ANGLE inside a Kaggle container may need extra setup. Start with swangle for a clean comparison against GitHub Actions.
- **Internet must be on** for the Node download, `git clone`, `pip`, `npm ci` and Openverse photos.
- Everything is written under `/kaggle/working/shorts-studio/out/` and is downloadable from the Kaggle output panel.
- Kaggle session limit is several hours, enough for a few renders.
