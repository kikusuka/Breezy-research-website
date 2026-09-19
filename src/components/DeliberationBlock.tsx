import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldAlert,
  Scale,
  Sparkles,
  Copy,
  Check,
  Clock,
  Flame,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DebateStep, DebateTone } from '../types';
import { getToneAvatar } from '../data/agentAvatars';

interface DeliberationBlockProps {
  steps: DebateStep[];
  isDeliberating: boolean;
  activeRound?: number;
  tone?: DebateTone;
}

export const DeliberationBlock: React.FC<DeliberationBlockProps> = ({
  steps,
  isDeliberating,
  activeRound,
  tone = 'balanced',
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<{ [id: string]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getRoleBadge = (role: string) => {
    const avatar = getToneAvatar(role, tone);
    switch (role.toLowerCase()) {
      case 'architect':
        return {
          icon: <Cpu className="h-4 w-4 text-sky-400" />,
          title: 'Thesis • The Architect',
          subtitle: 'Initial baseline proposal and solution foundation',
          borderColor: 'border-sky-950/50 hover:border-sky-800/60',
          bgHeader: 'bg-[#0f1422]',
          accentColor: 'text-sky-200',
          avatar,
        };
      case 'skeptic':
        return {
          icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
          title: 'Antithesis • The Skeptic',
          subtitle: 'Fatal flaws, edge cases & attack surface exposure',
          borderColor: 'border-rose-950/50 hover:border-rose-800/60',
          bgHeader: 'bg-[#181116]',
          accentColor: 'text-rose-200',
          avatar,
        };
      case 'verifier':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
          title: 'Audit • The Verifier',
          subtitle: 'Empirical verification & constraint boundary testing',
          borderColor: 'border-emerald-950/50 hover:border-emerald-800/60',
          bgHeader: 'bg-[#0f1714]',
          accentColor: 'text-emerald-200',
          avatar,
        };
      case 'arbiter':
      default:
        return {
          icon: <Scale className="h-4 w-4 text-amber-400" />,
          title: 'Synthesis • The Arbiter',
          subtitle: 'Fortified resolution and consensus reconciliation',
          borderColor: 'border-amber-950/50 hover:border-amber-800/60',
          bgHeader: 'bg-[#19150f]',
          accentColor: 'text-amber-200',
          avatar,
        };
    }
  };

  if (steps.length === 0 && !isDeliberating) {
    return null;
  }

  const completedCount = steps.filter((s) => s.status === 'completed').length;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#1d2232] bg-[#0b0d14] shadow-xl">
      {/* Top Banner / Think Block Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between border-b border-[#181d2a] bg-[#10131d] px-5 py-3.5"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-md bg-[#161a28] text-slate-300">
            {isDeliberating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-mono uppercase tracking-[0.07em] text-slate-200">
              Council Cogitation • Deliberation Records
            </span>
            <span className="rounded-md border border-[#212738] bg-[#131724] px-2 py-0.5 text-[10px] font-medium text-[#8c97af]">
              {isDeliberating
                ? `Debate in progress (Stage ${activeRound || 1})...`
                : `${completedCount} Council Rounds Completed`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDeliberating && (
            <div className="flex items-center gap-1.5 text-[11px] text-sky-400">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Agents Active</span>
            </div>
          )}
          <button
            type="button"
            className="text-[#64748b] transition-colors hover:text-white"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="space-y-4 p-5 sm:p-6">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const badge = getRoleBadge(step.role);
            const isStepExpanded = expandedSteps[stepNum] ?? true;
            const isCurrentlyStreaming = step.status === 'running';

            return (
              <div
                key={step.stepId || stepNum}
                className={`overflow-hidden rounded-xl border transition-all ${badge.borderColor} bg-[#0e1018]`}
              >
                {/* Step Sub-Header */}
                <div
                  onClick={() => toggleStep(stepNum)}
                  className={`flex cursor-pointer items-center justify-between border-b border-[#181d2a] px-4 py-3.5 transition-colors ${badge.bgHeader}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Agent Geometric Avatar Portrait */}
                    <div className="relative shrink-0">
                      <div className={`relative h-10 w-10 overflow-hidden rounded-xl border border-slate-700/60 bg-[#080a10] shadow-md ring-1 ${badge.avatar.glowColor}`}>
                        <img
                          src={badge.avatar.avatarSrc}
                          alt={badge.avatar.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                      {isCurrentlyStreaming ? (
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-slate-900 bg-amber-400" />
                        </span>
                      ) : (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-slate-900 bg-[#161a28] shadow-sm">
                          {badge.icon}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-serif text-[14px] font-semibold tracking-tight ${badge.accentColor}`}>
                          {badge.title}
                        </span>
                        <span className="rounded border border-[#1f2536] bg-[#121520] px-1.5 py-0.5 text-[9.5px] font-mono text-[#858fa6]">
                          {step.provider} / {step.model}
                        </span>
                        {isCurrentlyStreaming && (
                          <span className="flex items-center gap-1 rounded bg-amber-950/70 border border-amber-800/40 px-1.5 py-0.2 text-[9px] font-mono text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                            deliberating
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-[11.5px] text-[#8894ad] leading-tight mt-0.5 truncate">
                        {badge.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {step.durationMs && (
                      <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                        <Clock className="h-3 w-3" />
                        {(step.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(step.content, String(stepNum));
                      }}
                      className="rounded p-1 text-[#64748b] hover:bg-[#181d2a] hover:text-white transition-colors"
                      title="Copy agent step"
                    >
                      {copiedId === String(stepNum) ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      type="button"
                      className="text-[#64748b] hover:text-white"
                    >
                      {isStepExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Step Body */}
                {isStepExpanded && (
                  <div className="p-4 sm:p-5 font-serif text-[13.5px] leading-[1.42] text-slate-200">
                    {step.content ? (
                      <div className="prose prose-invert max-w-none space-y-2.5 font-serif text-[13.5px] leading-[1.42] [&_p]:font-serif [&_p]:text-[13.5px] [&_p]:leading-[1.42] [&_p]:my-2 [&_p]:text-slate-200/90 [&_h1]:font-serif [&_h1]:text-[16px] [&_h1]:font-normal [&_h1]:tracking-[-0.016em] [&_h1]:text-white [&_h1]:mt-3 [&_h1]:mb-1.5 [&_h2]:font-serif [&_h2]:text-[14.5px] [&_h2]:font-normal [&_h2]:tracking-[-0.014em] [&_h2]:text-white [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:font-serif [&_h3]:text-[13.5px] [&_h3]:font-medium [&_h3]:tracking-[-0.01em] [&_h3]:text-slate-100 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1.5 [&_li]:my-0.5 [&_li]:leading-[1.4] [&_li]:font-serif [&_strong]:text-slate-100 [&_code]:rounded [&_code]:bg-[#141824] [&_code]:border [&_code]:border-[#1e2436] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11px] [&_pre]:rounded-lg [&_pre]:bg-[#08090f] [&_pre]:p-3 [&_pre]:border [&_pre]:border-[#1a1f2e] [&_pre]:my-2">
                        <ReactMarkdown>{step.content}</ReactMarkdown>
                      </div>
                    ) : isCurrentlyStreaming ? (
                      <div className="flex items-center gap-2 text-xs text-[#8c94ab]">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                        <span>Formulating arguments...</span>
                      </div>
                    ) : (
                      <span className="italic text-[#64748b]">Pending debate round...</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
