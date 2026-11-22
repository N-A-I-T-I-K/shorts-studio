import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Captions} from './Captions';
import {Device, DeviceType} from './Device';
import {CAR_TYPES, Vehicle} from './Vehicle';
import {NET_TYPES, NetVisual} from './NetVisuals';
import {NET3D_TYPES, Visual3D} from './Scene3D';
import {GTA_TYPES, VisualGta} from './GtaScenes';
import {DataRain, Flash, GridBG, Ring, Road, SpeedLines, Sweep, Vignette} from './VFX';
import {ThemeBG} from './ThemeBG';
import {CardFrame, Mascot, Sparkles, ThemeBadge} from './MotionKit';
import {getTheme, Theme} from './themes';
import {Hook, KineticTitle, Scene, Stat, StoryProps} from './Story';

/** One background for the whole video: drifting glow, crossfading photos, no cuts. */
const FlowBackground: React.FC<{
  f: number;
  total: number;
  scenes: Scene[];
  starts: number[];
  theme: Theme;
}> = ({f, total, scenes, starts, theme}) => {
  const [c1, c2] = theme.palette[0];
  const angle = 140 + (f / Math.max(1, total)) * 70;
  const glowX = 540 + Math.sin(f / 190) * 380;
  const glowY = 900 + Math.cos(f / 240) * 420;
  return (
    <AbsoluteFill style={{background: `linear-gradient(${angle}deg, ${c1}, ${c2})`}}>
      <div
        style={{
          position: 'absolute',
          left: glowX - 520,
          top: glowY - 520,
          width: 1040,
          height: 1040,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.accent}2e, transparent 68%)`,
          pointerEvents: 'none',
        }}
      />
      {scenes.map((sc, i) => {
        if (!sc.photo) return null;
        const center = (starts[i] + (starts[i + 1] ?? total)) / 2;
        const span = Math.max(1, ((starts[i + 1] ?? total) - starts[i]) * 0.78);
        const op = interpolate(Math.abs(f - center), [0, span], [theme.photoOpacity, 0], {
          extrapolateRight: 'clamp',
        });
        return (
          <Img
            key={i}
            src={staticFile(sc.photo)}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: op,
              transform: `scale(${1.06 + (f / total) * 0.1})`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.photoTint}55, ${theme.photoTint}cc)`}} />
      <ThemeBG seed={theme.bgStyle * 31} variant={theme.bgStyle} accent={theme.accent} lf={f} />
    </AbsoluteFill>
  );
};

