import React from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';

export type Net3DType = 'network3d' | 'email3d' | 'packets3d' | 'web3d' | 'bars3d' | 'social3d' | 'phone3d' | 'globe3d';
export const NET3D_TYPES: string[] = ['network3d', 'email3d', 'packets3d', 'web3d', 'bars3d', 'social3d', 'phone3d', 'globe3d'];

const FONT = 'Montserrat, "Arial Black", Arial, sans-serif';
const MONO = 'Consolas, "Courier New", monospace';

type V3 = [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const prog = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const lin = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ---------- shared 3D pieces ---------- */
const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.9} />
    <directionalLight position={[5, 7, 9]} intensity={2.4} />
    <pointLight position={[-6, -3, 5]} intensity={80} color="#38bdf8" />
  </>
);

const Link3: React.FC<{a: THREE.Vector3; b: THREE.Vector3; r?: number; color?: string; opacity?: number}> = ({a, b, r = 0.05, color = '#60a5fa', opacity = 0.9}) => {
  const dir = b.clone().sub(a);
  const len = dir.length();
  if (len < 0.02) return null;
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <cylinderGeometry args={[r, r, len, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={opacity} />
    </mesh>
  );
};

const Ball: React.FC<{p: THREE.Vector3; r: number; color: string; glow?: number}> = ({p, r, color, glow = 0.8}) => (
  <mesh position={p}>
    <sphereGeometry args={[r, 14, 10]} />
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} />
  </mesh>
);

const Stage: React.FC<{h?: number; cam?: V3; look?: V3; fov?: number; children: React.ReactNode}> = ({h = 672, cam = [0, 0, 12], look = [0, 0, 0], fov = 40, children}) => (
  <ThreeCanvas
    width={960}
    height={h}
    camera={{fov, position: cam, near: 0.1, far: 100}}
    onCreated={({camera}) => {
      camera.lookAt(look[0], look[1], look[2]);
    }}
    style={{position: 'absolute', left: 0, top: 0}}
  >
    <Lights />
    {children}
  </ThreeCanvas>
);

/* =====================  1969: 3D ARPANET  ===================== */
const NET_POS: V3[] = [
  [-3.6, 0.6, 0],
  [-0.8, 2.0, -1.4],
  [0.4, -0.9, 1.3],
  [3.6, 1.0, -0.5],
];
const NET_LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [1, 3],
];

