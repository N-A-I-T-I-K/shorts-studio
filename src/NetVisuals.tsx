import React from 'react';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';

export type NetType = 'network' | 'email' | 'packets' | 'browser' | 'graph' | 'social' | 'mobile' | 'globe';
export const NET_TYPES: string[] = ['network', 'email', 'packets', 'browser', 'graph', 'social', 'mobile', 'globe'];

const FONT = 'Montserrat, "Arial Black", Arial, sans-serif';
const MONO = 'Consolas, "Courier New", monospace';

const prog = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
const lin = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- 1969: ARPANET ---------- */
const Network: React.FC<{f: number}> = ({f}) => {
  const nodes = [
    {x: 160, y: 190, l: 'UCLA'},
    {x: 440, y: 110, l: 'SRI'},
    {x: 520, y: 330, l: 'UCSB'},
    {x: 830, y: 210, l: 'UTAH'},
  ];
  const links = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
  ];
  const typed = f < 90 ? 0 : f < 100 ? 1 : 2;
  const lost = f >= 118;
  return (
    <g>
      {links.map(([a, b], i) => {
        const p = prog(f, 18 + i * 8, 20);
        const A = nodes[a];
        const B = nodes[b];
        return (
          <line key={i} x1={A.x} y1={A.y} x2={lerp(A.x, B.x, p)} y2={lerp(A.y, B.y, p)} stroke="#60a5fa" strokeWidth={5} strokeLinecap="round" />
        );
      })}
      {f > 60 &&
        links.map(([a, b], i) => {
          const t = (f * 0.018 + i * 0.27) % 1;
          const x = lerp(nodes[a].x, nodes[b].x, t);
          const y = lerp(nodes[a].y, nodes[b].y, t);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={18} fill="#fde047" opacity={0.3} />
              <circle cx={x} cy={y} r={9} fill="#fde047" />
            </g>
          );
        })}
      {nodes.map((n, i) => {
        const s = prog(f, i * 8, 14);
        return (
          <g key={i} transform={`translate(${n.x} ${n.y}) scale(${s})`}>
            <circle r={44} fill="#1e3a8a" stroke="#60a5fa" strokeWidth={5} />
            <rect x={-20} y={-16} width={40} height={28} rx={4} fill="#bfdbfe" />
            <rect x={-10} y={14} width={20} height={6} fill="#bfdbfe" />
            <text y={78} textAnchor="middle" fill="#fff" fontFamily={FONT} fontWeight={800} fontSize={30}>
              {n.l}
            </text>
          </g>
        );
      })}
      <g opacity={prog(f, 70, 10)}>
        <rect x={150} y={470} width={700} height={170} rx={18} fill="#020617" stroke={lost ? '#ef4444' : '#334155'} strokeWidth={4} />
        <text x={185} y={545} fontFamily={MONO} fontSize={54} fill="#4ade80">
          {'> '}
          {'LO'.slice(0, typed)}
          {f % 30 < 15 && !lost ? '_' : ''}
        </text>
        {lost ? (
          <text x={185} y={610} fontFamily={MONO} fontSize={40} fill="#ef4444" opacity={f % 10 < 6 ? 1 : 0.5}>
            CONNECTION LOST
          </text>
        ) : null}
      </g>
    </g>
  );
};

/* ---------- 1971: first email ---------- */
const Monitor: React.FC<{x: number; y: number; children?: React.ReactNode}> = ({x, y, children}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={210} height={150} rx={14} fill="#0f172a" stroke="#64748b" strokeWidth={6} />
    <rect x={14} y={14} width={182} height={122} rx={6} fill="#0b1220" />
    <rect x={85} y={150} width={40} height={40} fill="#64748b" />
    <rect x={55} y={188} width={100} height={12} rx={6} fill="#64748b" />
    {children}
  </g>
);

