import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type Word = {text: string; start: number; end: number};

const CHUNK = 3; // words shown at once

export const Captions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  let i = -1;
  for (let k = 0; k < words.length; k++) {
    if (words[k].start <= t) i = k;
    else break;
  }
  if (i < 0 || t > words[i].end + 0.6) return null; // hide during long silence

  const chunkStart = Math.floor(i / CHUNK) * CHUNK;
  const visible = words.slice(chunkStart, chunkStart + CHUNK);

  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: '76%',
          transform: 'translateY(-50%)',
          width: '90%',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        {visible.map((w, j) => {
          const idx = chunkStart + j;
          const active = idx === i;
          const sp = spring({
            frame: frame - Math.round(w.start * fps),
            fps,
            config: {damping: 12, stiffness: 220},
          });
          const scale = interpolate(sp, [0, 1], [0.7, 1]);
          return (
            <span
              key={idx}
              style={{
                fontFamily: 'Montserrat, "Arial Black", Arial, sans-serif',
                fontWeight: 900,
                fontSize: 88,
                textTransform: 'uppercase',
                color: active ? '#FFE600' : '#FFFFFF',
                WebkitTextStroke: '10px #000',
                paintOrder: 'stroke fill',
                textShadow: '0 6px 0 rgba(0,0,0,0.6)',
                transform: `scale(${active ? scale : 1})`,
                display: 'inline-block',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
