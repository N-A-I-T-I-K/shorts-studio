import json
names = ['sleep','mars','volcanoes','dinosaurs','music','color','germs','electricity','trees','laughter']
for name in names:
    f = f'tools/script_{name}.json'
    d = json.load(open(f, encoding='utf8'))
    w = sum(len(s['text'].split()) for s in d['scenes'])
    print(f'{name:12} scenes={len(d["scenes"])} words={w}')
