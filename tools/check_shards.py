"""Verify the sharded render frame ranges match story.json exactly.
Usage: python tools\\check_shards.py [shards]
Prints the start-end used by render_sharded.yml and confirms no gaps/overlaps.
"""
import json
import sys

FPS = 30
shards = int(sys.argv[1]) if len(sys.argv) > 1 else 4
with open('public/story.json', encoding='utf-8') as fh:
    story = json.load(fh)
total = round(story['totalSec'] * FPS)
ranges = [(total * i // shards, total * (i + 1) // shards - 1) for i in range(shards)]

frames = []
for i, (start, end) in enumerate(ranges):
    print(f'part {i}: frames {start}-{end} ({end - start + 1} frames)')
    frames.extend(range(start, end + 1))

ok = frames == list(range(total))
print(f'total frames: {total} | covered: {len(frames)} | {"OK - exact cover" if ok else "MISMATCH"}')
for i, (start, end) in enumerate(ranges):
    print(f'  part {i}: --frames={start}-{end}')
sys.exit(0 if ok else 1)
