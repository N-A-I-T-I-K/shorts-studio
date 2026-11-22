import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

export const SpeedLines: React.FC<{lf: number; n?: number}> = ({lf, n = 22}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: n}).map((_, i) => {
      const r = random(`sl${i}`);
      const r2 = random(`sy${i}`);
      const r3 = random(`sw${i}`);
      const w = 260 + r3 * 520;
      const speed = 40 + r * 50;
      const x = 1200 - ((lf * speed + r * 3200) % 3200);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: 380 + r2 * 900,
            width: w,
            height: 3 + r3 * 6,
            opacity: 0.12 + r * 0.2,
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9))',
          }}
        />
      );
    })}
  </AbsoluteFill>
);

export const Road: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 1035, height: 170, background: 'rgba(10,15,30,0.75)'}} />
    {Array.from({length: 9}).map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 1115,
          height: 12,
          width: 100,
          left: i * 160 - ((lf * 34) % 160),
          background: 'rgba(255,255,255,0.8)',
          borderRadius: 6,
        }}
      />
    ))}
  </AbsoluteFill>
);

export const Sweep: React.FC<{lf: number}> = ({lf}) => {
  const x = interpolate(lf, [8, 40], [-700, 1500], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: x,
          width: 260,
          height: 2400,
          transform: 'rotate(18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.35), rgba(255,255,255,0))',
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
    }}
  />
);

export const Flash: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: '#fff',
      opacity: interpolate(lf, [0, 7], [0.75, 0], {extrapolateRight: 'clamp'}),
    }}
  />
);

export const Ring: React.FC<{lf: number}> = ({lf}) => {
  const size = interpolate(lf, [0, 22], [100, 2000], {extrapolateRight: 'clamp'});
  const op = interpolate(lf, [0, 22], [0.7, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 540 - size / 2,
          top: 820 - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          border: '14px solid rgba(255,255,255,0.9)',
          opacity: op,
        }}
      />
    </AbsoluteFill>
  );
};

export const DataRain: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
    {Array.from({length: 14}).map((_, i) => {
      const speed = 3 + random(`dr${i}`) * 5;
      const chars = Array.from({length: 16})
        .map((_, k) => (random(`dc${i}-${k}`) > 0.5 ? '1' : '0'))
        .join('\n');
      const y = ((lf * speed + random(`dy${i}`) * 2400) % 2800) - 500;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 20 + i * 76,
            top: y,
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: 34,
            lineHeight: '42px',
            whiteSpace: 'pre',
            color: 'rgba(125,211,252,0.22)',
            textAlign: 'center',
          }}
        >
          {chars}
        </div>
      );
    })}
  </AbsoluteFill>
);

export const GridBG: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      backgroundImage:
        'linear-gradient(rgba(125,211,252,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(125,211,252,0.07) 2px, transparent 2px)',
      backgroundSize: '120px 120px',
      backgroundPosition: `0px ${lf * 2}px`,
    }}
  />
);

export const Particles: React.FC<{lf: number; seed: number; color?: string; count?: number}> = ({
  lf,
  seed,
  color = 'rgba(255,230,0,0.6)',
  count = 30,
}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: count}).map((_, i) => {
        const r = random(`p${seed}-${i}`);
        const r2 = random(`p2${seed}-${i}`);
        const r3 = random(`p3${seed}-${i}`);
        const size = 4 + r3 * 12;
        const speed = 80 + r * 120;
        const x = ((r * 1200 + lf * speed) % 1400) - 100;
        const y = ((r2 * 2000 - lf * speed * 0.7) % 2200) - 100;
        const opacity = 0.3 + r2 * 0.5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              opacity: opacity * (1 - Math.min(1, lf / (fps * 8))),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const GlowOrbs: React.FC<{lf: number; seed: number}> = ({lf, seed}) => {
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 6}).map((_, i) => {
        const r = random(`orb${seed}-${i}`);
        const r2 = random(`orb2${seed}-${i}`);
        const size = 100 + r * 300;
        const x = 100 + r * 880;
        const y = 200 + r2 * 1400;
        const pulse = Math.sin(lf / 12 + i * 2) * 0.3 + 0.7;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,230,0,${0.15 * pulse}), rgba(255,100,50,${0.08 * pulse}), transparent)`,
              filter: 'blur(60px)',
              opacity: 0.6 + pulse * 0.3,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const CinematicBars: React.FC<{lf: number}> = ({lf}) => {
  const barHeight = interpolate(lf, [0, 15], [180, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          background: '#000',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          background: '#000',
        }}
      />
    </AbsoluteFill>
  );
};

export const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015), rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
      opacity: 0.4,
    }}
  />
);

export const ChromaticAberration: React.FC<{lf: number}> = ({lf}) => {
  const offset = Math.sin(lf * 0.8) * interpolate(lf, [0, 10], [6, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: 0.3}}>
      <div
        style={{
          position: 'absolute',
          inset: -offset,
          background: 'linear-gradient(90deg, rgba(255,0,80,0.15), transparent 50%, rgba(0,220,255,0.15))',
        }}
      />
    </AbsoluteFill>
  );
};