export const Network3DScene: React.FC<{f: number}> = ({f}) => {
  const ps = NET_POS.map((p) => V(p[0], p[1], p[2]));
  return (
    <group rotation={[0.12, Math.sin(f / 45) * 0.45, 0]} position={[0, Math.sin(f / 20) * 0.1, 0]}>
      {NET_LINKS.map(([a, b], i) => {
        const p = prog(f, 18 + i * 8, 20);
        return <Link3 key={i} a={ps[a]} b={ps[a].clone().lerp(ps[b], p)} />;
      })}
      {f > 60 &&
        NET_LINKS.map(([a, b], i) => {
          const t = (f * 0.018 + i * 0.27) % 1;
          return <Ball key={i} p={ps[a].clone().lerp(ps[b], t)} r={0.17} color="#fde047" glow={1.3} />;
        })}
      {ps.map((p, i) => {
        const s = Math.max(0.001, prog(f, i * 8, 14));
        return (
          <group key={i} position={p} scale={s}>
            <mesh>
              <sphereGeometry args={[0.5, 24, 16]} />
              <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.6} metalness={0.3} roughness={0.35} />
            </mesh>
            <mesh rotation={[f * 0.05 + i, f * 0.03, 0]}>
              <torusGeometry args={[0.85, 0.04, 8, 40]} />
              <meshStandardMaterial color="#93c5fd" emissive="#93c5fd" emissiveIntensity={0.8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Terminal: React.FC<{f: number}> = ({f}) => {
  const typed = f < 90 ? 0 : f < 100 ? 1 : 2;
  const lost = f >= 118;
  return (
    <div
      style={{
        position: 'absolute',
        left: 130,
        top: 490,
        width: 700,
        height: 160,
        borderRadius: 18,
        background: '#020617',
        border: `4px solid ${lost ? '#ef4444' : '#334155'}`,
        boxSizing: 'border-box',
        padding: '14px 32px',
        fontFamily: MONO,
        opacity: prog(f, 60, 10),
      }}
    >
      <div style={{fontSize: 50, color: '#4ade80', height: 66}}>
        {'> '}
        {'LO'.slice(0, typed)}
        {f % 30 < 15 && !lost ? '_' : ''}
      </div>
      {lost ? <div style={{fontSize: 38, color: '#ef4444', opacity: f % 10 < 6 ? 1 : 0.5}}>CONNECTION LOST</div> : null}
    </div>
  );
};

/* =====================  1971: 3D EMAIL  ===================== */
const FLAP = (() => {
  const s = new THREE.Shape();
  s.moveTo(-0.8, 0);
  s.lineTo(0.8, 0);
  s.lineTo(0, -0.55);
  s.closePath();
  return s;
})();

const Monitor3: React.FC<{x: number; screen: string; glow: number}> = ({x, screen, glow}) => (
  <group position={[x, -0.4, 0]}>
    <mesh>
      <boxGeometry args={[2.2, 1.5, 0.15]} />
      <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0, 0.09]}>
      <planeGeometry args={[1.9, 1.2]} />
      <meshStandardMaterial color={screen} emissive={screen} emissiveIntensity={0.5 + glow} />
    </mesh>
    <mesh position={[0, -1.05, -0.05]}>
      <cylinderGeometry args={[0.15, 0.2, 0.6, 12]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
    <mesh position={[0, -1.4, 0]}>
      <boxGeometry args={[1.1, 0.1, 0.8]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
  </group>
);

export const Email3DScene: React.FC<{f: number}> = ({f}) => {
  const t = prog(f, 45, 55);
  const P0 = V(-3.2, -0.3, 0.3);
  const C = V(0, 3.6, 2.5);
  const P1 = V(3.2, -0.3, 0.3);
  const curve = new THREE.QuadraticBezierCurve3(P0, C, P1);
  const pos = curve.getPoint(t);
  const arrived = t >= 1;
  const ring = lin(f, 100, 24);
  const open = -prog(f, 100, 14) * 2.4;
  return (
    <group rotation={[0.06, Math.sin(f / 50) * 0.25, 0]}>
      <Monitor3 x={-3.6} screen="#0b1220" glow={0} />
      <Monitor3 x={3.6} screen={arrived ? '#16a34a' : '#0b1220'} glow={arrived ? 0.6 : 0} />
      {[0.08, 0.16, 0.24, 0.32].map((d, i) =>
        t > 0 && !arrived ? <Ball key={i} p={curve.getPoint(Math.max(0, t - d))} r={0.11 - i * 0.02} color="#fde047" glow={1} /> : null,
      )}
      {f >= 45 && !arrived ? (
        <group position={pos} rotation={[Math.sin(f / 6) * 0.2, f * 0.08, Math.sin(f / 5) * 0.3]}>
          <mesh>
            <boxGeometry args={[1.6, 1.0, 0.1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <group position={[0, 0.5, 0.06]} rotation={[open, 0, 0]}>
            <mesh>
              <extrudeGeometry args={[FLAP, {depth: 0.03, bevelEnabled: false}]} />
              <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      ) : null}
      {arrived ? (
        <mesh position={[3.6, -0.4, 0.2]} scale={Math.max(0.01, 0.5 + ring * 2.5)}>
          <torusGeometry args={[1, 0.05, 8, 48]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} transparent opacity={1 - ring} />
        </mesh>
      ) : null}
    </group>
  );
};

const AtOverlay: React.FC<{f: number}> = ({f}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: 960,
      textAlign: 'center',
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 190,
      lineHeight: '200px',
      color: '#fde047',
      WebkitTextStroke: '10px #000',
      paintOrder: 'stroke fill',
      transform: `scale(${(1 + 0.08 * Math.sin(f / 5)) * prog(f, 12, 16)})`,
    }}
  >
    @
  </div>
);

/* =====================  1983: 3D PACKETS  ===================== */
const PK_N = 20;
const PK_POS: V3[] = Array.from({length: PK_N}).map((_, i) => {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / PK_N);
  const th = Math.PI * (1 + Math.sqrt(5)) * i;
  const r = 3.1 + random(`pr${i}`) * 0.6;
  return [r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi) * 0.9, r * Math.sin(phi) * Math.sin(th)] as V3;
});
const PK_LINKS: [number, number][] = (() => {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  PK_POS.forEach((p, i) => {
    PK_POS.map((q, j) => ({j, d: (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2}))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({j}) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push([i, j]);
        }
      });
  });
  return out;
})();

export const Packets3DScene: React.FC<{f: number}> = ({f}) => {
  const ps = PK_POS.map((p) => V(p[0], p[1], p[2]));
  const colors = ['#fde047', '#34d399', '#f472b6'];
  return (
    <group rotation={[0.3, f * 0.012 + 0.5, 0]} scale={prog(f, 0, 16)}>
      {PK_LINKS.map(([a, b], k) => (
        <Link3 key={k} a={ps[a]} b={ps[b]} r={0.022} opacity={0.55 * Math.min(prog(f, a * 3, 12), prog(f, b * 3, 12))} />
      ))}
      {f > 30 &&
        PK_LINKS.map(([a, b], k) => {
          const t = (f * 0.025 + random(`pk${k}`)) % 1;
          return <Ball key={k} p={ps[a].clone().lerp(ps[b], t)} r={0.1} color={colors[k % 3]} glow={1.2} />;
        })}
      {ps.map((p, i) => (
        <mesh key={i} position={p} scale={Math.max(0.001, prog(f, i * 3, 12))}>
          <sphereGeometry args={[0.22, 14, 10]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#38bdf8" emissiveIntensity={0.7} />
        </mesh>
      ))}
      <mesh rotation={[f * 0.02, f * 0.03, 0]}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} wireframe />
      </mesh>
    </group>
  );
};

const TcpBadge: React.FC<{f: number}> = ({f}) => (
  <div
    style={{
      position: 'absolute',
      left: 480 - 190,
      top: 336 - 60,
      width: 380,
      height: 120,
      borderRadius: 60,
      background: 'rgba(15,23,42,0.92)',
      border: '8px solid #22d3ee',
      boxSizing: 'border-box',
      textAlign: 'center',
      lineHeight: '104px',
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 72,
      color: '#22d3ee',
      transform: `scale(${prog(f, 40, 14) * (1 + 0.04 * Math.sin(f / 4))})`,
    }}
  >
    TCP/IP
  </div>
);

/* =====================  1991: 3D WEB WINDOW  ===================== */
export const Web3DScene: React.FC<{f: number}> = ({f}) => {
  const s = Math.max(0.001, prog(f, 0, 16));
  const loadP = lin(f, 40, 25);
  const widths = [3.6, 3.1, 3.4, 2.4];
  const cur = prog(f, 100, 30);
  const cx = lerp(2.2, -1.5, cur);
  const cy = lerp(0.9, -1.15, cur);
  const click = lin(f, 130, 16);
  return (
    <group rotation={[0.08, Math.sin(f / 45) * 0.35, 0]} position={[0, Math.sin(f / 20) * 0.12, 0]} scale={s}>
      {[1, 2].map((k) => (
        <mesh key={k} position={[0.5 * k, 0.3 * k, -1.2 * k]}>
          <boxGeometry args={[5.2, 3.6, 0.08]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.28} />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[5.2, 3.6, 0.14]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.55, 0.02]}>
        <boxGeometry args={[5.2, 0.5, 0.15]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {['#ef4444', '#f59e0b', '#22c55e'].map((c, i) => (
        <Ball key={i} p={V(-2.3 + i * 0.3, 1.55, 0.16)} r={0.09} color={c} glow={0.3} />
      ))}
      <mesh position={[0.6, 1.55, 0.1]}>
        <boxGeometry args={[3.4, 0.3, 0.12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-2.6 + (5.2 * Math.max(loadP, 0.001)) / 2, 1.28, 0.1]}>
        <boxGeometry args={[5.2 * Math.max(loadP, 0.001), 0.06, 0.06]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-1.5, 0.45, 0.4]} rotation={[0.3, f * 0.04, 0]} scale={prog(f, 66, 14)}>
        <sphereGeometry args={[0.7, 16, 12]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.5} wireframe />
      </mesh>
      {widths.map((w, i) => {
        const ww = Math.max(0.001, w * prog(f, 80 + i * 6, 14));
        return (
          <mesh key={i} position={[-2.3 + ww / 2 + 1.2 - 0.2, 0.55 - i * 0.38, 0.1]}>
            <boxGeometry args={[ww, 0.14, 0.06]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        );
      })}
      <mesh position={[-1.5, -1.2, 0.1]} scale={[prog(f, 90, 10), 1, 1]}>
        <boxGeometry args={[1.8, 0.1, 0.06]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={0.7} />
      </mesh>
      {f >= 100 ? (
        <group>
          <mesh position={[cx, cy, 0.6]} rotation={[0, 0, 0.4]}>
            <coneGeometry args={[0.13, 0.38, 3]} />
            <meshStandardMaterial color="#111827" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
          {f >= 130 ? (
            <mesh position={[-1.5, -1.15, 0.2]} scale={Math.max(0.01, click * 1.4)}>
              <torusGeometry args={[1, 0.05, 8, 40]} />
              <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={1} transparent opacity={1 - click} />
            </mesh>
          ) : null}
        </group>
      ) : null}
    </group>
  );
};

const UrlPill: React.FC<{f: number}> = ({f}) => (
  <div
    style={{
      position: 'absolute',
      top: 8,
      left: 480 - 220,
      width: 440,
      height: 62,
      borderRadius: 31,
      background: '#fff',
      border: '4px solid #94a3b8',
      boxSizing: 'border-box',
      fontFamily: MONO,
      fontSize: 34,
      lineHeight: '54px',
      paddingLeft: 26,
      color: '#0f172a',
      opacity: prog(f, 8, 8),
    }}
  >
    {'info.cern.ch'.slice(0, Math.max(0, Math.floor((f - 10) / 2)))}
  </div>
);

/* =====================  GRAPH: 3D BARS (ITU data)  ===================== */
const BAR_YEARS = [2005, 2010, 2015, 2020, 2025];
const BAR_VALS = [1.023, 1.981, 2.954, 4.7, 6.0];
const BAR_COLORS = ['#22d3ee', '#38bdf8', '#818cf8', '#c084fc', '#fde047'];
const BAR_X = [-4, -2, 0, 2, 4];
const BAR_K = 76.9; // pixels per 3D unit at the bar plane

export const Bars3DScene: React.FC<{f: number}> = ({f}) => (
  <group rotation={[0, Math.sin(f / 40) * 0.1, 0]}>
    <mesh position={[0, -0.05, 0]}>
      <boxGeometry args={[11, 0.1, 4]} />
      <meshStandardMaterial color="#0b1220" />
    </mesh>
    <gridHelper args={[11, 11, '#38bdf8', '#1e3a8a']} position={[0, 0.01, 0]} />
    {BAR_VALS.map((v, i) => {
      const h = Math.max(0.001, v * 0.75 * prog(f, 10 + i * 12, 40));
      return (
        <group key={i} position={[BAR_X[i], 0, 0]}>
          <mesh position={[0, h / 2, 0]} scale={[1, h, 1]}>
            <boxGeometry args={[1.1, 1, 1.1]} />
            <meshStandardMaterial color={BAR_COLORS[i]} emissive={BAR_COLORS[i]} emissiveIntensity={0.35} metalness={0.3} roughness={0.35} />
          </mesh>
          <mesh position={[0, h + 0.25, 0]} scale={Math.max(0.001, prog(f, 40 + i * 12, 12))}>
            <sphereGeometry args={[0.22, 14, 10]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1.2} />
          </mesh>
        </group>
      );
    })}
  </group>
);

const BarsOverlay: React.FC<{f: number}> = ({f}) => {
  const val = 6 * prog(f, 10, 70);
  return (
    <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 30, top: 10, fontWeight: 800, fontSize: 30, color: '#bae6fd'}}>PEOPLE ONLINE (BILLIONS)</div>
      <div style={{position: 'absolute', left: 30, top: 50, fontWeight: 900, fontSize: 110, color: '#fde047', WebkitTextStroke: '9px #000', paintOrder: 'stroke fill'}}>
        {val.toFixed(1)}B
      </div>
      {BAR_YEARS.map((y, i) => (
        <div key={y} style={{position: 'absolute', left: 480 + BAR_X[i] * BAR_K - 80, width: 160, top: 596, textAlign: 'center', color: '#fff', opacity: prog(f, 10 + i * 12, 20)}}>
          <div style={{fontWeight: 800, fontSize: 30}}>{y}</div>
          <div style={{fontWeight: 900, fontSize: 36, color: BAR_COLORS[i]}}>{BAR_VALS[i].toFixed(1)}B</div>
        </div>
      ))}
      <div style={{position: 'absolute', right: 30, top: 650, fontSize: 22, color: '#fff', opacity: 0.6}}>Source: ITU</div>
    </div>
  );
};

/* =====================  2004-06: 3D SOCIAL CARDS  ===================== */
const HEART = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.9, 0.1, -0.5, 0.9, 0, 0.45);
  s.bezierCurveTo(0.5, 0.9, 0.9, 0.1, 0, -0.5);
  return s;
})();
const SOCIAL = [
  {name: 'Facebook', year: '2004', c: '#3b82f6', y: 2.3, dir: -1},
  {name: 'YouTube', year: '2005', c: '#ef4444', y: 0, dir: 1},
  {name: 'Twitter', year: '2006', c: '#0ea5e9', y: -2.3, dir: -1},
];

