import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {Theme} from './themes';

const MOTION = [
  {damping: 14, stiffness: 240}, // snap
  {damping: 9, stiffness: 150},  // bounce
  {damping: 22, stiffness: 90},  // glide
  {damping: 8, stiffness: 320},  // punch
];

const useEnter = (lf: number, theme: Theme, delay = 20) => {
  const {fps} = useVideoConfig();
  return spring({frame: Math.max(0, lf - delay), fps, config: MOTION[theme.motion % MOTION.length]});
};

/** Small animated mascot whose shape comes from the theme. */
export const Mascot: React.FC<{lf: number; theme: Theme}> = ({lf, theme}) => {
  const sp = useEnter(lf, theme, 26);
  const bob = Math.sin(lf / 11) * 9;
  const tilt = Math.sin(lf / 17) * 4;
  const blink = Math.sin(lf / 47) > 0.985 ? 0.15 : 1;
  const c = theme.secondary;
  const a = theme.accent;
  const face: React.CSSProperties = {
    position: 'absolute',
    top: 38,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 18,
  };
  const eye: React.CSSProperties = {
    width: 20,
    height: 26,
    borderRadius: 10,
    background: '#06060c',
    boxShadow: `0 0 0 4px ${a}55`,
    transform: `scaleY(${blink})`,
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 36,
        top: 660,
        width: 150,
        height: 170,
        transform: `translateY(${(1 - sp) * 120 + bob}px) rotate(${tilt}deg) scale(${0.7 + 0.3 * sp})`,
        opacity: sp,
        pointerEvents: 'none',
      }}
    >
      {theme.character % 4 === 0 ? (
        <>
          <div style={{position: 'absolute', left: 72, top: 0, width: 5, height: 34, background: a}} />
          <div style={{position: 'absolute', left: 60, top: -10, width: 30, height: 30, borderRadius: '50%', background: a, boxShadow: `0 0 26px ${a}`}} />
          <div style={{position: 'absolute', inset: 30, borderRadius: 34, background: `linear-gradient(150deg, ${c}, #10101e)`, border: `4px solid ${a}88`}}>
            <div style={face}>
              <div style={eye} />
              <div style={eye} />
            </div>
            <div style={{position: 'absolute', bottom: 24, left: '50%', width: 58, height: 8, marginLeft: -29, borderRadius: 4, background: a, opacity: 0.8}} />
          </div>
        </>
      ) : theme.character % 4 === 1 ? (
        <>
          <div style={{position: 'absolute', inset: 22, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${c}, #0b0b18 70%)`, border: `4px solid ${a}aa`, boxShadow: `0 0 44px ${a}55`}}>
            <div style={face}>
              <div style={eye} />
              <div style={eye} />
            </div>
          </div>
          <div style={{position: 'absolute', left: -14, top: 72, width: 180, height: 22, borderRadius: 12, border: `3px solid ${a}66`, transform: 'rotate(-16deg)'}} />
        </>
      ) : theme.character % 4 === 2 ? (
        <>
          <div style={{position: 'absolute', left: 14, top: 12, width: 122, height: 96, borderRadius: '60px 60px 40px 40px', background: `linear-gradient(180deg, ${c}, #0c0c18)`, border: `4px solid ${a}99`}}>
            <div style={{position: 'absolute', top: 34, left: 22, width: 30, height: 38, borderRadius: 16, background: '#05050a'}} />
            <div style={{position: 'absolute', top: 34, right: 22, width: 30, height: 38, borderRadius: 16, background: '#05050a'}} />
          </div>
          <div style={{position: 'absolute', left: 40, top: 108, width: 70, height: 44, borderRadius: 18, background: `${c}cc`, border: `3px solid ${a}77`}} />
        </>
      ) : (
        <>
          <div style={{position: 'absolute', left: 26, top: 34, width: 98, height: 104, borderRadius: 20, background: `linear-gradient(140deg, ${c}, #0d0d1a)`, border: `5px solid ${a}aa`}}>
            <div style={face}>
              <div style={{...eye, width: 16, height: 16, borderRadius: 8}} />
              <div style={{...eye, width: 16, height: 16, borderRadius: 8}} />
            </div>
          </div>
          <div style={{position: 'absolute', left: 0, top: 62, width: 26, height: 46, borderRadius: 10, background: a, opacity: 0.8}} />
          <div style={{position: 'absolute', right: 0, top: 62, width: 26, height: 46, borderRadius: 10, background: a, opacity: 0.8}} />
        </>
      )}
    </div>
  );
};

