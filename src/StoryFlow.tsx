import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
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
import {ChromaticAberration, CinematicBars, DataRain, Flash, GridBG, Particles, Ring, Road, Scanlines, SpeedLines, Sweep, Vignette} from './VFX';
import {ThemeBG} from './ThemeBG';
import {BeatGlow, CardFrame, DataMoment, HeroObject, Mascot, Sparkles, ThemeBadge, beatPulse} from './MotionKit';
import {getTheme, Theme} from './themes';
import {Hook, KineticTitle, Scene, Stat, StoryProps} from './Story';

/** One background for the whole video: drifting glow, crossfading photos, no cuts. */
const FlowBackground: React.FC<{
  f: number;
  total: number;
  scenes: Scene[];
  starts: number[];
  ends: number[];
  fps: number;
  theme: Theme;
}> = ({f, total, scenes, starts, ends, fps, theme}) => {
  const [c1, c2] = theme.palette[0];
  const angle = 140 + (f / Math.max(1, total)) * 70;
  const glowX = 540 + Math.sin(f / 190) * 380;
  const glowY = 900 + Math.cos(f / 240) * 420;
  // Loop seam: the last half-second becomes the exact gradient used on frame 0,
  // so when Shorts wraps the video there is no visible cut.
  const loopOp = interpolate(f, [total - 15, total - 1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
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
      {scenes.flatMap((sc, i) => {
        const photos = sc.photos?.length ? sc.photos : sc.photo ? [sc.photo] : [];
        const cues = sc.photoCues ?? [];
        return photos.map((path, j) => {
          // Each photo owns a stretch of the narration; neighbours overlap for a smooth blend.
          const cue = cues[j];
          const s = cue ? cue.from * fps : starts[i] + ((ends[i] - starts[i]) * j) / photos.length;
          const e = cue ? cue.to * fps : starts[i] + ((ends[i] - starts[i]) * (j + 1)) / photos.length;
          const F = 15;
          const smooth = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.ease)};
          const op = Math.min(
            interpolate(f, [s - F, s + F], [0, 1], smooth),
            interpolate(f, [e - F, e + F], [1, 0], smooth)
          ) * theme.photoOpacity;
          if (op <= 0.002) return null;
          const progress = (f - s) / Math.max(1, e - s);
          const zoom = 1.04 + progress * 0.09;
          // Alternating slow horizontal drift + a tiny tilt makes still photos feel filmed.
          const pan = (i % 2 ? -1 : 1) * progress * 26;
          const tilt = ((i + j) % 3 - 1) * progress * 1.2;
          return (
            <Img
              key={`${i}-${j}`}
              src={staticFile(path)}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: op,
                transform: `translateX(${pan}px) scale(${zoom}) rotate(${tilt}deg)`,
              }}
            />
          );
        });
      })}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${theme.photoTint}55, ${theme.photoTint}cc)`}} />
      <ThemeBG seed={theme.bgStyle * 31} variant={theme.bgStyle} accent={theme.accent} lf={f} />
      {loopOp > 0 ? (
        <AbsoluteFill style={{background: `linear-gradient(140deg, ${c1}, ${c2})`, opacity: loopOp}} />
      ) : null}
    </AbsoluteFill>
  );
};

/** Four different chapter transitions, rotated one per scene. Cheap DOM + gradients only. */
const ChapterTransition: React.FC<{lf: number; theme: Theme; kind: number}> = ({lf, theme, kind}) => {
  if (lf > 30) return null;
  const a = theme.accent;
  const c = theme.secondary;
  const k = ((kind % 4) + 4) % 4;

  if (k === 0) { // glitch cut
    const op = interpolate(lf, [0, 5, 22], [0.9, 0.7, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', opacity: op}}>
        {[220, 520, 820, 1180].map((y, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', left: (Math.floor(lf / 3) % 2 ? 1 : -1) * (8 + i * 6),
              top: y, width: 1080, height: 12 + i * 4,
              background: i % 2 ? `${c}aa` : `${a}cc`,
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }
  if (k === 1) { // whip-pan with streak
    const x = interpolate(lf, [2, 30], [-400, 1480], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const op = interpolate(lf, [2, 12, 30], [0, 0.95, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden', transform: `skewX(${interpolate(lf, [0, 30], [8, -8])}deg)`}}>
        <div style={{position: 'absolute', top: 462, left: x, width: 1100, height: 6, background: `linear-gradient(90deg, transparent, ${a}, ${c}, transparent)`, boxShadow: `0 0 45px ${a}`, opacity: op, transform: 'rotate(-2deg)'}} />
      </AbsoluteFill>
    );
  }
  if (k === 2) { // zoom-through ring
    const s = interpolate(lf, [0, 26], [0.1, 2.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const op = interpolate(lf, [0, 8, 26], [0, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 540 - 320 * s, top: 900 - 320 * s, width: 640 * s, height: 640 * s, borderRadius: '50%', border: `18px solid ${a}`, opacity: op}} />
      </AbsoluteFill>
    );
  }
  // light-leak flash
  const op = interpolate(lf, [0, 6, 26], [0, 0.75, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, ${c}88, ${a}55 35%, transparent 70%)`, opacity: op}} />
    </AbsoluteFill>
  );
};

