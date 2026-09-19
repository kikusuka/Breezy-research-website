import React, { useState } from 'react';
import {
  X,
  Scale,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  Globe,
  ArrowRightLeft,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  GitCompare,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { DebateSession } from '../types';

interface SessionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: DebateSession[];
  initialSessionAId?: string;
  initialSessionBId?: string;
  onSelectSession?: (sessionId: string) => void;
}

export const SessionCompareModal: React.FC<SessionCompareModalProps> = ({
  isOpen,
  onClose,
  sessions,
  initialSessionAId,
  initialSessionBId,
  onSelectSession,
}) => {
  const completedSessions = sessions.filter(
    (s) => s.status === 'completed' || s.finalOutput || (s.steps && s.steps.length > 0)
  );

  const [sessionAId, setSessionAId] = useState<string>(() => {
    if (initialSessionAId && completedSessions.some((s) => s.id === initialSessionAId)) {
      return initialSessionAId;
    }
    return completedSessions[0]?.id || '';
  });

  const [sessionBId, setSessionBId] = useState<string>(() => {
    if (initialSessionBId && completedSessions.some((s) => s.id === initialSessionBId)) {
      return initialSessionBId;
    }
    return completedSessions[1]?.id || completedSessions[0]?.id || '';
  });

  if (!isOpen) return null;

  const sessionA = completedSessions.find((s) => s.id === sessionAId);
  const sessionB = completedSessions.find((s) => s.id === sessionBId);

  const consensusA = sessionA?.metrics?.consensusRate ?? (sessionA?.finalOutput ? 90 : 75);
  const consensusB = sessionB?.metrics?.consensusRate ?? (sessionB?.finalOutput ? 90 : 75);
  const consensusDelta = consensusA - consensusB;

  const wordsA = sessionA?.finalOutput ? sessionA.finalOutput.trim().split(/\s+/).length : 0;
  const wordsB = sessionB?.finalOutput ? sessionB.finalOutput.trim().split(/\s+/).length : 0;
  const wordDelta = wordsA - wordsB;

  const isSamePrompt = sessionA && sessionB && sessionA.prompt.trim().toLowerCase() === sessionB.prompt.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-6xl h-[90vh] max-h-[860px] rounded-2xl border border-[#23293c] bg-[#0c0e16] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1c2232] bg-[#111420] px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <GitCompare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-[17px] font-semibold text-white tracking-[-0.012em]">
                Side-by-Side Deliberation Consensus Comparison
              </h2>
              <p className="text-[11.5px] text-slate-400">
                Analyze differing dialectic outcomes, consensus alignment rates, and model seat strategies.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#1a202e] hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Session Selector Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-[#1b202e] bg-[#0f121c] shrink-0">
          {/* Session A Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-sky-300">
              <span>Transcript A (Baseline)</span>
              <span className="text-[10px] font-mono text-slate-400">
                {sessionA ? new Date(sessionA.createdAt).toLocaleDateString() : ''}
              </span>
            </label>
            <select
              value={sessionAId}
              onChange={(e) => setSessionAId(e.target.value)}
              className="w-full rounded-lg border border-[#252c3f] bg-[#141824] px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
            >
              {completedSessions.map((s, idx) => (
                <option key={`a-${s.id}`} value={s.id}>
                  Transcript #{idx + 1}: {s.prompt.slice(0, 60)} ({s.protocol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Session B Selector */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs font-semibold text-amber-300">
              <span>Transcript B (Comparison)</span>
              <span className="text-[10px] font-mono text-slate-400">
                {sessionB ? new Date(sessionB.createdAt).toLocaleDateString() : ''}
              </span>
            </label>
            <select
              value={sessionBId}
              onChange={(e) => setSessionBId(e.target.value)}
              className="w-full rounded-lg border border-[#252c3f] bg-[#141824] px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
            >
              {completedSessions.map((s, idx) => (
                <option key={`b-${s.id}`} value={s.id}>
                  Transcript #{idx + 1}: {s.prompt.slice(0, 60)} ({s.protocol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Key Differences & Delta Metrics Bar */}
        {sessionA && sessionB && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#121623] border-b border-[#1a1f2e] text-xs font-mono shrink-0">
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Consensus Rate Delta:</span>
                <strong
                  className={`font-bold ${
                    consensusDelta > 0
                      ? 'text-emerald-400'
                      : consensusDelta < 0
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {consensusDelta > 0 ? `+${consensusDelta}%` : `${consensusDelta}%`}
                </strong>
              </span>

              <span className="text-slate-600">•</span>

              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Output Length Delta:</span>
                <strong className="text-sky-300">
                  {wordDelta > 0 ? `+${wordDelta} words (A longer)` : wordDelta < 0 ? `${Math.abs(wordDelta)} words (B longer)` : 'Equal length'}
                </strong>
              </span>

              <span className="text-slate-600">•</span>

              <span className="text-slate-400">
                Inquiry Topic:{' '}
                {isSamePrompt ? (
                  <span className="text-emerald-300 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                    Identical Prompt Re-run
                  </span>
                ) : (
                  <span className="text-amber-300">Differing Inquiries</span>
                )}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="rounded bg-sky-950/80 border border-sky-800/40 text-sky-300 px-1.5 py-0.5">
                A: {sessionA.steps?.length || 0} Rounds ({wordsA} words)
              </span>
              <span className="rounded bg-amber-950/80 border border-amber-800/40 text-amber-300 px-1.5 py-0.5">
                B: {sessionB.steps?.length || 0} Rounds ({wordsB} words)
              </span>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Content Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column A: Session A */}
          <div className="flex flex-col rounded-xl border border-sky-950/50 bg-[#10131e] p-4 space-y-4">
            {sessionA ? (
              <>
                {/* Session A Header Card */}
                <div className="rounded-lg border border-sky-900/40 bg-sky-950/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-sky-400 tracking-wider">
                      Transcript A Baseline
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                        {consensusA}% Consensus
                      </span>
                      {onSelectSession && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSession(sessionA.id);
                            onClose();
                          }}
                          className="text-[10px] font-mono bg-sky-500/20 text-sky-200 hover:bg-sky-500/30 border border-sky-500/40 px-2 py-0.5 rounded transition-colors"
                        >
                          Load A in Chamber →
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-white leading-relaxed">
                    {sessionA.prompt}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                    <span className="rounded bg-[#161a28] px-1.5 py-0.5 text-slate-300 uppercase border border-[#252c3d]">
                      {sessionA.protocol}
                    </span>
                    <span className="rounded bg-[#161a28] px-1.5 py-0.5 text-slate-300 capitalize border border-[#252c3d]">
                      Tone: {sessionA.tone || 'balanced'}
                    </span>
                    {sessionA.enableSearchGrounding && (
                      <span className="rounded bg-sky-950 border border-sky-800 text-sky-300 px-1.5 py-0.5 flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" /> Grounded
                      </span>
                    )}
                  </div>
                </div>

                {/* Session A Output */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Ratified Consensus Output A
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {wordsA} words • {sessionA.finalOutput?.length || 0} chars
                    </span>
                  </div>
                  <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed bg-[#0c0e16] rounded-lg border border-[#1d2232] p-4 max-h-[420px] overflow-y-auto">
                    {sessionA.finalOutput ? (
                      <Markdown>{sessionA.finalOutput}</Markdown>
                    ) : (
                      <p className="text-slate-500 italic">No finalized output generated for this session.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Select Transcript A to compare
              </div>
            )}
          </div>

          {/* Column B: Session B */}
          <div className="flex flex-col rounded-xl border border-amber-950/50 bg-[#121019] p-4 space-y-4">
            {sessionB ? (
              <>
                {/* Session B Header Card */}
                <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider">
                      Transcript B Comparison
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                        {consensusB}% Consensus
                      </span>
                      {onSelectSession && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSession(sessionB.id);
                            onClose();
                          }}
                          className="text-[10px] font-mono bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-500/40 px-2 py-0.5 rounded transition-colors"
                        >
                          Load B in Chamber →
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-white leading-relaxed">
                    {sessionB.prompt}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                    <span className="rounded bg-[#181522] px-1.5 py-0.5 text-slate-300 uppercase border border-[#2c263d]">
                      {sessionB.protocol}
                    </span>
                    <span className="rounded bg-[#181522] px-1.5 py-0.5 text-slate-300 capitalize border border-[#2c263d]">
                      Tone: {sessionB.tone || 'balanced'}
                    </span>
                    {sessionB.enableSearchGrounding && (
                      <span className="rounded bg-sky-950 border border-sky-800 text-sky-300 px-1.5 py-0.5 flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5" /> Grounded
                      </span>
                    )}
                  </div>
                </div>

                {/* Session B Output */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Ratified Consensus Output B
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {wordsB} words • {sessionB.finalOutput?.length || 0} chars
                    </span>
                  </div>
                  <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed bg-[#0e0c16] rounded-lg border border-[#231d32] p-4 max-h-[420px] overflow-y-auto">
                    {sessionB.finalOutput ? (
                      <Markdown>{sessionB.finalOutput}</Markdown>
                    ) : (
                      <p className="text-slate-500 italic">No finalized output generated for this session.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                Select Transcript B to compare
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1a1f2e] bg-[#0a0c14] px-6 py-3 text-xs text-slate-400 shrink-0">
          <span>Comparing 2 dialectic transcripts from local session memory</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#23293c] bg-[#141824] px-4 py-1.5 text-xs text-slate-200 hover:text-white transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
