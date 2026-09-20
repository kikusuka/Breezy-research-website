import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Scale,
  Sparkles,
  ShieldAlert,
  Clock,
  Flame,
  Printer,
  FileCode,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DebateStep } from '../types';
import { ExportTranscriptMenu } from './ExportTranscriptMenu';
import {
  exportConsensusAsPdf,
  exportConsensusAsMarkdown,
} from '../utils/exportTranscript';
import { AGENT_AVATARS } from '../data/agentAvatars';

interface FinalAnswerCardProps {
  content: string;
  prompt?: string;
  protocol?: string;
  steps?: DebateStep[];
  metrics?: {
    durationMs: number;
    consensusRate: number;
    contentionLevel: string;
    resolvedPointsCount: number;
  };
  onRerun?: () => void;
}

export const FinalAnswerCard: React.FC<FinalAnswerCardProps> = ({
  content,
  prompt = '',
  protocol = 'trio',
  steps = [],
  metrics,
  onRerun,
}) => {
  const [copied, setCopied] = useState(false);

  const debateData = {
    prompt: prompt || 'Deliberation Inquiry',
    protocol,
    steps,
    finalOutput: content,
    metrics,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    exportConsensusAsPdf(debateData);
  };

  const handleExportMarkdown = () => {
    exportConsensusAsMarkdown(debateData);
  };

  return (
    <div
      id="final-synthesized-answer"
      className="rounded-xl border border-[#232838] bg-[#11141c] p-6 sm:p-8 shadow-xl transition-all"
    >
      {/* Top Banner / Verdict Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2230] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-amber-500/40 bg-[#171b26] shadow-md ring-1 ring-amber-500/30">
            <img
              src={AGENT_AVATARS.arbiter.avatarSrc}
              alt="The Arbiter"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-slate-900 bg-[#161a28] shadow-sm">
              <Scale className="h-2.5 w-2.5 text-amber-400" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-[19px] font-normal tracking-[-0.018em] text-white">
                Council Consensus Resolution
              </h3>
              <span className="rounded border border-[#2b3348] bg-[#161a25] px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-[0.08em] text-slate-300">
                Ratified Synthesis
              </span>
            </div>
            <p className="font-serif text-[12.5px] text-slate-400 mt-0.5 leading-[1.38]">
              Adversarially reconciled by The Arbiter with fatal flaw defenses integrated
            </p>
          </div>
        </div>

        {/* Action Controls: Copy, Quick PDF/MD Export & Menu */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Resolution Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[#262c3b] bg-[#141722] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#384155] hover:text-white transition-all shadow-sm"
            title="Copy synthesized consensus resolution to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Quick PDF Export */}
          <button
            type="button"
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-900/30 hover:border-rose-400/50 hover:text-rose-200 transition-all shadow-sm"
            title="Export final consensus resolution as print-ready PDF"
          >
            <Printer className="h-3.5 w-3.5 text-rose-400" />
            <span>PDF</span>
          </button>

          {/* Quick Markdown Export */}
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/30 hover:border-amber-400/50 hover:text-amber-200 transition-all shadow-sm"
            title="Download final consensus as Markdown (.md)"
          >
            <FileCode className="h-3.5 w-3.5 text-amber-400" />
            <span>.MD</span>
          </button>

          {/* Export Transcript Dropdown */}
          <ExportTranscriptMenu
            debate={debateData}
            variant="secondary"
          />

          {onRerun && (
            <button
              type="button"
              onClick={onRerun}
              className="flex items-center gap-1.5 rounded-lg border border-[#262c3b] bg-[#141722] px-3 py-1.5 text-xs text-slate-300 hover:border-[#384155] hover:text-white transition-colors"
              title="Rerun debate with current inquiry"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Rerun</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-[#262c3b] bg-[#161a25] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-[#1d2332] hover:border-[#3a445c]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured Telemetry Row */}
      {metrics && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-lg border border-[#1e2332] bg-[#0c0f16] p-4 text-xs font-mono">
          <div className="border-r border-[#1a1f2c] last:border-r-0 pr-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Consensus Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-emerald-400">
                {metrics.consensusRate}%
              </span>
              <span className="text-[10px] text-slate-400">convergence</span>
            </div>
          </div>

          <div className="border-r border-[#1a1f2c] last:border-r-0 pr-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Deliberation Time
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-slate-200">
                {metrics.durationMs ? `${(metrics.durationMs / 1000).toFixed(1)}s` : 'Realtime'}
              </span>
            </div>
          </div>

          <div className="border-r border-[#1a1f2c] last:border-r-0 pr-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Contention Index
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-amber-300">
                {metrics.contentionLevel}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
              Flaws Fortified
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-slate-100">
                {metrics.resolvedPointsCount}
              </span>
              <span className="text-[10px] text-slate-400">points addressed</span>
            </div>
          </div>
        </div>
      )}

      {/* Markdown Body with Refined Editorial Serif Typography */}
      <div className="prose prose-invert max-w-none space-y-3 font-serif text-[15px] leading-[1.46] text-slate-200 selection:bg-amber-500/20 [&_p]:font-serif [&_p]:text-[15px] [&_p]:leading-[1.46] [&_p]:my-2.5 [&_p]:text-slate-200/95 [&_h1]:font-serif [&_h1]:text-[21px] [&_h1]:font-normal [&_h1]:tracking-[-0.02em] [&_h1]:text-white [&_h1]:mt-5 [&_h1]:mb-2 [&_h2]:font-serif [&_h2]:text-[18px] [&_h2]:font-normal [&_h2]:tracking-[-0.016em] [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:font-serif [&_h3]:text-[15.5px] [&_h3]:font-medium [&_h3]:tracking-[-0.012em] [&_h3]:text-slate-100 [&_h3]:mt-3.5 [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-1 [&_li]:leading-[1.44] [&_li]:font-serif [&_strong]:text-slate-100 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-[#181d2a] [&_code]:border [&_code]:border-[#252c3c] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-slate-200 [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[#222838] [&_pre]:bg-[#0c0e14] [&_pre]:p-4 [&_pre]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-amber-500/40 [&_blockquote]:pl-4 [&_blockquote]:py-0.5 [&_blockquote]:my-3 [&_blockquote]:text-slate-300 [&_blockquote]:font-serif [&_blockquote]:italic [&_blockquote]:leading-[1.44] [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[#232938] [&_th]:bg-[#141822] [&_th]:p-2.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-mono [&_td]:border [&_td]:border-[#232938] [&_td]:p-2.5 [&_td]:text-xs [&_td]:font-mono">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};
