import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Step, Steps } from '@open-slide/core';
import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';

import hkuLogo from './assets/hku-logo.png';
import studioQr from './assets/studio-qr.png';

// ─── Panel-tweakable design tokens ────────────────────────────────────────────
// Format follows the HKU iGEM dry-lab workshop deck: warm cream, deep navy,
// coral accent, rounded Fredoka + Nunito. Edit live from the Design panel.
export const design: DesignSystem = {
  palette: {
    bg: '#FFF8EE',
    text: '#1D1A2F',
    accent: '#FF5B3A',
  },
  fonts: {
    display: '"Fredoka", "Baloo 2", system-ui, sans-serif',
    body: '"Nunito", system-ui, -apple-system, sans-serif',
  },
  typeScale: {
    hero: 150,
    body: 36,
  },
  radius: 28,
};

// ─── Local (non-tweakable) constants ─────────────────────────────────────────
const C = {
  purple: '#8B5CF6',
  green: '#16A34A',
  blue: '#0284C7',
  rose: '#E11D48',
  amber: '#F59E0B',
  peach: '#F6CDB0',
  sky: '#DDF0FF',
  muted: '#6B6780',
  tan: '#EADFCC',
  white: '#FFFFFF',
  yellow: '#FFC83D',
  dot: '#EFE4D2',
};

const FONT = {
  display: 'var(--osd-font-display)',
  body: 'var(--osd-font-body)',
  mono: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
};

const LAB_URL = 'https://y-jpy.github.io/IGEM-De-Novo-Workshop-Trial-/';

// ─── Webfonts (module-level, slide-keyed injection) ──────────────────────────
const FREDOKA_HREF = new URL('./assets/fredoka.woff2', import.meta.url).href;
const NUNITO_HREF = new URL('./assets/nunito.woff2', import.meta.url).href;

if (typeof document !== 'undefined' && !document.getElementById('osd-webfont-de-novo-design-workshop')) {
  const el = document.createElement('style');
  el.id = 'osd-webfont-de-novo-design-workshop';
  el.textContent = `
@font-face{
  font-family:"Fredoka";
  src:url("${FREDOKA_HREF}") format("woff2");
  font-weight:300 700;
  font-display:swap;
}
@font-face{
  font-family:"Nunito";
  src:url("${NUNITO_HREF}") format("woff2");
  font-weight:200 1000;
  font-display:swap;
}`;
  document.head.appendChild(el);
}

// ─── Motion keyframes (module-level, slide-keyed) ────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('osd-style-de-novo-design-workshop')) {
  const el = document.createElement('style');
  el.id = 'osd-style-de-novo-design-workshop';
  el.textContent = `
@keyframes dn-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
@keyframes dn-rise{0%{transform:translateY(0);opacity:0}15%{opacity:1}80%{opacity:1}100%{transform:translateY(var(--rise,-150px));opacity:0}}
@keyframes dn-fall{0%{transform:translateY(0);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateY(var(--fall,120px));opacity:0}}
@keyframes dn-pop{0%{transform:scale(0)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes dn-pop-in{0%{opacity:0;transform:translateY(10px)}100%{opacity:1;transform:none}}
@keyframes dn-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes dn-ring{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.6)}}
@keyframes dn-jiggle{0%,100%{transform:translate(0,0)}25%{transform:translate(2px,-2px)}50%{transform:translate(-2px,1px)}75%{transform:translate(1px,2px)}}
@keyframes dn-shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}}
@keyframes dn-glow{0%,100%{filter:drop-shadow(0 0 0 rgba(22,163,74,0))}50%{filter:drop-shadow(0 0 10px rgba(250,204,21,.95))}}
@keyframes dn-emit{0%{transform:translate(0,0);opacity:0}15%{opacity:1}100%{transform:translate(var(--dx,0),var(--dy,0));opacity:0}}
@keyframes dn-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes dn-stage{0%,55%,100%{opacity:.4}22%{opacity:1}}
@keyframes dn-flash{0%,100%{box-shadow:0 6px 0 rgba(29,26,47,.18)}50%{box-shadow:0 6px 0 rgba(22,163,74,.55)}}
.dn-btn{transition:transform .12s ease,box-shadow .12s ease,background .2s ease,color .2s ease,border-color .2s ease}
.dn-btn:hover{transform:translateY(-3px)}
.dn-btn:active{transform:translateY(3px);box-shadow:0 0 0 rgba(0,0,0,0)!important}
.dn-anim-box{transform-box:fill-box;transform-origin:center}
.dn-wobble{animation:dn-jiggle 1.6s ease-in-out infinite}`;
  document.head.appendChild(el);
}

// ─── Shared components ───────────────────────────────────────────────────────

const Dots = () => (
  <svg width="1920" height="1080" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden>
    <defs>
      <pattern id="dn-dots" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="2" fill={C.dot} />
      </pattern>
    </defs>
    <rect width="1920" height="1080" fill="url(#dn-dots)" />
  </svg>
);

const Frame = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: 'var(--osd-bg)',
      color: 'var(--osd-text)',
      fontFamily: FONT.body,
      boxSizing: 'border-box',
      padding: '88px 120px 0',
      overflow: 'clip',
    }}
  >
    <Dots />
    <div style={{ position: 'relative', height: '100%' }}>{children}</div>
  </div>
);

const Kicker = ({ children, color = 'var(--osd-accent)', style }: { children: ReactNode; color?: string; style?: CSSProperties }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 26,
      fontWeight: 900,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    <span style={{ width: 14, height: 14, borderRadius: 99, background: color }} />
    {children}
  </div>
);

const H = ({ children, size = 72 }: { children: ReactNode; size?: number }) => (
  <h2
    style={{
      fontFamily: FONT.display,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.08,
      margin: '14px 0 0',
      letterSpacing: '-0.01em',
    }}
  >
    {children}
  </h2>
);

const Lede = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ fontSize: 30, fontWeight: 600, color: C.muted, lineHeight: 1.45, marginTop: 16, maxWidth: 1180, ...style }}>
    {children}
  </div>
);

const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div
    style={{
      background: C.white,
      borderRadius: 'var(--osd-radius)',
      border: `3px solid ${C.tan}`,
      boxShadow: `0 10px 0 ${C.tan}`,
      position: 'relative',
      ...style,
    }}
  >
    {children}
  </div>
);

const Chip = ({
  children,
  color,
  size = 26,
  style,
}: {
  children: ReactNode;
  color: string;
  size?: number;
  style?: CSSProperties;
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      padding: size >= 26 ? '8px 20px' : '5px 14px',
      borderRadius: 999,
      background: `${color}1F`,
      color,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.2,
      ...style,
    }}
  >
    {/* @slide-comment id="c-6e77dfba" ts="2026-10-02T04:26:49.650Z" text="eyJub3RlIjoibW92ZSB0aGlzIHRvIHRoZSAxNXRoIHNsaWRlIn0" */}
    {children}
  </span>
);

