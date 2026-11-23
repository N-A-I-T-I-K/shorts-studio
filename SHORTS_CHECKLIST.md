# Pre-publish Shorts checklist

Run through this before uploading. Based on the Nov 2026 research in `HANDOFF.md`
(Metricool 799,718 videos, Later, Sprout Social).

## The video itself
- [ ] Hook lands in the **first 1.5 seconds** — no logo, no "hey guys", no slow build.
- [ ] On-screen text carries the point with the sound **off** (69% watch muted).
- [ ] Captions are high-contrast and synced to single spoken words.
- [ ] Every number has a hit: flash, chart, pop, music dip.
- [ ] Visual changes at least every ~2 seconds (photo, transition, or camera move).
- [ ] Ending flows back into the opening frame — the loop should feel intentional.
- [ ] Last line is a **question**, and "COMMENT YOUR GUESS" is visible.
- [ ] Watch the joins at ~25%, ~50%, ~75% of the sharded render.
- [ ] Check the last 1 second for the loop seam and end card.

## The upload
- [ ] Title uses the script's hook and stays under 100 characters (`tools/make_meta.py`).
- [ ] Description leads with the hook, then the year arc, then the question.
- [ ] 3-5 hashtags, written for YouTube search, not copied blindly from TikTok.
- [ ] Pinned comment is the exact ending question.
- [ ] Add a **Related Video** link to a longer video if one exists.
- [ ] Thumbnail text is 3-5 words maximum, readable at phone size.

## After publishing
- [ ] Check the retention graph after 24h — find the second where people leave.
- [ ] Reply to the first 10 comments to seed the thread.
- [ ] Batch the next clips with `tools/make_meta.py --all` so titles stay consistent.

## Quick commands
```text
python tools/check_story.py --all          validate every script
python tools/build_story.py tools/script_<topic>.json
python tools/check_shards.py               verify shard frame coverage
python tools/make_meta.py tools/script_<topic>.json
```