/** A single scene's content. It fades in/out instead of sliding the whole frame away. */
const FlowScene: React.FC<{
  scene: Scene;
  index: number;
  lf: number;
  durF: number;
  theme: Theme;
  total: number;
}> = ({scene, index, lf, durF, theme, total}) => {
  const fadeIn = interpolate(lf, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(lf, [durF - 16, durF], [1, 0.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = Math.min(fadeIn, fadeOut);
  const drift = interpolate(lf, [0, durF], [0, -26]);
  const isCar = CAR_TYPES.includes(scene.device);
  const isNet3 = NET3D_TYPES.includes(scene.device);
  const isGta = GTA_TYPES.includes(scene.device);
  const isNet = NET_TYPES.includes(scene.device) || isNet3;

  return (
    <AbsoluteFill style={{opacity: op}}>
      <div
        style={{
          position: 'absolute',
          top: 135 + drift,
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
            textShadow: `6px 0 ${theme.accent}, -6px 0 rgba(0,220,255,0.85)`,
          }}
        >
          {scene.year}
        </div>
        <KineticTitle text={scene.title} lf={lf} accent={theme.accent} font={theme.font} />
      </div>

      {isNet ? <GridBG lf={lf} /> : null}
      {isNet ? <DataRain lf={lf} /> : <SpeedLines lf={lf} n={isCar ? 18 : 8} />}
      {isCar ? <Road lf={lf} /> : null}

      <div
        style={{
          position: 'absolute',
          top: (isCar ? 640 : isNet || isNet3 || isGta ? 545 : 500) + drift * 0.4,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          transform: 'scale(0.85)',
        }}
      >
        {isGta ? (
          <VisualGta type={scene.device as never} />
        ) : isNet3 ? (
          <Visual3D type={scene.device as never} />
        ) : isNet ? (
          <NetVisual type={scene.device as never} />
        ) : isCar ? (
          <Vehicle type={scene.device as never} />
        ) : (
          <Device type={scene.device as DeviceType} />
        )}
      </div>

      {scene.stat ? (
        <>
          <CardFrame lf={lf} theme={theme} />
          <Sparkles lf={lf} theme={theme} />
          <Stat text={scene.stat} label={scene.statLabel} lf={lf} accent={theme.accent} glow={theme.glow} font={theme.font} />
        </>
      ) : null}
      {index === 0 && scene.hook ? <Hook text={scene.hook} lf={lf} accent={theme.accent} font={theme.font} /> : null}

      {scene.stat ? (
        <Sequence from={34}>
          <Audio src={staticFile('impact.mp3')} volume={0.8} />
        </Sequence>
      ) : null}
      {index === 0 ? (
        <Audio src={staticFile('impact.mp3')} volume={0.6} />
      ) : null}
    </AbsoluteFill>
  );
};

/** Always-on progress rail. It grows smoothly from 0 to 100% for the whole video. */
const FlowTimeline: React.FC<{f: number; total: number; scenes: Scene[]; theme: Theme; starts: number[]}> = ({
  f, total, scenes, theme, starts,
}) => {
  const x0 = 90;
  const x1 = 990;
  const fill = x0 + ((x1 - x0) * f) / Math.max(1, total);
  const index = starts.reduce((acc, s, i) => (f >= s ? i : acc), 0);
  return (
    <div style={{position: 'absolute', top: 40, left: 0, right: 0, height: 100, fontFamily: theme.font}}>
      <div style={{position: 'absolute', left: x0, top: 14, width: x1 - x0, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.22)'}} />
      <div style={{position: 'absolute', left: x0, top: 14, width: fill - x0, height: 6, borderRadius: 3, background: theme.accent, boxShadow: `0 0 22px ${theme.accent}`}} />
      {scenes.map((sc, i) => {
        const x = x0 + (i * (x1 - x0)) / Math.max(1, scenes.length - 1);
        return (
          <div key={i}>
            <div
              style={{
                position: 'absolute',
                left: x - 9,
                top: 8,
                width: 18,
                height: 18,
                borderRadius: 9,
                background: i <= index ? theme.accent : 'rgba(255,255,255,0.35)',
                border: '3px solid #000',
                transform: i === index ? 'scale(1.4)' : 'scale(1)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: x - 62,
                width: 124,
                top: 38,
                textAlign: 'center',
                fontSize: 22,
                fontWeight: 800,
                color: '#fff',
                opacity: i === index ? 1 : 0.42,
                textShadow: '0 2px 0 #000',
              }}
            >
              {sc.year}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const StoryFlow: React.FC<StoryProps> = ({scenes, music, sfx, sfxPack, narration, theme: themeId}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = useCurrentFrame();
  const theme = getTheme(themeId);
  const total = durationInFrames / fps;
  const starts = scenes.map((s) => Math.round(s.start * fps));

  const allWords = scenes.flatMap((s) => s.words ?? []);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <FlowBackground f={f} total={total} scenes={scenes} starts={starts} theme={theme} />

      {scenes.map((sc, i) => {
        const from = starts[i];
        const to = i < scenes.length - 1 ? starts[i + 1] : durationInFrames;
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <FlowScene
              scene={sc}
              index={i}
              lf={f - from}
              durF={Math.max(1, to - from)}
              theme={theme}
              total={total}
            />
          </Sequence>
        );
      })}

      <Mascot lf={f} theme={theme} />
      <ThemeBadge lf={f} theme={theme} />
      <FlowTimeline f={f} total={total} scenes={scenes} theme={theme} starts={starts} />
      <Sweep lf={f} />
      <Vignette />
      <Ring lf={f} />
      <Flash lf={f} />

      <Captions words={allWords} accent={theme.accent} font={theme.font} />

      {narration ? <Audio src={staticFile(narration)} /> : null}
      {sfx ? <Audio src={staticFile(sfx)} volume={0.35} /> : null}
      {music ? (
        <Audio
          src={staticFile(music)}
          volume={(fr) =>
            interpolate(fr, [0, 30, durationInFrames - 45, durationInFrames], [0, 0.11, 0.11, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
