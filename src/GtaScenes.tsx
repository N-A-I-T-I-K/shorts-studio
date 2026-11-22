import React from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {Easing, interpolate, random, useCurrentFrame} from 'remotion';

export type GtaType = 'citynight' | 'topdown' | 'jump3d' | 'neonmiami' | 'rainycity' | 'money' | 'online' | 'compare';
export const GTA_TYPES: string[] = ['citynight', 'topdown', 'jump3d', 'neonmiami', 'rainycity', 'money', 'online', 'compare'];

const FONT = 'Montserrat, "Arial Black", Arial, sans-serif';
type V3 = [number, number, number];

const prog = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mod = (a: number, m: number) => ((a % m) + m) % m;
const NEON = ['#f0abfc', '#22d3ee', '#fde047', '#fb7185', '#a3e635'];

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.9} />
    <directionalLight position={[5, 8, 6]} intensity={2.2} />
    <pointLight position={[-6, 3, 5]} intensity={70} color="#f472b6" />
    <pointLight position={[6, 2, 4]} intensity={50} color="#22d3ee" />
  </>
);

const Stage: React.FC<{cam: V3; look: V3; fov?: number; children: React.ReactNode}> = ({cam, look, fov = 45, children}) => (
  <ThreeCanvas
    width={960}
    height={672}
    camera={{fov, position: cam, near: 0.1, far: 120}}
    onCreated={({camera}) => {
      camera.lookAt(look[0], look[1], look[2]);
    }}
    style={{position: 'absolute', left: 0, top: 0}}
  >
    <Lights />
    {children}
  </ThreeCanvas>
);

const Ground: React.FC<{color?: string; size?: [number, number]; y?: number; z?: number}> = ({color = '#0b1020', size = [60, 80], y = 0, z = -20}) => (
  <mesh position={[0, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={size} />
    <meshStandardMaterial color={color} metalness={0.2} roughness={0.8} />
  </mesh>
);

/* A simple blocky car, faces -Z (away from the camera). */
const Car: React.FC<{color?: string; scale?: number; lights?: boolean}> = ({color = '#ef4444', scale = 1, lights = true}) => (
  <group scale={scale}>
    <mesh position={[0, 0.35, 0]}>
      <boxGeometry args={[1.1, 0.4, 2.2]} />
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.72, 0.1]}>
      <boxGeometry args={[0.9, 0.34, 1.2]} />
      <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.2} />
    </mesh>
    {[-0.5, 0.5].map((x) =>
      [-0.7, 0.7].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.2, 12]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      )),
    )}
    {lights
      ? [-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, 0.38, -1.12]}>
            <boxGeometry args={[0.25, 0.12, 0.04]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fef08a" emissiveIntensity={2} />
          </mesh>
        ))
      : null}
    {[-0.35, 0.35].map((x) => (
      <mesh key={`t${x}`} position={[x, 0.38, 1.12]}>
        <boxGeometry args={[0.25, 0.1, 0.04]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
      </mesh>
    ))}
  </group>
);

