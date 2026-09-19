import architectImg from '../assets/images/architect_avatar_1789843137752.jpg';
import skepticImg from '../assets/images/skeptic_avatar_1789843152010.jpg';
import arbiterImg from '../assets/images/arbiter_avatar_1789843166380.jpg';
import verifierImg from '../assets/images/verifier_avatar_1789843178620.jpg';

import architectAggressiveImg from '../assets/images/architect_aggressive_1789845987965.jpg';
import skepticAggressiveImg from '../assets/images/skeptic_aggressive_1789846003549.jpg';
import architectDiplomaticImg from '../assets/images/architect_diplomatic_1789846016154.jpg';
import skepticDiplomaticImg from '../assets/images/skeptic_diplomatic_1789846028172.jpg';

import { DebateTone } from '../types';

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
    avatarSrc: architectImg,
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
    avatarSrc: skepticImg,
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
    avatarSrc: arbiterImg,
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
    avatarSrc: verifierImg,
    glowColor: 'shadow-emerald-500/20 ring-emerald-500/40',
    badgeBorder: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-950/40',
    badgeText: 'text-emerald-300',
    description: 'Verifies empirical calculations, technical boundary conditions, and testability.',
  },
};

export function getAgentAvatar(role: string): AgentAvatarConfig {
  const normalized = role.toLowerCase().trim();
  if (normalized.includes('skeptic')) return AGENT_AVATARS.skeptic;
  if (normalized.includes('arbiter')) return AGENT_AVATARS.arbiter;
  if (normalized.includes('verifier')) return AGENT_AVATARS.verifier;
  return AGENT_AVATARS.architect;
}

export function getToneAvatar(role: string, tone: DebateTone = 'balanced'): AgentAvatarConfig {
  const base = getAgentAvatar(role);
  const roleKey = base.role;

  if (tone === 'aggressive') {
    let imgSrc = base.avatarSrc;
    if (roleKey === 'architect') imgSrc = architectAggressiveImg;
    if (roleKey === 'skeptic') imgSrc = skepticAggressiveImg;

    return {
      ...base,
      avatarSrc: imgSrc,
      glowColor: 'shadow-rose-600/50 ring-2 ring-rose-500/80',
      badgeBorder: 'border-rose-600/60',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-200',
      toneTag: 'Fiery Aggressive Mode',
      toneFilterClass: 'contrast-[1.15] saturate-[1.25]',
    };
  }

  if (tone === 'diplomatic') {
    let imgSrc = base.avatarSrc;
    if (roleKey === 'architect') imgSrc = architectDiplomaticImg;
    if (roleKey === 'skeptic') imgSrc = skepticDiplomaticImg;

    return {
      ...base,
      avatarSrc: imgSrc,
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
