import json, glob, os
new = ['ocean','psychology','blackholes','body','ai','money','time','animals','food','weather']
for name in new:
    f = f'tools/script_{name}.json'
    d = json.load(open(f, encoding='utf8'))
    w = sum(len(s['text'].split()) for s in d['scenes'])
    print(f'{name:12} scenes={len(d["scenes"])} words={w}')
