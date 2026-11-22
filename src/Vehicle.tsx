import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

export type CarType = 'benz' | 'modelt' | 'fins' | 'compact' | 'hybrid' | 'ev' | 'suv' | 'future'
  | 'gta3' | 'gta_vc' | 'gta_sa' | 'gta_iv' | 'gta_v' | 'gta_vi';
export const CAR_TYPES: string[] = ['benz', 'modelt', 'fins', 'compact', 'hybrid', 'ev', 'suv', 'future',
  'gta3', 'gta_vc', 'gta_sa', 'gta_iv', 'gta_v', 'gta_vi'];

const Wheel: React.FC<{cx: number; cy: number; r: number; rot: number}> = ({cx, cy, r, rot}) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    <circle cx={cx} cy={cy} r={r} fill="#0b0b0b" />
    <circle cx={cx} cy={cy} r={r * 0.62} fill="#cbd5e1" />
    <circle cx={cx} cy={cy} r={r * 0.22} fill="#475569" />
    {[0, 72, 144, 216, 288].map((a) => (
      <line
        key={a}
        x1={cx}
        y1={cy}
        x2={cx + Math.cos((a * Math.PI) / 180) * r * 0.6}
        y2={cy + Math.sin((a * Math.PI) / 180) * r * 0.6}
        stroke="#475569"
        strokeWidth={r * 0.1}
      />
    ))}
  </g>
);