const PillBtn = ({
  children,
  color = 'var(--osd-accent)',
  active = true,
  size = 30,
  disabled = false,
  onClick,
  style,
}: {
  children: ReactNode;
  color?: string;
  active?: boolean;
  size?: number;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) => (
  <button
    type="button"
    className="dn-btn"
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={(e) => {
      onClick?.();
      e.currentTarget.blur();
    }}
    onKeyDown={(e) => e.stopPropagation()}
    style={{
      fontFamily: FONT.body,
      fontSize: size,
      fontWeight: 900,
      padding: `${size * 0.5}px ${size * 1.05}px`,
      borderRadius: 999,
      border: `4px solid ${color}`,
      background: active ? color : C.white,
      color: active ? '#fff' : color,
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      boxShadow: '0 6px 0 rgba(29,26,47,.18)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </button>
);

const Icon = ({ d, size = 40, color = 'currentColor', stroke = 5 }: { d: string; size?: number; color?: string; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
    <path d={d} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  check: 'M10 26 L20 36 L38 14',
  cross: 'M12 12 L36 36 M36 12 L12 36',
  lock: 'M14 22 H34 V38 H14 Z M18 22 V16 A6 6 0 0 1 30 16 V22',
  shield: 'M24 6 L40 12 V26 C40 36 33 42 24 46 C15 42 8 36 8 26 V12 Z',
  flask: 'M20 10 H28 V20 L36 36 A4 4 0 0 1 32 42 H16 A4 4 0 0 1 12 36 L20 20 Z M15 6 H33',
  filter: 'M8 10 H40 L28 26 V36 L20 40 V26 Z',
  helix: 'M14 8 C30 8 30 24 14 24 C-2 24 -2 40 14 40 M34 8 C18 8 18 24 34 24 C50 24 50 40 34 40 M16 10 L32 10 M16 24 L32 24 M16 38 L32 38',
  bolt: 'M26 6 L12 28 H22 L20 42 L36 20 H26 Z',
  link: 'M16 18 H8 A6 6 0 0 1 8 6 H16 M32 30 H40 A6 6 0 0 0 40 42 H32 M14 34 L34 14',
  reset: 'M10 24 A14 14 0 1 0 15 13 M10 8 V16 H18',
  play: 'M16 10 L38 24 L16 38 Z',
};

const Arrow = ({ color = 'var(--osd-accent)', w = 64 }: { color?: string; w?: number }) => (
  <svg width={w} height="48" viewBox="0 0 64 48" aria-hidden style={{ flex: 'none' }}>
    <path d="M6 24 H52 M38 10 L54 24 L38 38" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockBadge = ({ size = 18 }: { size?: number }) => (
  <span
    style={{
      position: 'absolute',
      top: -size / 2 - 4,
      right: -size / 2,
      width: size,
      height: size,
      borderRadius: 99,
      background: C.muted,
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <Icon d={ICONS.lock} size={size * 0.66} color="#fff" stroke={6} />
  </span>
);

const Peptide = ({
  seq,
  size = 44,
  locks = [],
  choices = [],
  dim = [],
  hot = [],
}: {
  seq: string;
  size?: number;
  locks?: number[];
  choices?: number[];
  dim?: number[];
  hot?: number[];
}) => (
  <div style={{ display: 'flex', gap: 6 }}>
    {seq.split('').map((aa, i) => {
      const locked = locks.includes(i);
      const isChoice = choices.includes(i);
      const isHot = hot.includes(i);
      return (
        <div
          key={i}
          className={isHot ? 'dn-wobble' : undefined}
          style={{
            width: size,
            height: size * 1.28,
            borderRadius: size * 0.28,
            background: locked ? C.tan : isChoice ? '#FFF1E4' : C.white,
            border: `2px solid ${locked ? C.muted : isChoice ? 'var(--osd-accent)' : C.tan}`,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: Math.round(size * 0.42),
            color: locked ? C.muted : 'var(--osd-text)',
            opacity: dim.includes(i) ? 0.35 : 1,
          }}
        >
          {aa}
          {locked && <LockBadge />}
        </div>
      );
    })}
  </div>
);

const StatChip = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div style={{ display: 'grid', gap: 2 }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: C.muted }}>{label}</div>
    <div style={{ fontFamily: FONT.display, fontSize: 40, fontWeight: 700, color }}>{value}</div>
  </div>
);

// ─── Candidate data (from the lab's funnel) ──────────────────────────────────

type Cand = { id: string; seq: string; plddt: number; iptm: number; hits: number; binders: number };

const CANDIDATES: Cand[] = [
  { id: 'MD2B-01', seq: 'MSVQELLAELAGLKT', plddt: 92.4, iptm: 0.84, hits: 0, binders: 0 },
  { id: 'MD2B-02', seq: 'GTVKELLRELAGLKS', plddt: 88.1, iptm: 0.78, hits: 0, binders: 3 },
  { id: 'MD2B-03', seq: 'MTVQKLLDELAGLKA', plddt: 64.3, iptm: 0, hits: 0, binders: 0 },
  { id: 'MD2B-04', seq: 'MSVEELLKELAGLRT', plddt: 79.6, iptm: 0.52, hits: 0, binders: 0 },
  { id: 'MD2B-05', seq: 'GSVQDLLKELAGLKS', plddt: 85.2, iptm: 0.72, hits: 2, binders: 0 },
  { id: 'MD2B-06', seq: 'MTVQELLKELAGLKT', plddt: 90.7, iptm: 0.88, hits: 0, binders: 2 },
  { id: 'MD2B-07', seq: 'MSVQELLAELAGLKA', plddt: 76.9, iptm: 0.66, hits: 0, binders: 1 },
  { id: 'MD2B-08', seq: 'GTVQELLKELAGLKT', plddt: 58.2, iptm: 0, hits: 0, binders: 0 },
  { id: 'MD2B-09', seq: 'MSVKELLDELAGLKS', plddt: 83.4, iptm: 0.69, hits: 1, binders: 0 },
  { id: 'MD2B-10', seq: 'MTVQELLRELAGLKT', plddt: 94.1, iptm: 0.91, hits: 0, binders: 0 },
];

const CandRow = ({
  c,
  metric,
  verdict,
  tone = 'keep',
}: {
  c: Cand;
  metric: ReactNode;
  verdict: string;
  tone?: 'keep' | 'drop' | 'warn';
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '6px 18px',
      borderRadius: 18,
      background: tone === 'drop' ? 'rgba(225,29,72,0.06)' : tone === 'warn' ? 'rgba(245,158,11,0.08)' : C.white,
      border: `2px solid ${tone === 'drop' ? `${C.rose}55` : tone === 'warn' ? `${C.amber}55` : C.tan}`,
    }}
  >
    <div style={{ width: 116, fontFamily: FONT.display, fontWeight: 600, fontSize: 22, flex: 'none' }}>{c.id}</div>
    <div style={{ flex: 1, fontFamily: FONT.mono, letterSpacing: '0.12em', fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {c.seq}
    </div>
    <div style={{ width: 130, textAlign: 'right', fontSize: 26, fontWeight: 900, flex: 'none' }}>{metric}</div>
    <div style={{ width: 150, flex: 'none', display: 'flex', justifyContent: 'flex-end' }}>
      <Chip color={tone === 'drop' ? C.rose : tone === 'warn' ? C.amber : C.green} size={20}>
        {verdict}
      </Chip>
    </div>
  </div>
);

// ─── Page 1 · Cover ──────────────────────────────────────────────────────────

const CoverArt = () => (
  <svg width="700" height="700" viewBox="0 0 700 700" aria-hidden>
    {/* chain */}
    <path d="M150 430 C230 330 470 330 550 430" stroke={C.tan} strokeWidth="10" fill="none" strokeLinecap="round" />
    {[
      [150, 430, C.peach, 'dn-bob 3.2s ease-in-out 0s infinite'],
      [245, 372, C.white, 'dn-bob 3.2s ease-in-out .3s infinite'],
      [340, 342, C.sky, 'dn-bob 3.2s ease-in-out .6s infinite'],
      [435, 342, C.white, 'dn-bob 3.2s ease-in-out .9s infinite'],
      [530, 372, C.peach, 'dn-bob 3.2s ease-in-out 1.2s infinite'],
    ].map(([cx, cy, fill, anim], i) => (
      <g key={i} className="dn-anim-box" style={{ animation: anim as string }}>
        <circle cx={cx as number} cy={cy as number} r="40" fill={fill as string} stroke={C.tan} strokeWidth="5" />
        <circle cx={cx as number} cy={cy as number} r="14" fill="var(--osd-accent)" opacity="0.85" />
      </g>
    ))}
    {/* hotspot rings */}
    {[350, 500].map((cx, i) => (
      <g key={i} className="dn-anim-box">
        <circle
          cx={cx}
          cy={380}
          r="34"
          fill="none"
          stroke={C.rose}
          strokeWidth="8"
          style={{ animation: `dn-ring 2.2s ease-out ${i * 1.1}s infinite` }}
        />
        <circle cx={cx} cy={380} r="34" fill="none" stroke={C.rose} strokeWidth="8" opacity="0.25" />
      </g>
    ))}
    {/* floating residues */}
    {[
      [90, 250, 18, C.purple, 0],
      [620, 180, 24, C.green, 0.8],
      [600, 560, 16, C.blue, 0.4],
      [95, 560, 22, C.yellow, 1.2],
      [250, 150, 14, C.green, 1.6],
    ].map(([cx, cy, r, fill, d], i) => (
      <circle
        key={i}
        cx={cx as number}
        cy={cy as number}
        r={r as number}
        fill={fill as string}
        opacity="0.9"
        className="dn-anim-box"
        style={{ animation: `dn-pulse 2.6s ease-in-out ${d as number}s infinite` }}
      />
    ))}
    {/* spark */}
    <text x="612" y="190" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="52" fill={C.purple} opacity="0.55">
      ?
    </text>
  </svg>
);

const Cover: Page = () => (
  <Frame>
    <img src={hkuLogo} alt="HKU iGEM" style={{ position: 'absolute', top: 8, right: 8, height: 100, width: 'auto' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 60, height: '100%', paddingBottom: 90 }}>
      <div style={{ flex: 1 }}>
        <Kicker style={{ fontSize: '28px' }}>HKU iGEM · De Novo Design Workshop</Kicker>
        <div style={{ fontFamily: FONT.display, fontSize: '117px', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.015em', marginTop: 22 }}>
          Design a better protein — <span style={{ color: 'var(--osd-accent)' }}>with AI</span>.
        </div>
        <Lede style={{ fontSize: '38px' }}>Design an anti-inflammatory medicine from nothing.</Lede>
        <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
          <Chip color={C.purple}>no coding needed</Chip>
          <Chip color={C.green}>for high-school students</Chip>
        </div>
      </div>
      <CoverArt />
    </div>
  </Frame>
);

// ─── Page 2 · Warm-up ────────────────────────────────────────────────────────

const StructPanel = ({
  level,
  color,
  caption,
  delay,
  children,
}: {
  level: string;
  color: string;
  caption: string;
  delay: number;
  children: ReactNode;
}) => (
  <div style={{ width: 168, animation: `dn-pop-in .5s cubic-bezier(0,0,0.2,1) ${delay}s both` }}>
    <div
      style={{
        height: 150,
        borderRadius: 18,
        border: `3px solid ${C.tan}`,
        background: C.white,
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
    <div style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 600, color, marginTop: 10, lineHeight: 1.1 }}>{level}</div>
    <div style={{ fontSize: 19, fontWeight: 800, color: C.muted, marginTop: 3, lineHeight: 1.3 }}>{caption}</div>
  </div>
);

const StructStrip = () => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginTop: 22 }}>
    <StructPanel level="1 · primary" color="var(--osd-accent)" caption="a chain of amino acids" delay={0}>
      <div style={{ display: 'flex', gap: 4 }}>
        {['M', 'T', 'V', 'Q'].map((aa, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 36,
              borderRadius: 8,
              border: `2px solid ${C.tan}`,
              background: i === 0 ? C.peach : C.white,
              display: 'grid',
              placeItems: 'center',
              fontFamily: FONT.display,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            {aa}
          </div>
        ))}
      </div>
    </StructPanel>
    <StructPanel level="2 · secondary" color={C.blue} caption="curls into helices" delay={0.12}>
      <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden>
        {[30, 65, 100].map((x, i) => (
          <path
            key={i}
            d={`M${x} 20 C${x + 22} 45 ${x - 22} 75 ${x} 110`}
            stroke={i === 1 ? C.blue : C.sky}
            strokeWidth={i === 1 ? 7 : 4}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </StructPanel>
    <StructPanel level="3 · tertiary" color={C.green} caption="folds into a 3D shape" delay={0.24}>
      <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden>
        <path
          d="M15 110 C15 35 60 25 70 55 C78 80 100 75 105 55 C108 40 98 28 88 28"
          fill={C.sky}
          stroke={C.green}
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <circle cx="52" cy="78" r="10" fill={C.green} />
        <circle cx="90" cy="45" r="8" fill={C.purple} />
      </svg>
    </StructPanel>
    <StructPanel level="4 · quaternary" color={C.purple} caption="chains team up" delay={0.36}>
      <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden>
        <path d="M45 45 L85 45 M45 85 L85 85 M65 45 L65 85 M45 65 L85 65" stroke={C.tan} strokeWidth="3" />
        {[
          [45, 45, C.purple],
          [85, 45, C.blue],
          [45, 85, C.green],
          [85, 85, 'var(--osd-accent)'],
        ].map(([cx, cy, fill], i) => (
          <circle key={i} cx={cx as number} cy={cy as number} r="17" fill={fill as string} stroke="#1D1A2F" strokeWidth="3" />
        ))}
      </svg>
    </StructPanel>
  </div>
);

const Intro: Page = () => (
  <Frame>
    <Kicker color={C.purple}>Warm-up</Kicker>
    <H>Proteins (蛋白質) are the machines of life</H>
    <div style={{ display: 'flex', gap: 70, marginTop: 26, alignItems: 'center' }}>
      <div style={{ flex: 'none' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.muted, maxWidth: 720, lineHeight: 1.4 }}>every protein is built the same way — one chain of amino acids (氨基酸), folded level by level</div>
        <StructStrip />
        <div style={{ fontSize: 24, fontWeight: 800, color: C.muted, marginTop: 16, maxWidth: 720, lineHeight: 1.4 }}>
          the fold decides the job
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Steps>
          <Bullet lead="Proteins play a central role in biological processes."> Nearly everything your body does — moving, digesting, healing — is run by proteins.</Bullet>
          <Step>
            <Bullet lead="A receptor (受體) is a protein receiver."> It sits on a cell and recognises one specific signal — like a lock waiting for its key.</Bullet>
          </Step>
          <Step>
            <Bullet lead="Your immune system (免疫系統) is the body's defence."> When something is wrong, it triggers an alarm — and other cells answer the call.</Bullet>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

// ─── Page 3 · The problem ────────────────────────────────────────────────────

const WoundArt = () => (
  <svg width="640" height="560" viewBox="0 0 640 560" aria-hidden>
    {/* wound */}
    <g className="dn-anim-box">
      <circle cx="120" cy="220" r="46" fill="none" stroke={C.rose} strokeWidth="8" style={{ animation: 'dn-ring 2s ease-out 0s infinite' }} />
      <circle cx="120" cy="220" r="46" fill="none" stroke={C.rose} strokeWidth="8" opacity="0.2" />
    </g>
    <rect x="60" y="160" width="120" height="120" rx="30" fill="#FFF1F0" stroke={C.rose} strokeWidth="6" />
    <text x="120" y="232" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="40" fill={C.rose}>
      ⚠
    </text>
    <text x="120" y="348" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="30" fill={C.rose}>
      chronic wound
    </text>
    {/* alarm bolts */}
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M${240 + i * 40} ${170 + i * 60} L${262 + i * 40} ${140 + i * 60} L${248 + i * 40} ${146 + i * 60} L${282 + i * 40} ${150 + i * 60}`}
        stroke={C.yellow}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dn-anim-box"
        style={{ animation: `dn-emit 1.4s ease-out ${i * 0.45}s infinite`, '--dx': '210px', '--dy': '60px' } as CSSProperties}
      />
    ))}
    {/* MD2 receptor */}
    <path
      d="M300 90 C420 70 540 130 560 250 C570 330 530 380 460 395 C440 300 380 270 340 285 C330 320 300 330 285 300 C270 270 300 240 330 240 C340 160 300 105 300 90 Z"
      fill={C.peach}
      stroke={C.tan}
      strokeWidth="6"
    />
    <ellipse cx="462" cy="330" rx="70" ry="34" fill="#FFE9D6" stroke={C.tan} strokeWidth="5" />
    <text x="430" y="212" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="44" fill="#1D1A2F">
      MD2
    </text>
    <text x="430" y="255" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="24" fill={C.muted}>
      the alarm's receptor
    </text>
    {/* TAP2 trying to block */}
    <g className="dn-anim-box" style={{ animation: 'dn-jiggle 1.8s ease-in-out infinite' }}>
      <rect x="380" y="330" width="150" height="54" rx="27" fill={C.white} stroke={C.muted} strokeWidth="5" />
      <text x="455" y="368" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="28" fill={C.muted}>
        TAP2
      </text>
    </g>
    <text x="455" y="428" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="26" fill={C.muted}>
      blocks MD2 — for now
    </text>
  </svg>
);

const Bullet = ({ lead, children }: { lead: ReactNode; children?: ReactNode }) => (
  <div style={{ display: 'flex', gap: 20, marginTop: 28, alignItems: 'flex-start' }}>
    <span style={{ width: 16, height: 16, borderRadius: 99, background: 'var(--osd-accent)', flex: 'none', marginTop: 16 }} />
    <div style={{ fontSize: 30, fontWeight: 600, color: C.muted, lineHeight: 1.4 }}>
      {lead}
      {children}
    </div>
  </div>
);

const Problem: Page = () => (
  <Frame>
    <Kicker color={C.rose}>The Problem</Kicker>
    <H>A wound that won't stop alarming</H>
    <div style={{ display: 'flex', gap: 70, marginTop: 26, alignItems: 'center' }}>
      <div style={{ flex: 'none' }}>
        <WoundArt />
      </div>
      <div style={{ flex: 1 }}>
        <Steps>
          <Bullet lead="A chronic wound keeps triggering an immune alarm."> The alarm travels through a receptor called <b>MD2</b> — a protein built from amino acids.</Bullet>
          <Step>
            <Bullet lead="TAP2 already blocks MD2 —"> and helps wounds heal.</Bullet>
          </Step>
          <Step>
            <Bullet lead="But TAP2 is flawed:">
              <div style={{ display: 'flex', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
                <Chip color={C.rose}>short-lived</Chip>
                <Chip color={C.amber}>only moderately strong</Chip>
                <Chip color={C.purple}>can provoke an immune response</Chip>
              </div>
            </Bullet>
          </Step>
          <Step>
            <Bullet lead="Our job: design a better TAP2 —"> with generative AI, not from nothing.</Bullet>
          </Step>
          <Step>
            <Bullet lead="Then run it through the same filters"> a real drug candidate faces.</Bullet>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

// ─── Page 4 · Mission ────────────────────────────────────────────────────────

const StageCard = ({
  n,
  color,
  title,
  sub,
  icon,
  delay,
}: {
  n: number;
  color: string;
  title: string;
  sub: string;
  icon: string;
  delay: number;
}) => (
  <Card style={{ width: 386, height: 520, boxSizing: 'border-box', padding: '28px 26px', animation: `dn-pop-in .6s cubic-bezier(0,0,0.2,1) ${delay}s both` }}>
    <div
      style={{
        position: 'absolute',
        top: -26,
        left: -18,
        width: 64,
        height: 64,
        borderRadius: 99,
        background: color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontFamily: FONT.display,
        fontSize: 34,
        fontWeight: 700,
        boxShadow: '0 6px 0 rgba(0,0,0,.15)',
      }}
    >
      {n}
    </div>
    <div
      style={{
        height: 170,
        borderRadius: 20,
        background: `${color}14`,
        display: 'grid',
        placeItems: 'center',
        color,
      }}
    >
      <Icon d={icon} size={92} stroke={6} />
    </div>
    <div style={{ fontFamily: FONT.display, fontSize: 44, fontWeight: 600, lineHeight: 1.12, marginTop: 22 }}>{title}</div>
    <div style={{ fontSize: '31px', fontWeight: 700, color: C.muted, lineHeight: 1.42, marginTop: 10 }}>{sub}</div>
  </Card>
);

const Roadmap: Page = () => (
  <Frame>
    <Kicker>Your Mission</Kicker>
    <H>From AI idea to a buildable gene</H>
    <Lede>Four stages, ten steps. Every decision you make gets written into your Lab Notebook.</Lede>
    <div style={{ display: 'flex', gap: 10, marginTop: 64, alignItems: 'flex-start' }}>
      <StageCard
        n={1}
        color="var(--osd-accent)"
        title="Generate"
        sub={'Lock the hotspots & propose the binders'}
        icon={ICONS.helix}
        delay={0}
      />
      <div style={{ paddingTop: 230, flex: 'none' }}>
        <Arrow w={44} />
      </div>
      <StageCard
        n={2}
        color={C.purple}
        title="Filter"
        sub="Four checks — fold, grip, human, immune"
        icon={ICONS.filter}
        delay={0.12}
      />
      <div style={{ paddingTop: 230, flex: 'none' }}>
        <Arrow w={44} color={C.purple} />
      </div>
      <StageCard
        n={3}
        color={C.blue}
        title="Test"
        sub="Simulate body temperature, then mutate to strengthen the grip."
        icon={ICONS.flask}
        delay={0.24}
      />
      <div style={{ paddingTop: 230, flex: 'none' }}>
        <Arrow w={44} color={C.blue} />
      </div>
      <StageCard
        n={4}
        color={C.green}
        title="Build"
        sub="Turn the protein back into a gene and clear the biosafety check."
        icon={ICONS.shield}
        delay={0.36}
      />
    </div>
  </Frame>
);

// ─── Page 5 · Stage 1.1 · Find the spot ──────────────────────────────────────

const Md2Art = () => (
  <svg width="720" height="560" viewBox="0 0 720 560" aria-hidden>
    <path
      d="M90 140 C240 90 420 120 560 200 C640 245 660 340 610 400 C560 455 470 470 400 440 C300 400 260 300 240 240 C220 180 140 165 90 140 Z"
      fill={C.peach}
      stroke={C.tan}
      strokeWidth="7"
    />
    {/* pocket rim */}
    <path d="M300 320 C360 300 430 310 470 350" stroke="#E9C9A6" strokeWidth="12" fill="none" strokeLinecap="round" />
    <text x="300" y="120" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="46" fill="#1D1A2F">
      MD2
    </text>
    <text x="300" y="162" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="600" fontSize="26" fill={C.muted}>
      residues A17 – A160
    </text>
    {/* hotspots */}
    {[
      [392, 300, 'A82'],
      [452, 348, 'A85'],
    ].map(([cx, cy, label], i) => (
      <g key={i}>
        <circle
          cx={cx as number}
          cy={cy as number}
          r="30"
          fill="none"
          stroke={C.rose}
          strokeWidth="8"
          className="dn-anim-box"
          style={{ animation: `dn-ring 2s ease-out ${i * 1}s infinite` }}
        />
        <circle cx={cx as number} cy={cy as number} r="30" fill={C.rose} />
        <text
          x={cx as number}
          y={(cy as number) + (i === 0 ? -48 : 62)}
          textAnchor="middle"
          fontFamily="Fredoka, sans-serif"
          fontWeight="700"
          fontSize="30"
          fill={C.rose}
        >
          {label}
        </text>
      </g>
    ))}
    {/* binder covering both */}
    <path d="M330 270 C380 230 480 240 520 320 C540 365 500 420 440 425" stroke="#1D1A2F" strokeWidth="16" fill="none" strokeLinecap="round" strokeDasharray="3 26" />
    <text x="540" y="240" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="30" fill="#1D1A2F">
      your binder
    </text>
    {/* alarm, blocked */}
    <path
      d="M140 420 L180 380 M162 388 L196 396"
      stroke={C.yellow}
      strokeWidth="9"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="dn-anim-box"
      style={{ animation: 'dn-emit 1.6s ease-out 0s infinite', '--dx': '190px', '--dy': '-60px' } as CSSProperties}
      opacity="0.8"
    />
  </svg>
);

const FindTheSpot: Page = () => (
  <Frame>
    <Kicker>Stage 1 · Generate · Step 1 of 10</Kicker>
    <H>Find the spot on MD2 worth covering</H>
    <div style={{ display: 'flex', gap: 70, marginTop: 26, alignItems: 'center' }}>
      <div style={{ flex: 'none' }}>
        <Md2Art />
      </div>
      <div style={{ flex: 1 }}>
        <Steps>
          <Step>
            <Lede>
              They sit on the rim of the pocket. A binder that covers both <b>physically blocks the alarm</b> from landing.
            </Lede>
          </Step>
          <Step>
            <Lede>
              <b>Miss one — and the alarm still fires.</b>
            </Lede>
          </Step>
          <Step>
            <div style={{ display: 'flex', gap: 14, marginTop: 24, flexWrap: 'wrap' }}>
              <Chip color={C.blue}>residue (殘基) — one amino acid in a chain</Chip>
              <Chip color={C.rose}>hotspot (熱點) — what the binder must touch</Chip>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

// ─── Page 6 · Stage 1.2a · RFdiffusion ───────────────────────────────────────

const DiffusionDemo = () => {
  const rnd = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const pts: [number, number][] = [];
  for (let i = 0; i < 15; i++) {
    const t = i / 14;
    pts.push([40 + t * 220, 200 + Math.sin(t * Math.PI * 1.35) * 110 - t * 40]);
  }
  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(0)},${y.toFixed(0)}`).join(' ');
  const stages = [
    { label: '1 · start: pure noise', draw: (k: number) => (
      <g key={`s${k}`}>
        {Array.from({ length: 36 }).map((_, i) => (
          <circle
            key={i}
            cx={30 + rnd(i + k * 71) * 240}
            cy={30 + rnd(i + k * 131 + 9) * 240}
            r={5 + rnd(i + k * 37 + 3) * 6}
            fill={i % 3 === 0 ? C.purple : i % 3 === 1 ? C.blue : C.muted}
            opacity="0.55"
            className="dn-anim-box"
            style={{ animation: `dn-jiggle 1.6s ease-in-out ${(i % 8) * 0.2}s infinite` }}
          />
        ))}
      </g>
    ) },
    { label: '2 · denoise a little', draw: (k: number) => (
      <g key={`s${k}`} opacity="0.55">
        <path d={pathD} fill="none" stroke={C.muted} strokeWidth="20" strokeLinecap="round" strokeDasharray="2 12" />
        {pts.map(([x, y], i) => (
          <circle
            key={i}
            cx={x + (rnd(i + k * 97) - 0.5) * 26}
            cy={y + (rnd(i + k * 149 + 5) - 0.5) * 26}
            r="13"
            fill={C.white}
            stroke={C.muted}
            strokeWidth="4"
            opacity="0.6"
          />
        ))}
      </g>
    ) },
    { label: '3 · end: a backbone', draw: (k: number) => (
      <g key={`s${k}`}>
        <path d={pathD} fill="none" stroke="#1D1A2F" strokeWidth="7" strokeLinecap="round" />
        {pts.map(([x, y], i) => {
          const hot = i === 4 || i === 10;
          return (
            <g key={i}>
              {hot && (
                <circle
                  cx={x}
                  cy={y}
                  r="26"
                  fill="none"
                  stroke={C.rose}
                  strokeWidth="5"
                  className="dn-anim-box"
                  style={{ animation: `dn-ring 2s ease-out ${i === 4 ? 0 : 1}s infinite` }}
                />
              )}
              <circle cx={x} cy={y} r="15" fill={hot ? C.rose : C.peach} stroke={C.tan} strokeWidth="4" />
            </g>
          );
        })}
      </g>
    ) },
  ];
  return (
    <div>
      <svg width="980" height="310" viewBox="0 0 980 310" aria-hidden>
        {stages.map((s, k) => (
          <g
            key={s.label}
            className="dn-anim-box"
            style={{ animation: `dn-stage 4.5s ease-in-out ${k * 1.5}s infinite` }}
          >
            <rect x={k * 330} y="4" width="300" height="300" rx="20" fill="none" stroke={C.tan} strokeWidth="4" />
            <g transform={`translate(${k * 330} 0)`}>{s.draw(k)}</g>
          </g>
        ))}
      </svg>
      <div style={{ display: 'flex', gap: 30, marginTop: 10 }}>
        {stages.map((s) => (
          <div key={s.label} style={{ width: 300, textAlign: 'center', fontSize: 24, fontWeight: 900, color: C.muted }}>
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const RfDiffusion: Page = () => (
  <Frame>
    <Kicker>Stage 1 · Generate · Step 2 of 10</Kicker>
    <H>RFdiffusion invents the backbone</H>
    <Steps>
      <Lede style={{ marginTop: 14 }}>
        Two models work as a team. First, <b>RFdiffusion</b>: it starts from random noise shaped like a protein and removes the noise
        step by step — until a plausible 15-residue backbone appears.
      </Lede>
      <Step>
        <Card style={{ marginTop: 28, boxSizing: 'border-box', padding: '26px 30px' }}>
          <DiffusionDemo />
        </Card>
      </Step>
      <Step>
        <div style={{ display: 'flex', gap: 16, marginTop: 26, flexWrap: 'wrap' }}>
          <Chip color="var(--osd-accent)">model 1 of 2 · an image generator, in 3D</Chip>
          <Chip color={C.rose}>the A82 / A85 hotspot stays locked at every step</Chip>
        </div>
      </Step>
    </Steps>
  </Frame>
);

// ─── Page 7 · Stage 1.2b · ProteinMPNN ───────────────────────────────────────

const MiniCand = ({ c, delay }: { c: Cand; delay: number }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 14px',
      borderRadius: 16,
      background: C.white,
      border: `2px solid ${C.tan}`,
      animation: `dn-pop-in .5s cubic-bezier(0,0,0.2,1) ${delay}s both`,
    }}
  >
    <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, color: C.muted, width: 84, flex: 'none' }}>{c.id}</span>
    <span style={{ fontFamily: FONT.mono, letterSpacing: '0.1em', fontSize: 19, fontWeight: 700 }}>{c.seq}</span>
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 99,
        background: c.plddt >= 90 ? C.green : c.plddt >= 70 ? C.yellow : C.rose,
        flex: 'none',
        marginLeft: 'auto',
      }}
    />
  </div>
);

const SequencePuzzle = ({ seq }: { seq: string }) => {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (tick >= 12 + seq.length * 3) setRunning(false);
  }, [tick, seq.length]);
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const POOL = 'ACDEFGHIKLMNPQRSTVWY';
  const settleAt = (i: number) => 12 + i * 3;
  const replay = () => {
    setTick(0);
    setRunning(true);
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        {seq.split('').map((aa, i) => {
          const settled = tick >= settleAt(i);
          const letter = settled ? aa : POOL[Math.floor(rnd(i, tick) * 20)];
          return (
            <div
              key={i}
              style={{
                width: 48,
                height: 61,
                borderRadius: 13,
                background: settled ? C.white : '#F3EEE3',
                border: `2px solid ${settled ? C.green : C.tan}`,
                display: 'grid',
                placeItems: 'center',
                fontFamily: FONT.mono,
                fontSize: 24,
                fontWeight: 800,
                color: settled ? C.green : C.muted,
              }}
            >
              {settled ? aa : letter}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 18 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.muted }}>
          one possible answer — solved <b>position by position</b>, 20 amino acids to choose from at each
        </div>
        <PillBtn color={C.purple} size={22} onClick={replay}>
          <Icon d={ICONS.reset} size={20} color="#fff" stroke={6} /> replay
        </PillBtn>
      </div>
    </div>
  );
};

const ProteinMpnn: Page = () => (
  <Frame>
    <Kicker>Stage 1 · Generate · Step 2 of 10</Kicker>
    <H>ProteinMPNN writes the sequence</H>
    <Steps>
      <Lede style={{ marginTop: 14 }}>
        Now <b>ProteinMPNN</b>: the backbone is fixed, and it solves a puzzle — which of the <b>20 amino acids</b> goes at each of the
        15 positions, so the chain would most likely fold into that shape.
      </Lede>
      <Step>
        <Card style={{ marginTop: 26, boxSizing: 'border-box', padding: '22px 30px' }}>
          <SequencePuzzle seq="MTVQELLRELAGLKT" />
        </Card>
      </Step>
      <Step>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginTop: 24 }}>
          {CANDIDATES.map((c, i) => (
            <MiniCand key={c.id} c={c} delay={0.05 * i} />
          ))}
        </div>
      </Step>
      <Step>
        <Lede>
          <b>AI is good at proposing, not at judging.</b>{' Every candidate is a hypothesis, not an answer. That is what the funnel is for.'}
        </Lede>
      </Step>
    </Steps>
  </Frame>
);

// ─── Page 8 · Stage 2 · The funnel ───────────────────────────────────────────

const FunnelRow = ({
  n,
  color,
  title,
  question,
  count,
  of,
}: {
  n: number;
  color: string;
  title: string;
  question: string;
  count: number;
  of: number;
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 26, animation: 'dn-pop-in .55s cubic-bezier(0,0,0.2,1) both' }}>
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 99,
        background: color,
        color: '#fff',
        display: 'grid',
        placeItems: 'center',
        fontFamily: FONT.display,
        fontSize: 30,
        fontWeight: 700,
        flex: 'none',
      }}
    >
      {n}
    </div>
    <div style={{ width: 430, flex: 'none' }}>
      <div style={{ fontFamily: FONT.display, fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.muted, marginTop: 6, marginLeft: 22 }}>
        {question}
      </div>
    </div>
    <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: of }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: 99,
            background: i < count ? color : C.tan,
            border: `2px solid ${i < count ? color : C.tan}`,
          }}
        />
      ))}
    </div>
    <Chip color={color} size={24}>
      {count} of {of} survive
    </Chip>
  </div>
);

