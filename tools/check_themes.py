import glob, json, os

ACCENTS = ['yellow', 'cyan', 'pink', 'green', 'amber', 'violet', 'mint', 'orange']
FONTS = ['montserrat', 'impact', 'trebuchet', 'courier', 'verdana']


def hsh(s):
    h = 2166136261
    for ch in s:
        h = ((h ^ ord(ch)) * 16777619) & 0xFFFFFFFF
    return h


seen = {}
for f in sorted(glob.glob('tools/script*.json')):
    d = json.load(open(f, encoding='utf8'))
    key = d.get('theme') if isinstance(d, dict) else os.path.basename(f)
    h = hsh(key)
    look = (ACCENTS[(h >> 4) % 8], (h >> 7) % 8, FONTS[(h >> 11) % 5])
    seen.setdefault(look, []).append(key)
    print(f'{key:20} hue={h % 360:3} accent={look[0]:8} bg={look[1]} font={look[2]}')

dupes = {k: v for k, v in seen.items() if len(v) > 1}
print('\nidentical looks:', dupes if dupes else 'none')
