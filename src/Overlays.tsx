import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type OverlayItem = {
  type: 'badge' | 'code' | 'counter' | 'progress' | 'confetti';
  from: number; // seconds
  to: number; // seconds
  text?: string;
  label?: string;
  value?: number; // counter target
  total?: number; // progress total
};

const FONT = 'Montserrat, "Arial Black", Arial, sans-serif';

const Pop: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 180}});
  return (
    <div style={{transform: `translateY(${(1 - s) * -60}px) scale(${0.85 + 0.15 * s})`, opacity: s}}>
      {children}
    </div>
  );
};

const Badge: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div
      style={{
        background: '#E11D48',
        color: '#fff',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 56,
        padding: '22px 44px',
        borderRadius: 28,
        boxShadow: '0 12px 0 rgba(0,0,0,0.35)',
        textTransform: 'uppercase',
      }}
    >
      {text}
    </div>
  </div>
);

const Code: React.FC<{text: string}> = ({text}) => {
  const f = useCurrentFrame();
  const shown = text.slice(0, Math.floor(f * 1.2));
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 260,
        background: '#0d1117',
        border: '3px solid #30363d',
        borderRadius: 24,
        padding: 36,
        color: '#7ee787',
        fontFamily: 'Consolas, "Courier New", monospace',
        fontSize: 44,
        whiteSpace: 'pre-wrap',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {'> '}
      {shown}
    </div>
  );
};

const Counter: React.FC<{value: number; label?: string}> = ({value, label}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [0, 45], [0, value], {
    extrapolateRight: 'clamp',
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  return (
    <div style={{position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center', fontFamily: FONT}}>
      <div style={{fontSize: 150, fontWeight: 900, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>
        {Math.round(v).toLocaleString('en-US')}
      </div>
      {label ? <div style={{fontSize: 56, fontWeight: 800, color: '#FFE600', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill'}}>{label}</div> : null}
    </div>
  );
};

const Progress: React.FC<{len: number; total: number}> = ({len, total}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, len], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 60, left: 60, right: 60, fontFamily: FONT}}>
      <div style={{height: 24, background: 'rgba(255,255,255,0.25)', borderRadius: 12, overflow: 'hidden'}}>
        <div style={{width: `${p * 100}%`, height: '100%', background: '#22c55e'}} />
      </div>
      <div style={{marginTop: 12, color: '#fff', fontWeight: 800, fontSize: 40, WebkitTextStroke: '5px #000', paintOrder: 'stroke fill'}}>
        {Math.round(p * total).toLocaleString('en-US')} / {total.toLocaleString('en-US')}
      </div>
    </div>
  );
};

const Confetti: React.FC = () => {
  const f = useCurrentFrame();
  const colors = ['#FFE600', '#E11D48', '#22c55e', '#3b82f6', '#f97316'];
  return (
    <AbsoluteFill>
      {Array.from({length: 60}).map((_, i) => {
        const x = random(`x${i}`) * 1080;
        const speed = 8 + random(`s${i}`) * 14;
        const y = ((f * speed + random(`y${i}`) * 600) % 2100) - 100;
        const rot = f * (4 + random(`r${i}`) * 10);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 18,
              height: 30,
              background: colors[i % colors.length],
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Overlays: React.FC<{items: OverlayItem[]}> = ({items}) => {
  const {fps} = useVideoConfig();
  return (
    <>
      {items.map((o, i) => {
        const len = Math.max(1, Math.round((o.to - o.from) * fps));
        return (
          <Sequence key={i} from={Math.round(o.from * fps)} durationInFrames={len}>
            {o.type === 'badge' && <Pop><Badge text={o.text ?? ''} /></Pop>}
            {o.type === 'code' && <Pop><Code text={o.text ?? ''} /></Pop>}
            {o.type === 'counter' && <Pop><Counter value={o.value ?? 0} label={o.label} /></Pop>}
            {o.type === 'progress' && <Progress len={len} total={o.total ?? 100} />}
            {o.type === 'confetti' && <Confetti />}
          </Sequence>
        );
      })}
    </>
  );
};