const Email: React.FC<{f: number}> = ({f}) => {
  const t = prog(f, 45, 55);
  const P0 = {x: 300, y: 330};
  const C = {x: 500, y: 40};
  const P1 = {x: 700, y: 330};
  const at = (u: number) => ({
    x: (1 - u) * (1 - u) * P0.x + 2 * (1 - u) * u * C.x + u * u * P1.x,
    y: (1 - u) * (1 - u) * P0.y + 2 * (1 - u) * u * C.y + u * u * P1.y,
  });
  const pos = at(t);
  const typed = 'user@host'.slice(0, Math.max(0, Math.floor((f - 5) / 3)));
  const arrived = t >= 1;
  const pulse = 1 + 0.08 * Math.sin(f / 5);
  const ring = lin(f, 100, 20);
  return (
    <g>
      <g transform={`translate(500 250) scale(${pulse * prog(f, 12, 16)})`}>
        <text textAnchor="middle" y={70} fontSize={230} fontFamily={FONT} fontWeight={900} fill="#fde047" stroke="#000" strokeWidth={10} paintOrder="stroke">
          @
        </text>
      </g>
      <Monitor x={70} y={290}>
        <text x={28} y={86} fontFamily={MONO} fontSize={26} fill="#4ade80">
          {typed}
        </text>
      </Monitor>
      <Monitor x={720} y={290}>
        {arrived ? (
          <g>
            <rect x={30} y={50} width={150} height={44} rx={10} fill="#22c55e" />
            <text x={105} y={81} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#fff">
              NEW MAIL
            </text>
          </g>
        ) : null}
      </Monitor>
      {[0.08, 0.16, 0.24, 0.32].map((d, i) => {
        const p = at(Math.max(0, t - d));
        return t > 0 && !arrived ? <circle key={i} cx={p.x} cy={p.y} r={10 - i * 2} fill="#fde047" opacity={0.5 - i * 0.1} /> : null;
      })}
      {f >= 45 && !arrived ? (
        <g transform={`translate(${pos.x - 45} ${pos.y - 30}) rotate(${Math.sin(f / 4) * 8} 45 30)`}>
          <rect width={90} height={60} rx={8} fill="#f8fafc" stroke="#94a3b8" strokeWidth={3} />
          <polyline points="0,0 45,36 90,0" fill="none" stroke="#94a3b8" strokeWidth={3} />
        </g>
      ) : null}
      {arrived ? <circle cx={825} cy={365} r={ring * 140} fill="none" stroke="#22c55e" strokeWidth={8} opacity={1 - ring} /> : null}
    </g>
  );
};

/* ---------- 1983: TCP/IP ---------- */
const Packets: React.FC<{f: number}> = ({f}) => {
  const N = 16;
  const pts = Array.from({length: N}).map((_, i) => ({x: 90 + random(`px${i}`) * 820, y: 60 + random(`py${i}`) * 580}));
  const seen = new Set<string>();
  const links: [number, number][] = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2}))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach(({j}) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        links.push([i, j]);
      }
    });
  });
  const colors = ['#fde047', '#34d399', '#f472b6'];
  const badge = prog(f, 40, 14);
  const pulse = 1 + 0.04 * Math.sin(f / 4);
  return (
    <g>
      {links.map(([a, b], k) => {
        const o = Math.min(prog(f, a * 3, 12), prog(f, b * 3, 12));
        return <line key={k} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke="#38bdf8" strokeWidth={3} opacity={0.55 * o} />;
      })}
      {f > 30 &&
        links.map(([a, b], k) => {
          const t = (f * 0.025 + random(`pk${k}`)) % 1;
          return <circle key={k} cx={lerp(pts[a].x, pts[b].x, t)} cy={lerp(pts[a].y, pts[b].y, t)} r={7} fill={colors[k % 3]} />;
        })}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={16 * prog(f, i * 3, 12)} fill="#0f172a" stroke="#38bdf8" strokeWidth={5} />
      ))}
      <g transform={`translate(500 340) scale(${badge * pulse})`}>
        <rect x={-190} y={-60} width={380} height={120} rx={60} fill="#0f172a" stroke="#22d3ee" strokeWidth={8} />
        <text textAnchor="middle" y={26} fontFamily={FONT} fontWeight={900} fontSize={76} fill="#22d3ee">
          TCP/IP
        </text>
      </g>
    </g>
  );
};

