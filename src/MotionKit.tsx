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

/** Music timing helpers. Cheap to compute, no audio decoding needed at render time. */
export const MUSIC_BPM = 128; // matches music_hype.mp3 from tools/make_audio.py
export const beatPulse = (f: number, fps: number, bpm = MUSIC_BPM) => {
  const period = (60 / bpm) * fps;
  return Math.pow(1 - (f % period) / period, 4);
};

/** Small animated mascot whose shape comes from the theme. */
export const Mascot: React.FC<{lf: number; theme: Theme; energy?: number; shock?: number}> = ({lf, theme, energy = 0, shock = 0}) => {
  const sp = useEnter(lf, theme, 26);
  const bob = Math.sin(lf / 11) * 9 - energy * 62; // jumps on the big number
  const tilt = Math.sin(lf / 17) * 4 + shock * 9;
  const blink = shock > 0.25 ? 1.35 : Math.sin(lf / 47) > 0.985 ? 0.15 : 1;
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
    boxShadow: `0 0 0 4px ${a}55, 0 0 ${shock > 0.25 ? 22 : 0}px ${a}`,
    transform: `scale(${1 + shock * 0.2}, ${blink})`,
  };

  return (
    <div
      style={{
        position: 'absolute',
        right: 36,
        top: 660,
        width: 150,
        height: 170,
        transform: `translateY(${(1 - sp) * 120 + bob}px) rotate(${tilt}deg) scale(${0.7 + 0.3 * sp + energy * 0.14})`,
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

/** Beat-synced rails and a corner flare that changes every 2 seconds. No blur filters. */
export const BeatGlow: React.FC<{f: number; theme: Theme}> = ({f, theme}) => {
  const {fps} = useVideoConfig();
  const p = beatPulse(f, fps);
  const slot = Math.floor(f / (2 * fps)) % 3;
  const color = slot === 0 ? theme.accent : slot === 1 ? theme.secondary : theme.accent;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 762, height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.12 + p * 0.55}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1134, height: 3, background: `linear-gradient(90deg, transparent, ${theme.secondary}, transparent)`, opacity: 0.1 + p * 0.45}} />
      <div style={{position: 'absolute', right: -100, top: -120, width: 620, height: 620, background: `radial-gradient(circle, ${color}30, transparent 70%)`, opacity: 0.3 + p * 0.35}} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: 96 + i * 30, top: 84, width: i === slot ? 18 : 9, height: 9,
            borderRadius: 5, background: i === slot ? color : 'rgba(255,255,255,0.35)',
            boxShadow: i === slot ? `0 0 18px ${color}` : 'none',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** One small 3D-looking hero object in a glowing corner. Vector only, so cloud rendering stays fast. */
export const HeroObject: React.FC<{f: number; theme: Theme; hero?: string}> = ({f, theme, hero = 'rocket'}) => {
  const kind = hero === 'planet' ? 'planet' : hero === 'coin' ? 'coin' : 'rocket';
  const float = Math.sin(f / 27) * 10;
  const spin = Math.sin(f / 70) * 10;
  const a = theme.accent;
  const c = theme.secondary;
  const gid = `hero-${theme.id}`;
  return (
    <div
      style={{
        position: 'absolute', left: 30, top: 646, width: 200, height: 220,
        transform: `translateY(${float}px) rotate(${spin}deg)`, pointerEvents: 'none',
      }}
    >
      <div style={{position: 'absolute', inset: -34, background: `radial-gradient(circle, ${a}33, transparent 68%)`}} />
      <svg width="200" height="220" viewBox="0 0 200 220">
        <defs>
          <linearGradient id={`${gid}-body`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={c} />
            <stop offset="1" stopColor="#0a0a16" />
          </linearGradient>
          <linearGradient id={`${gid}-fire`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3b0" />
            <stop offset="0.5" stopColor={a} />
            <stop offset="1" stopColor="#ff4d2e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {kind === 'rocket' ? (
          <>
            <path d="M100 18 L126 70 L74 70 Z" fill={a} />
            <path d="M74 70 Q100 52 126 70 L134 160 Q100 182 66 160 Z" fill={`url(#${gid}-body)`} stroke={a} strokeWidth="4" />
            <path d="M66 122 L36 176 L70 160 Z" fill={c} stroke={a} strokeWidth="3" />
            <path d="M134 122 L164 176 L130 160 Z" fill={c} stroke={a} strokeWidth="3" />
            <circle cx="100" cy="96" r="20" fill="#05050c" stroke={a} strokeWidth="5" />
            <path d={`M84 168 Q100 ${206 + (f % 12)} 116 168 Z`} fill={`url(#${gid}-fire)`} />
          </>
        ) : kind === 'planet' ? (
          <>
            <circle cx="100" cy="104" r="62" fill={`url(#${gid}-body)`} stroke={a} strokeWidth="5" />
            <ellipse cx="100" cy="104" rx="96" ry="26" fill="none" stroke={c} strokeWidth="8" transform="rotate(-18 100 104)" />
            <circle cx="78" cy="84" r="9" fill={`${a}88`} />
          </>
        ) : (
          <>
            <circle cx="100" cy="106" r="64" fill={`url(#${gid}-body)`} stroke={a} strokeWidth="7" />
            <circle cx="100" cy="106" r="48" fill="none" stroke={c} strokeWidth="4" />
            <path d="M108 70 L86 110 L102 110 L92 144 L120 98 L102 98 Z" fill={a} />
          </>
        )}
      </svg>
    </div>
  );
};

/** Draws a live bar chart, line graph or route when the narration hits a number. */
export const DataMoment: React.FC<{lf: number; at: number; theme: Theme; kind: number}> = ({lf, at, theme, kind}) => {
  if (lf < at - 2 || lf > at + 82) return null;
  const p = interpolate(lf, [at, at + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const out = interpolate(lf, [at + 62, at + 76], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const a = theme.accent;
  const c = theme.secondary;
  const wrap: React.CSSProperties = {
    position: 'absolute', left: '50%', top: 1146, transform: 'translateX(-50%)',
    width: 520, height: 150, opacity: out, pointerEvents: 'none',
  };
  const k = ((kind % 3) + 3) % 3;
  if (k === 0) {
    return (
      <div style={wrap}>
        {[0, 1, 2, 3, 4].map((i) => {
          const h = (34 + (i % 3) * 32) * p;
          return (
            <div key={i} style={{position: 'absolute', bottom: 0, left: 20 + i * 100, width: 62, height: 108, background: 'rgba(255,255,255,0.08)', borderRadius: 8}}>
              <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: h, borderRadius: 8, background: i === 4 ? a : c, boxShadow: `0 0 18px ${a}66`}} />
            </div>
          );
        })}
      </div>
    );
  }
  if (k === 1) {
    return (
      <svg style={wrap} viewBox="0 0 520 150">
        <polyline points="10,130 100,90 190,102 280,46 370,62 460,12" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="6" />
        <polyline points="10,130 100,90 190,102 280,46 370,62 460,12" fill="none" stroke={a} strokeWidth="6"
          strokeDasharray="700" strokeDashoffset={700 * (1 - p)} strokeLinecap="round" />
        <circle cx="460" cy="12" r={7 + p * 6} fill={c} />
      </svg>
    );
  }
  return (
    <svg style={wrap} viewBox="0 0 520 150">
      <path d="M30 110 Q140 20 250 96 T490 38" fill="none" stroke={`${a}55`} strokeWidth="8" strokeDasharray="14 12" />
      {[30, 140, 250, 370, 490].map((x, i) => {
        const y = [110, 52, 96, 74, 38][i];
        const show = p > i / 5;
        return <circle key={i} cx={x} cy={y} r={show ? 12 : 0} fill={i === 4 ? a : c} />;
      })}
    </svg>
  );
};
