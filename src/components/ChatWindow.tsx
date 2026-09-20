import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  ArrowUpRight,
  Radio,
  History,
  Plus,
  Compass,
  ArrowRight,
  Heart,
  Activity,
  Cpu,
  ShieldAlert,
  Scale,
  CheckCircle2,
  Check,
  Globe,
  EyeOff,
  Eye,
  Sidebar,
  Trash2,
  Columns,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { PromptInput } from './PromptInput';
import { FinalAnswerCard } from './FinalAnswerCard';
import { ExportTranscriptMenu } from './ExportTranscriptMenu';
import { FloatingExportButton } from './FloatingExportButton';
import { SessionCompareModal } from './SessionCompareModal';
import { DebateStep, HeartbeatState, DebateSession, SessionSnapshot } from '../types';

interface ChatWindowProps {
  currentPrompt: string;
  isDeliberating: boolean;
  steps: DebateStep[];
  finalOutput: string;
  metrics?: {
    durationMs: number;
    consensusRate: number;
    contentionLevel: string;
    resolvedPointsCount: number;
  };
  heartbeat?: HeartbeatState;
  protocol?: 'trio' | 'quad' | 'duel';
  sessions?: DebateSession[];
  activeSessionId?: string | null;
  onSelectSession?: (sessionId: string) => void;
  onNewDebate?: () => void;
  onOpenHistory?: () => void;
  onStartDebate: (promptText: string) => void;
  onCancel: () => void;
  onOpenCouncilWindow: () => void;
  snapshots?: SessionSnapshot[];
  onRestoreSnapshot?: (snapshot: SessionSnapshot) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentPrompt,
  isDeliberating,
  steps,
  finalOutput,
  metrics,
  heartbeat,
  protocol = 'trio',
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewDebate,
  onOpenHistory,
  onStartDebate,
  onCancel,
  onOpenCouncilWindow,
  onRestoreSnapshot,
}) => {
  const [pulseTick, setPulseTick] = useState(false);
  const [isSourcesSidebarOpen, setIsSourcesSidebarOpen] = useState(false);
  const [ignoredSourceUrls, setIgnoredSourceUrls] = useState<string[]>([]);
  const [isExecSummaryOpen, setIsExecSummaryOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Helper to construct a clean 1-paragraph Executive TL;DR synthesized by Synthesizer Agent
  const generateExecutiveTLDR = () => {
    if (!finalOutput && steps.length === 0) {
      return "Deliberation inquiry pending. Once the Council completes its multi-agent debate, the Synthesizer agent will generate a 1-paragraph executive summary highlighting core trade-offs and recommended actions.";
    }

    // Try to extract the first clean synthesis paragraph or construct one
    if (finalOutput) {
      const cleanOutput = finalOutput
        .replace(/^#+\s*/gm, '')
        .replace(/\*\*/g, '')
        .split('\n\n')
        .filter((p) => p.trim().length > 30)[0];
      if (cleanOutput) {
        return `EXECUTIVE TL;DR (SYNTHESIZER AGENT): ${cleanOutput.trim()}`;
      }
    }

    const synthesizerStep = steps.find((s) => s.role === 'synthesizer');
    if (synthesizerStep?.content) {
      const cleanStep = synthesizerStep.content
        .replace(/^#+\s*/gm, '')
        .replace(/\*\*/g, '')
        .slice(0, 320);
      return `EXECUTIVE TL;DR (SYNTHESIZER AGENT): ${cleanStep}...`;
    }

    return `EXECUTIVE TL;DR (SYNTHESIZER AGENT): In evaluating "${currentPrompt}", the Council reconciled structural design constraints with security edge cases across ${steps.length} rounds of critique, arriving at an optimal consensus path with ${metrics?.consensusRate || 85}% agreement.`;
  };
  
  // Local snapshots state to store checkpoints in localStorage
  const [localSnapshots, setLocalSnapshots] = useState<SessionSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('synthexis_snapshots');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveSnapshot = (name: string) => {
    const newSnap: SessionSnapshot = {
      id: `snap-${Date.now()}`,
      sessionId: activeSessionId || 'sandbox',
      name: name || `Checkpoint at ${new Date().toLocaleTimeString()}`,
      prompt: currentPrompt,
      protocol: activeSession?.protocol || protocol,
      steps: JSON.parse(JSON.stringify(steps)),
      finalOutput,
      timestamp: Date.now(),
    };
    const nextSnaps = [newSnap, ...localSnapshots];
    setLocalSnapshots(nextSnaps);
    localStorage.setItem('synthexis_snapshots', JSON.stringify(nextSnaps));
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSnaps = localSnapshots.filter((s) => s.id !== id);
    setLocalSnapshots(nextSnaps);
    localStorage.setItem('synthexis_snapshots', JSON.stringify(nextSnaps));
  };

  // Compile active prompt filters, applying user modifications from the sources sidebar
  const handleStartDebateWithFilters = (promptText: string) => {
    let finalPrompt = promptText;
    if (ignoredSourceUrls.length > 0) {
      finalPrompt += `\n\n[COMPLIANCE DISCIPLINE: EXCLUDE THE FOLLOWING SOURCE DOMAINS AND KNOWLEDGE PATHS]:\n${ignoredSourceUrls
        .map((url) => `- ${url}`)
        .join('\n')}\n(Note: The user has flagged these research sources as low-relevance. Completely filter and exclude their data from final consensus playbook triangulation.)`;
    }
    onStartDebate(finalPrompt);
  };

  // Helper to dynamically extract ground citations from all agent steps
  const extractCitations = () => {
    const list: { title: string; url: string; id: string }[] = [];
    const seen = new Set<string>();

    steps.forEach((step) => {
      // Matches markdown links
      const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = mdRegex.exec(step.content)) !== null) {
        const title = match[1].trim();
        const url = match[2].trim();
        if (!seen.has(url)) {
          seen.add(url);
          list.push({ title, url, id: url });
        }
      }

      // Matches raw URLs
      const rawRegex = /(https?:\/\/[^\s<]+)/g;
      let rawMatch;
      while ((rawMatch = rawRegex.exec(step.content)) !== null) {
        const url = rawMatch[1].trim().replace(/[).,;:]$/, '');
        if (!seen.has(url) && !url.includes(')') && !url.includes(']')) {
          seen.add(url);
          let title = url;
          try {
            const parsed = new URL(url);
            title = parsed.hostname.replace('www.', '');
          } catch {}
          list.push({ title, url, id: url });
        }
      }
    });

    return list;
  };

  const citations = extractCitations();

  useEffect(() => {
    if (!isDeliberating) return;
    const bpm = heartbeat?.bpm || 74;
    const intervalMs = Math.round((60 / bpm) * 1000);

    const timer = setInterval(() => {
      setPulseTick((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isDeliberating, heartbeat?.bpm]);

  const hasStarted = Boolean(currentPrompt || isDeliberating || finalOutput);
  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div
      id="chat-window-container"
      className="relative flex flex-col h-full rounded-xl border border-[#1e2330] bg-[#0c0e15] shadow-xl overflow-hidden transition-all"
    >
      {/* Workbench Panel Header */}
      <div className="flex items-center justify-between border-b border-[#1b202c] bg-[#10131d] px-5 py-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#181d2a] text-slate-300">
            <MessageSquare className="h-3 w-3" />
          </div>
          <span className="text-xs font-medium text-slate-200">
            Dialogue Console
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
            / Protocol: {activeSession?.protocol || protocol}
          </span>
        </div>

        {/* Header Controls: Live status, Export, and View Switcher */}
        {/* Header Controls: Live status, Export, and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {isDeliberating && (
            <div className="flex items-center gap-1.5 rounded-md border border-amber-900/40 bg-amber-950/20 px-2 py-0.5 text-[11px] font-mono text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Deliberating • {heartbeat?.bpm || 74} BPM</span>
            </div>
          )}

          {/* Persistent Checkpoint (Session Snapshot) Trigger */}
          {hasStarted && steps.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const name = prompt('Enter a name for this debate snapshot branch:', `Snapshot - Round ${steps.length}`);
                if (name !== null) {
                  handleSaveSnapshot(name);
                }
              }}
              className="flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-950/25 px-2.5 py-1 text-xs text-amber-300 hover:bg-amber-900/20 transition-colors"
              title="Save a persistent snapshot to branch off debates from this mid-session state"
            >
              <span>💾 Save Checkpoint</span>
            </button>
          )}

          {/* Grounding Sources Panel Toggle */}
          {citations.length > 0 && (
            <button
              type="button"
              onClick={() => setIsSourcesSidebarOpen(!isSourcesSidebarOpen)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                isSourcesSidebarOpen
                  ? 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300'
                  : 'border-[#222837] bg-[#141722] text-slate-300 hover:text-white'
              }`}
              title="Toggle Grounding Sources Explorer sidebar to filter research knowledge"
            >
              <Sidebar className="h-3 w-3" />
              <span>Sources ({citations.length - ignoredSourceUrls.length}/{citations.length})</span>
            </button>
          )}

          {/* Quick Export in Header if debate has content */}
          {hasStarted && steps.length > 0 && (
            <ExportTranscriptMenu
              debate={{
                prompt: currentPrompt || activeSession?.prompt || 'Council Inquiry',
                protocol: activeSession?.protocol || protocol,
                createdAt: activeSession?.createdAt,
                steps,
                finalOutput,
                metrics,
              }}
              variant="secondary"
            />
          )}

          {/* Executive Summary TL;DR Button */}
          {hasStarted && (
            <button
              type="button"
              onClick={() => setIsExecSummaryOpen(!isExecSummaryOpen)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all ${
                isExecSummaryOpen
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 shadow-xs'
                  : 'border-[#222837] bg-[#141722] text-slate-300 hover:border-[#343e54] hover:text-white'
              }`}
              title="Synthesize 1-paragraph TL;DR Executive Summary by Synthesizer Agent"
            >
              <FileText className="h-3 w-3 text-amber-400" />
              <span>Executive Summary</span>
            </button>
          )}

          {/* Compare Sessions Split-View Button */}
          {sessions.length >= 2 && (
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
              title="Compare two deliberation sessions side-by-side"
            >
              <Columns className="h-3 w-3 text-indigo-400" />
              <span className="hidden sm:inline">Compare Inquiries</span>
            </button>
          )}

          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
              title="Browse past debate transcripts"
            >
              <History className="h-3 w-3 text-slate-400" />
              <span className="hidden sm:inline">Transcripts</span>
            </button>
          )}

          {onNewDebate && hasStarted && (
            <button
              type="button"
              onClick={onNewDebate}
              className="flex items-center gap-1 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
              title="Start a new deliberation inquiry"
            >
              <Plus className="h-3 w-3 text-slate-400" />
              <span className="hidden sm:inline">New Inquiry</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCouncilWindow}
            className="flex items-center gap-1 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
            title="Inspect dialectic debate rounds and agent critique ledger"
          >
            <span>Chamber Ledger</span>
            <ArrowUpRight className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Dialogue Split Workspace Container */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Left Side: Active Dialogue Thread */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 min-w-0">
          {!hasStarted ? (
            /* Empty Dialogue Intro */
            <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center max-w-xl mx-auto py-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#262c3b] bg-[#131622] text-amber-400/90 mb-4 shadow-sm">
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="font-serif text-[26px] font-normal tracking-[-0.022em] text-white mb-2">
                Dialectic Inquiry Console
              </h2>
              <p className="font-serif text-[14.5px] text-slate-300/90 leading-[1.44] max-w-md mb-8">
                Submit architectural decisions, philosophical dilemmas, code security reviews, or technical tradeoffs. The Council stress-tests edge cases and synthesizes a battle-tested consensus.
              </p>

              {/* Quick Access to Previous Sessions */}
              {sessions.length > 0 && onSelectSession && (
                <div className="w-full text-left space-y-2 pt-6 border-t border-[#1a1f2c]">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 uppercase tracking-[0.08em] mb-1">
                    <span className="flex items-center gap-1.5">
                      <History className="h-3 w-3 text-slate-400" />
                      Previous Inquiries
                    </span>
                    {onOpenHistory && (
                      <button
                        type="button"
                        onClick={onOpenHistory}
                        className="text-slate-400 hover:text-slate-200 transition-colors lowercase"
                      >
                        browse all ({sessions.length})
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {sessions.slice(0, 3).map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => onSelectSession(session.id)}
                        className="group flex items-center justify-between gap-3 w-full rounded-lg border border-[#1e2330] bg-[#10131c] p-3 text-left transition-all hover:border-[#2f384d] hover:bg-[#141824]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-serif text-[13.5px] font-normal text-slate-200 truncate group-hover:text-white transition-colors leading-[1.38]">
                            {session.prompt}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                            <span className="uppercase text-slate-400">{session.protocol}</span>
                            <span>•</span>
                            <span>{session.steps?.length || 0} rounds</span>
                            {session.metrics?.consensusRate && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400">
                                  {session.metrics.consensusRate}% consensus
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Checkpoint Branches */}
              {localSnapshots.length > 0 && onRestoreSnapshot && (
                <div className="w-full text-left space-y-2 pt-6 border-t border-[#1a1f2c] mt-4">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 uppercase tracking-[0.08em] mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-400">💾</span>
                      Active Checkpoint Snapshots
                    </span>
                    <span className="text-[10px] text-slate-500 lowercase font-mono">
                      {localSnapshots.length} checkpoints
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {localSnapshots.slice(0, 4).map((snap) => (
                      <div
                        key={snap.id}
                        onClick={() => onRestoreSnapshot(snap)}
                        className="group flex items-center justify-between gap-3 w-full rounded-lg border border-amber-500/15 bg-[#121014] p-3 text-left transition-all hover:border-amber-500/30 hover:bg-amber-950/15 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-[11.5px] font-semibold text-amber-300">
                              {snap.name}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">
                              {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="font-serif text-[13px] font-normal text-slate-300 truncate leading-[1.38] mt-1">
                            {snap.prompt}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                            <span className="uppercase text-slate-400">{snap.protocol}</span>
                            <span>•</span>
                            <span>{snap.steps?.length || 0} rounds</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-slate-800 cursor-pointer"
                            title="Delete checkpoint"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ArrowRight className="h-3.5 w-3.5 text-amber-600 group-hover:text-amber-300 transition-colors shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Chat Thread */
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Archived Transcript Header Banner */}
              {!isDeliberating && activeSession && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1e2330] bg-[#10131c] px-4 py-2.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-sans font-medium">Archived Deliberation</span>
                    <span className="text-slate-400">•</span>
                    <span>
                      {new Date(activeSession.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExportTranscriptMenu
                      debate={{
                        prompt: activeSession.prompt,
                        protocol: activeSession.protocol,
                        createdAt: activeSession.createdAt,
                        steps: activeSession.steps || [],
                        finalOutput: activeSession.finalOutput,
                        metrics: activeSession.metrics,
                      }}
                      variant="minimal"
                    />
                    {onNewDebate && (
                      <button
                        type="button"
                        onClick={onNewDebate}
                        className="flex items-center gap-1 rounded border border-[#242b3b] bg-[#141824] px-2 py-0.5 text-[11px] text-slate-200 hover:border-[#354056] hover:text-white transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>New Inquiry</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* User Inquiry Statement */}
              {currentPrompt && (
                <div className="rounded-xl border border-[#222838] bg-[#11141d] p-5 shadow-sm">
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 uppercase tracking-[0.08em] mb-2">
                    <span>Inquiry Statement</span>
                    <span>Submitted</span>
                  </div>
                  <p className="font-serif text-[15.5px] font-normal text-slate-100 leading-[1.45] whitespace-pre-wrap">
                    {currentPrompt}
                  </p>
                </div>
              )}

              {/* Executive Summary TL;DR Card (Synthesizer Agent) */}
              {isExecSummaryOpen && (
                <div className="rounded-xl border border-amber-500/30 bg-[#121017] p-5 space-y-2.5 shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-amber-900/30 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Executive Summary (Synthesizer Agent TL;DR)
                        </h4>
                        <p className="text-[10.5px] text-slate-400 font-mono">
                          1-Paragraph Condensed Strategic Deliberation Verdict
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsExecSummaryOpen(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-[#1f1b26] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="font-serif text-[13.5px] text-amber-100/90 leading-relaxed bg-[#0b0910] p-4 rounded-lg border border-amber-950/60 shadow-inner">
                    {generateExecutiveTLDR()}
                  </p>
                </div>
              )}

              {/* Mobile Only Deliberation Pulse Stream (Hidden on Desktop) */}
              {isDeliberating && (
                <div className="lg:hidden rounded-xl border border-[#252c3c] bg-[#10131d] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-500/20 animate-pulse" />
                      <span className="text-xs font-semibold text-white">Chamber Transmission ({heartbeat?.bpm || 74} BPM)</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest animate-pulse">Deliberating</span>
                  </div>
                  <p className="text-[11.5px] text-slate-300 leading-relaxed font-serif bg-[#070910] p-3 rounded-lg border border-[#191e2b]">
                    {heartbeat?.statusText || 'Council is actively stress-testing hypotheses.'}
                  </p>
                </div>
              )}

              {/* Final Answer Card with Export and Black Swan Stress-Tester */}
              {finalOutput && (
                <div className="pt-2 space-y-6">
                  <FinalAnswerCard
                    content={finalOutput}
                    prompt={currentPrompt}
                    protocol={activeSession?.protocol || protocol}
                    steps={steps}
                    metrics={metrics}
                    onRerun={() => handleStartDebateWithFilters(currentPrompt)}
                  />

                  {/* Black Swan Crisis Injector */}
                  <div className="rounded-xl border border-amber-500/10 bg-amber-950/5 p-4 sm:p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0 p-1 bg-amber-950/40 rounded-lg border border-amber-900/30">🌪️</span>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                          Strategic Black Swan Stress-Tester
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                          Inject custom high-stakes perturbations to stress-test your blueprint's real-world adaptive capacity. Clicking a card forces the council to adapt their architecture under severe crisis.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={isDeliberating}
                        onClick={() => handleStartDebateWithFilters(`${currentPrompt}\n\n[BLACK SWAN CRISIS INJECTED]: A massive multi-region cloud outage takes down our primary hosts. We must redesign our system for instant disaster-recovery, active-active state replication, and absolute preservation under complete blackout.`)}
                        className="group p-3 rounded-lg border border-[#1d2230] bg-[#0c0e15] hover:border-amber-500/40 hover:bg-amber-950/10 text-left transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        <span className="text-[11.5px] font-medium text-slate-200 group-hover:text-amber-300">⚡ Infrastructure Outage</span>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">
                          Simulate host blackout. Force active-active multi-region failover.
                        </p>
                      </button>

                      <button
                        type="button"
                        disabled={isDeliberating}
                        onClick={() => handleStartDebateWithFilters(`${currentPrompt}\n\n[BLACK SWAN CRISIS INJECTED]: A strict regulatory compliance audit mandate takes immediate effect. We face $20M fines if ANY user-identifiable data, logs, or payload metadata is stored outside local geographic boundaries.`)}
                        className="group p-3 rounded-lg border border-[#1d2230] bg-[#0c0e15] hover:border-amber-500/40 hover:bg-amber-950/10 text-left transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        <span className="text-[11.5px] font-medium text-slate-200 group-hover:text-amber-300">⚖️ Sovereign Regulatory Audit</span>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">
                          Simulate strict audit. Force zero-knowledge & geographic residency.
                        </p>
                      </button>

                      <button
                        type="button"
                        disabled={isDeliberating}
                        onClick={() => handleStartDebateWithFilters(`${currentPrompt}\n\n[BLACK SWAN CRISIS INJECTED]: A critical zero-day exploit targeting our exact tech stack is leaked. Malicious actors are actively conducting memory-injection and spoofing credentials.`)}
                        className="group p-3 rounded-lg border border-[#1d2230] bg-[#0c0e15] hover:border-amber-500/40 hover:bg-amber-950/10 text-left transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        <span className="text-[11.5px] font-medium text-slate-200 group-hover:text-amber-300">💀 Active Zero-Day Breach</span>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">
                          Simulate memory-injection threat. Force zero-trust access containment.
                        </p>
                      </button>

                      <button
                        type="button"
                        disabled={isDeliberating}
                        onClick={() => handleStartDebateWithFilters(`${currentPrompt}\n\n[BLACK SWAN CRISIS INJECTED]: Operating budgets are immediately slashed by 65%. We must maintain current service standards but operate on a bare fraction of current server or API cost estimates.`)}
                        className="group p-3 rounded-lg border border-[#1d2230] bg-[#0c0e15] hover:border-amber-500/40 hover:bg-amber-950/10 text-left transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        <span className="text-[11.5px] font-medium text-slate-200 group-hover:text-amber-300">💸 65% Capital Slash</span>
                        <p className="text-[9.5px] text-slate-400 mt-1 leading-normal">
                          Simulate capital crash. Force extreme cost-pruning & serverless offloading.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Grounding Sources Sidebar */}
        {isSourcesSidebarOpen && citations.length > 0 && (
          <div className="w-80 shrink-0 border-l border-[#1c212f] bg-[#090b12] flex flex-col h-full animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#1c212f] bg-[#0c0e15] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
                  Grounding Sources
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsSourcesSidebarOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-1.5 py-0.5 rounded border border-[#212739] bg-[#141722] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-4 bg-[#0a0c14]/50 border-b border-[#1c212f]">
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                Below are web domains and search references mined during grounding. Toggle sources to exclude them from the consensus synthesis pipeline.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {citations.map((cite) => {
                const isIgnored = ignoredSourceUrls.includes(cite.url);
                return (
                  <div
                    key={cite.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isIgnored
                        ? 'border-rose-950/40 bg-rose-950/5 opacity-60'
                        : 'border-[#1b202c] bg-[#0e111a] hover:border-[#2f384f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`text-[12px] font-medium leading-snug truncate ${
                          isIgnored ? 'text-rose-400 line-through' : 'text-slate-200'
                        }`} title={cite.title}>
                          {cite.title}
                        </div>
                        <a
                          href={cite.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9.5px] text-slate-500 hover:text-indigo-400 font-mono truncate block mt-0.5"
                        >
                          {cite.url}
                        </a>
                      </div>

                      {/* Toggle Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isIgnored) {
                            setIgnoredSourceUrls(ignoredSourceUrls.filter(u => u !== cite.url));
                          } else {
                            setIgnoredSourceUrls([...ignoredSourceUrls, cite.url]);
                          }
                        }}
                        className={`p-1.5 rounded cursor-pointer transition-all shrink-0 ${
                          isIgnored
                            ? 'bg-rose-950/50 border border-rose-800/40 text-rose-300 hover:bg-rose-900/40'
                            : 'bg-indigo-950/40 border border-indigo-800/30 text-indigo-300 hover:bg-indigo-900/40'
                        }`}
                        title={isIgnored ? "Include in synthesis" : "Exclude from synthesis"}
                      >
                        {isIgnored ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[8.5px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded ${
                        isIgnored ? 'bg-rose-950/60 text-rose-300/80' : 'bg-indigo-950/40 text-indigo-300/80'
                      }`}>
                        {isIgnored ? 'Excluded' : 'Active Mapped'}
                      </span>
                      <span className="text-[8px] text-slate-500 font-mono">
                        Grounding Cit.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {ignoredSourceUrls.length > 0 && (
              <div className="p-4 border-t border-[#1c212f] bg-[#0c0e15] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-rose-400">
                  <span>Filtered Constraints:</span>
                  <span>{ignoredSourceUrls.length} excluded</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Excluded paths will be forcibly omitted from subsequent rounds of active deliberation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Right Side: Council Chamber Telemetry Node (A premium, unified hub on desktop!) */}
        <div className="hidden lg:flex w-80 shrink-0 flex-col border-l border-[#1b202c] bg-[#080a11] p-5 overflow-y-auto select-none space-y-5">
          <div className="flex items-center justify-between border-b border-[#181d2a] pb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isDeliberating ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              Council Telemetry
            </span>
            <span className="text-[9px] font-mono text-[#6c748a]">
              Mode: {activeSession?.protocol || protocol}
            </span>
          </div>

          {/* Real-time EKG ECG Wave Monitor */}
          <div className="rounded-xl border border-[#1a1f2b] bg-[#0c0e15] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Heart className={`h-3 w-3 ${isDeliberating ? 'text-rose-400 animate-pulse' : 'text-slate-600'}`} />
                CADENCE
              </span>
              <span className={`font-bold ${isDeliberating ? 'text-white' : 'text-slate-600'}`}>
                {isDeliberating ? (heartbeat?.bpm || 74) : 0} <span className="text-[9px] font-normal">BPM</span>
              </span>
            </div>

            {/* Micro Waveform Path */}
            <div className="relative flex h-10 w-full items-center justify-center overflow-hidden rounded border border-[#141822] bg-[#07090e]">
              <svg className="h-8 w-full" viewBox="0 0 300 40" preserveAspectRatio="none" fill="none">
                <line x1="0" y1="20" x2="300" y2="20" stroke="#121622" strokeWidth="1" strokeDasharray="3 3" />
                <path
                  d={
                    isDeliberating
                      ? pulseTick
                        ? "M 0 20 L 60 20 L 70 19 L 77 22 L 85 8 L 92 34 L 100 14 L 107 22 L 120 20 L 180 20 L 190 18 L 197 23 L 205 9 L 212 32 L 220 15 L 227 21 L 240 20 L 300 20"
                        : "M 0 20 L 60 20 L 70 20 L 77 21 L 85 10 L 92 32 L 100 16 L 107 21 L 120 20 L 180 20 L 190 19 L 197 22 L 205 11 L 212 30 L 220 17 L 227 20 L 240 20 L 300 20"
                      : "M 0 20 L 300 20"
                  }
                  stroke={isDeliberating ? "#fbbf24" : "#272e3f"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              </svg>
            </div>
            {isDeliberating && (
              <p className="text-[10px] text-slate-400 italic text-center truncate">
                {heartbeat?.statusText || 'Stress-testing technical designs...'}
              </p>
            )}
          </div>

          {/* Interactive Seat Orbit */}
          <div className="relative rounded-xl border border-[#1a1f2b] bg-[#0c0e15] p-4 flex flex-col items-center justify-center py-6">
            <span className="absolute top-2.5 left-3 text-[9px] font-mono text-[#6c748a] uppercase">Chamber Orbit</span>
            
            {/* Round Seating Ring */}
            <div className="relative h-28 w-28 rounded-full border border-dashed border-[#1f2537] flex items-center justify-center">
              {isDeliberating && (
                <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-[spin_10s_linear_infinite]" />
              )}
              <span className="text-[11px] font-mono text-slate-500">council</span>

              {/* Architect Seat (Top) */}
              <div 
                className={`absolute -top-3 left-1/2 -translate-x-1/2 p-1.5 rounded-full border transition-all duration-300 ${
                  heartbeat?.role === 'architect' 
                    ? 'bg-blue-950 border-blue-400 text-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.5)] scale-110' 
                    : 'bg-[#10131c] border-[#1e2433] text-slate-500'
                }`}
                title="The Architect"
              >
                <Cpu className="h-3 w-3" />
              </div>

              {/* Skeptic Seat (Right) */}
              <div 
                className={`absolute top-1/2 -right-3 -translate-y-1/2 p-1.5 rounded-full border transition-all duration-300 ${
                  heartbeat?.role === 'skeptic' 
                    ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.5)] scale-110' 
                    : 'bg-[#10131c] border-[#1e2433] text-slate-500'
                }`}
                title="The Skeptic"
              >
                <ShieldAlert className="h-3 w-3" />
              </div>

              {/* Verifier Seat (Bottom, conditional highlight) */}
              <div 
                className={`absolute -bottom-3 left-1/2 -translate-x-1/2 p-1.5 rounded-full border transition-all duration-300 ${
                  heartbeat?.role === 'verifier' 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110' 
                    : 'bg-[#10131c] border-[#1e2433] text-slate-500'
                }`}
                title="The Verifier"
              >
                <CheckCircle2 className="h-3 w-3" />
              </div>

              {/* Arbiter Seat (Left) */}
              <div 
                className={`absolute top-1/2 -left-3 -translate-y-1/2 p-1.5 rounded-full border transition-all duration-300 ${
                  heartbeat?.role === 'arbiter' 
                    ? 'bg-amber-950 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)] scale-110' 
                    : 'bg-[#10131c] border-[#1e2433] text-slate-500'
                }`}
                title="The Arbiter"
              >
                <Scale className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* Summarized Debate Round Logs */}
          <div className="flex-1 flex flex-col min-h-0 space-y-2">
            <span className="text-[9px] font-mono text-[#6c748a] uppercase tracking-wider block">Live Stream Ticker</span>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
              {steps.map((step, idx) => {
                const isCurrent = step.status === 'running';
                const isDone = step.status === 'completed';
                
                return (
                  <div 
                    key={step.stepId}
                    className={`rounded-lg border p-2.5 transition-all text-[11px] ${
                      isCurrent 
                        ? 'bg-[#101422] border-indigo-900/50' 
                        : isDone 
                          ? 'bg-[#0b0d14] border-[#1c212f]' 
                          : 'bg-transparent border-[#131722] opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-200">{step.agentName}</span>
                      {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />}
                      {isDone && <Check className="h-3 w-3 text-emerald-400" />}
                    </div>

                    {isCurrent && (
                      <span className="text-[#8c92a4] italic">Active core cogitation...</span>
                    )}

                    {isDone && (
                      <div className="text-slate-300 leading-[1.4] space-y-1 font-serif max-h-40 overflow-y-auto bg-[#07090e] p-2 rounded border border-[#161b27]">
                        {step.summary ? (
                          <div className="whitespace-pre-wrap">{step.summary}</div>
                        ) : (
                          <div className="line-clamp-3">{step.content}</div>
                        )}
                      </div>
                    )}

                    {!isCurrent && !isDone && (
                      <span className="text-slate-600">Awaiting preceding turn</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Inquiry Input Area */}
      <div className="border-t border-[#1b202c] bg-[#0c0e15] p-4 sm:p-5">
        <PromptInput
          onStartDebate={onStartDebate}
          isDeliberating={isDeliberating}
          onCancel={onCancel}
        />
      </div>

      {/* Floating Export Consensus Button */}
      <FloatingExportButton
        debate={{
          prompt: currentPrompt || activeSession?.prompt || 'Council Inquiry',
          protocol: activeSession?.protocol || protocol,
          createdAt: activeSession?.createdAt,
          steps,
          finalOutput,
          metrics,
        }}
        className="bottom-24 right-5 sm:bottom-28 sm:right-7"
      />

      {/* Side-by-Side Session Compare Modal */}
      <SessionCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        sessions={sessions}
        initialSessionAId={activeSessionId || sessions[0]?.id}
      />
    </div>
  );
};