/* ---------- 1991: the Web ---------- */
const Browser: React.FC<{f: number}> = ({f}) => {
  const url = 'info.cern.ch'.slice(0, Math.max(0, Math.floor((f - 10) / 2)));
  const loadP = lin(f, 40, 25);
  const head = 'World Wide Web'.slice(0, Math.max(0, Math.floor((f - 66) / 2)));
  const widths = [640, 560, 600, 420];
  const cur = prog(f, 100, 30);
  const cx = lerp(800, 230, cur);
  const cy = lerp(300, 520, cur);
  const click = lin(f, 130, 16);
  const flash = f >= 135 ? (1 - lin(f, 135, 14)) * 0.8 : 0;
  return (
    <g>
      <rect x={60} y={20} width={880} height={640} rx={24} fill="#f8fafc" stroke="#94a3b8" strokeWidth={4} />
      <rect x={60} y={20} width={880} height={90} rx={24} fill="#e2e8f0" />
      {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
        <circle key={i} cx={110 + i * 40} cy={65} r={12} fill={c} />
      ))}
      <rect x={250} y={38} width={650} height={54} rx={27} fill="#fff" stroke="#cbd5e1" strokeWidth={3} />
      <text x={282} y={76} fontFamily={MONO} fontSize={32} fill="#0f172a">
        {url}
      </text>
      <rect x={60} y={106} width={880 * loadP} height={6} fill="#3b82f6" />
      <text x={110} y={210} fontFamily={FONT} fontWeight={900} fontSize={64} fill="#111827">
        {head}
      </text>
      {widths.map((w, i) => (
        <rect key={i} x={110} y={260 + i * 52} width={w * prog(f, 80 + i * 6, 14)} height={22} rx={11} fill="#cbd5e1" />
      ))}
      <g opacity={prog(f, 90, 10)}>
        <text x={110} y={540} fontFamily={FONT} fontWeight={800} fontSize={46} fill="#2563eb">
          Click to explore
        </text>
        <rect x={110} y={554} width={330} height={5} fill="#2563eb" />
      </g>
      {f >= 100 ? (
        <g>
          {f >= 130 ? <circle cx={230} cy={520} r={click * 70} fill="none" stroke="#2563eb" strokeWidth={6} opacity={1 - click} /> : null}
          <polygon transform={`translate(${cx} ${cy})`} points="0,0 0,44 12,34 22,56 32,52 22,30 38,30" fill="#111" stroke="#fff" strokeWidth={3} />
        </g>
      ) : null}
      <rect x={60} y={20} width={880} height={640} rx={24} fill="#fff" opacity={flash} />
    </g>
  );
};

/* ---------- Graph: people online (ITU data) ---------- */
const DATA: [number, number][] = [
  [2005, 1.023],
  [2006, 1.147],
  [2007, 1.367],
  [2008, 1.545],
  [2009, 1.727],
  [2010, 1.981],
  [2011, 2.174],
  [2012, 2.387],
  [2013, 2.562],
  [2014, 2.75],
  [2015, 2.954],
  [2016, 3.217],
  [2017, 3.5],
  [2018, 3.8],
  [2019, 4.2],
  [2020, 4.7],
  [2021, 5.1],
  [2022, 5.3],
  [2025, 6.0],
];
const X0 = 140;
const X1 = 900;
const Y0 = 560;
const Y1 = 90;
const xOf = (yr: number) => X0 + ((yr - 2005) / 20) * (X1 - X0);
const yOf = (v: number) => Y0 - (v / 6.5) * (Y0 - Y1);
const valueAt = (yr: number) => {
  for (let i = 0; i < DATA.length - 1; i++) {
    const [y0, v0] = DATA[i];
    const [y1, v1] = DATA[i + 1];
    if (yr >= y0 && yr <= y1) return lerp(v0, v1, (yr - y0) / (y1 - y0));
  }
  return DATA[DATA.length - 1][1];
};

