"""Paste this ENTIRE file into ONE Kaggle code cell and Run. No notebook import needed.
Set Internet: On in Kaggle's right sidebar before running.
"""
import json
import os
import shutil
import subprocess
import time

SCRIPT = 'script_rocket_fire'   # any tools/script_*.json
CONCURRENCIES = [4]             # try [2, 4, 8] to compare render speeds
REPO = '/kaggle/working/shorts-studio'
NODE_TAR = 'node-v20.19.0-linux-x64'
NODE_DIR = f'/kaggle/working/{NODE_TAR}/bin'
SUDO = '' if os.geteuid() == 0 else 'sudo '

os.environ['PATH'] = NODE_DIR + ':' + os.environ['PATH']
TIMINGS = {}


def timed(name, cmd, cwd=None):
    print(f'\n=== {name} ===')
    print(f'$ {cmd}')
    t0 = time.time()
    r = subprocess.run(cmd, shell=True, cwd=cwd, executable='/bin/bash')
    dt = time.time() - t0
    TIMINGS[name] = TIMINGS.get(name, 0) + dt
    print(f'--- {name}: {dt:.1f}s (exit {r.returncode}) ---')
    if r.returncode != 0:
        raise RuntimeError(f'{name} failed with exit {r.returncode}')
    return dt


# 1. Node 20
if not os.path.exists(f'{NODE_DIR}/node'):
    timed('install Node 20',
          f'cd /kaggle/working && curl -fsSLO https://nodejs.org/dist/v20.19.0/{NODE_TAR}.tar.xz && tar -xf {NODE_TAR}.tar.xz')
os.environ['PATH'] = NODE_DIR + ':' + os.environ['PATH']
print('node:', subprocess.check_output(['node', '-v'], text=True).strip())
print('npm :', subprocess.check_output(['npm', '-v'], text=True).strip())

# 2. ffmpeg + edge-tts
if not shutil.which('ffmpeg'):
    timed('install ffmpeg', f'{SUDO}apt-get update -qq && {SUDO}apt-get install -y -qq ffmpeg')
timed('pip edge-tts', 'pip install -q edge-tts')
print('ffmpeg:', subprocess.check_output(['ffmpeg', '-version'], text=True).splitlines()[0])

# 3. Repo
if not os.path.isdir(REPO):
    timed('clone repo', f'git clone -q https://github.com/N-A-I-T-I-K/shorts-studio.git {REPO}')
os.chdir(REPO)
print('repo ready at', os.getcwd())

# 4-6. Build pipeline
timed('npm ci', 'npm ci', cwd=REPO)
timed('fetch photos', f'python tools/fetch_assets.py tools/{SCRIPT}.json', cwd=REPO)
timed('build story', f'python tools/build_story.py tools/{SCRIPT}.json', cwd=REPO)

with open('public/story.json', encoding='utf8') as fh:
    d = json.load(fh)
print('duration:', d['totalSec'], 's | words:',
      sum(len(s['words']) for s in d['scenes']), '| photos:',
      sum(len(s['photos']) for s in d['scenes']))

# 7. Render benchmark
for c in CONCURRENCIES:
    out = f'out/{SCRIPT}_c{c}.mp4'
    timed(f'render c={c}',
          f'npx remotion render StoryFlow {out} --gl=swangle --concurrency={c}',
          cwd=REPO)

# 8. Speed report
print('\n' + '=' * 40)
print('SPEED SUMMARY')
print('=' * 40)
for name, secs in TIMINGS.items():
    print(f'{name:<22} {secs:>8.1f}s')
print(f'{"TOTAL":<22} {sum(TIMINGS.values()):>8.1f}s')

best = min(CONCURRENCIES, key=lambda c: TIMINGS.get(f'render c={c}', 1e9))
video = f'{REPO}/out/{SCRIPT}_c{best}.mp4'
print('\nfastest render: concurrency', best)
print('video:', video)

try:
    from IPython.display import Video, FileLink, display
    display(Video(video, width=360))
    display(FileLink(video))
except ImportError:
    print('(run inside Kaggle/Jupyter to see the embedded video)')