export const Social3DScene: React.FC<{f: number}> = ({f}) => (
  <group>
    {Array.from({length: 10}).map((_, i) => {
      const t = (f * 0.015 + random(`h${i}`)) % 1;
      return (
        <mesh key={i} position={[(random(`hx${i}`) - 0.5) * 10, -4.5 + t * 9, -1.2]} rotation={[0, f * 0.05 + i, 0]} scale={0.6 + random(`hs${i}`) * 0.6}>
          <extrudeGeometry args={[HEART, {depth: 0.15, bevelEnabled: false}]} />
          <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={0.5} />
        </mesh>
      );
    })}
    {SOCIAL.map((it, i) => {
      const p = prog(f, 6 + i * 26, 22);
      return (
        <group key={it.name} position={[it.dir * (1 - p) * 14, it.y, 0]} rotation={[0, (1 - p) * it.dir * 0.8 + Math.sin(f / 30 + i) * 0.05, 0]}>
          <mesh>
            <boxGeometry args={[11, 1.75, 0.5]} />
            <meshStandardMaterial color={it.c} metalness={0.2} roughness={0.4} />
          </mesh>
          <mesh position={[-4.5, 0, 0.35]}>
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
          </mesh>
        </group>
      );
    })}
  </group>
);

const SocialOverlay: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', inset: 0, fontFamily: FONT}}>
    {SOCIAL.map((it, i) => {
      const p = prog(f, 6 + i * 26, 22);
      const cy = 336 - it.y * 76.9;
      return (
        <div key={it.name} style={{position: 'absolute', left: 54, width: 852, top: cy - 69, height: 138, transform: `translateX(${it.dir * (1 - p) * 1076}px)`, color: '#fff'}}>
          <div style={{position: 'absolute', left: 150, top: 32, fontWeight: 900, fontSize: 62, textShadow: '0 4px 0 rgba(0,0,0,0.35)'}}>{it.name}</div>
          <div style={{position: 'absolute', right: 40, top: 40, fontWeight: 800, fontSize: 54, opacity: 0.9}}>{it.year}</div>
        </div>
      );
    })}
  </div>
);