const Graph: React.FC<{f: number}> = ({f}) => {
  const p = interpolate(f, [12, 112], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const curYear = 2005 + 20 * p;
  const curVal = valueAt(curYear);
  const line = 'M' + DATA.map(([y, v]) => `${xOf(y)} ${yOf(v)}`).join(' L ');
  const area = `${line} L ${xOf(2025)} ${Y0} L ${xOf(2005)} ${Y0} Z`;
  const ex = xOf(curYear);
  const ey = yOf(curVal);
  return (
    <g>
      <defs>
        <clipPath id="gclip">
          <rect x={X0 - 10} y={0} width={ex - X0 + 10} height={700} />
        </clipPath>
        <linearGradient id="garea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity={0.55} />
          <stop offset="1" stopColor="#22d3ee" stopOpacity={0} />
        </linearGradient>
      </defs>
      <text x={X0} y={50} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#bae6fd">
        PEOPLE ONLINE (BILLIONS)
      </text>
      {[0, 2, 4, 6].map((v) => (
        <g key={v}>
          <line x1={X0} y1={yOf(v)} x2={X1} y2={yOf(v)} stroke="#fff" strokeOpacity={0.18} strokeWidth={2} />
          <text x={X0 - 16} y={yOf(v) + 10} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={28} fill="#fff" opacity={0.8}>
            {v === 0 ? '0' : `${v}B`}
          </text>
        </g>
      ))}
      {[2005, 2010, 2015, 2020, 2025].map((yr) => (
        <text key={yr} x={xOf(yr)} y={Y0 + 46} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill="#fff" opacity={0.8}>
          {yr}
        </text>
      ))}
      <g clipPath="url(#gclip)">
        <path d={area} fill="url(#garea)" />
        <path d={line} fill="none" stroke="#22d3ee" strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
      </g>
      {curYear >= 2007 ? (
        <g opacity={prog(f, 12 + 100 * ((2007 - 2005) / 20), 10)}>
          <line x1={xOf(2007)} y1={yOf(1.367) - 14} x2={xOf(2007)} y2={yOf(1.367) - 90} stroke="#fde047" strokeWidth={3} strokeDasharray="8 8" />
          <rect x={xOf(2007) - 70} y={yOf(1.367) - 140} width={140} height={50} rx={25} fill="#fde047" />
          <text x={xOf(2007)} y={yOf(1.367) - 106} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill="#111">
            iPhone
          </text>
        </g>
      ) : null}
      <circle cx={ex} cy={ey} r={28} fill="#fde047" opacity={0.3} />
      <circle cx={ex} cy={ey} r={14} fill="#fde047" />
      <text x={X0 + 14} y={190} textAnchor="start" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#fde047" stroke="#000" strokeWidth={9} paintOrder="stroke">
        {curVal.toFixed(1)}B
      </text>
      <text x={X1} y={Y0 + 96} textAnchor="end" fontFamily={FONT} fontWeight={600} fontSize={22} fill="#fff" opacity={0.6}>
        Source: ITU
      </text>
    </g>
  );
};

/* ---------- 2004-2006: social media ---------- */
const Heart: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 12 C-30 -10 -14 -34 0 -16 C14 -34 30 -10 0 12Z" fill="#fb7185" opacity={o} />
);

