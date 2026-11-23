import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type Word = {text: string; start: number; end: number};

const CHUNK = 3; // words shown at once

export const Captions: React.FC<{words: Word[]; accent?: string; font?: string; karaoke?: boolean}> = ({words, accent = '#FFE600', font = 'Montserrat, "Arial Black", Arial, sans-serif', karaoke = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  let i = -1;
  for (let k = 0; k < words.length; k++) {
    if (words[k].start <= t) i = k;
    else break;
  }
  if (i < 0 || t > words[i].end + 0.6) return null; // hide during long silence

  if (karaoke) {
    // One spoken word at a time: neon pop, then clear for the next word.
    const w = words[i];
    const sp = spring({frame: frame - Math.round(w.start * fps), fps, config: {damping: 11, stiffness: 260}});
    const pop = interpolate(sp, [0, 1], [0.55, 1]);
    const lift = interpolate(sp, [0, 1], [26, 0]);
    const vis = interpolate(t, [w.start, w.start + 0.08, w.end + 0.05, w.end + 0.24], [0, 1, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div
          style={{
            position: 'absolute',
            top: '72%',
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: font,
            fontWeight: 900,
            fontSize: 150,
            lineHeight: '150px',
            textTransform: 'uppercase',
            color: accent,
            WebkitTextStroke: '12px #000',
            paintOrder: 'stroke fill',
            // Cheap stacked glow - no blur filter, so cloud render stays fast.
            textShadow: `0 0 14px ${accent}, 0 0 42px ${accent}, 0 9px 0 rgba(0,0,0,0.7)`,
            opacity: vis,
            transform: `translateY(${lift}px) scale(${pop})`,
          }}
        >
          {w.text}
        </div>
        <div
          style={{
            position: 'absolute',
            top: '81.5%',
            left: '50%',
            width: 180 * pop,
            height: 6,
            marginLeft: -90 * pop,
            borderRadius: 3,
            background: accent,
            boxShadow: `0 0 20px ${accent}`,
            opacity: vis * 0.9,
          }}
        />
      </AbsoluteFill>
    );
  }

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
                fontFamily: font,
                fontWeight: 900,
                fontSize: 88,
                textTransform: 'uppercase',
                color: active ? accent : '#FFFFFF',
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
