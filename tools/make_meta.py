"""Generate YouTube Shorts packaging text from a script json.
Usage: python tools\\make_meta.py tools\\script_<topic>.json
       python tools\\make_meta.py --all
Writes out\\meta_<topic>.txt (thumbnail, title, description, pinned comment).
No API keys, no network, no video code — pure text from the script itself.
"""
import glob
import json
import os
import sys


def make(path):
    with open(path, encoding='utf-8') as fh:
        data = json.load(fh)
    scenes = data['scenes']
    name = os.path.basename(path).replace('script_', '').replace('.json', '')

    hook = next((s['hook'] for s in scenes if s.get('hook')), '')
    first = scenes[0]
    last = scenes[-1]
    stats = [s['stat'] for s in scenes if s.get('stat') and s['stat'] not in ('NEXT',)]

    title = (hook or f"{stats[0]} {first.get('statLabel', '')}").strip()
    if len(title) > 100:
        title = title[:97].rstrip() + '...'
    if '#shorts' not in title.lower():
        title = f'{title} #shorts'

    # Thumbnail: at most 5 words so it stays readable on a phone.
    thumb = ' '.join((hook or first['title']).split()[:5]).upper()

    question = last['text'].strip()
    arc = '  '.join(f"{s['year']}: {s['title']}" for s in scenes[1:-1] if s.get('year'))

    blob = ' '.join(s.get('text', '') + ' ' + s.get('title', '') for s in scenes).lower()
    if any(k in blob for k in ('rocket', 'space', 'orbit', 'moon', 'star')):
        tags = '#shorts #space #rockets #science'
    elif any(k in blob for k in ('internet', 'computer', 'phone', 'web')):
        tags = '#shorts #technology #history #facts'
    else:
        tags = '#shorts #facts #history #didyouknow'

    description = '\n'.join([
        hook or first['text'].strip(),
        '',
        arc,
        '',
        question,
        '',
        tags,
    ])
    pinned = question + '\nI read every answer. 👇'

    os.makedirs('out', exist_ok=True)
    out = os.path.join('out', f'meta_{name}.txt')
    with open(out, 'w', encoding='utf-8') as fh:
        fh.write(
            f'THUMBNAIL TEXT\n{thumb}\n\n'
            f'TITLE\n{title}\n\n'
            f'DESCRIPTION\n{description}\n\n'
            f'PINNED COMMENT\n{pinned}\n'
        )
    print(f'wrote {out} | title {len(title)} chars | thumb "{thumb}"')
    return out


if __name__ == '__main__':
    args = sys.argv[1:]
    files = sorted(glob.glob('tools/script_*.json')) if args and args[0] == '--all' else args
    if not files:
        print('usage: python tools/make_meta.py [--all | tools/script_<topic>.json ...]')
        sys.exit(2)
    for f in files:
        make(f)
