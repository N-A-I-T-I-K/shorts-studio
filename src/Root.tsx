import React from 'react';
import {Composition, staticFile} from 'remotion';
import {Short, ShortProps} from './Short';
import {Story, StoryProps} from './Story';

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Short"
      component={Short}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 10}
      defaultProps={{video: 'clip.mp4', words: [], overlays: [], zoomEverySec: 5} as ShortProps}
      calculateMetadata={async ({props}: {props: ShortProps}) => {
        const words = await fetch(staticFile('words.json')).then((r) => r.json());
        const cfg = await fetch(staticFile('overlays.json')).then((r) => r.json());
        const dur = cfg.durationSec ?? (words.length ? words[words.length - 1].end + 0.5 : 10);
        return {
          durationInFrames: Math.round(dur * FPS),
          props: {...props, words, overlays: cfg.items ?? []},
        };
      }}
    />
    <Composition
      id="Story"
      component={Story}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 10}
      defaultProps={{scenes: []} as StoryProps}
      calculateMetadata={async ({props}: {props: StoryProps}) => {
        const data = await fetch(staticFile('story.json')).then((r) => r.json());
        return {
          durationInFrames: Math.round(data.totalSec * FPS),
          props: {...props, scenes: data.scenes, music: data.music ?? null, sfx: data.sfx ?? null, sfxPack: data.sfxPack ?? null},
        };
      }}
    />
  </>
);