/** Small theme tag that pops in near the top-right. */
export const ThemeBadge: React.FC<{lf: number; theme: Theme}> = ({lf, theme}) => {
  const sp = useEnter(lf, theme, 8);
  const out = interpolate(lf, [110, 128], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top: 168,
        right: 56,
        padding: '12px 26px',
        borderRadius: 999,
        background: 'rgba(3,5,14,0.72)',
        border: `3px solid ${theme.accent}`,
        color: theme.accent,
        fontFamily: theme.font,
        fontWeight: 900,
        fontSize: 30,
        letterSpacing: 2,
        textTransform: 'uppercase',
        transform: `translateX(${(1 - sp) * 140}px) scale(${0.6 + 0.4 * sp})`,
        opacity: sp * out,
        pointerEvents: 'none',
      }}
    >
      {theme.label}
    </div>
  );
};

/** Glass card frame used behind the big stat. */
export const CardFrame: React.FC<{lf: number; theme: Theme; at?: number}> = ({lf, theme, at = 34}) => {
  const sp = useEnter(lf, theme, at);
  // Leave with the stat text instead of hanging around on an empty screen.
  const out = interpolate(lf, [at + 62, at + 76], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const skin = theme.card % 3;
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 820,
    height: 330,
    left: 130,
    top: 795,
    background: 'rgba(4,6,18,0.62)',
    opacity: sp * out,
    transform: `scale(${0.65 + 0.35 * sp})`,
    pointerEvents: 'none',
  };
  if (skin === 0) {
    return (
      <div style={{...base, borderRadius: 42, border: `5px solid ${theme.accent}aa`, boxShadow: `0 0 70px ${theme.accent}55, inset 0 0 60px ${theme.accent}22`}} />
    );
  }
  if (skin === 1) {
    return (
      <div style={{...base, borderRadius: 10, border: `2px dashed ${theme.secondary}aa`, borderLeft: `16px solid ${theme.accent}`, boxShadow: `0 22px 70px rgba(0,0,0,0.7)`}} />
    );
  }
  return (
    <>
      <div style={{...base, borderRadius: 0, border: `2px solid ${theme.secondary}66`}} />
      {[
        [130, 795], [868, 795], [130, 1092], [868, 1092],
      ].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - 10, top: y - 10, width: 34, height: 34, borderTop: `6px solid ${theme.accent}`, borderLeft: i % 2 ? 'none' : `6px solid ${theme.accent}`, borderRight: i % 2 ? `6px solid ${theme.accent}` : 'none', borderBottom: i > 1 ? `6px solid ${theme.accent}` : 'none', opacity: sp * out}} />
      ))}
    </>
  );
};

/** Small particle burst for the stat hit. */
export const Sparkles: React.FC<{lf: number; theme: Theme; at?: number}> = ({lf, theme, at = 34}) => {
  const g = lf - at;
  if (g < 0 || g > 36) return null;
  const out = interpolate(g, [0, 36], [1, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 16}).map((_, i) => {
        const ang = (i / 16) * Math.PI * 2;
        const r = 40 + g * (7 + (i % 4) * 2);
        const x = 540 + Math.cos(ang) * r * 1.5;
        const y = 960 + Math.sin(ang) * r;
        const size = 8 + (i % 3) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: i % 2 ? 4 : '50%',
              background: i % 3 === 0 ? theme.secondary : theme.accent,
              opacity: out,
              transform: `rotate(${g * 6}deg)`,
              boxShadow: `0 0 20px ${theme.accent}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