const Body: React.FC<{type: CarType; rot: number; f: number}> = ({type, rot, f}) => {
  const pulse = 0.6 + 0.4 * Math.sin(f / 6);
  switch (type) {
    case 'benz':
      return (
        <g>
          <line x1={220} y1={235} x2={560} y2={262} stroke="#5b3a1e" strokeWidth={10} />
          <rect x={260} y={170} width={270} height={22} rx={8} fill="#5b3a1e" />
          <rect x={300} y={95} width={130} height={75} rx={16} fill="#7c2d12" />
          <rect x={190} y={115} width={100} height={75} rx={10} fill="#374151" />
          <line x1={560} y1={262} x2={500} y2={110} stroke="#374151" strokeWidth={12} strokeLinecap="round" />
          <line x1={470} y1={105} x2={520} y2={105} stroke="#374151" strokeWidth={12} strokeLinecap="round" />
          <Wheel cx={220} cy={235} r={95} rot={rot} />
          <Wheel cx={560} cy={262} r={58} rot={rot} />
        </g>
      );
    case 'modelt':
      return (
        <g>
          <rect x={120} y={140} width={470} height={85} rx={10} fill="#1f2937" />
          <rect x={250} y={55} width={250} height={90} rx={8} fill="#111827" />
          <rect x={270} y={72} width={95} height={60} rx={4} fill="#93c5fd" />
          <rect x={380} y={72} width={95} height={60} rx={4} fill="#93c5fd" />
          <circle cx={585} cy={165} r={18} fill="#fbbf24" />
          <Wheel cx={210} cy={245} r={72} rot={rot} />
          <Wheel cx={500} cy={245} r={72} rot={rot} />
        </g>
      );
    case 'fins':
      return (
        <g>
          <rect x={40} y={150} width={620} height={85} rx={34} fill="#f472b6" />
          <polygon points="210,150 270,80 450,80 520,150" fill="#f9a8d4" />
          <polygon points="280,148 315,92 440,92 495,148" fill="#bae6fd" />
          <polygon points="50,165 10,95 100,150" fill="#f472b6" />
          <rect x={60} y={190} width={580} height={8} fill="#ffffff" opacity={0.8} />
          <circle cx={650} cy={180} r={16} fill="#fde047" />
          <Wheel cx={150} cy={240} r={58} rot={rot} />
          <Wheel cx={540} cy={240} r={58} rot={rot} />
        </g>
      );
    case 'compact':
      return (
        <g>
          <path d="M70 235 L70 170 Q72 148 105 143 L200 128 Q250 72 340 70 L450 70 Q520 82 555 150 L600 160 Q630 172 630 235 Z" fill="#fb923c" />
          <path d="M235 128 Q270 90 340 88 L400 88 L400 140 Z" fill="#bae6fd" />
          <path d="M415 88 L455 88 Q500 98 525 140 L415 140 Z" fill="#bae6fd" />
          <circle cx={605} cy={185} r={14} fill="#fde047" />
          <Wheel cx={185} cy={238} r={58} rot={rot} />
          <Wheel cx={500} cy={238} r={58} rot={rot} />
        </g>
      );
    case 'hybrid':
      return (
        <g>
          <path d="M50 235 L50 178 Q50 158 90 152 L200 142 L275 82 Q340 62 425 82 L500 146 L620 160 Q655 172 655 235 Z" fill="#22c55e" />
          <path d="M285 140 L322 92 L420 92 L470 140 Z" fill="#bae6fd" />
          <ellipse cx={350} cy={190} rx={28} ry={14} fill="#bbf7d0" transform="rotate(-25 350 190)" />
          <circle cx={630} cy={190} r={13} fill="#fde047" />
          <Wheel cx={170} cy={238} r={58} rot={rot} />
          <Wheel cx={520} cy={238} r={58} rot={rot} />
        </g>
      );
    case 'ev':
      return (
        <g>
          <path d="M40 235 L40 195 Q60 168 150 158 L300 90 Q385 62 470 98 L565 152 Q640 168 668 205 L668 235 Z" fill="#3b82f6" />
          <path d="M310 148 L345 100 L440 108 L505 148 Z" fill="#0f172a" />
          <rect x={560} y={185} width={105} height={10} rx={5} fill="#e0f2fe" opacity={pulse} />
          <polygon points="215,178 185,218 208,218 198,248 235,203 212,203" fill="#fde047" />
          <Wheel cx={160} cy={240} r={60} rot={rot} />
          <Wheel cx={520} cy={240} r={60} rot={rot} />
        </g>
      );
    case 'suv':
      return (
        <g>
          <path d="M55 238 L55 155 Q55 122 100 117 L200 107 L250 50 L520 50 Q575 62 595 117 L640 127 Q665 142 665 238 Z" fill="#6366f1" />
          <path d="M265 105 L295 62 L400 62 L400 105 Z" fill="#bae6fd" />
          <path d="M415 62 L510 62 Q548 72 565 105 L415 105 Z" fill="#bae6fd" />
          <circle cx={645} cy={165} r={8 * pulse + 4} fill="#fde047" />
          <circle cx={330} cy={46} r={8 * pulse + 4} fill="#fde047" />
          <circle cx={100} cy={140} r={8 * pulse + 4} fill="#fde047" />
          <Wheel cx={190} cy={238} r={64} rot={rot} />
          <Wheel cx={520} cy={238} r={64} rot={rot} />
        </g>
      );
    case 'gta3':
      return (
        <g>
          <defs>
            <linearGradient id="gta3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#00b4d8" />
              <stop offset="1" stopColor="#0077b6" />
            </linearGradient>
          </defs>
          <path d="M60 235 L60 180 Q60 155 110 150 L220 140 L280 75 Q350 50 440 70 L540 135 L640 155 Q680 165 680 235 Z" fill="url(#gta3)" />
          <path d="M290 135 L320 85 L380 85 L430 135 Z" fill="#0f172a" />
          <rect x={580} y={180} width={95} height={12} rx={6} fill="#e0f2fe" opacity={pulse} />
          <polygon points="200,170 165,215 190,215 180,250 220,200 195,200" fill="#fde047" />
          <Wheel cx={180} cy={240} r={62} rot={rot} />
          <Wheel cx={520} cy={240} r={62} rot={rot} />
        </g>
      );
    case 'gta_vc':
      return (
        <g>
          <defs>
            <linearGradient id="gtavc" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff6b35" />
              <stop offset="0.5" stopColor="#f7b731" />
              <stop offset="1" stopColor="#ff6b35" />
            </linearGradient>
          </defs>
          <path d="M50 235 L50 185 Q70 155 160 145 L280 130 L330 55 Q400 30 480 55 L550 125 L650 150 Q700 165 700 235 Z" fill="url(#gtavc)" />
          <path d="M340 125 L370 65 L420 65 L475 125 Z" fill="#0f172a" />
          <rect x={590} y={175} width={105} height={14} rx={7} fill="#fef3c7" opacity={pulse} />
          <ellipse cx={355} cy={42} rx={20} ry={12} fill="#fbbf24" transform="rotate(-30 355 42)" />
          <Wheel cx={170} cy={240} r={60} rot={rot} />
          <Wheel cx={530} cy={240} r={60} rot={rot} />
        </g>
      );
    case 'gta_sa':
      return (
        <g>
          <defs>
            <linearGradient id="gtasa" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2d6a4f" />
              <stop offset="0.5" stopColor="#40916c" />
              <stop offset="1" stopColor="#52b788" />
            </linearGradient>
          </defs>
          <path d="M40 235 L40 175 Q40 145 90 140 L180 130 L240 60 Q320 30 420 55 L500 125 L580 150 Q640 160 660 235 Z" fill="url(#gtasa)" />
          <path d="M250 125 L280 70 L360 70 L415 125 Z" fill="#0f172a" />
          <ellipse cx={330} cy={185} rx={32} ry={18} fill="#a8e6cf" transform="rotate(-20 330 185)" />
          <circle cx={620} cy={175} r={14} fill="#fde047" />
          <Wheel cx={160} cy={240} r={64} rot={rot} />
          <Wheel cx={530} cy={240} r={64} rot={rot} />
        </g>
      );
    case 'gta_iv':
      return (
        <g>
          <defs>
            <linearGradient id="gtaiv" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#374151" />
              <stop offset="0.5" stopColor="#6b7280" />
              <stop offset="1" stopColor="#9ca3af" />
            </linearGradient>
          </defs>
          <path d="M55 235 L55 190 Q55 160 105 155 L200 148 L260 85 Q330 60 420 80 L500 145 L600 165 Q660 175 660 235 Z" fill="url(#gtaiv)" />
          <path d="M270 140 L300 95 L380 95 L435 140 Z" fill="#0f172a" />
          <rect x={560} y={180} width={95} height={10} rx={5} fill="#e5e7eb" opacity={pulse} />
          <polygon points="220,175 190,220 215,220 205,255 240,205 215,205" fill="#fde047" />
          <Wheel cx={180} cy={240} r={62} rot={rot} />
          <Wheel cx={520} cy={240} r={62} rot={rot} />
        </g>
      );
    case 'gta_v':
      return (
        <g>
          <defs>
            <linearGradient id="gtav" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1e3a8a" />
              <stop offset="0.5" stopColor="#3b82f6" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <path d="M40 235 L40 195 Q60 165 150 155 L280 100 Q370 70 470 105 L570 145 Q650 160 670 205 L670 235 Z" fill="url(#gtav)" />
          <path d="M300 150 L330 105 L420 112 L485 150 Z" fill="#0f172a" />
          <rect x={560} y={185} width={105} height={10} rx={5} fill="#e0f2fe" opacity={pulse} />
          <polygon points="215,178 185,218 208,218 198,248 235,203 212,203" fill="#fde047" />
          <Wheel cx={160} cy={240} r={60} rot={rot} />
          <Wheel cx={520} cy={240} r={60} rot={rot} />
        </g>
      );
    case 'gta_vi':
      return (
        <g>
          <defs>
            <linearGradient id="gtavi" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ec4899" />
              <stop offset="0.3" stopColor="#f43f5e" />
              <stop offset="0.6" stopColor="#f97316" />
              <stop offset="1" stopColor="#fbbf24" />
            </linearGradient>
          </defs>
          <path d="M35 235 L35 200 Q50 170 140 160 L300 95 Q400 55 510 90 L620 145 Q710 165 710 235 Z" fill="url(#gtavi)" />
          <path d="M320 155 L355 110 L440 115 L505 155 Z" fill="#0f172a" />
          <rect x={600} y={190} width={100} height={12} rx={6} fill="#fef2f2" opacity={pulse} />
          <ellipse cx={370} cy={48} rx={22} ry={14} fill="#fecaca" transform="rotate(-35 370 48)" />
          <Wheel cx={155} cy={240} r={65} rot={rot} />
          <Wheel cx={530} cy={240} r={65} rot={rot} />
        </g>
      );
    default:
      return (
        <g>
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <ellipse cx={350} cy={275} rx={270} ry={22} fill="#22d3ee" opacity={0.2 + 0.2 * pulse} />
          <rect x={70} y={110} width={560} height={130} rx={65} fill="url(#pg)" />
          <ellipse cx={360} cy={122} rx={190} ry={50} fill="#e0f2fe" opacity={0.7} />
          <rect x={110} y={185} width={480} height={8} rx={4} fill="#ffffff" opacity={0.6} />
        </g>
      );
  }
};

export const Vehicle: React.FC<{type: CarType}> = ({type}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14, stiffness: 70}});
  const x = (1 - s) * -1100;
  const bounce = Math.sin(f * 0.7) * 3;
  const rot = f * (s < 0.98 ? 30 : 16);
  return (
    <div style={{transform: `translate(${x}px, ${bounce}px)`}}>
      <svg width={900} height={411} viewBox="0 0 700 320">
        <Body type={type} rot={rot} f={f} />
      </svg>
    </div>
  );
};