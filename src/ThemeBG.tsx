import React from 'react';
import {AbsoluteFill, random} from 'remotion';

type Props = {
  seed: number;
  variant: number;
  accent: string;
  lf: number;
};

const wrap: React.CSSProperties = {position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'};

/** Eight deterministic, lightweight motion backgrounds. One is picked per theme. */
export const ThemeBG: React.FC<Props> = ({seed, variant, accent, lf}) => {
  const f = lf;
  const v = ((variant % 8) + 8) % 8;

  if (v === 0) {
    // Floating orbs
    return (
      <AbsoluteFill style={wrap}>
        {Array.from({length: 16}).map((_, i) => {
          const rx = random(`orbx${seed}-${i}`);
          const ry = random(`orby${seed}-${i}`);
          const rs = random(`orbs${seed}-${i}`);
          const size = 160 + rs * 340;
          const x = ((rx * 1400 + f * (0.5 + ry * 1.1)) % 1400) - 170;
          const y = ((((ry * 2200 - f * (0.7 + rx * 1.3)) % 2200) + 2200) % 2200) - 180;
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
                background: `radial-gradient(circle, ${accent}33, transparent 70%)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (v === 1) {
    // Perspective grid + falling data columns
    return (
      <AbsoluteFill style={wrap}>
        <div
          style={{
            position: 'absolute',
            inset: '-40%',
            backgroundImage: `linear-gradient(${accent}22 1px, transparent 1px), linear-gradient(90deg, ${accent}22 1px, transparent 1px)`,
            backgroundSize: '70px 70px',
            transform: `perspective(700px) rotateX(58deg) translateY(${(f * 1.6) % 70}px)`,
            opacity: 0.7,
          }}
        />
        {Array.from({length: 9}).map((_, i) => {
          const rx = random(`col${seed}-${i}`);
          const speed = 3 + rx * 7;
          const y = ((f * speed + rx * 1800) % 1900) - 200;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 60 + i * 115,
                top: y,
                width: 3,
                height: 120 + rx * 180,
                background: `linear-gradient(transparent, ${accent}aa, transparent)`,
                opacity: 0.6,
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (v === 2) {
    // Diagonal light beams
    return (
      <AbsoluteFill style={wrap}>
        {Array.from({length: 9}).map((_, i) => {
          const r = random(`beam${seed}-${i}`);
          const x = ((r * 1800 + f * (2 + r * 3)) % 1800) - 400;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: -300,
                width: 18 + r * 44,
                height: 2600,
                background: `linear-gradient(90deg, transparent, ${accent}26, transparent)`,
                transform: 'rotate(24deg)',
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (v === 3) {
    // Concentric pulsing rings
    return (
      <AbsoluteFill style={wrap}>
        {Array.from({length: 7}).map((_, i) => {
          const size = 220 + i * 200 + (f * 0.7) % 200;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '52%',
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                borderRadius: '50%',
                border: `2px solid ${accent}2e`,
                boxShadow: `0 0 40px ${accent}18`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (v === 4) {
    // Rising embers
    return (
      <AbsoluteFill style={wrap}>
        {Array.from({length: 40}).map((_, i) => {
          const rx = random(`emx${seed}-${i}`);
          const ry = random(`emy${seed}-${i}`);
          const rs = random(`ems${seed}-${i}`);
          const x = rx * 1080 + Math.sin((f + i * 17) / 26) * 34;
          const y = (((ry * 1920 - f * (0.7 + rs * 2.4)) % 1920) + 1920) % 1920;
          const size = 3 + rs * 9;
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
                background: accent,
                opacity: 0.15 + rs * 0.5,
                boxShadow: `0 0 16px ${accent}`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (v === 5) {
    // Star field
    return (
      <AbsoluteFill style={wrap}>
        {Array.from({length: 70}).map((_, i) => {
          const rx = random(`stx${seed}-${i}`);
          const ry = random(`sty${seed}-${i}`);
          const rs = random(`sts${seed}-${i}`);
          const tw = 0.3 + 0.7 * Math.abs(Math.sin((f + i * 9) / (12 + rs * 22)));
          const size = 1 + rs * 4;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: rx * 1080,
                top: ry * 1920,
                width: size,
                height: size,
                borderRadius: '50%',
                background: i % 5 === 0 ? accent : '#ffffff',
                opacity: tw * (i % 5 === 0 ? 0.9 : 0.5),
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  if (v === 6) {
    // Wave bands
    return (
      <AbsoluteFill style={wrap}>
        {Array.from({length: 10}).map((_, i) => {
          const y = 260 + i * 165 + Math.sin((f + i * 26) / 34) * 46;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: -300,
                top: y,
                width: 1700,
                height: 2 + (i % 3),
                background: `linear-gradient(90deg, transparent, ${accent}38, transparent)`,
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  }

  // Dotted matrix
  return (
    <AbsoluteFill style={wrap}>
      <div
        style={{
          position: 'absolute',
          inset: -30,
          backgroundImage: `radial-gradient(${accent}44 2px, transparent 2.5px)`,
          backgroundSize: '44px 44px',
          transform: `translateY(${(f * 0.6) % 44}px)`,
          opacity: 0.75,
        }}
      />
      {Array.from({length: 6}).map((_, i) => {
        const r = random(`scan${seed}-${i}`);
        const y = ((f * (1.5 + r * 2) + r * 1900) % 1900) - 100;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: 1080,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${accent}77, transparent)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
