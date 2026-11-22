import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions, Word} from './Captions';
import {Device, DeviceType} from './Device';
import {CAR_TYPES, CarType, Vehicle} from './Vehicle';
import {NET_TYPES, NetType, NetVisual} from './NetVisuals';
import {NET3D_TYPES, Net3DType, Visual3D} from './Scene3D';
import {GTA_TYPES, GtaType, VisualGta} from './GtaScenes';
import {DataRain, Flash, GridBG, Ring, Road, SpeedLines, Sweep, Vignette} from './VFX';
import {ThemeBG} from './ThemeBG';
import {CardFrame, Mascot, Sparkles, ThemeBadge} from './MotionKit';
import {getTheme, Theme} from './themes';

export type Scene = {
  year: string;
  title: string;
  device: DeviceType | CarType | NetType | Net3DType | GtaType;
  text: string;
  start: number;
  dur: number;
  audio?: string;
  words: Word[];
  photo?: string | null;
  hook?: string | null;
  stat?: string | null;
  statLabel?: string | null;
};

export type SfxPack = {impact?: string | null; pop?: string | null; click?: string | null};
export type StoryProps = {scenes: Scene[]; music?: string | null; sfx?: string | null; sfxPack?: SfxPack | null; theme?: string | null; narration?: string | null};

const T = 12; // transition length in frames

