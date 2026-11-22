import glob, json, os

for f in sorted(glob.glob('tools/script*.json')):
    d = json.load(open(f, encoding='utf8'))
    scenes = d['scenes'] if isinstance(d, dict) else d
    words = sum(len(s['text'].split()) for s in scenes)
    theme = d.get('theme') if isinstance(d, dict) else None
    photos = sum(1 for s in scenes if s.get('photo_query'))
    flag = '' if (len(scenes) == 8 and 130 <= words <= 160 and theme and photos == 8) else '  <-- CHECK'
    print(f'{os.path.basename(f):28} scenes={len(scenes)} words={words:3} photos={photos} theme={theme}{flag}')
