import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type DeviceType = 'brick' | 'bar' | 'flip' | 'smart' | 'fold';

const shell = {
  boxSizing: 'border-box',
  background: '#1a1a1a',
  border: '10px solid #3a3a3a',
  boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
} as const;

const Keypad: React.FC<{rows: number}> = ({rows}) => (
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, padding: '0 30px'}}>
    {Array.from({length: rows * 3}).map((_, i) => (
      <div key={i} style={{height: 36, borderRadius: 12, background: '#555'}} />
    ))}
  </div>
);

const APP_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308'];

const Apps: React.FC<{cols: number; rows: number}> = ({cols, rows}) => (
  <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 18, padding: 24}}>
    {Array.from({length: cols * rows}).map((_, i) => (
      <div key={i} style={{aspectRatio: '1', borderRadius: 16, background: APP_COLORS[i % APP_COLORS.length]}} />
    ))}
  </div>
);

const SmartScreen: React.FC<{width: number; height: number; rows: number}> = ({width, height, rows}) => (
  <div style={{...shell, width, height, borderRadius: 60, position: 'relative', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#0ea5e9,#6d28d9)'}} />
    <div style={{position: 'absolute', top: 16, left: '50%', width: 90, height: 24, marginLeft: -45, borderRadius: 14, background: '#000'}} />
    <div style={{position: 'relative', paddingTop: 70}}>
      <Apps cols={4} rows={rows} />
    </div>
  </div>
);

const Body: React.FC<{type: DeviceType}> = ({type}) => {
  if (type === 'brick') {
    return (
      <div style={{...shell, position: 'relative', width: 270, height: 700, borderRadius: 36, paddingTop: 70, background: '#2b2b2b'}}>
        <div style={{position: 'absolute', top: -90, left: 34, width: 32, height: 100, borderRadius: 12, background: '#222'}} />
        <div style={{margin: '0 34px 44px', height: 100, borderRadius: 8, background: '#9bbf8a'}} />
        <Keypad rows={7} />
      </div>
    );
  }
  if (type === 'bar') {
    return (
      <div style={{...shell, width: 300, height: 620, borderRadius: 44, paddingTop: 50}}>
        <div style={{margin: '0 30px 36px', height: 170, borderRadius: 14, background: '#8fd3c8'}} />
        <Keypad rows={4} />
      </div>
    );
  }
  if (type === 'flip') {
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
        <div style={{...shell, width: 380, height: 270, borderRadius: 40, padding: 24}}>
          <div style={{height: '100%', borderRadius: 18, background: '#7dd3fc'}} />
        </div>
        <div style={{...shell, width: 380, height: 270, borderRadius: 40, paddingTop: 28}}>
          <Keypad rows={4} />
        </div>
      </div>
    );
  }
  if (type === 'smart') {
    return <SmartScreen width={380} height={780} rows={6} />;
  }
  return (
    <div style={{display: 'flex', gap: 6}}>
      <SmartScreen width={300} height={780} rows={6} />
      <SmartScreen width={300} height={780} rows={6} />
    </div>
  );
};

export const Device: React.FC<{type: DeviceType}> = ({type}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 110}});
  const float = Math.sin(f / 18) * 14;
  return (
    <div
      style={{
        paddingTop: 90,
        transform: `translateY(${(1 - s) * 400 + float}px) rotate(${(1 - s) * -12}deg)`,
        opacity: Math.min(1, s * 2),
      }}
    >
      <Body type={type} />
    </div>
  );
};