export const KineticTitle: React.FC<{text: string; lf: number; accent: string; font: string}> = ({text, lf, accent, font}) => {
  const {fps} = useVideoConfig();
  const chars = [...text.toUpperCase()];
  return (
    <div
      style={{
        fontSize: 64,
        fontWeight: 900,
        fontFamily: font,
        color: accent,
        WebkitTextStroke: '8px #000',
        paintOrder: 'stroke fill',
        whiteSpace: 'pre',
      }}
    >
      {chars.map((ch, i) => {
        const s = spring({frame: Math.max(0, lf - 6 - i * 1.2), fps, config: {damping: 12, stiffness: 200}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              transform: `translateY(${(1 - s) * 60}px) scale(${0.6 + 0.4 * s})`,
              opacity: Math.min(1, s * 2),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const Timeline: React.FC<{years: string[]; index: number; lf: number; accent: string; font: string}> = ({years, index, lf, accent, font}) => {
  const n = years.length;
  const x0 = 90;
  const x1 = 990;
  const xs = years.map((_, i) => x0 + (n > 1 ? (i * (x1 - x0)) / (n - 1) : 0));
  const prev = index > 0 ? xs[index - 1] : xs[0];
  const fill = prev + (xs[index] - prev) * interpolate(lf, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: 40, left: 0, right: 0, height: 100, fontFamily: font}}>
      <div style={{position: 'absolute', left: x0, top: 14, width: x1 - x0, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.25)'}} />
      <div style={{position: 'absolute', left: x0, top: 14, width: fill - x0, height: 6, borderRadius: 3, background: accent}} />
      {xs.map((x, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: 'absolute',
              left: x - 9,
              top: 8,
              width: 18,
              height: 18,
              borderRadius: 9,
              background: i <= index ? accent : 'rgba(255,255,255,0.35)',
              border: '3px solid #000',
              transform: i === index ? 'scale(1.35)' : 'scale(1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: x - 60,
              width: 120,
              top: 38,
              textAlign: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: '#fff',
              opacity: i === index ? 1 : 0.5,
              textShadow: '0 2px 0 #000',
            }}
          >
            {years[i]}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const Cue: React.FC<{at: number; src?: string | null; vol?: number}> = ({at, src, vol = 0.6}) =>
  src ? (
    <Sequence from={at}>
      <Audio src={staticFile(src)} volume={vol} />
    </Sequence>
  ) : null;

export const Hook: React.FC<{text: string; lf: number; accent: string; font: string}> = ({text, lf, accent, font}) => {
  const {fps} = useVideoConfig();
  const sp = spring({frame: lf, fps, config: {damping: 10, stiffness: 200}});
  const out = interpolate(lf, [62, 76], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = Math.sin(lf * 1.7) * interpolate(lf, [0, 20], [12, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out, pointerEvents: 'none'}}>
      <div
        style={{
          width: 940,
          textAlign: 'center',
          fontFamily: font,
          fontWeight: 900,
          fontSize: 100,
          lineHeight: '114px',
          color: accent,
          WebkitTextStroke: '12px #000',
          paintOrder: 'stroke fill',
          textTransform: 'uppercase',
          background: 'rgba(0,0,0,0.55)',
          borderRadius: 40,
          padding: '30px 20px',
          transform: `translateX(${shake}px) scale(${0.4 + 0.6 * sp})`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

export const Stat: React.FC<{text: string; label?: string | null; lf: number; accent: string; glow: string; font: string}> = ({text, label, lf, accent, glow, font}) => {
  const {fps} = useVideoConfig();
  const start = 34;
  const g = lf - start;
  if (g < 0) return null;
  const sp = spring({frame: g, fps, config: {damping: 9, stiffness: 220, mass: 0.8}});
  const out = interpolate(lf, [start + 62, start + 76], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = Math.sin(g * 2.1) * interpolate(g, [0, 14], [16, 0], {extrapolateRight: 'clamp'});
  const flash = interpolate(g, [0, 7], [0.5, 0], {extrapolateRight: 'clamp'});
  const num = text.match(/^(\d[\d,.]*)(.*)$/);
  const counted = num
    ? String(Math.round(parseFloat(num[1].replace(/,/g, '')) * Math.min(1, sp))) + num[2]
    : text;
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out, pointerEvents: 'none'}}>
        <div style={{textAlign: 'center', fontFamily: font, fontWeight: 900, transform: `translate(${shake}px, ${-shake * 0.5}px) scale(${2.6 - 1.6 * sp})`}}>
          <div style={{fontSize: 190, lineHeight: '200px', color: accent, WebkitTextStroke: '14px #000', paintOrder: 'stroke fill', textShadow: `0 0 60px ${glow}`}}>{counted}</div>
          {label ? <div style={{fontSize: 64, color: '#fff', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill'}}>{label}</div> : null}
        </div>
      </AbsoluteFill>
    </>
  );
};

const SceneView: React.FC<{
  scene: Scene;
  index: number;
  shift: number;
  sfx?: string | null;
  sfxPack?: SfxPack | null;
  years: string[];
  theme: Theme;
}> = ({scene, index, shift, sfx, sfxPack, years, theme}) => {
  const f = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const lf = Math.max(0, f - shift); // frames since the scene's real start
  const isCar = CAR_TYPES.includes(scene.device);
  const isNet3 = NET3D_TYPES.includes(scene.device);
  const isGta = GTA_TYPES.includes(scene.device);
  const isNet = NET_TYPES.includes(scene.device) || isNet3;
  const [c1, c2] = theme.palette[index % theme.palette.length];

  const p = shift
    ? interpolate(f, [0, shift], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)})
    : 1;
  const wrap: React.CSSProperties = {};
  if (shift) {
    const kind = index % 4;
    if (kind === 0) wrap.transform = `translateX(${(1 - p) * 1080}px)`;
    if (kind === 1) wrap.transform = `translateY(${(1 - p) * 1920}px)`;
    if (kind === 2) {
      wrap.transform = `scale(${0.6 + 0.4 * p})`;
      wrap.opacity = p;
    }
    if (kind === 3) wrap.clipPath = `circle(${p * 150}% at 50% 55%)`;
  }

  const angle = interpolate(lf, [0, durationInFrames], [150, 210]);
  const impact = interpolate(lf, [0, 10], [1.12, 1], {extrapolateRight: 'clamp'});
  const zoom = interpolate(lf, [0, durationInFrames], [1, 1.05]) * impact;
  const pop = spring({frame: lf, fps, config: {damping: 11, stiffness: 170}});
  const yearShake = Math.sin(lf * 0.9) * interpolate(lf, [0, 14], [10, 0], {extrapolateRight: 'clamp'});
  const g = interpolate(lf, [0, 12], [16, 0], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: `linear-gradient(${angle}deg, ${c1}, ${c2})`, ...wrap}}>
      {scene.photo ? (
        <AbsoluteFill>
          <Img
            src={staticFile(scene.photo)}
            style={{width: '100%', height: '100%', objectFit: 'cover', opacity: theme.photoOpacity, transform: `scale(${1 + 0.14 * (lf / Math.max(1, durationInFrames))})`}}
          />
          <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.photoTint}66, ${theme.photoTint}cc)`}} />
        </AbsoluteFill>
      ) : null}
      <ThemeBG seed={index + theme.bgStyle * 17} variant={theme.bgStyle} accent={theme.accent} lf={lf} />
      <ThemeBadge lf={lf} theme={theme} />
      {isNet ? <GridBG lf={lf} /> : null}
      {isNet ? <DataRain lf={lf} /> : <SpeedLines lf={lf} n={isCar ? 22 : 10} />}
      {isCar ? <Road lf={lf} /> : null}
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <div
          style={{
            position: 'absolute',
            top: 135,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: theme.font,
            color: '#fff',
          }}
        >
          <div
            style={{
              fontSize: 220,
              lineHeight: '230px',
              fontWeight: 900,
              WebkitTextStroke: '10px #000',
              paintOrder: 'stroke fill',
              textShadow: `${g}px 0 ${theme.accent}, ${-g}px 0 rgba(0,220,255,0.9)`,
              transform: `translateX(${yearShake}px) scale(${0.5 + 0.5 * pop})`,
              opacity: Math.min(1, pop * 1.5),
            }}
          >
            {scene.year}
          </div>
          <KineticTitle text={scene.title} lf={lf} accent={theme.accent} font={theme.font} />
        </div>
        <Sequence from={shift}>
          {isGta ? (
            <div style={{position: 'absolute', top: 545, left: 60}}>
              <VisualGta type={scene.device as GtaType} />
            </div>
          ) : isNet3 ? (
            <div style={{position: 'absolute', top: 545, left: 60}}>
              <Visual3D type={scene.device as Net3DType} />
            </div>
          ) : isNet ? (
            <div style={{position: 'absolute', top: 545, left: 60}}>
              <NetVisual type={scene.device as NetType} />
            </div>
          ) : isCar ? (
            <div style={{position: 'absolute', top: 640, left: 90}}>
              <Vehicle type={scene.device as CarType} />
            </div>
          ) : (
            <div style={{position: 'absolute', top: 500, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: 'scale(0.85)'}}>
              <Device type={scene.device as DeviceType} />
            </div>
          )}
        </Sequence>
        <Mascot lf={lf} theme={theme} />
      </AbsoluteFill>
      <Timeline years={years} index={index} lf={lf} accent={theme.accent} font={theme.font} />
      <Sweep lf={lf} />
      <Vignette />
      <Sequence from={shift}>
        <Captions words={scene.words} accent={theme.accent} font={theme.font} />
        {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
      </Sequence>
      {scene.stat ? (
        <>
          <CardFrame lf={lf} theme={theme} />
          <Sparkles lf={lf} theme={theme} />
          <Stat text={scene.stat} label={scene.statLabel} lf={lf} accent={theme.accent} glow={theme.glow} font={theme.font} />
        </>
      ) : null}
      {scene.stat ? <Cue at={shift + 34} src={sfxPack?.impact} vol={0.9} /> : null}
      {index === 0 && scene.hook ? <Hook text={scene.hook} lf={lf} accent={theme.accent} font={theme.font} /> : null}
      <Cue at={shift} src={sfxPack?.impact} vol={0.7} />
      {(scene.device === 'social3d' || scene.device === 'social') &&
        [0, 1, 2].map((k) => <Cue key={k} at={shift + 10 + k * 26} src={sfxPack?.pop} vol={0.6} />)}
      {(scene.device === 'network3d' || scene.device === 'network') &&
        [90, 100].map((a) => <Cue key={a} at={shift + a} src={sfxPack?.click} vol={0.5} />)}
      {(scene.device === 'web3d' || scene.device === 'browser') && <Cue at={shift + 130} src={sfxPack?.click} vol={0.6} />}
      <Ring lf={lf} />
      <Flash lf={lf} />
      {sfx ? <Audio src={staticFile(sfx)} volume={0.5} /> : null}
    </AbsoluteFill>
  );
};

export const Story: React.FC<StoryProps> = ({scenes, music, sfx, sfxPack, theme: themeId}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const years = scenes.map((s) => s.year);
  const theme = getTheme(themeId);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map((s, i) => {
        const shift = i > 0 ? T : 0;
        return (
          <Sequence
            key={i}
            from={Math.round(s.start * fps) - shift}
            durationInFrames={Math.max(1, Math.round(s.dur * fps)) + shift}
          >
            <SceneView scene={s} index={i} shift={shift} sfx={sfx} sfxPack={sfxPack} years={years} theme={theme} />
          </Sequence>
        );
      })}
      {music ? (
        <Audio
          src={staticFile(music)}
          volume={(fr) =>
            interpolate(fr, [0, 30, durationInFrames - 45, durationInFrames], [0, 0.12, 0.12, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
