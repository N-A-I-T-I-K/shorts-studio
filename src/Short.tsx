import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Captions, Word} from './Captions';
import {OverlayItem, Overlays} from './Overlays';

export type ShortProps = {
  video: string; // file in public/, e.g. clip.mp4
  music?: string; // optional file in public/
  words: Word[];
  overlays: OverlayItem[];
  zoomEverySec: number;
};

export const Short: React.FC<ShortProps> = ({video, music, words, overlays, zoomEverySec}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const period = Math.max(1, Math.round(fps * zoomEverySec));
  const p = frame % period;
  const punch = interpolate(p, [0, 6, period], [1.0, 1.08, 1.0], {extrapolateRight: 'clamp'});
  const push = interpolate(frame, [0, durationInFrames], [1, 1.06]);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${punch * push})`}}>
        <OffthreadVideo src={staticFile(video)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
      <Overlays items={overlays} />
      <Captions words={words} />
      {music ? <Audio src={staticFile(music)} volume={0.12} /> : null}
    </AbsoluteFill>
  );
};
