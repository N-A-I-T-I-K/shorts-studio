"""Generate YouTube Shorts packaging text from a script json.
Usage: python tools\\make_meta.py tools\\script_<topic>.json
Writes out\\meta_<topic>.txt (title, description, pinned comment).
No API keys, no network, no video code — pure text from the script itself.
"""
import json
import os
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "tools/script_rocket_fire.json"
with open(path, encoding="utf-8") as fh:
    data = json.load(fh)
scenes = data["scenes"]
name = os.path.basename(path).replace("script_", "").replace(".json", "")

hook = next((s["hook"] for s in scenes if s.get("hook")), "")
first = scenes[0]
last = scenes[-1]
stats = [s["stat"] for s in scenes if s.get("stat") and s["stat"] not in ("NEXT",)]
years = [s["year"] for s in scenes if s.get("year") not in ("NOW", "NEXT")]

# Title: the hook is already written to stop the scroll. Fall back to the first stat.
title = (hook or f"{stats[0]} {first.get('statLabel', '')}").strip()
if len(title) > 100:
    title = title[:97].rstrip() + "..."
if "#shorts" not in title.lower():
    title = f"{title} #shorts"

question = last["text"].strip()
arc = "  ".join(f"{s['year']}: {s['title']}" for s in scenes[1:-1] if s.get("year"))

blob = " ".join(s.get("text", "") + " " + s.get("title", "") for s in scenes).lower()
if any(k in blob for k in ("rocket", "space", "orbit", "moon", "star")):
    tags = "#shorts #space #rockets #science"
elif any(k in blob for k in ("internet", "computer", "phone", "web")):
    tags = "#shorts #technology #history #facts"
else:
    tags = "#shorts #facts #history #didyouknow"

description = "\n".join([
    hook or first["text"].strip(),
    "",
    arc,
    "",
    question,
    "",
    tags,
])

pinned = question + "\nI read every answer. 👇"

out_dir = "out"
os.makedirs(out_dir, exist_ok=True)
out = os.path.join(out_dir, f"meta_{name}.txt")
with open(out, "w", encoding="utf-8") as fh:
    fh.write(f"TITLE\n{title}\n\nDESCRIPTION\n{description}\n\nPINNED COMMENT\n{pinned}\n")

print(f"wrote {out}")
print("title chars:", len(title))
