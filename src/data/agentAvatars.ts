import { DebateTone } from '../types';

// Premium dark aesthetic geometric vector SVGs
const createGeometricAvatar = (primaryColor: string, accentColor: string, iconPaths: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" rx="24" fill="#0a0c14"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="${primaryColor}" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="4 3"/>
    <circle cx="50" cy="50" r="28" fill="${primaryColor}" fill-opacity="0.08" stroke="${primaryColor}" stroke-width="1" stroke-opacity="0.3"/>
    <g transform="translate(25, 25) scale(2.08)" stroke="${primaryColor}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none">
      ${iconPaths}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Architect: Isometric Blueprint Cube Vector
const architectSvg = createGeometricAvatar(
  '#38bdf8',
  '#0284c7',
  `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`
);

// Skeptic: Shield Target Vector
const skepticSvg = createGeometricAvatar(
  '#f43f5e',
  '#e11d48',
  `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/>`
);

// Arbiter: Scale / Triangle Prism Vector
const arbiterSvg = createGeometricAvatar(
  '#fbbf24',
  '#d97706',
  `<path d="M12 3v18M3 12h18M6 8l-3 6h6l-3-6zM18 8l-3 6h6l-3-6z"/>`
);

// Verifier: Hexagonal Shield Check Vector
const verifierSvg = createGeometricAvatar(
  '#34d399',
  '#059669',
  `<path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"/><path d="M9 12l2 2 4-4"/>`
);

// Synthesizer: Constellation Network Vector
const synthesizerSvg = createGeometricAvatar(
  '#c084fc',
  '#9333ea',
  `<circle cx="12" cy="12" r="3"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 7l3.5 3.5M17 7l-3.5 3.5M7 17l3.5-3.5M17 17l-3.5-3.5"/>`
);

export interface AgentAvatarConfig {
  role: 'architect' | 'skeptic' | 'arbiter' | 'verifier' | string;
  name: string;
  title: string;
  avatarSrc: string;
  glowColor: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  toneTag?: string;
  toneFilterClass?: string;
}

export const AGENT_AVATARS: Record<string, AgentAvatarConfig> = {
  architect: {
    role: 'architect',
    name: 'The Architect',
    title: 'Thesis & Structural Formulation',
    avatarSrc: architectSvg,
    glowColor: 'shadow-sky-500/20 ring-sky-500/40',
    badgeBorder: 'border-sky-500/30',
    badgeBg: 'bg-sky-950/40',
    badgeText: 'text-sky-300',
    description: 'Constructs initial baseline hypothesis, comprehensive logic, and architectural proposals.',
  },
  skeptic: {
    role: 'skeptic',
    name: 'The Skeptic',
    title: 'Antithesis & Inquisitorial Refutation',
    avatarSrc: skepticSvg,
    glowColor: 'shadow-rose-500/20 ring-rose-500/40',
    badgeBorder: 'border-rose-500/30',
    badgeBg: 'bg-rose-950/40',
    badgeText: 'text-rose-300',
    description: 'Relentlessly identifies fatal flaws, edge cases, vulnerabilities, and false assumptions.',
  },
  arbiter: {
    role: 'arbiter',
    name: 'The Arbiter',
    title: 'Synthesis & Consensus Adjudication',
    avatarSrc: arbiterSvg,
    glowColor: 'shadow-amber-500/20 ring-amber-500/40',
    badgeBorder: 'border-amber-500/30',
    badgeBg: 'bg-amber-950/40',
    badgeText: 'text-amber-300',
    description: 'Synthesizes dialectic conflict into an airtight, battle-tested consensus resolution.',
  },
  verifier: {
    role: 'verifier',
    name: 'The Verifier',
    title: 'Empirical Truth & Constraint Audit',
    avatarSrc: verifierSvg,
    glowColor: 'shadow-emerald-500/20 ring-emerald-500/40',
    badgeBorder: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-950/40',
    badgeText: 'text-emerald-300',
    description: 'Verifies empirical calculations, technical boundary conditions, and testability.',
  },
  synthesizer: {
    role: 'synthesizer',
    name: 'The Synthesizer',
    title: 'Dialectic Summary & Argument Compilation',
    avatarSrc: synthesizerSvg,
    glowColor: 'shadow-fuchsia-500/20 ring-fuchsia-500/40',
    badgeBorder: 'border-fuchsia-500/30',
    badgeBg: 'bg-fuchsia-950/40',
    badgeText: 'text-fuchsia-300',
    description: 'Compiles and structures an objective bulleted list of key arguments from both sides before final consensus.',
  },
};

export function getAgentAvatar(role: string): AgentAvatarConfig {
  const normalized = role.toLowerCase().trim();
  if (normalized.includes('skeptic')) return AGENT_AVATARS.skeptic;
  if (normalized.includes('arbiter')) return AGENT_AVATARS.arbiter;
  if (normalized.includes('verifier')) return AGENT_AVATARS.verifier;
  if (normalized.includes('synthesizer')) return AGENT_AVATARS.synthesizer;
  return AGENT_AVATARS.architect;
}

export function getToneAvatar(role: string, tone: DebateTone = 'balanced'): AgentAvatarConfig {
  const base = getAgentAvatar(role);
  const roleKey = base.role;

  if (tone === 'aggressive') {
    return {
      ...base,
      avatarSrc: base.avatarSrc,
      glowColor: 'shadow-rose-600/50 ring-2 ring-rose-500/80',
      badgeBorder: 'border-rose-600/60',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-200',
      toneTag: 'Fiery Aggressive Mode',
      toneFilterClass: 'contrast-[1.15] saturate-[1.25]',
    };
  }

  if (tone === 'diplomatic') {
    return {
      ...base,
      avatarSrc: base.avatarSrc,
      glowColor: 'shadow-emerald-500/30 ring-2 ring-emerald-400/50',
      badgeBorder: 'border-emerald-500/40',
      badgeBg: 'bg-emerald-950/60',
      badgeText: 'text-emerald-200',
      toneTag: 'Harmonious Diplomatic Mode',
      toneFilterClass: 'saturate-[1.1] brightness-[1.05]',
    };
  }

  if (tone === 'rigorous') {
    return {
      ...base,
      glowColor: 'shadow-amber-500/40 ring-2 ring-amber-400/60',
      badgeBorder: 'border-amber-500/50',
      badgeBg: 'bg-amber-950/70',
      badgeText: 'text-amber-200',
      toneTag: 'Analytical Rigorous Mode',
      toneFilterClass: 'contrast-[1.1]',
    };
  }

  // Default balanced mode
  return {
    ...base,
    toneTag: 'Standard Balanced Mode',
    toneFilterClass: '',
  };
}
