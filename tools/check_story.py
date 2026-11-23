"""Validate script json before spending a render.
Usage: python tools\\check_story.py [--all | tools\\script_<topic>.json ...]
Exit code 1 if any script has a hard error. Warnings do not block.
"""
import glob
import json
import sys

DEVICES = {
    # 3D
    'network3d', 'email3d', 'packets3d', 'web3d', 'bars3d', 'social3d', 'phone3d', 'globe3d',
    # flat tech
    'network', 'email', 'packets', 'browser', 'graph', 'social', 'mobile', 'globe',
    # cars
    'benz', 'modelt', 'fins', 'compact', 'hybrid', 'ev', 'suv', 'future',
    # phones
    'brick', 'bar', 'flip', 'smart', 'fold',
    # city / games / money
    'citynight', 'topdown', 'jump3d', 'neonmiami', 'rainycity', 'money', 'online', 'compare',
}


def check(path):
    with open(path, encoding='utf-8') as fh:
        d = json.load(fh)
    scenes = d.get('scenes', [])
    errors, warnings = [], []

    if len(scenes) != 8:
        errors.append(f'expected 8 scenes, got {len(scenes)}')
    words = sum(len(s.get('text', '').split()) for s in scenes)
    if not 130 <= words <= 160:
        errors.append(f'narration is {words} words, need 130-160')

    used = {}
    for i, s in enumerate(scenes):
        tag = f'scene {i}'
        year = str(s.get('year', ''))
        if len(year) > 5:
            errors.append(f'{tag}: year "{year}" is longer than 5 chars')
        if len(s.get('title', '').split()) > 4:
            errors.append(f'{tag}: title has more than 4 words')
        device = s.get('device', '')
        if device not in DEVICES:
            errors.append(f'{tag}: unknown device "{device}"')
        used[device] = used.get(device, 0) + 1
        stat_word = s.get('statWord', '').lower()
        if stat_word and stat_word not in s.get('text', '').lower():
            errors.append(f'{tag}: statWord "{stat_word}" not spoken in text')
        if not s.get('photo_query') and not s.get('photo'):
            warnings.append(f'{tag}: no photo_query, photo will be generic')
        if not s.get('stat'):
            warnings.append(f'{tag}: no stat card')

    for device, n in used.items():
        if n > 2:
            errors.append(f'device "{device}" used {n} times (max 2)')

    voice = d.get('voice', '')
    if any(bad in voice for bad in ('_energetic', '_normal')):
        errors.append(f'voice "{voice}" must be a plain Neural name')
    if scenes and not scenes[0].get('hook'):
        warnings.append('first scene has no hook text')
    if scenes and not scenes[-1].get('text', '').rstrip().endswith('?'):
        errors.append('last scene must end with a question')

    ok = not errors
    print(f'{"PASS" if ok else "FAIL"} {path} | {words} words | {len(scenes)} scenes')
    for w in warnings:
        print(f'  WARN  {w}')
    for e in errors:
        print(f'  ERROR {e}')
    return ok


if __name__ == '__main__':
    args = sys.argv[1:]
    files = sorted(glob.glob('tools/script_*.json')) if '--all' in args else args
    if not files:
        print('usage: python tools/check_story.py [--all | tools/script_<topic>.json ...]')
        sys.exit(2)
    results = [check(f) for f in files]
    print(f'\n{sum(results)}/{len(results)} scripts passed')
    sys.exit(0 if all(results) else 1)