/* ---------- 2026: endless night flight over a neon city ---------- */
export const CityNight3DScene: React.FC<{f: number}> = ({f}) => {
  const shift = f * 0.07;
  const base = Math.floor(shift);
  const frac = shift - base;
  const rows = Array.from({length: 13}).map((_, k) => k);
  const cols = [-3, -2, -1, 1, 2, 3];
  return (
    <group>
      <fog attach="fog" args={['#1e1b4b', 8, 42]} />
      <Ground />
      <mesh position={[0, 0.01, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 80]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {Array.from({length: 14}).map((_, j) => (
        <mesh key={j} position={[0, 0.03, 6 - mod(j * 4 + f * 0.3, 56)]}>
          <boxGeometry args={[0.12, 0.02, 1.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {rows.map((k) =>
        cols.map((c) => {
          const id = k - base;
          const r = random(`cb${c}-${id}`);
          const h = 1.6 + random(`ch${c}-${id}`) * 6.5;
          const w = 1.9;
          const x = c * 3.1 + (c < 0 ? -0.4 : 0.4);
          const z = 6 - (k - frac) * 3.4;
          const neon = NEON[Math.floor(r * NEON.length)];
          return (
            <group key={`${k}-${c}`} position={[x, 0, z]}>
              <mesh position={[0, h / 2, 0]}>
                <boxGeometry args={[w, h, 2.2]} />
                <meshStandardMaterial color="#111a33" metalness={0.3} roughness={0.6} />
              </mesh>
              <mesh position={[(c < 0 ? 1 : -1) * (w / 2 + 0.02), h / 2, 0]}>
                <boxGeometry args={[0.05, h * 0.8, 1.9]} />
                <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={r > 0.35 ? 1.1 : 0.35} />
              </mesh>
            </group>
          );
        }),
      )}
      {Array.from({length: 14}).map((_, i) => {
        const t = mod(f * 0.05 + random(`cash${i}`), 1);
        return (
          <mesh key={i} position={[(random(`cx${i}`) - 0.5) * 8, 9 - t * 10, random(`cz${i}`) * 4 - 1]} rotation={[f * 0.08 + i, f * 0.05, f * 0.06]}>
            <boxGeometry args={[0.5, 0.02, 0.3]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------- 1997: top-down map ---------- */
const LANES = [-4.2, -1.4, 1.4, 4.2];
const TD_COLORS = ['#ef4444', '#facc15', '#38bdf8', '#a3e635', '#f472b6', '#fb923c', '#e2e8f0', '#a78bfa'];

const TopCars: React.FC<{f: number}> = ({f}) => (
  <group>
    {LANES.map((z, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      return [0, 1, 2].map((k) => {
        const x = mod(f * 0.07 * dir * (1 + i * 0.12) + k * 8 + i * 3, 24) - 12;
        return (
          <mesh key={`h${i}-${k}`} position={[x, 0.15, z + dir * 0.45]}>
            <boxGeometry args={[0.9, 0.2, 0.5]} />
            <meshStandardMaterial color={TD_COLORS[(i * 3 + k) % 8]} />
          </mesh>
        );
      });
    })}
    {LANES.map((x, i) => {
      const dir = i % 2 === 0 ? -1 : 1;
      return [0, 1, 2].map((k) => {
        const z = mod(f * 0.06 * dir * (1 + i * 0.1) + k * 7 + i * 5, 20) - 10;
        return (
          <mesh key={`v${i}-${k}`} position={[x + dir * 0.45, 0.15, z]}>
            <boxGeometry args={[0.5, 0.2, 0.9]} />
            <meshStandardMaterial color={TD_COLORS[(i * 3 + k + 3) % 8]} />
          </mesh>
        );
      });
    })}
  </group>
);

const Blocks: React.FC<{rise: (i: number) => number; palette?: string[]}> = ({rise, palette = ['#7c8aa5', '#94a3b8', '#64748b', '#8b9bb5']}) => {
  const out: React.ReactNode[] = [];
  let n = 0;
  for (let a = 0; a < 5; a++) {
    for (let b = 0; b < 5; b++) {
      const cx = (a - 2) * 2.8;
      const cz = (b - 2) * 2.8;
      if (LANES.some((l) => Math.abs(l - cx) < 1.2) && false) continue;
      const i = n++;
      const h = 0.4 + random(`bk${i}`) * 3.2;
      const hh = Math.max(0.02, h * rise(i));
      out.push(
        <mesh key={i} position={[cx, hh / 2, cz]}>
          <boxGeometry args={[1.5, hh, 1.5]} />
          <meshStandardMaterial color={palette[i % palette.length]} />
        </mesh>,
      );
    }
  }
  return <group>{out}</group>;
};

export const TopDown3DScene: React.FC<{f: number}> = ({f}) => (
  <group rotation={[0, Math.sin(f / 60) * 0.15, 0]}>
    <Ground color="#3f4a5c" size={[26, 26]} z={0} />
    {LANES.map((l, i) => (
      <group key={i}>
        <mesh position={[l, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 26]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        <mesh position={[0, 0.011, l]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[26, 1.5]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      </group>
    ))}
    {[-5.6, -2.8, 0, 2.8, 5.6].flatMap((a) =>
      [-5.6, -2.8, 0, 2.8, 5.6].map((b, j) => (
        <mesh key={`${a}${b}`} position={[a, 0.05, b]}>
          <boxGeometry args={[1.5, 0.1, 1.5]} />
          <meshStandardMaterial color={['#a3b18a', '#cbd5e1', '#fcd34d', '#fca5a5'][(j + Math.abs(a)) % 4 | 0]} />
        </mesh>
      )),
    )}
    <TopCars f={f} />
  </group>
);

/* ---------- 2001: the map jumps into 3D ---------- */
export const Jump3DScene: React.FC<{f: number}> = ({f}) => {
  const tilt = (1 - prog(f, 8, 45)) * (Math.PI / 4);
  return (
    <group rotation={[tilt, Math.sin(f / 70) * 0.25, 0]} scale={0.9}>
      <Ground color="#334155" size={[26, 26]} z={0} />
      <Blocks rise={(i) => prog(f, 12 + (i % 5) * 3 + Math.floor(i / 5) * 3, 30)} palette={['#7c8aa5', '#94a3b8', '#64748b', '#a5b4c8']} />
      <group scale={1}>
        <TopCars f={f * 0.7} />
      </group>
    </group>
  );
};

/* ---------- 2002/2004: neon sunset drive ---------- */
export const NeonMiami3DScene: React.FC<{f: number}> = ({f}) => (
  <group>
    <fog attach="fog" args={['#3b0764', 14, 52]} />
    <mesh position={[0, 3.2, -30]}>
      <sphereGeometry args={[7, 28, 18]} />
      <meshStandardMaterial color="#fb7185" emissive="#fb7185" emissiveIntensity={1.4} />
    </mesh>
    {Array.from({length: 6}).map((_, i) => (
      <mesh key={i} position={[0, -1 + i * 0.9, -22.5]}>
        <boxGeometry args={[20, 0.12 + i * 0.07, 0.2]} />
        <meshStandardMaterial color="#3b0764" />
      </mesh>
    ))}
    {[-14, -8, 9, 15].map((x, i) => (
      <mesh key={x} position={[x, 2, -34]}>
        <coneGeometry args={[5 + (i % 2) * 2, 8 + i, 5]} />
        <meshStandardMaterial color="#4c1d95" emissive="#6d28d9" emissiveIntensity={0.4} />
      </mesh>
    ))}
    <mesh position={[0, 0, -14]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[60, 70]} />
      <meshStandardMaterial color="#1e1b4b" />
    </mesh>
    <gridHelper args={[60, 40, '#f0abfc', '#6d28d9']} position={[0, 0.02, -14 + mod(f * 0.08, 1.5)]} />
    {Array.from({length: 10}).map((_, k) => {
      const side = k % 2 === 0 ? -1 : 1;
      const z = 6 - mod(k * 5 + f * 0.2, 50);
      return (
        <group key={k} position={[side * 4.2, 0, z]} rotation={[0, side * 0.4 + k, 0]}>
          <mesh position={[0, 1.4, 0]} rotation={[0, 0, side * 0.12]}>
            <cylinderGeometry args={[0.1, 0.17, 2.8, 8]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <mesh key={l} position={[Math.cos((l / 6) * Math.PI * 2) * 0.7, 2.9, Math.sin((l / 6) * Math.PI * 2) * 0.7]} rotation={[Math.sin((l / 6) * Math.PI * 2) * 0.6, 0, -Math.cos((l / 6) * Math.PI * 2) * 0.6]}>
              <boxGeometry args={[0.18, 0.05, 1.4]} />
              <meshStandardMaterial color="#16a34a" emissive="#22c55e" emissiveIntensity={0.3} />
            </mesh>
          ))}
        </group>
      );
    })}
    <group position={[0, 0.02 + Math.sin(f / 6) * 0.02, 3]}>
      <Car color="#22d3ee" scale={1.3} />
    </group>
  </group>
);

/* ---------- 2008: rainy, darker city ---------- */
export const RainyCity3DScene: React.FC<{f: number}> = ({f}) => (
  <group>
    <fog attach="fog" args={['#0b1220', 6, 34]} />
    <mesh position={[0, 0, -14]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 60]} />
      <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
    </mesh>
    {Array.from({length: 12}).map((_, j) => (
      <mesh key={j} position={[0, 0.03, 6 - mod(j * 4 + f * 0.25, 48)]}>
        <boxGeometry args={[0.12, 0.02, 1.4]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#e2e8f0" emissiveIntensity={0.4} />
      </mesh>
    ))}
    {[-1, 1].map((side) =>
      Array.from({length: 8}).map((_, k) => {
        const h = 4 + random(`rb${side}${k}`) * 8;
        return (
          <mesh key={`${side}${k}`} position={[side * 4.6, h / 2, 4 - k * 4.2]}>
            <boxGeometry args={[3, h, 3.6]} />
            <meshStandardMaterial color="#111827" metalness={0.3} roughness={0.7} />
          </mesh>
        );
      }),
    )}
    {Array.from({length: 6}).map((_, k) => {
      const side = k % 2 === 0 ? -1 : 1;
      const z = 2 - k * 6;
      return (
        <group key={k} position={[side * 2.2, 0, z]}>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 3.2, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 3.3, 0]}>
            <sphereGeometry args={[0.22, 12, 8]} />
            <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={2} />
          </mesh>
        </group>
      );
    })}
    <pointLight position={[0, 3.3, -2]} intensity={60} color="#fbbf24" />
    <group position={[0, 0.02, 1.5 - mod(f * 0.05, 12) * 0.2]} rotation={[0, Math.PI, 0]}>
      <Car color="#7f1d1d" scale={1.2} />
    </group>
    {Array.from({length: 120}).map((_, i) => {
      const x = (random(`rx${i}`) - 0.5) * 14;
      const z = 6 - random(`rz${i}`) * 24;
      const y = 9 - mod(f * 0.42 + random(`ry${i}`) * 9, 9);
      return (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.02, 0.45, 0.02]} />
          <meshBasicMaterial color="#93c5fd" transparent opacity={0.55} />
        </mesh>
      );
    })}
  </group>
);

/* ---------- 2013: the money ---------- */
export const Money3DScene: React.FC<{f: number}> = ({f}) => {
  const stacks = [-3.2, -1.6, 0, 1.6, 3.2];
  return (
    <group>
      <Ground color="#0b1020" size={[30, 30]} z={0} />
      {stacks.map((x, i) => {
        const n = Math.floor(prog(f, 8 + i * 6, 60) * (5 + (2 - Math.abs(i - 2)) * 6));
        return (
          <group key={i} position={[x, 0, 0]}>
            {Array.from({length: n}).map((_, k) => (
              <mesh key={k} position={[Math.sin(k * 1.3) * 0.04, 0.08 + k * 0.17, 0]}>
                <cylinderGeometry args={[0.6, 0.6, 0.14, 20]} />
                <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.3} emissive="#a16207" emissiveIntensity={0.35} />
              </mesh>
            ))}
          </group>
        );
      })}
      <mesh position={[0, 3.6, -1.2]} rotation={[Math.PI / 2, 0, f * 0.05]} scale={prog(f, 0, 20)}>
        <cylinderGeometry args={[1.5, 1.5, 0.3, 32]} />
        <meshStandardMaterial color="#fde047" metalness={0.95} roughness={0.25} emissive="#ca8a04" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, 3.6, -1.2]} rotation={[Math.PI / 2, 0, f * 0.05]} scale={prog(f, 0, 20)}>
        <torusGeometry args={[1.5, 0.12, 10, 40]} />
        <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.25} emissive="#facc15" emissiveIntensity={0.8} />
      </mesh>
      {Array.from({length: 26}).map((_, i) => {
        const t = mod(f * 0.02 + random(`cn${i}`), 1);
        return (
          <mesh key={i} position={[(random(`cnx${i}`) - 0.5) * 9, 8 - t * 9, random(`cnz${i}`) * 3 - 1]} rotation={[f * 0.1 + i, f * 0.07, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.07, 14]} />
            <meshStandardMaterial color="#facc15" metalness={0.9} roughness={0.3} emissive="#a16207" emissiveIntensity={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------- Online: a galaxy of game discs ---------- */
export const Online3DScene: React.FC<{f: number}> = ({f}) => {
  const count = Math.floor(prog(f, 5, 70) * 160);
  return (
    <group rotation={[0.9, f * 0.012, 0]} scale={prog(f, 0, 16)}>
      <mesh>
        <sphereGeometry args={[0.8, 20, 14]} />
        <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={1.4} />
      </mesh>
      {Array.from({length: count}).map((_, i) => {
        const a = i * 0.45 + f * (0.012 + (i % 5) * 0.002);
        const r = 1.4 + Math.sqrt(i) * 0.3;
        const c = NEON[i % NEON.length];
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(i * 0.7) * 0.25, Math.sin(a) * r]} rotation={[f * 0.05 + i, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.03, 14]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} metalness={0.5} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ---------- Day-one sales: GTA V vs GTA VI ---------- */
export const Compare3DScene: React.FC<{f: number}> = ({f}) => {
  const hV = Math.max(0.001, 0.8 * 1.1 * prog(f, 10, 35));
  const hVI = Math.max(0.001, 3.79 * 1.1 * prog(f, 40, 60));
  return (
    <group rotation={[0, Math.sin(f / 40) * 0.1, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[9, 0.1, 4]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>
      <gridHelper args={[9, 9, '#38bdf8', '#1e3a8a']} position={[0, 0.01, 0]} />
      <mesh position={[-2.2, hV / 2, 0]} scale={[1, hV, 1]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.35} metalness={0.3} roughness={0.35} />
      </mesh>
      <mesh position={[2.2, hVI / 2, 0]} scale={[1, hVI, 1]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.55} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-2.2, hV + 0.3, 0]} scale={prog(f, 40, 10)}>
        <sphereGeometry args={[0.24, 14, 10]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
      </mesh>
      <mesh position={[2.2, hVI + 0.3, 0]} scale={prog(f, 100, 10)}>
        <sphereGeometry args={[0.3, 14, 10]} />
        <meshStandardMaterial color="#fff" emissive="#fde047" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
};

const CompareOverlay: React.FC<{f: number}> = ({f}) => (
  <div style={{position: 'absolute', inset: 0, fontFamily: FONT, color: '#fff'}}>
    <div style={{position: 'absolute', left: 480 - 2.2 * 76.9 - 120, width: 240, top: 590, textAlign: 'center', opacity: prog(f, 10, 20)}}>
      <div style={{fontSize: 30, fontWeight: 800}}>GTA V · 2013</div>
      <div style={{fontSize: 52, fontWeight: 900, color: '#38bdf8'}}>$0.8B</div>
    </div>
    <div style={{position: 'absolute', left: 480 + 2.2 * 76.9 - 120, width: 240, top: 590, textAlign: 'center', opacity: prog(f, 40, 20)}}>
      <div style={{fontSize: 30, fontWeight: 800}}>GTA VI · 2026</div>
      <div style={{fontSize: 52, fontWeight: 900, color: '#fde047'}}>$3.79B</div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 480 + 2.2 * 76.9 - 200,
        top: 40,
        width: 160,
        height: 160,
        borderRadius: 80,
        background: '#ef4444',
        border: '8px solid #fff',
        boxSizing: 'border-box',
        textAlign: 'center',
        lineHeight: '144px',
        fontSize: 62,
        fontWeight: 900,
        transform: `scale(${prog(f, 100, 14) * (1 + 0.05 * Math.sin(f / 4))}) rotate(-8deg)`,
      }}
    >
      4.7x
    </div>
    <div style={{position: 'absolute', right: 30, top: 650, fontSize: 20, opacity: 0.6}}>Day-one sales, company figures</div>
  </div>
);

const SCENES: Record<GtaType, {cam: V3; look: V3; fov: number}> = {
  citynight: {cam: [0, 3.4, 10], look: [0, 2.8, -12], fov: 52},
  topdown: {cam: [0, 14, 0.01], look: [0, 0, 0], fov: 45},
  jump3d: {cam: [0, 9, 9], look: [0, 0.5, 0], fov: 45},
  neonmiami: {cam: [0, 2.2, 9], look: [0, 1.4, -8], fov: 50},
  rainycity: {cam: [0, 2.2, 9], look: [0, 1.8, -8], fov: 50},
  money: {cam: [0, 3.2, 10.5], look: [0, 2.2, 0], fov: 45},
  online: {cam: [0, 2, 11], look: [0, 0, 0], fov: 45},
  compare: {cam: [0, 2.4, 12], look: [0, 1.9, 0], fov: 40},
};

export const VisualGta: React.FC<{type: GtaType}> = ({type}) => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 10);
  const c = SCENES[type];
  let body: React.ReactNode = null;
  if (type === 'citynight') body = <CityNight3DScene f={f} />;
  else if (type === 'topdown') body = <TopDown3DScene f={f} />;
  else if (type === 'jump3d') body = <Jump3DScene f={f} />;
  else if (type === 'neonmiami') body = <NeonMiami3DScene f={f} />;
  else if (type === 'rainycity') body = <RainyCity3DScene f={f} />;
  else if (type === 'money') body = <Money3DScene f={f} />;
  else if (type === 'online') body = <Online3DScene f={f} />;
  else body = <Compare3DScene f={f} />;
  return (
    <div style={{position: 'relative', width: 960, height: 672, opacity: enter, transform: `scale(${0.94 + 0.06 * enter})`, overflow: 'hidden', borderRadius: 28}}>
      <Stage cam={c.cam} look={c.look} fov={c.fov}>
        {body}
      </Stage>
      {type === 'compare' ? <CompareOverlay f={f} /> : null}
    </div>
  );
};