const Funnel: Page = () => (
  <Frame>
    <Kicker color={C.purple}>Stage 2 · Filter</Kicker>
    <H>Ten candidates in. How many come out?</H>
    <Steps>
      <Lede style={{ marginTop: 14 }}>Four different questions, asked in order of cost. Fail any one — and you're out.</Lede>
      <Step>
        <div style={{ marginTop: 26 }}>
          <FunnelRow n={1} color="var(--osd-accent)" title="Fold — pLDDT" question="Will it even fold?" count={8} of={10} />
        </div>
      </Step>
      <Step>
        <div style={{ marginTop: 18 }}>
          <FunnelRow n={2} color={C.blue} title="Grip — ipTM" question="Does it actually hold MD2?" count={7} of={8} />
        </div>
      </Step>
      <Step>
        <div style={{ marginTop: 18 }}>
          <FunnelRow n={3} color={C.amber} title="Human — MMseqs2" question="Does it look like something the body already makes?" count={5} of={7} />
        </div>
      </Step>
      <Step>
        <div style={{ marginTop: 18 }}>
          <FunnelRow n={4} color={C.rose} title="Immune — MHCflurry" question="Would the immune system flag it?" count={2} of={5} />
        </div>
      </Step>
      <Step>
        <div style={{ display: 'flex', gap: 18, marginTop: 28, alignItems: 'center' }}>
          {['10', '8', '7', '5', '2'].map((n, i, a) => (
            <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span
                style={{
                  fontFamily: FONT.display,
                  fontSize: 72,
                  fontWeight: 700,
                  color: i === a.length - 1 ? C.green : i === 0 ? 'var(--osd-text)' : C.muted,
                  animation: 'dn-pop .5s cubic-bezier(0,0,0.2,1) both',
                }}
              >
                {n}
              </span>
              {i < a.length - 1 && <Arrow color={C.muted} w={48} />}
            </span>
          ))}
          <Chip color={C.green} size={30}>
            two leads — a normal success rate
          </Chip>
        </div>
      </Step>
    </Steps>
  </Frame>
);