/** A single scene's content. It fades in/out instead of sliding the whole frame away. */
const FlowScene: React.FC<{
  scene: Scene;
  index: number;
  lf: number;
  f: number;
  durF: number;
  theme: Theme;
  total: number;
  dateEnd: number;
  statAt: number;
}> = ({scene, index, lf, f, durF, theme, total, dateEnd, statAt}) => {
  const fadeIn = interpolate(lf, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(lf, [durF - 14, durF], [1, 0.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = Math.min(fadeIn, fadeOut);
  const drift = interpolate(lf, [0, durF], [0, -26]);
  // The date is announced, then it clears the screen so the visual can breathe.
  const dateOp = interpolate(lf, [dateEnd, dateEnd + 12], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const datePop = interpolate(lf, [0, 9], [0.62, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Twist scenes get a quick RGB jitter on the date; the underline sweeps as it lands.
  const jitterAmt = scene.mood === 'shock'
    ? interpolate(lf, [statAt, statAt + 8, statAt + 48], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;
  const jitter = Math.sin(lf * 1.7) * 5 * jitterAmt;
  const sweep = interpolate(lf, [dateEnd - 4, dateEnd + 22], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // The picture rises in right after the date, in time with the story.
  const visualOp = interpolate(lf, [dateEnd - 4, dateEnd + 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const visualY = interpolate(lf, [dateEnd - 4, dateEnd + 20], [90, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const breathe = 1 + Math.sin(lf / 22) * 0.018 + beatPulse(f, 30) * 0.02; // alive on the music beat
  const isCar = CAR_TYPES.includes(scene.device);
  const isNet3 = NET3D_TYPES.includes(scene.device);
  const isGta = GTA_TYPES.includes(scene.device);
  const isNet = NET_TYPES.includes(scene.device) || isNet3;

  return (
    <AbsoluteFill style={{opacity: op}}>
      <div
        style={{
          position: 'absolute', top: 300, left: 0, right: 0,
          textAlign: 'center', fontFamily: theme.font, fontWeight: 900,
          fontSize: 520, lineHeight: '520px', color: theme.accent,
          opacity: 0.045, whiteSpace: 'nowrap',
          transform: `translateY(${lf * 0.3}px) scale(1.15)`,
          pointerEvents: 'none',
        }}
      >
        {scene.year}
      </div>
      <ChapterTransition lf={lf} theme={theme} kind={index} />
      <div
        style={{
          position: 'absolute',
          top: 135 + drift,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: theme.font,
          color: '#fff',
          opacity: dateOp,
          transform: `translateX(${jitter}px) scale(${datePop})`,
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
        <div
          style={{
            position: 'absolute', left: '50%', top: 386, width: 460, height: 6,
            marginLeft: -230, borderRadius: 3, background: theme.accent,
            boxShadow: `0 0 26px ${theme.accent}`,
            opacity: dateOp * 0.85,
            transform: `scaleX(${sweep})`,
          }}
        />
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
          opacity: visualOp,
          transform: `translateY(${visualY}px) scale(${0.85 * breathe})`,
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
          <CardFrame lf={lf} theme={theme} at={statAt} />
          <Sparkles lf={lf} theme={theme} at={statAt} />
          <Stat text={scene.stat} label={scene.statLabel} lf={lf} accent={theme.accent} glow={theme.glow} font={theme.font} at={statAt} />
          <DataMoment lf={lf} at={statAt} theme={theme} kind={index} />
        </>
      ) : null}
      {index === 0 && scene.hook ? <Hook text={scene.hook} lf={lf} accent={theme.accent} font={theme.font} /> : null}

      {scene.stat ? (
        <Sequence from={statAt}>
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
      <div
        style={{
          position: 'absolute', right: 44, top: 42,
          fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: 2,
          textShadow: '0 2px 0 #000',
          opacity: interpolate(f, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        {String(index + 1).padStart(2, '0')}
        <span style={{color: theme.accent}}> / </span>
        {String(scenes.length).padStart(2, '0')}
      </div>
    </div>
  );
};

/** Thin animated corner frame — a cheap recurring series signature. */
const CornerFrame: React.FC<{f: number; theme: Theme}> = ({f, theme}) => {
  const {fps} = useVideoConfig();
  const p = beatPulse(f, fps);
  const op = interpolate(f, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (0.28 + p * 0.3);
  const arm = 78;
  const edge = 34;
  const corners: React.CSSProperties[] = [
    {left: edge, top: edge, borderTop: '5px solid', borderLeft: '5px solid'},
    {right: edge, top: edge, borderTop: '5px solid', borderRight: '5px solid'},
    {left: edge, bottom: edge, borderBottom: '5px solid', borderLeft: '5px solid'},
    {right: edge, bottom: edge, borderBottom: '5px solid', borderRight: '5px solid'},
  ];
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: op}}>
      {corners.map((c, i) => (
        <div key={i} style={{position: 'absolute', width: arm, height: arm, borderColor: theme.accent, ...c}} />
      ))}
    </AbsoluteFill>
  );
};

/** Small beat waveform in the lower-left corner: a visual cue that the track is alive. */
const BeatWave: React.FC<{f: number; theme: Theme}> = ({f, theme}) => {
  const {fps} = useVideoConfig();
  const p = beatPulse(f, fps);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 12}).map((_, i) => {
        const h = 8 + (14 + Math.abs(Math.sin(f / 7 + i * 0.7)) * 34) * (0.35 + p * 0.65);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: 38 + i * 13, bottom: 330,
              width: 7, height: h, borderRadius: 4,
              background: i % 3 === 0 ? theme.secondary : theme.accent,
              opacity: 0.4 + p * 0.45,
              transformOrigin: 'bottom',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Last-second engagement card: a reply prompt plus a tease into the next video. */
const EndPrompt: React.FC<{f: number; totalF: number; theme: Theme}> = ({f, totalF, theme}) => {
  const lf = f - (totalF - 44);
  if (lf < 0) return null;
  const enter = interpolate(lf, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const loopOut = interpolate(f, [totalF - 15, totalF - 1], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const op = enter * loopOut;
  const y = interpolate(lf, [0, 12], [34, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none', fontFamily: theme.font}}>
      <div
        style={{
          position: 'absolute', top: '86.5%', left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          opacity: op, transform: `translateY(${y}px)`,
        }}
      >
        <div
          style={{
            padding: '14px 40px', borderRadius: 20,
            background: '#000c', border: `4px solid ${theme.accent}`,
            fontSize: 40, fontWeight: 900, letterSpacing: 2, color: '#fff',
            textShadow: '0 3px 0 #000', boxShadow: `0 0 34px ${theme.accent}55`,
          }}
        >
          COMMENT YOUR GUESS
        </div>
        <div style={{fontSize: 26, fontWeight: 800, color: theme.accent, letterSpacing: 3, textShadow: '0 2px 0 #000'}}>
          NEXT VIDEO&nbsp; →
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const StoryFlow: React.FC<StoryProps> = ({scenes, music, sfx, sfxPack, narration, theme: themeId, hero}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const f = useCurrentFrame();
  const theme = getTheme(themeId);
  const total = durationInFrames / fps;
  const starts = scenes.map((s) => Math.round(s.start * fps));
  const ends = scenes.map((s, i) => (i < scenes.length - 1 ? starts[i + 1] : durationInFrames));

  const allWords = scenes.flatMap((s) => s.words ?? []);

  // The mascot reacts to the story beat and to twist scenes flagged in the script.
  const current = starts.reduce((acc, s, i) => (f >= s ? i : acc), 0);
  const sc = scenes[current];
  const statF = sc ? starts[current] + Math.round(((sc.statSec ?? sc.start) - sc.start) * fps) : -1;
  const energy = interpolate(f, [statF, statF + 6, statF + 24], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shock = sc?.mood === 'shock'
    ? interpolate(f, [statF + 6, statF + 18, statF + 52], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;

  // Beat-driven camera: push in on numbers, shake on the twist, ease back on the final question.
  // Scale never drops below 1, so no black edges appear at the joins.
  const beat = beatPulse(f, fps);
  const lastStart = starts[scenes.length - 1] ?? 0;
  const closing = current === scenes.length - 1
    ? interpolate(f, [lastStart, lastStart + 150], [0.05, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;
  // The first 26 frames snap in from a slight push: the feed's first 1.5s feel alive.
  const openingRamp = interpolate(f, [0, 26], [0.08, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const camScale = 1 + Math.max(energy * 0.04, closing, openingRamp) + beat * 0.004;
  const camX = shock > 0 ? Math.sin(f * 1.9) * shock * 4 : 0;
  const camY = shock > 0 ? Math.cos(f * 2.4) * shock * 3 : 0;
  const camera: React.CSSProperties = {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    transform: `translate(${camX}px, ${camY}px) scale(${camScale})`,
    transformOrigin: '50% 50%',
  };

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={camera}>
      <FlowBackground f={f} total={total} scenes={scenes} starts={starts} ends={ends} fps={fps} theme={theme} />
      <Particles lf={f % (fps * 8)} seed={7} color={theme.accent} count={18} />
      {shock > 0 && f - statF < 12 ? <ChromaticAberration lf={f - statF} /> : null}

      {scenes.map((sc, i) => {
        const from = starts[i];
        const to = ends[i];
        const durF = Math.max(1, to - from);
        // Every cue comes from the real spoken word timings in story.json.
        const first = (sc.words ?? [])[0];
        const dateRaw = ((sc.dateSec ?? first?.end ?? sc.start + 0.4) - sc.start) * fps + 8;
        const dateEnd = Math.round(Math.max(18, Math.min(44, dateRaw)));
        const statRaw = ((sc.statSec ?? sc.start + sc.dur * 0.55) - sc.start) * fps;
        const statAt = Math.round(Math.max(dateEnd + 4, Math.min(durF - 22, statRaw)));
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <FlowScene
              scene={sc}
              index={i}
              lf={f - from}
              f={f}
              durF={durF}
              theme={theme}
              total={total}
              dateEnd={dateEnd}
              statAt={statAt}
            />
          </Sequence>
        );
      })}

      <Mascot lf={f} theme={theme} energy={energy} shock={shock} />
      <HeroObject f={f} theme={theme} hero={hero ?? undefined} />
      <BeatGlow f={f} theme={theme} />
      {energy > 0 ? (
        <AbsoluteFill style={{background: '#fff', opacity: energy * 0.1, pointerEvents: 'none'}} />
      ) : null}
      <ThemeBadge lf={f} theme={theme} />
      <CornerFrame f={f} theme={theme} />
      <BeatWave f={f} theme={theme} />
      <FlowTimeline f={f} total={total} scenes={scenes} theme={theme} starts={starts} />
      <Sweep lf={f} />
      <Scanlines />
      <div style={{position: 'absolute', inset: 0, opacity: 0.8 + beat * 0.2}}>
        <Vignette />
      </div>
      <Ring lf={f} />
      <Flash lf={f} />
      <CinematicBars lf={f} />
      </div>

      <div
        style={{
          position: 'absolute', inset: 0,
          opacity: interpolate(f, [durationInFrames - 15, durationInFrames - 1], [1, 0], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          }),
        }}
      >
        <Captions words={allWords} accent={theme.accent} font={theme.font} karaoke />
      </div>
      <EndPrompt f={f} totalF={durationInFrames} theme={theme} />

      {narration ? <Audio src={staticFile(narration)} /> : null}
      {sfx ? <Audio src={staticFile(sfx)} volume={0.3} /> : null}
      {sfx ? starts.slice(1).map((s, i) => (
        <Sequence key={`whoosh${i}`} from={Math.max(0, s - 4)}>
          <Audio src={staticFile(sfx)} volume={0.55} />
        </Sequence>
      )) : null}

      {/* Sound design layer: soft date ticks, count-up pops, and a riser into the twist. */}
      {starts.map((s, i) => (
        <Sequence key={`dateTick${i}`} from={s}>
          <Audio src={staticFile('click.mp3')} volume={0.28} />
        </Sequence>
      ))}
      {scenes.flatMap((scene, i) => {
        if (!scene.statSec) return [];
        const at = starts[i] + Math.round((scene.statSec - scene.start) * fps);
        return [0, 7, 14].map((d, k) => (
          <Sequence key={`countPop${i}-${k}`} from={at + d}>
            <Audio src={staticFile('pop.mp3')} volume={0.16 + k * 0.07} />
          </Sequence>
        ));
      })}
      {sc?.mood === 'shock' ? (
        <Sequence from={Math.max(0, statF - 24)}>
          <Audio
            src={staticFile('whoosh.mp3')}
            volume={(fr) => interpolate(fr, [0, 24], [0.08, 0.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          />
        </Sequence>
      ) : null}
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
