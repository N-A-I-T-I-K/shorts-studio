"""Validate and build every script, keeping a copy of each generated story.json.
Usage: python tools\\build_all.py
Leaves public/story.json as the last built script so the normal render still works.
Copies go to public/story_<topic>.json for later bulk runs.
"""
import glob
import json
import os
import shutil
import subprocess
import sys

files = sorted(glob.glob('tools/script_*.json'))
if not files:
    print('no tools/script_*.json files found')
    sys.exit(2)

ok = 0
for path in files:
    print(f'\n=== {path} ===')
    check = subprocess.run([sys.executable, 'tools/check_story.py', path])
    if check.returncode != 0:
        print('skipped (validation failed)')
        continue
    build = subprocess.run([sys.executable, 'tools/build_story.py', path])
    if build.returncode != 0:
        print('skipped (build failed)')
        continue
    topic = os.path.basename(path).replace('script_', '').replace('.json', '')
    with open('public/story.json', encoding='utf-8') as fh:
        story = json.load(fh)
    dest = f'public/story_{topic}.json'
    with open(dest, 'w', encoding='utf-8') as fh:
        json.dump(story, fh, ensure_ascii=False, indent=2)
    print(f'saved {dest} | {story["totalSec"]}s | {len(story["scenes"])} scenes')
    ok += 1

print(f'\nbuilt {ok}/{len(files)} scripts')