// ─── Page 9 · Step 2.1 · pLDDT ───────────────────────────────────────────────

const ConfidenceDemo = () => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    pts.push([50 + t * 780, 300 - Math.sin(t * Math.PI * 1.6) * 150 - t * 40]);
  }
  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(0)},${y.toFixed(0)}`).join(' ');
  const unsure = [5, 6, 7];
  return (
    <div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Chip color={C.green} size={20}>confident — the shape is probably real</Chip>
        <Chip color={C.rose} size={20}>uncertain — the model isn't sure</Chip>
      </div>
      <svg width="880" height="360" viewBox="0 0 880 360" aria-hidden style={{ display: 'block', marginTop: 14 }}>
        <path d={pathD} fill="none" stroke={C.tan} strokeWidth="26" strokeLinecap="round" />
        {pts.map(([x, y], i) => {
          const bad = unsure.includes(i);
          return (
            <g key={i}>
              {bad && (
                <circle
                  cx={x}
                  cy={y}
                  r="34"
                  fill="none"
                  stroke={C.rose}
                  strokeWidth="4"
                  strokeDasharray="7 9"
                  className="dn-anim-box"
                  style={{ animation: 'dn-pulse 1.6s ease-in-out infinite' }}
                />
              )}
              <circle
                cx={x}
                cy={y}
                r="20"
                fill={bad ? '#FFF1F0' : i === 0 ? C.peach : C.white}
                stroke={bad ? C.rose : C.green}
                strokeWidth="5"
                className={bad ? 'dn-wobble' : undefined}
                style={bad ? { transformBox: 'fill-box', transformOrigin: 'center' } : undefined}
              />
              {bad && (
                <text x={x} y={y + 9} textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="26" fill={C.rose}>
                  ?
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 18 }}>
        <div
          style={{
            position: 'relative',
            width: 640,
            height: 34,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #E11D48, #F59E0B, #16A34A)',
            opacity: 0.92,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '70%',
              top: -10,
              bottom: -10,
              width: 4,
              background: '#1D1A2F',
              borderRadius: 99,
            }}
          />
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: C.muted }}>
          pLDDT · keep <span style={{ color: C.green }}>≥ 70</span>, discard below
        </div>
      </div>
    </div>
  );
};

const FoldCheck: Page = () => (
  <Frame>
    <Kicker>Stage 2 · Filter · Step 3 of 10</Kicker>
    <H>Throw away anything that won't fold</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 26 }}>
      <Card style={{ flex: 1, boxSizing: 'border-box', padding: '24px 30px' }}>
        <ConfidenceDemo />
      </Card>
      <div style={{ width: 470, flex: 'none' }}>
        <Steps>
          <Lede style={{ marginTop: 0 }}>
            AlphaFold gives every design a <b>confidence</b>: pLDDT, scored 0–100. It is not a grade for the protein — it is the model's
            own estimate of how close its prediction will land.
          </Lede>
          <Step>
            <Lede>
              A confident region means the shape is probably real. An uncertain region means the model is guessing — <b>that backbone
              may not exist at all</b>.
            </Lede>
          </Step>
          <Step>
            <div style={{ marginTop: 26, display: 'grid', gap: 18 }}>
              <StatChip label="survived · pLDDT ≥ 70" value="8 of 10" color={C.green} />
            </div>
          </Step>
          <Step>
            <Lede>
              Confidence is not quality — but a design nobody can fold has <b>no chance at all</b>. That is why it is the cheapest
              check, run first.
            </Lede>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

// ─── Page 10 · Step 2.2 · ipTM ────────────────────────────────────────────────

const GripPair = ({
  ok,
  delay,
}: {
  ok: boolean;
  delay: number;
}) => (
  <Card
    style={{
      width: 470,
      height: 470,
      boxSizing: 'border-box',
      padding: '22px 26px',
      animation: 'dn-pop-in .55s cubic-bezier(0,0,0.2,1) both',
      animationDelay: `${delay}s`,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Chip color={ok ? C.green : C.rose} size={22}>
        {ok ? 'ipTM 0.88 · holds on' : 'ipTM 0.52 · drifts away'}
      </Chip>
      <div style={{ fontFamily: FONT.display, fontSize: 40, fontWeight: 700, color: ok ? C.green : C.rose }}>
        {ok ? '0.88' : '0.52'}
      </div>
    </div>
    <svg width="410" height="330" viewBox="0 0 410 330" aria-hidden>
      <path
        d="M60 120 C150 60 300 70 360 150 C390 190 360 230 320 240 C260 170 180 150 120 190 C90 210 70 180 60 120 Z"
        fill={C.peach}
        stroke={C.tan}
        strokeWidth="6"
      />
      <ellipse cx="300" cy="205" rx="58" ry="26" fill="#FFE9D6" stroke={C.tan} strokeWidth="5" />
      <text x="170" y="150" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="38" fill="#1D1A2F">
        MD2
      </text>
      {ok ? (
        <g className="dn-anim-box" style={{ animation: 'dn-glow 2.4s ease-in-out infinite' }}>
          <rect x="250" y="150" width="120" height="46" rx="23" fill={C.green} opacity="0.9" />
          <text x="310" y="182" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="26" fill="#fff">
            binder
          </text>
        </g>
      ) : (
        <g className="dn-anim-box" style={{ animation: 'dn-bob 2.4s ease-in-out infinite' }}>
          <rect x="250" y="60" width="120" height="46" rx="23" fill={C.rose} opacity="0.75" />
          <text x="310" y="92" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="26" fill="#fff">
            binder
          </text>
        </g>
      )}
    </svg>
    <div style={{ fontSize: 24, fontWeight: 800, color: C.muted, textAlign: 'center' }}>
      {ok ? 'folds, and grips the pocket' : 'folds — then floats away'}
    </div>
  </Card>
);

const GripCheck: Page = () => (
  <Frame>
    <Kicker>Stage 2 · Filter · Step 4 of 10</Kicker>
    <H>Does it actually grip MD2?</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 26, alignItems: 'center' }}>
      <Steps>
        <Lede style={{ marginTop: 0 }}>
          Boltz-1 folds the binder <b>together with MD2</b> and reports ipTM — a 0–1 score for how confident it is about the interface. Keep anything at <b>0.60 or above</b>.
        </Lede>
        <Step>
          <div style={{ display: 'flex', gap: 34, marginTop: 26 }}>
            <GripPair ok delay={0} />
            <GripPair ok={false} delay={0.15} />
          </div>
        </Step>
        <Step>
          <Lede>
            <b>7 survive · 8 → 7.</b> A binder that folds but doesn't hold on is just a floating peptide.
          </Lede>
        </Step>
      </Steps>
    </div>
  </Frame>
);

// ─── Page 11 · Step 2.3 · MMseqs2 ─────────────────────────────────────────────

const HumanCheck: Page = () => {
  const rows = CANDIDATES.filter((c) => c.plddt >= 70 && c.iptm >= 0.6);
  return (
    <Frame>
      <Kicker>Stage 2 · Filter · Step 5 of 10</Kicker>
      <H>Does it resemble a human sequence?</H>
      <div style={{ display: 'flex', gap: 56, marginTop: 26 }}>
        <Card style={{ flex: 1, boxSizing: 'border-box', padding: '20px 22px' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((c) => {
              const warn = c.hits > 0;
              return (
                <div key={c.id} className={warn ? 'dn-wobble' : undefined}>
                  <CandRow
                    c={c}
                    metric={<span style={{ color: warn ? C.amber : 'var(--osd-text)' }}>{c.hits === 0 ? '0 hits' : `${c.hits} hit${c.hits > 1 ? 's' : ''}`}</span>}
                    verdict={warn ? 'review flag' : 'clear'}
                    tone={warn ? 'warn' : 'keep'}
                  />
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{ width: 470, flex: 'none' }}>
          <Steps>
            <Lede style={{ marginTop: 0 }}>
              MMseqs2 compares every candidate against the <b>human proteome</b>{' (蛋白質組) — the catalogue of proteins your body can make. A match is a review flag, not proof of danger: hold those back.'}
            </Lede>
            <Step>
              <div style={{ marginTop: 26, display: 'grid', gap: 18 }}>
                <StatChip label="survived" value="5 of 7" color={C.amber} />
              </div>
            </Step>
            <Step>
              <Lede>
                A useful screen — but <b>zero matches is not a guarantee of safety</b>.
              </Lede>
            </Step>
          </Steps>
        </div>
      </div>
    </Frame>
  );
};

// ─── Page 12 · Step 2.4 · MHCflurry ──────────────────────────────────────────

const ImmuneCheck: Page = () => {
  const rows = CANDIDATES.filter((c) => c.plddt >= 70 && c.iptm >= 0.6 && c.hits === 0);
  return (
    <Frame>
      <Kicker>Stage 2 · Filter · Step 6 of 10</Kicker>
      <H>Could the immune system recognise your medicine?</H>
      <div style={{ display: 'flex', gap: 56, marginTop: 26 }}>
        <Card style={{ flex: 1, boxSizing: 'border-box', padding: '20px 22px' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((c) => {
              const warn = c.binders > 0;
              return (
                <div key={c.id} className={warn ? 'dn-wobble' : undefined}>
                  <CandRow
                    c={c}
                    metric={
                      <span style={{ color: warn ? C.rose : 'var(--osd-text)' }}>
                        {c.binders === 0 ? '0 binders' : `${c.binders} binder${c.binders > 1 ? 's' : ''}`}
                      </span>
                    }
                    verdict={warn ? 'hold back' : 'quiet'}
                    tone={warn ? 'drop' : 'keep'}
                  />
                </div>
              );
            })}
          </div>
        </Card>
        <div style={{ width: 470, flex: 'none' }}>
          <Steps>
            <Lede style={{ marginTop: 0 }}>
              Cells display peptide fragments on <b>MHC class I</b> for T-cells to inspect. MHCflurry predicts which peptides may be
              presented — a strong signal means the body might flag your medicine. Hold those back.
            </Lede>
            <Step>
              <div style={{ marginTop: 26, display: 'grid', gap: 18 }}>
                <StatChip label="leads left" value="2 of 5" color={C.green} />
              </div>
            </Step>
            <Step>
              <Lede>
                Same ten designs, <b>four different questions</b>. Each screen removes uncertainty before the expensive work begins.
              </Lede>
            </Step>
          </Steps>
        </div>
      </div>
    </Frame>
  );
};

// ─── Page 13 · Stage 3.1 · Simulation ────────────────────────────────────────

const RmsdChart = () => {
  const W = 760;
  const H = 430;
  const L = 76;
  const R = 26;
  const T = 30;
  const B = 64;
  const y = (v: number) => T + ((8 - v) / 8) * (H - T - B);
  const x = (t: number) => L + (t / 20) * (W - L - R);

  // representative trajectories: rose drifts up, green plateaus low
  const rosePts: [number, number][] = [];
  const greenPts: [number, number][] = [];
  for (let t = 0; t <= 20; t++) {
    const w1 = Math.sin(t * 0.85) * 0.7;
    const w2 = Math.sin(t * 1.3) * 0.28;
    rosePts.push([x(t), y(0.7 + 0.36 * t + w1)]);
    greenPts.push([x(t), y(1.2 + Math.min(1.5, t * 0.22) + w2)]);
  }
  const d = (pts: [number, number][]) => pts.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');

  return (
    <svg width={W} height={H} aria-hidden>
      {[0, 2, 4, 6, 8].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke={C.tan} strokeWidth="3" />
          <text x={L - 16} y={y(v) + 10} textAnchor="end" fontFamily={FONT.body} fontWeight="800" fontSize="24" fill={C.muted}>
            {v}
          </text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((t) => (
        <text key={t} x={x(t)} y={H - 20} textAnchor="middle" fontFamily={FONT.body} fontWeight="800" fontSize="24" fill={C.muted}>
          {t} ns
        </text>
      ))}
      <text x={L - 34} y={T - 4} textAnchor="end" fontFamily={FONT.body} fontWeight="900" fontSize="24" fill={C.muted}>
        RMSD (Å)
      </text>
      <path
        d={d(rosePts)}
        fill="none"
        stroke={C.rose}
        strokeWidth="9"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        style={{ animation: 'dn-draw 1.6s ease-out 0.4s both' }}
      />
      <path
        d={d(greenPts)}
        fill="none"
        stroke={C.green}
        strokeWidth="9"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1"
        style={{ animation: 'dn-draw 1.6s ease-out 1.1s both' }}
      />
    </svg>
  );
};

const Simulation: Page = () => (
  <Frame>
    <Kicker color={C.blue}>Stage 3 · Physics · Step 7 of 10</Kicker>
    <H>Does it stay stable at body temperature?</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 26, alignItems: 'center' }}>
      <Card style={{ flex: 'none', boxSizing: 'border-box', padding: '22px 30px' }}>
        <RmsdChart />
      </Card>
      <div style={{ flex: 1 }}>
        <Steps>
          <Lede style={{ marginTop: 0 }}>
            Two candidates remain. Drop both into a simulated water box at <b>37 °C</b> and follow their motion for <b>20 ns</b>. RMSD
            measures how far each drifts from its starting shape.
          </Lede>
          <Step>
            <Lede>
              <span style={{ color: C.rose, fontWeight: 900 }}>MD2B-01</span> — persistent rise: substantial drift. A warning sign.
            </Lede>
          </Step>
          <Step>
            <Lede>
              <span style={{ color: C.green, fontWeight: 900 }}>MD2B-10</span> — low plateau: limited drift. <b>We take this one forward.</b>
            </Lede>
          </Step>
          <Step>
            <div style={{ marginTop: 26 }}>
              <Chip color={C.blue} size={26}>
                scores are snapshots · simulation is a movie
              </Chip>
            </div>
          </Step>
        </Steps>
      </div>
    </div>
  </Frame>
);

// ─── Page 14 · Stage 3.2 · Evolution ─────────────────────────────────────────

const EVO_STATE = [
  { seq: 'MTVQELLRELAGLKT', dg: -6.6, color: C.rose, note: null as string | null },
  { seq: 'MTVQEILRELAGLKT', dg: -7.4, color: C.amber, note: 'UCB picked position 6: L → I' },
  { seq: 'MTIQEILRELAGLKT', dg: -8.2, color: C.green, note: 'UCB picked position 3: V → I' },
];
const EVO_LOCKS = [0, 4, 7, 10, 12];

const Evolution: Page = () => {
  const [stage, setStage] = useState(0);
  const s = EVO_STATE[stage];
  const dgPct = Math.min(100, Math.max(0, ((-s.dg - 6) / 4) * 100));
  return (
    <Frame>
      <Kicker color={C.blue}>Stage 3 · Physics · Step 8 of 10</Kicker>
      <H>Make the grip stronger</H>
      <Lede>
        MD2B-10 holds on, but weakly: <b>ΔG = −6.6 kcal/mol</b>. ΔG is the binding free energy (結合自由能) — the more negative, the
        tighter the grip. We need <b>≤ −8.0</b>. Mutate one residue at a time — never the five locked positions that touch the hotspots.
      </Lede>
      <div style={{ display: 'flex', gap: 56, marginTop: 40, alignItems: 'center' }}>
        <div style={{ flex: 'none' }}>
          <Peptide seq={s.seq} size={52} locks={EVO_LOCKS} hot={stage > 0 ? [stage === 1 ? 5 : 2] : []} />
          <div
            style={{
              position: 'relative',
              width: 900,
              height: 52,
              marginTop: 60,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #FF5B3A, #F59E0B, #16A34A)',
              opacity: 0.9,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: -14,
                bottom: -14,
                width: 5,
                background: C.muted,
                borderRadius: 99,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: `calc(${dgPct}% - 20px)`,
                top: -16,
                width: 40,
                height: 84,
                borderRadius: 99,
                background: C.white,
                border: `5px solid ${s.color}`,
                boxShadow: '0 6px 0 rgba(29,26,47,.18)',
                transition: 'left .9s cubic-bezier(0,0,0.2,1), border-color .3s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 900, marginTop: 18, fontSize: 22, fontWeight: 800, color: C.muted }}>
            <span>−6.0 weak</span>
            <span>−8.0 target</span>
            <span>−10.0 very strong</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONT.display, fontSize: 86, fontWeight: 700, color: s.color }}>ΔG = {s.dg.toFixed(1)}</span>
            <span style={{ fontSize: 30, fontWeight: 800, color: C.muted }}>kcal/mol</span>
          </div>
          {s.note ? (
            <Chip color={s.color} size={24} style={{ marginTop: 18 }}>
              {s.note}
            </Chip>
          ) : (
            <Chip color={C.muted} size={24} style={{ marginTop: 18 }}>
              five positions are locked — they touch the hotspots
            </Chip>
          )}
          <div style={{ marginTop: 28 }}>
            <Chip color={C.purple} size={24}>UCB (上置信算法): μ + c√(ln N / n) — exploit what works, explore what's untried</Chip>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 34, flexWrap: 'wrap' }}>
            {stage < 2 ? (
              <PillBtn color={C.purple} onClick={() => setStage(stage + 1)}>
                Ask UCB: which mutation next?
              </PillBtn>
            ) : (
              <PillBtn color={C.green}>
                <Icon d={ICONS.check} size={28} color="#fff" stroke={7} /> ΔG ≤ −8.0 — strong enough to build
              </PillBtn>
            )}
            <PillBtn color={C.muted} active={stage > 0} disabled={stage === 0} onClick={() => setStage(stage - 1)}>
              Undo last
            </PillBtn>
            <PillBtn color={C.muted} active={false} disabled={stage === 0} onClick={() => setStage(0)}>
              Reset
            </PillBtn>
          </div>
          <Lede>
            Every mutation was tested by a <b>model, not a pipette</b>. The wet lab would take weeks to test this many variants — the
            model narrows thousands of options to a handful worth trying for real.
          </Lede>
        </div>
      </div>
    </Frame>
  );
};

// ─── Page 15 · Stage 4.1 · Write the gene ────────────────────────────────────

const CODON_CHOICES: { pos: number; label: string; options: [string, number][] }[] = [
  { pos: 1, label: 'T at position 2', options: [['ACC', 44], ['ACA', 13]] },
  { pos: 5, label: 'L at position 6', options: [['CTG', 52], ['CTA', 4]] },
  { pos: 8, label: 'E at position 9', options: [['GAA', 69], ['GAG', 31]] },
  { pos: 11, label: 'G at position 12', options: [['GGC', 44], ['GGG', 12]] },
  { pos: 14, label: 'T at position 15', options: [['ACC', 44], ['ACA', 13]] },
];
const FIXED_CODONS: (string | null)[] = [
  'ATG', null, 'GTT', 'CAG', 'GAA', null, 'CTG', 'CGT', null, 'CTG', 'GCG', null, 'CTG', 'AAA', null,
];

const WriteTheGene: Page = () => {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const allPicked = CODON_CHOICES.every((c) => picked[c.pos] !== undefined);
  const allCorrect = allPicked && CODON_CHOICES.every((c) => picked[c.pos] === 0);
  const codons = FIXED_CODONS.map((f, i) => {
    if (f) return f;
    const ch = CODON_CHOICES.find((c) => c.pos === i)!;
    const idx = picked[i];
    return idx === undefined ? '·'.repeat(3) : ch.options[idx][0];
  });
  return (
    <Frame>
      <Kicker color={C.green}>Stage 4 · Build · Step 9 of 10</Kicker>
      <H>Write the gene</H>
      <Lede>
        Proteins are built from DNA, three letters at a time. <b>4³ = 64 codons</b>{' (密碼子) spell only 20 amino acids — and E. coli (大腸桿菌)'}<b>{''}</b>{' reads some of them much faster than others.'}
      </Lede>
      <div style={{ display: 'flex', gap: 56, marginTop: 34 }}>
        <div style={{ width: 470, flex: 'none' }}>
          <Peptide seq="MTVQELLRELAGLKT" size={52} choices={CODON_CHOICES.map((c) => c.pos)} />
          <div style={{ marginTop: 20, fontSize: 22, fontWeight: 800, color: C.muted, lineHeight: 1.4 }}>
            Five positions are up to you — pick the triplet E. coli reads fastest for each.
          </div>
          <Card style={{ marginTop: 22, boxSizing: 'border-box', padding: '18px 22px', width: 470 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.muted, marginBottom: 8 }}>
              Reference · E. coli codon usage
            </div>
            <div style={{ display: 'grid', gap: 6, fontFamily: FONT.mono, fontSize: 19, fontWeight: 700 }}>
              {CODON_CHOICES.map((c) => (
                <div key={c.pos} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: C.muted }}>{c.label}</span>
                  {c.options.map(([codon, pct], i) => (
                    <span key={codon} style={{ color: i === 0 ? C.green : C.muted, opacity: i === 0 ? 1 : 0.75 }}>
                      {codon} {pct}%
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div style={{ flex: 1, display: 'grid', gap: 12 }}>
          {CODON_CHOICES.map((c) => {
            const idx = picked[c.pos];
            return (
              <div key={c.pos} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ width: 220, flex: 'none', fontSize: 26, fontWeight: 900, color: C.muted }}>{c.label}</span>
                {c.options.map(([codon, pct], oi) => {
                  const chosen = idx === oi;
                  const right = oi === 0;
                  const show = idx !== undefined;
                  return (
                    <button
                      key={codon}
                      type="button"
                      className="dn-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        setPicked({ ...picked, [c.pos]: oi });
                        e.currentTarget.blur();
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: 25,
                        fontWeight: 800,
                        padding: '8px 20px',
                        borderRadius: 18,
                        border: `3px solid ${show && chosen ? (right ? C.green : C.rose) : C.tan}`,
                        background: show && chosen ? (right ? C.green : C.rose) : C.white,
                        color: show && chosen ? '#fff' : 'var(--osd-text)',
                        cursor: 'pointer',
                        boxShadow: `0 5px 0 ${show && chosen ? (right ? C.green : C.rose) : C.tan}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      {codon}
                      <span style={{ opacity: 0.7, fontSize: 19 }}>{pct}%</span>
                      {show && chosen && <Icon d={right ? ICONS.check : ICONS.cross} size={22} color="#fff" stroke={6} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <Card style={{ marginTop: 24, boxSizing: 'border-box', padding: '16px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.muted, flex: 'none' }}>Full gene · 5′ → 3′</div>
          <div style={{ fontFamily: FONT.mono, fontSize: 26, fontWeight: 800, letterSpacing: '0.12em', whiteSpace: 'nowrap' }}>
            <span style={{ color: C.green }}>ATG</span> {codons.slice(1, -1).join(' ')} <span style={{ color: C.rose }}>TAA</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <Chip color={C.green} size={18}>ATG starts the gene</Chip>
          <Chip color={C.rose} size={18}>TAA stops it</Chip>
        </div>
      </Card>
      <div style={{ marginTop: 18 }}>
        {allCorrect ? (
          <Chip color={C.green} size={26}>
            ✓ Codon-optimised — same protein, many possible genes. Matching the host is free efficiency.
          </Chip>
        ) : allPicked ? (
          <Chip color={C.amber} size={26}>Almost — swap the rare codons for E. coli's favourites</Chip>
        ) : (
          <Chip color={C.muted} size={26}>pick one codon per highlighted position</Chip>
        )}
      </div>
    </Frame>
  );
};

// ─── Page 16 · Stage 4.2 · Safety ────────────────────────────────────────────

const SAFETY_QUIZ: { q: string; options: { label: string; ok: boolean; why: string }[] }[] = [
  {
    q: 'A non-pathogenic Risk Group 1 E. coli strain, nothing hazardous in the sequence, routine small-scale work. Which containment level is normally appropriate?',
    options: [
      { label: 'BSL-1 · standard lab hygiene', ok: true, why: 'Appropriate under these assumptions, subject to institutional risk assessment and local rules.' },
      { label: 'BSL-3 · respirator + sealed room', ok: false, why: 'BSL-3 is intended for substantially higher-risk work.' },
      { label: 'BSL-4 · full positive-pressure suit', ok: false, why: 'BSL-4 is reserved for the highest-risk agents.' },
    ],
  },
  {
    q: 'Before ordering the DNA, what should you screen the sequence against?',
    options: [
      { label: 'Databases of sequences of concern', ok: true, why: 'Reputable providers screen customers and sequences — reproducible, auditable biosecurity.' },
      { label: 'The internet, for similar-looking proteins', ok: false, why: 'Not a curated database — it can miss homologues of a known toxin, and it cannot be audited.' },
      { label: 'Nothing — the AI already checked', ok: false, why: 'The AI was trained to fold proteins, not to audit their safety.' },
    ],
  },
  {
    q: 'Your peptide is meant for a wound dressing. Which result would stop you from proceeding?',
    options: [
      { label: 'A strong predicted MHC-I presentation signal', ok: true, why: 'Flags potential T-cell recognition — reassess or redesign before going further.' },
      { label: 'A pLDDT of 94', ok: false, why: '94 is excellent fold confidence — encouraging, but not a safety certificate.' },
      { label: 'A ΔG of −8.4 kcal/mol', ok: false, why: '−8.4 passes the affinity target — strong binding, not proof of safety.' },
    ],
  },
];

const SafetyCheck: Page = () => {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const allRight = SAFETY_QUIZ.every((q, qi) => picked[qi] !== undefined && q.options[picked[qi]].ok);
  return (
    <Frame>
      <Kicker color={C.green}>Stage 4 · Build · Step 10 of 10</Kicker>
      <H>Clear the safety check</H>
      <Lede>Before any DNA is ordered, three questions.  Some answers sound reasonable — but protect the wrong thing.</Lede>
      <Chip color={C.blue} size={24} style={{ marginTop: 18 }}>
        DNA is the recipe — a gene spells out the amino acid chain that folds into a protein
      </Chip>
      <div style={{ display: 'grid', gap: 16, marginTop: 26 }}>
        {SAFETY_QUIZ.map((q, qi) => {
          const idx = picked[qi];
          const answered = idx !== undefined;
          const right = answered && q.options[idx].ok;
          return (
            <Card key={qi} style={{ boxSizing: 'border-box', padding: '14px 24px' }}>
              <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>{q.q}</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                {q.options.map((o, oi) => {
                  const chosen = idx === oi;
                  const showResult = answered && (chosen || o.ok);
                  const color = o.ok ? C.green : C.rose;
                  const active = answered && o.ok ? true : chosen;
                  return (
                    <button
                      key={oi}
                      type="button"
                      className="dn-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        if (answered) return;
                        setPicked({ ...picked, [qi]: oi });
                        e.currentTarget.blur();
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      style={{
                        fontFamily: FONT.body,
                        fontSize: 20,
                        fontWeight: 900,
                        padding: '9px 18px',
                        borderRadius: 999,
                        border: `3px solid ${showResult ? color : C.tan}`,
                        background: showResult ? (active ? color : C.white) : C.white,
                        color: showResult && active ? '#fff' : 'var(--osd-text)',
                        cursor: answered ? 'default' : 'pointer',
                        opacity: answered && !showResult ? 0.4 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'left',
                      }}
                    >
                      {showResult && <Icon d={o.ok ? ICONS.check : ICONS.cross} size={18} color={active ? '#fff' : color} stroke={7} />}
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div style={{ fontSize: 21, fontWeight: 800, color: right ? C.green : C.rose, marginTop: 8 }}>
                  {right ? '✓ ' : '✗ '}
                  {q.options[idx].why}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <div style={{ marginTop: 20 }}>
        {allRight ? (
          <Chip color={C.green} size={28}>
            ✓ Cleared to order — but passing gates means "prioritise for further testing", not "safe for patients"
          </Chip>
        ) : (
          <Chip color={C.muted} size={28}>answer all three to clear the check</Chip>
        )}
      </div>
    </Frame>
  );
};

// ─── Page 17 · Result ────────────────────────────────────────────────────────

const Result: Page = () => (
  <Frame>
    <Kicker color={C.green}>What You Built</Kicker>
    <H>From scratch to gene</H>
    <div style={{ display: 'flex', gap: 56, marginTop: 30, alignItems: 'flex-start' }}>
      <Card style={{ flex: 1, boxSizing: 'border-box', padding: '34px 40px' }}>
        <Steps>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <div style={{ fontFamily: FONT.display, fontSize: 72, fontWeight: 700 }}>MD2B-10</div>
            <Chip color={C.green} size={24}>de novo binder</Chip>
          </div>
          <Step>
            <div style={{ marginTop: 24 }}>
              <Peptide seq="MTVQELLRELAGLKT" size={46} />
            </div>
          </Step>
          <Step>
            <div style={{ display: 'flex', gap: 70, marginTop: 30 }}>
              <StatChip label="Fold confidence · pLDDT" value="94.1" color={C.green} />
              <StatChip label="Interface confidence · ipTM" value="0.91" color={C.blue} />
              <StatChip label="Binding energy · ΔG" value="−8.2" color="var(--osd-accent)" />
            </div>
          </Step>
          <Step>
            <div style={{ marginTop: 34 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.muted, marginBottom: 10 }}>Synthesised gene · 5′ → 3′</div>
              <div style={{ fontFamily: FONT.mono, fontSize: 27, fontWeight: 800, letterSpacing: '0.14em', lineHeight: 1.5 }}>
                <span style={{ color: C.green }}>ATG</span> ACC GTT CAG GAA CTG CTG CGT GAA CTG GCG GGC CTG AAA ACC{' '}
                <span style={{ color: C.rose }}>TAA</span>
              </div>
            </div>
          </Step>
          <Step>
            <Lede>
              Same molecule, many possible genes — we wrote the one <b>E. coli reads fastest</b>. Ten candidates went in; one complete
              design came out.
            </Lede>
          </Step>
        </Steps>
      </Card>
      <div style={{ width: 420, flex: 'none', display: 'grid', gap: 18 }}>
        {[
          ['Generate', "AI proposes — it doesn't judge. Every candidate is a hypothesis.", 'var(--osd-accent)'],
          ['Filter', 'Four different questions in a row — cheapest checks first.', C.purple],
          ['Physics', 'Scores are snapshots, simulation is a movie.', C.blue],
          ['Build', 'Check safety before ordering DNA.', C.green],
        ].map(([t, s, color], i) => (
          <Card key={t as string} style={{ boxSizing: 'border-box', padding: '16px 22px', animation: `dn-pop-in .5s cubic-bezier(0,0,0.2,1) ${0.3 + i * 0.12}s both` }}>
            <div style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 600, color: color as string }}>{t}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.muted, lineHeight: 1.4, marginTop: 4 }}>{s}</div>
          </Card>
        ))}
      </div>
    </div>
  </Frame>
);

// ─── Page 18 · The big idea ──────────────────────────────────────────────────

const BigIdea: Page = () => (
  <Frame>
    <Kicker color={C.purple}>The Big Idea</Kicker>
    <H size={84}>A design needs a generator — and a filter</H>
    <Steps>
      <div
        style={{
          fontFamily: FONT.display,
          fontSize: 58,
          fontWeight: 600,
          lineHeight: 1.25,
          marginTop: 40,
          maxWidth: 1400,
          color: C.muted,
        }}
      >
        “The real lesson is not that AI designs proteins. It is that a good design needs <span style={{ color: 'var(--osd-accent)' }}>both a generator and a filter</span> —
        followed by risk assessment and experimental validation.”
      </div>
      <Step>
        <div style={{ display: 'flex', gap: 12, marginTop: 46, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            ['Generate', 'var(--osd-accent)'],
            ['Filter', C.purple],
            ['Simulate', C.blue],
            ['Evolve', C.amber],
            ['Build', C.green],
          ].map(([label, color], i, a) => (
            <span key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Chip color={color as string} size={30} style={{ animation: `dn-pop .5s cubic-bezier(0,0,0.2,1) ${i * 0.15}s both` }}>
                {label}
              </Chip>
              {i < a.length - 1 && <Arrow color={C.muted} w={40} />}
            </span>
          ))}
        </div>
      </Step>
    </Steps>
  </Frame>
);

// ─── Page 19 · The lab ───────────────────────────────────────────────────────

const Lab: Page = () => {
  const [copied, setCopied] = useState(false);
  return (
    <Frame>
      <Kicker>Your Turn · The Lab</Kicker>
      <H>Open the studio</H>
      <div style={{ display: 'flex', gap: 60, marginTop: 30, alignItems: 'flex-start' }}>
        <Card style={{ width: 470, boxSizing: 'border-box', padding: '30px', display: 'grid', justifyItems: 'center', gap: 22 }}>
          <div
            style={{
              borderRadius: 22,
              border: '5px solid var(--osd-text)',
              boxShadow: '0 10px 0 rgba(29,26,47,.18)',
              lineHeight: 0,
              background: C.white,
              padding: 12,
            }}
          >
            <img src={studioQr} alt="QR code for the De Novo AI Bio-Design Studio" style={{ width: 320, height: 320, display: 'block' }} />
          </div>
          <div style={{ fontFamily: FONT.mono, fontSize: 23, fontWeight: 800, color: C.muted, textAlign: 'center' }}>
            y-jpy.github.io/IGEM-De-Novo-Workshop-Trial-
          </div>
          <PillBtn
            color={copied ? C.green : C.blue}
            size={26}
            onClick={() => {
              try {
                void navigator.clipboard.writeText(LAB_URL).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                });
              } catch {
                /* clipboard unavailable — the QR still works */
              }
            }}
          >
            {copied ? (
              <>
                <Icon d={ICONS.check} size={24} color="#fff" stroke={7} /> copied
              </>
            ) : (
              <>
                <Icon d={ICONS.link} size={24} color="#fff" stroke={6} /> copy link
              </>
            )}
          </PillBtn>
        </Card>
        <div style={{ flex: 1 }}>
          <Steps>
            <Lede style={{ marginTop: 0 }}>
              Scan to open the <b>De Novo AI Bio-Design Studio</b> — in pairs, start at Stage 1.
            </Lede>
            <Step>
              <Lede>
                Everything you decide gets written into your <b>Lab Notebook</b> on the right — the epitope you picked, the candidates
                you kept, the gene you wrote.
              </Lede>
            </Step>
            <Step>
              <div style={{ display: 'flex', gap: 16, marginTop: 26, flexWrap: 'wrap' }}>
                <Chip color="var(--osd-accent)">~50 min</Chip>
                <Chip color={C.purple}>no coding needed</Chip>
                <Chip color={C.green}>progress saves in this browser</Chip>
              </div>
            </Step>
            <Step>
              <Lede>
                <b>Wrong guesses are fine.</b> They show you exactly what each filter is for.
              </Lede>
            </Step>
          </Steps>
        </div>
      </div>
    </Frame>
  );
};

// ─── Page 20 · Mentimeter quiz ───────────────────────────────────────────────

const MENTI_KEY = 'de-novo-workshop-menti-v1';

const MentiQuiz: Page = () => {
  const [link, setLink] = useState<string>(() => {
    try {
      return localStorage.getItem(MENTI_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  return (
    <Frame>
      <Kicker color={C.rose}>After The Lab · Quiz</Kicker>
      <H>Mentimeter</H>
      <Lede>
        Students join at <b>menti.com</b> with the code at the top of the quiz. Use the arrow keys inside Mentimeter to move through
        questions.
      </Lede>
      <div style={{ display: 'flex', gap: 40, marginTop: 30, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 600,
              borderRadius: 24,
              overflow: 'hidden',
              border: '4px solid var(--osd-text)',
              background: 'var(--osd-text)',
              boxShadow: '0 10px 0 rgba(29,26,47,.2)',
            }}
          >
            {link ? (
              <iframe
                title="Mentimeter quiz"
                src={link}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#fff' }}
                allow="fullscreen; clipboard-write"
              />
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: FONT.display, fontSize: 56, fontWeight: 600 }}>
                Mentimeter quiz
              </div>
            )}
          </div>
        </div>
        <div style={{ width: 420, flex: 'none' }}>
          <Card style={{ boxSizing: 'border-box', padding: '24px 26px' }}>
            {editing ? (
              <div style={{ display: 'grid', gap: 14 }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="https://www.menti.com/…"
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 22,
                    fontWeight: 800,
                    padding: '12px 16px',
                    borderRadius: 16,
                    border: `3px solid ${C.tan}`,
                    background: C.white,
                    color: 'var(--osd-text)',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <PillBtn
                  color={C.green}
                  size={24}
                  onClick={() => {
                    const v = draft.trim();
                    setLink(v);
                    setEditing(false);
                    try {
                      localStorage.setItem(MENTI_KEY, v);
                    } catch {
                      /* private mode — link still works this session */
                    }
                  }}
                >
                  Save
                </PillBtn>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ fontSize: 23, fontWeight: 800, color: C.muted, lineHeight: 1.4 }}>
                  {link ? 'Quiz embedded. Present straight from this slide.' : 'No quiz linked yet — paste your Mentimeter code to embed it.'}
                </div>
                <button
                  type="button"
                  className="dn-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    setDraft(link);
                    setEditing(true);
                    e.currentTarget.blur();
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 24,
                    fontWeight: 900,
                    color: 'var(--osd-accent)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textAlign: 'left',
                  }}
                >
                  {link ? 'change Mentimeter link' : '+ add Mentimeter link'}
                </button>
              </div>
            )}
          </Card>
          <Lede>
            Before class: in Mentimeter, <b>Share → Participants → Embed slides</b>, then paste the code on this slide.
          </Lede>
        </div>
      </div>
    </Frame>
  );
};

// ─── Page 21 · Close ─────────────────────────────────────────────────────────

const Close: Page = () => (
  <Frame>
    <Kicker>That's It</Kicker>
    <div style={{ fontFamily: FONT.display, fontSize: 110, fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.015em', marginTop: 26 }}>
      Propose. Filter.
      <br />
      <span style={{ color: 'var(--osd-accent)' }}>Simulate. Build.</span>
    </div>
    <div style={{ display: 'flex', gap: 26, marginTop: 52 }}>
      {[
        ['AI proposes — filters judge.', C.purple],
        ['Scores are snapshots; simulation is a movie.', C.blue],
        ['Same protein, many genes — safety before ordering DNA.', C.green],
      ].map(([text, color], i) => (
        <Card key={text as string} style={{ width: 520, boxSizing: 'border-box', padding: '22px 28px', animation: `dn-pop-in .5s cubic-bezier(0,0,0.2,1) ${0.2 + i * 0.14}s both` }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ width: 16, height: 16, borderRadius: 99, background: color as string, flex: 'none' }} />
            <div style={{ fontFamily: FONT.display, fontSize: 30, fontWeight: 600, lineHeight: 1.25 }}>{text}</div>
          </div>
        </Card>
      ))}
    </div>
    <Lede style={{ fontSize: '56px' }}>
      Thank you!<b>{''}</b>
    </Lede>
  </Frame>
);

// ─── Deck exports ────────────────────────────────────────────────────────────

export const meta: SlideMeta = {
  title: 'De Novo AI Bio-Design Workshop',
  createdAt: '2026-09-23T04:17:24.304Z',
};

export const transition: SlideTransition = {
  duration: 260,
  exit: {
    duration: 260,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [{ opacity: 1 }, { opacity: 1 }],
  },
  enter: {
    duration: 260,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};

export const notes: (string | undefined)[] = [
  `TITLE · 30 s
Introduce yourself and the HKU iGEM team. Start presenting from THIS slide so later slides reveal step by step.
Today's promise: a chronic wound, an immune alarm, and ten AI-designed candidates. Students will run the same funnel a real drug candidate faces.`,
  `WARM-UP · 1 min
High-school audience — don't assume they know the words. Press → for each line: proteins run nearly everything in the body; a receptor is a protein receiver (lock and key); the immune system is the body's defence that raises alarms.
Keep it light — this is vocabulary insurance for the rest of the talk.`,
  `HOOK · 1 min
Read the problem aloud: the alarm travels through a receptor called MD2. Press → for each line — TAP2 already blocks MD2, but it is short-lived, moderately strong, and can provoke an immune response.
Land it: our job is not to invent from nothing — it is to design a better TAP2 with generative AI.`,
  `MISSION · 1 min
Walk the four stages: Generate → Filter → Test → Build. Point out that the studio is where the students will do all of it themselves (~50 minutes, no coding needed).
The funnel is the heart of the workshop — 10 candidates in, 2 out.`,
  `STEP 1 · 1 min
In the studio students drag to spin the real MD2 receptor (residues A17–A160) and click the two hotspots, A82 and A85.
They sit on the rim of the pocket — cover both and the alarm is physically blocked; miss one and it still fires. Vocabulary: hotspot, epitope, scaffold.`,
  `STEP 2 · RFDIFFUSION · 1 min
Two models work as a team. First RFdiffusion: noise in, backbone out — like an image generator, in 3D.
The demo cycles through the three denoising stages; point out that the A82/A85 hotspot stays locked at every step.`,
  `STEP 2 · PROTEINMPNN · 1 min
The backbone is fixed; now the sequence puzzle. Let the tiles spin and settle (replay if you like), then press → to reveal the 10 candidates.
Land the line: AI is good at proposing, not at judging — every candidate is a hypothesis, not an answer.`,
  `FUNNEL · 1 min
Four different questions asked in order of cost: fold → grip → human → immune. Press → for each row: 10 → 8 → 7 → 5 → 2.
Fail any one and you're out. Two survivors out of ten is a normal success rate.`,
  `STEP 3 · 1 min
pLDDT is AlphaFold's per-residue confidence (0–100). Keep ≥ 70, discard the rest — 8 of 10 survive.
Confidence is not the same as quality, but a design nobody can fold has no chance at all. That's why it's the cheapest check, run first.`,
  `STEP 4 · 1 min
Boltz-1 folds the binder together with MD2 and reports ipTM (0–1) for the interface. Keep ≥ 0.60 — 7 of 8 survive.
A binder that folds but doesn't hold on is just a floating peptide; it would drift away before it could block anything.`,
  `STEP 5 · 1 min
MMseqs2 compares every candidate against the human proteome. A hit is a review flag — not proof of danger, but worth a closer look. Hold back flagged candidates: 5 of 7 survive.
A useful screen; zero matches is not a guarantee of safety.`,
  `STEP 6 · 1 min
Cells display peptide fragments on MHC class I for T-cells to inspect. MHCflurry predicts which peptides may be presented — hold back strong signals: 2 of 5 survive.
Same ten designs, four different questions. Each screen removes uncertainty before the expensive work begins.`,
  `STEP 7 · 2 min
Both survivors drop into a simulated water box at 37 °C for 20 ns. RMSD measures drift from the starting shape.
MD2B-01 climbs (persistent rise), MD2B-10 plateaus low — we take MD2B-10 forward.
Land it: scores are snapshots, simulation is a movie. Only the movie shows you what falls apart.`,
  `STEP 8 · 2 min
MD2B-10 holds on, but weakly: ΔG = −6.6 kcal/mol, target ≤ −8.0. Click "Ask UCB" to replay the evolution — two mutations take it to −8.2.
UCB balances exploitation and exploration: μ + c√(ln N / n). Five positions are locked — they touch the hotspots.
Every mutation was tested by a model, not a pipette.`,
  `STEP 9 · 1.5 min
4³ = 64 codons spell only 20 amino acids, and E. coli reads some of them much faster than others (more tRNA is waiting).
Invite students to pick one codon per highlighted position, then check: same protein, many possible genes — matching the host's preference is free efficiency, no change to the final protein.`,
  `STEP 10 · 1 min
Before any DNA is ordered, three questions. Let students click and read the explanations — some answers sound reasonable but protect the wrong thing.
Land it: the AI was trained to fold proteins, not to audit their safety. Passing every gate means "prioritise for further testing", not "safe for patients".`,
  `RESULT · 1 min
The complete package: MD2B-10, sequence MTVQELLRELAGLKT, pLDDT 94.1, ipTM 0.91, ΔG −8.2 — and the codon-optimised gene.
From scratch to gene in about fifty minutes.`,
  `BIG IDEA · 1 min
Read the quote, then reveal the loop: Generate → Filter → Simulate → Evolve → Build.
The real lesson is not that AI designs proteins — it's that a good design needs both a generator and a filter, followed by risk assessment and experimental validation.`,
  `LAB · 1 min
Pairs scan the QR code and start at Stage 1. Everything they decide is written into their Lab Notebook on the right.
Wrong guesses are fine — they show exactly what each filter is for.`,
  `QUIZ · 3–4 min
Students join at menti.com with the code at the top of the Menti slide. Use the arrow keys inside Menti (click the quiz first) to move through questions.
Before class: Share → Participants → Embed slides in Mentimeter, then paste the code on this slide.`,
  `CLOSE · 30 s
Propose, filter, simulate, build. Every model is a bit wrong — and that's how the design gets better. Thank you!`,
];

export default [
  Cover,
  Intro,
  Problem,
  Roadmap,
  FindTheSpot,
  RfDiffusion,
  ProteinMpnn,
  Funnel,
  FoldCheck,
  GripCheck,
  HumanCheck,
  ImmuneCheck,
  Simulation,
  Evolution,
  WriteTheGene,
  SafetyCheck,
  Result,
  BigIdea,
  Lab,
  MentiQuiz,
  Close,
] satisfies Page[];