const Social: React.FC<{f: number}> = ({f}) => {
  const items = [
    {name: 'Facebook', year: '2004', c: '#3b82f6', y: 70, dir: -1},
    {name: 'YouTube', year: '2005', c: '#ef4444', y: 270, dir: 1},
    {name: 'Twitter', year: '2006', c: '#0ea5e9', y: 470, dir: -1},
  ];
  return (
    <g>
      {Array.from({length: 14}).map((_, i) => {
        const t = (f * 0.02 + random(`h${i}`)) % 1;
        return <Heart key={i} x={80 + random(`hx${i}`) * 840} y={690 - t * 700} s={0.8 + random(`hs${i}`) * 0.9} o={Math.sin(Math.PI * t) * 0.9} />;
      })}
      {items.map((it, i) => {
        const p = prog(f, 6 + i * 26, 22);
        const x = 80 + it.dir * (1 - p) * 1100;
        const badge = Math.floor(lin(f, 30 + i * 26, 60) * (20 + i * 15));
        return (
          <g key={it.name} transform={`translate(${x} ${it.y})`}>
            <rect width={840} height={150} rx={75} fill={it.c} />
            <circle cx={75} cy={75} r={46} fill="#fff" opacity={0.92} />
            <circle cx={75} cy={62} r={15} fill={it.c} />
            <path d="M45 105 Q75 70 105 105Z" fill={it.c} />
            <text x={150} y={92} fontFamily={FONT} fontWeight={900} fontSize={62} fill="#fff">
              {it.name}
            </text>
            <text x={800} y={92} textAnchor="end" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#fff" opacity={0.85}>
              {it.year}
            </text>
            {p > 0.9 ? (
              <g>
                <circle cx={790} cy={8} r={30} fill="#ef4444" stroke="#fff" strokeWidth={5} />
                <text x={790} y={19} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">
                  {badge}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/* ---------- 2007: internet in your pocket ---------- */
const Icon: React.FC<{kind: number; x: number; y: number; color: string}> = ({kind, x, y, color}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={48} fill={color} stroke="#fff" strokeWidth={5} />
    {kind === 0 && (
      <g>
        <rect x={-20} y={-18} width={40} height={28} rx={8} fill="#fff" />
        <polygon points="-8,10 -8,24 6,10" fill="#fff" />
      </g>
    )}
    {kind === 1 && <polygon points="-12,-18 -12,18 20,0" fill="#fff" />}
    {kind === 2 && (
      <g>
        <path d="M0 22 C-22 -4 -18 -24 0 -24 C18 -24 22 -4 0 22Z" fill="#fff" />
        <circle cy={-8} r={7} fill={color} />
      </g>
    )}
    {kind === 3 && (
      <g>
        <rect x={-22} y={-14} width={44} height={30} rx={6} fill="#fff" />
        <circle cy={1} r={9} fill={color} />
      </g>
    )}
  </g>
);

const Mobile: React.FC<{f: number}> = ({f}) => {
  const cx = 500;
  const cy = 340;
  const colors = ['#22c55e', '#ef4444', '#f59e0b', '#a855f7'];
  const appColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#6366f1', '#f97316', '#0ea5e9', '#84cc16'];
  const s = prog(f, 0, 18);
  const orbit = (k: number) => {
    const a = f * 0.04 + (k * Math.PI) / 2;
    return {x: cx + Math.cos(a) * 390, y: cy + Math.sin(a) * 210, back: Math.sin(a) < 0};
  };
  const pulse = 1 + 0.1 * Math.sin(f / 4);
  return (
    <g>
      {[0, 1, 2].map((k) => {
        const r = ((f * 3 + k * 100) % 300) + 170;
        return <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke="#38bdf8" strokeWidth={6} opacity={(1 - (r - 170) / 300) * 0.7} />;
      })}
      {[0, 1, 2, 3].map((k) => {
        const o = orbit(k);
        return o.back ? <Icon key={k} kind={k} x={o.x} y={o.y} color={colors[k]} /> : null;
      })}
      <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
        <rect x={350} y={50} width={300} height={580} rx={50} fill="#0f172a" stroke="#475569" strokeWidth={10} />
        <rect x={368} y={68} width={264} height={544} rx={36} fill="#0ea5e9" />
        <rect x={368} y={68} width={264} height={544} rx={36} fill="#6d28d9" opacity={0.6} />
        <rect x={455} y={80} width={90} height={22} rx={11} fill="#000" />
        {appColors.map((c, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const sc = prog(f, 20 + i * 3, 10);
          const ax = 395 + col * 85 + 35;
          const ay = 150 + row * 105 + 35;
          return <rect key={i} x={ax - 35 * sc} y={ay - 35 * sc} width={70 * sc} height={70 * sc} rx={18} fill={c} />;
        })}
      </g>
      {[0, 1, 2, 3].map((k) => {
        const o = orbit(k);
        return !o.back ? <Icon key={k} kind={k} x={o.x} y={o.y} color={colors[k]} /> : null;
      })}
      <g transform={`translate(640 80) scale(${pulse})`}>
        <circle r={32} fill="#ef4444" stroke="#fff" strokeWidth={5} />
        <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill="#fff">
          3
        </text>
      </g>
    </g>
  );
};

/* ---------- Today: globe, satellites, AI sparkles ---------- */
const CITIES: [number, number][] = [
  [-74, 41],
  [0, 51],
  [77, 28],
  [140, 36],
  [151, -34],
  [-46, -23],
  [31, 30],
  [3, 6],
];
const PAIRS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [1, 6],
  [6, 2],
  [5, 7],
];
const SPARKLE = 'M0 -22 Q4 -4 22 0 Q4 4 0 22 Q-4 4 -22 0 Q-4 -4 0 -22Z';

const Globe: React.FC<{f: number}> = ({f}) => {
  const cx = 500;
  const cy = 310;
  const r = 240;
  const rot = f * 0.9 + 40;
  const proj = (lon: number, lat: number) => {
    const a = ((lon + rot) * Math.PI) / 180;
    const la = (lat * Math.PI) / 180;
    return {x: cx + r * Math.cos(la) * Math.sin(a), y: cy - r * Math.sin(la), z: Math.cos(la) * Math.cos(a)};
  };
  const cities = CITIES.map(([lon, lat]) => proj(lon, lat));
  const ph = (-22 * Math.PI) / 180;
  const sat = (a: number) => {
    const x = Math.cos(a) * 420;
    const y = Math.sin(a) * 120;
    return {x: cx + x * Math.cos(ph) - y * Math.sin(ph), y: cy + x * Math.sin(ph) + y * Math.cos(ph)};
  };
  const counter = (6 * prog(f, 10, 70)).toFixed(1);
  const sparkles = [
    [120, 110],
    [880, 150],
    [150, 500],
    [860, 480],
    [500, 30],
    [720, 600],
  ];
  return (
    <g>
      <defs>
        <radialGradient id="gg" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0c4a6e" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 18} fill="#22d3ee" opacity={0.18 + 0.05 * Math.sin(f / 8)} />
      <circle cx={cx} cy={cy} r={r} fill="url(#gg)" />
      {[-60, -30, 0, 30, 60].map((lat) => {
        const la = (lat * Math.PI) / 180;
        return <ellipse key={lat} cx={cx} cy={cy - r * Math.sin(la)} rx={r * Math.cos(la)} ry={r * Math.cos(la) * 0.15} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const a = ((k * 30 + rot) * Math.PI) / 180;
        return <ellipse key={k} cx={cx} cy={cy} rx={Math.abs(r * Math.sin(a))} ry={r} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={2} />;
      })}
      {PAIRS.map(([a, b], k) => {
        const p1 = cities[a];
        const p2 = cities[b];
        if (p1.z < 0.05 || p2.z < 0.05) return null;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const qx = cx + (mx - cx) * 1.45;
        const qy = cy + (my - cy) * 1.45;
        return <path key={k} d={`M${p1.x} ${p1.y} Q${qx} ${qy} ${p2.x} ${p2.y}`} fill="none" stroke="#fde047" strokeWidth={5} strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={-f * 3} />;
      })}
      {cities.map((c, i) =>
        c.z > 0.05 ? (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={16 + 4 * Math.sin(f / 5 + i)} fill="#fde047" opacity={0.35} />
            <circle cx={c.x} cy={c.y} r={8} fill="#fde047" />
          </g>
        ) : null,
      )}
      <ellipse cx={cx} cy={cy} rx={420} ry={120} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={2} strokeDasharray="10 10" transform={`rotate(-22 ${cx} ${cy})`} />
      {[f * 0.05, f * 0.05 + Math.PI].map((a, i) => {
        const s = sat(a);
        return (
          <g key={i} transform={`translate(${s.x} ${s.y})`}>
            <rect x={-13} y={-9} width={26} height={18} rx={3} fill="#e2e8f0" />
            <rect x={-46} y={-6} width={30} height={12} fill="#38bdf8" />
            <rect x={16} y={-6} width={30} height={12} fill="#38bdf8" />
          </g>
        );
      })}
      {sparkles.map(([x, y], i) => (
        <path key={i} d={SPARKLE} transform={`translate(${x} ${y}) scale(${0.6 + 0.5 * Math.abs(Math.sin(f / 9 + i * 1.3))}) rotate(${f * 2})`} fill="#fde047" opacity={0.9} />
      ))}
      <text x={500} y={668} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#fff" stroke="#000" strokeWidth={6} paintOrder="stroke">
        {counter} BILLION+ ONLINE
      </text>
    </g>
  );
};

export const NetVisual: React.FC<{type: NetType}> = ({type}) => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 14);
  let body: React.ReactNode = null;
  if (type === 'network') body = <Network f={f} />;
  else if (type === 'email') body = <Email f={f} />;
  else if (type === 'packets') body = <Packets f={f} />;
  else if (type === 'browser') body = <Browser f={f} />;
  else if (type === 'graph') body = <Graph f={f} />;
  else if (type === 'social') body = <Social f={f} />;
  else if (type === 'mobile') body = <Mobile f={f} />;
  else body = <Globe f={f} />;
  return (
    <div style={{opacity: enter, transform: `scale(${0.92 + 0.08 * enter})`}}>
      <svg width={960} height={672} viewBox="0 0 1000 700">
        {body}
      </svg>
    </div>
  );
};