/* =====================  2007: 3D PHONE  ===================== */
const APP_C = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308', '#6366f1', '#f97316', '#0ea5e9', '#84cc16'];

export const Phone3DScene: React.FC<{f: number}> = ({f}) => {
  const s = Math.max(0.001, prog(f, 0, 18));
  const flip = (1 - prog(f, 0, 30)) * Math.PI * 1.5;
  const pulse = 1 + 0.15 * Math.sin(f / 4);
  return (
    <group>
      {[0, 1, 2].map((k) => {
        const u = ((f * 0.012 + k / 3) % 1);
        return (
          <mesh key={k} scale={0.8 + u * 3.2} rotation={[0, 0, 0]}>
            <torusGeometry args={[1, 0.03, 8, 64]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} transparent opacity={(1 - u) * 0.7} />
          </mesh>
        );
      })}
      <group scale={s} rotation={[0, Math.sin(f / 35) * 0.6 + flip, 0]}>
        <mesh>
          <boxGeometry args={[1.9, 3.8, 0.25]} />
          <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.13]}>
          <planeGeometry args={[1.7, 3.6]} />
          <meshStandardMaterial color="#4f46e5" emissive="#4f46e5" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 1.65, 0.15]}>
          <boxGeometry args={[0.5, 0.1, 0.03]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {APP_C.map((c, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <mesh key={i} position={[-0.55 + col * 0.55, 1.0 - row * 0.8, 0.16]} scale={Math.max(0.001, prog(f, 20 + i * 3, 10))}>
              <boxGeometry args={[0.38, 0.38, 0.05]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.4} />
            </mesh>
          );
        })}
        <mesh position={[0.95, 1.9, 0.2]} scale={pulse}>
          <sphereGeometry args={[0.22, 14, 10]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((k) => {
        const a = f * 0.04 + (k * Math.PI) / 2;
        const pos: V3 = [Math.cos(a) * 3.6, Math.sin(a * 2) * 0.9, Math.sin(a) * 3.0];
        const col = ['#22c55e', '#ef4444', '#f59e0b', '#a855f7'][k];
        return (
          <mesh key={k} position={pos} rotation={[f * 0.05, f * 0.07, 0]}>
            {k === 0 && <sphereGeometry args={[0.45, 16, 12]} />}
            {k === 1 && <coneGeometry args={[0.45, 0.8, 3]} />}
            {k === 2 && <octahedronGeometry args={[0.5]} />}
            {k === 3 && <torusGeometry args={[0.38, 0.16, 10, 24]} />}
            <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.6} metalness={0.3} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
};

/* =====================  TODAY: 3D GLOBE  ===================== */
const GR = 2.3;
const toXYZ = (lon: number, lat: number, r: number): THREE.Vector3 => {
  const lo = (lon * Math.PI) / 180;
  const la = (lat * Math.PI) / 180;
  return V(r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo));
};
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
const CITY_P = CITIES.map(([lo, la]) => toXYZ(lo, la, GR * 1.01));
const CURVES = PAIRS.map(([a, b]) => {
  const mid = CITY_P[a].clone().add(CITY_P[b]).multiplyScalar(0.5).normalize().multiplyScalar(GR * 1.6);
  return new THREE.QuadraticBezierCurve3(CITY_P[a], mid, CITY_P[b]);
});
const SPARK: V3[] = [
  [-4.2, 2.4, 0.5],
  [4.4, 2.0, 0],
  [-4.6, -1.6, 0.5],
  [4.2, -2.2, 0.8],
  [0.4, 3.6, -1],
  [-2, -3.4, 1],
];

export const Globe3DScene: React.FC<{f: number}> = ({f}) => {
  const s = Math.max(0.001, prog(f, 0, 18));
  return (
    <group scale={s} rotation={[0.25, 0, 0]}>
      <group rotation={[0, f * 0.014 + 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[GR, 40, 28]} />
          <meshStandardMaterial color="#0c4a6e" emissive="#075985" emissiveIntensity={0.5} metalness={0.2} roughness={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[GR * 1.012, 24, 16]} />
          <meshBasicMaterial color="#7dd3fc" wireframe transparent opacity={0.28} />
        </mesh>
        {CURVES.map((c, k) => (
          <mesh key={k}>
            <tubeGeometry args={[c, 32, 0.03, 6, false]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.9} />
          </mesh>
        ))}
        {CURVES.map((c, k) => (
          <Ball key={k} p={c.getPoint((f * 0.012 + k * 0.13) % 1)} r={0.1} color="#ffffff" glow={1.5} />
        ))}
        {CITY_P.map((p, i) => (
          <mesh key={i} position={p} scale={1 + 0.3 * Math.sin(f / 5 + i)}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
      <mesh>
        <sphereGeometry args={[GR * 1.12, 24, 16]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      <group rotation={[0.5, 0, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.012, 6, 80]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
        {[0, Math.PI].map((o, i) => {
          const a = f * 0.04 + o;
          return (
            <group key={i} position={[Math.cos(a) * 3.5, 0, Math.sin(a) * 3.5]} rotation={[0, -a, 0]}>
              <mesh>
                <boxGeometry args={[0.32, 0.22, 0.22]} />
                <meshStandardMaterial color="#e2e8f0" />
              </mesh>
              {[-1, 1].map((d) => (
                <mesh key={d} position={[0, 0, d * 0.4]}>
                  <boxGeometry args={[0.22, 0.02, 0.5]} />
                  <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
      {SPARK.map((p, i) => (
        <mesh key={i} position={p} rotation={[f * 0.04 + i, f * 0.05, 0]} scale={0.18 + 0.1 * Math.abs(Math.sin(f / 9 + i * 1.3))}>
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
};

const GlobeOverlay: React.FC<{f: number}> = ({f}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      width: 960,
      top: 610,
      textAlign: 'center',
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: 50,
      color: '#fff',
      WebkitTextStroke: '8px #000',
      paintOrder: 'stroke fill',
    }}
  >
    {(6 * prog(f, 10, 70)).toFixed(1)} BILLION+ ONLINE
  </div>
);

/* =====================  wrapper  ===================== */
export const Visual3D: React.FC<{type: Net3DType}> = ({type}) => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 10);
  const wrap: React.CSSProperties = {position: 'relative', width: 960, height: 672, opacity: enter, transform: `scale(${0.94 + 0.06 * enter})`};
  if (type === 'network3d') {
    return (
      <div style={wrap}>
        <Stage h={470} cam={[0, 0.5, 11]} look={[0, 0.3, 0]}>
          <Network3DScene f={f} />
        </Stage>
        <Terminal f={f} />
      </div>
    );
  }
  if (type === 'email3d') {
    return (
      <div style={wrap}>
        <Stage cam={[0, 0.8, 11]} look={[0, 0.2, 0]}>
          <Email3DScene f={f} />
        </Stage>
        <AtOverlay f={f} />
      </div>
    );
  }
  if (type === 'packets3d') {
    return (
      <div style={wrap}>
        <Stage cam={[0, 0, 11]}>
          <Packets3DScene f={f} />
        </Stage>
        <TcpBadge f={f} />
      </div>
    );
  }
  if (type === 'web3d') {
    return (
      <div style={wrap}>
        <Stage cam={[0, 0.2, 10.5]}>
          <Web3DScene f={f} />
        </Stage>
        <UrlPill f={f} />
      </div>
    );
  }
  if (type === 'bars3d') {
    return (
      <div style={wrap}>
        <Stage cam={[0, 2.2, 12]} look={[0, 1.7, 0]}>
          <Bars3DScene f={f} />
        </Stage>
        <BarsOverlay f={f} />
      </div>
    );
  }
  if (type === 'social3d') {
    return (
      <div style={wrap}>
        <Stage cam={[0, 0, 12]}>
          <Social3DScene f={f} />
        </Stage>
        <SocialOverlay f={f} />
      </div>
    );
  }
  if (type === 'phone3d') {
    return (
      <div style={wrap}>
        <Stage cam={[0, 0, 11]}>
          <Phone3DScene f={f} />
        </Stage>
      </div>
    );
  }
  return (
    <div style={wrap}>
      <Stage cam={[0, 0.2, 11]}>
        <Globe3DScene f={f} />
      </Stage>
      <GlobeOverlay f={f} />
    </div>
  );
};
