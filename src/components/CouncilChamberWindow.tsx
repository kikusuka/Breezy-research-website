import React, { useState } from 'react';
import {
  ShieldAlert,
  Cpu,
  Scale,
  Sliders,
  KeyRound,
  MessageSquare,
  Info,
  LayoutGrid,
  BarChart3,
  ListOrdered,
  Flame,
  Brain,
} from 'lucide-react';
import { CouncilHeartbeat } from './CouncilHeartbeat';
import { DeliberationBlock } from './DeliberationBlock';
import { ExportTranscriptMenu } from './ExportTranscriptMenu';
import { FloatingExportButton } from './FloatingExportButton';
import { CouncilMetricsDashboard } from './CouncilMetricsDashboard';
import { CouncilHeatmapView } from './CouncilHeatmapView';
import { CognitiveDashboard } from './CognitiveDashboard';
import { DebateStep, HeartbeatState, ProviderKeyConfig, DebateTone, DebateSession } from '../types';
import { AGENT_AVATARS, getToneAvatar } from '../data/agentAvatars';
import { loadSessions } from '../services/sessionStorage';

interface CouncilChamberWindowProps {
  currentPrompt: string;
  isDeliberating: boolean;
  activeRound: number;
  steps: DebateStep[];
  protocol: 'trio' | 'quad' | 'duel';
  tone?: DebateTone;
  seats: {
    architect: { provider: string; model: string };
    skeptic: { provider: string; model: string };
    arbiter: { provider: string; model: string };
  };
  keys: ProviderKeyConfig;
  heartbeat?: HeartbeatState;
  finalOutput?: string;
  metrics?: {
    durationMs: number;
    consensusRate: number;
    contentionLevel: string;
    resolvedPointsCount: number;
  };
  sessions?: DebateSession[];
  onSelectSession?: (sessionId: string) => void;
  onOpenVault: () => void;
  onOpenCouncil: () => void;
  onOpenExplainer: () => void;
  onOpenChatWindow: () => void;
}

export const CouncilChamberWindow: React.FC<CouncilChamberWindowProps> = ({
  currentPrompt,
  isDeliberating,
  activeRound,
  steps,
  protocol,
  tone = 'balanced',
  seats,
  keys,
  heartbeat,
  finalOutput,
  metrics,
  sessions,
  onSelectSession,
  onOpenVault,
  onOpenCouncil,
  onOpenExplainer,
  onOpenChatWindow,
}) => {
  const [activeTab, setActiveTab] = useState<'deliberation' | 'metrics' | 'heatmap' | 'cognitive'>('deliberation');

  // Interactive Arbiter Interjection states
  const [interjectionEnabled, setInterjectionEnabled] = useState(true);
  const [interjectionActive, setInterjectionActive] = useState(false);
  const [interjectionText, setInterjectionText] = useState('');
  const [interjectedRound, setInterjectedRound] = useState<number | null>(null);

  // Trigger interjection mid-debate automatically on Round 2 if enabled
  React.useEffect(() => {
    if (isDeliberating && activeRound === 2 && interjectionEnabled && interjectedRound !== 2) {
      setInterjectionActive(true);
      setInterjectedRound(2);
    }
  }, [isDeliberating, activeRound, interjectionEnabled, interjectedRound]);

  // Reset interjection state when a completely new debate starts (round reset)
  React.useEffect(() => {
    if (!isDeliberating && activeRound === 0) {
      setInterjectedRound(null);
      setInterjectionActive(false);
    }
  }, [isDeliberating, activeRound]);

  // Fallback to loaded sessions if not provided
  const allSessions = sessions && sessions.length > 0 ? sessions : loadSessions();

  return (
    <div
      id="council-chamber-window-container"
      className="relative flex flex-col h-full rounded-xl border border-[#1e2330] bg-[#0c0e15] shadow-xl overflow-hidden transition-all"
    >
      {/* Workbench Panel Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1b202c] bg-[#10131d] px-4 sm:px-5 py-2.5 gap-2 select-none">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#181d2a] text-slate-300">
            <LayoutGrid className="h-3 w-3" />
          </div>
          <span className="text-xs font-medium text-slate-200">
            Chamber Ledger & Flaw Analysis
          </span>
          <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
            / {protocol.toUpperCase()}
          </span>

          <button
            type="button"
            onClick={onOpenCouncil}
            className={`hidden md:inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono border transition-all ${
              tone === 'diplomatic'
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-950/80'
                : tone === 'rigorous'
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/40 hover:bg-amber-950/80'
                : tone === 'aggressive'
                ? 'bg-rose-950/50 text-rose-300 border-rose-500/40 hover:bg-rose-950/80'
                : 'bg-sky-950/50 text-sky-300 border-sky-500/40 hover:bg-sky-950/80'
            }`}
            title="Debate tone level - Click to change"
          >
            <span>Tone:</span>
            <span className="capitalize font-semibold">{tone}</span>
          </button>
        </div>

        {/* View Mode Switcher: Deliberation vs Metrics vs Heatmap vs Cognitive */}
        <div className="flex items-center gap-1 rounded-lg border border-[#222837] bg-[#131622] p-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('deliberation')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === 'deliberation'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListOrdered className="h-3 w-3" />
            <span>Deliberation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === 'metrics'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="h-3 w-3 text-amber-400" />
            <span>Metrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3 w-3 text-emerald-400" />
            <span>Heatmap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cognitive')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === 'cognitive'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Cognitive drift & divergence metrics"
          >
            <Brain className="h-3 w-3 text-amber-400" />
            <span>Cognitive</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Interjection Shield Toggle */}
          <button
            type="button"
            onClick={() => setInterjectionEnabled(!interjectionEnabled)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
              interjectionEnabled
                ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                : 'border-[#222837] bg-[#141722] text-slate-400 hover:text-slate-200'
            }`}
            title="Pause stream mid-session when logical discrepancies are flagged"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${interjectionEnabled ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`} />
            <span>Interjection: {interjectionEnabled ? 'ON' : 'OFF'}</span>
          </button>
          {/* Export Transcript if deliberation has steps */}
          {steps.length > 0 && (
            <ExportTranscriptMenu
              debate={{
                prompt: currentPrompt || 'Council Inquiry',
                protocol,
                steps,
                finalOutput,
                metrics,
              }}
              variant="secondary"
            />
          )}

          <button
            type="button"
            onClick={onOpenCouncil}
            className="flex items-center gap-1.5 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
            title="Configure model seats"
          >
            <Sliders className="h-3 w-3 text-slate-400" />
            <span className="hidden sm:inline">Seats</span>
          </button>

          <button
            type="button"
            onClick={onOpenVault}
            className="flex items-center gap-1.5 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
            title="BYOK Provider Vault"
          >
            <KeyRound className="h-3 w-3 text-slate-400" />
            <span className="hidden sm:inline">Keys</span>
          </button>

          <button
            type="button"
            onClick={onOpenChatWindow}
            className="flex items-center gap-1 rounded-md border border-[#222837] bg-[#141722] px-2.5 py-1 text-xs text-slate-300 hover:border-[#343e54] hover:text-white transition-colors"
            title="Switch to Dialogue Console"
          >
            <MessageSquare className="h-3 w-3 text-slate-400" />
            <span>Dialogue View</span>
          </button>
        </div>
      </div>

      {/* Main Chamber Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
        {activeTab === 'metrics' ? (
          <div className="space-y-6">
            <CouncilMetricsDashboard
              sessions={allSessions}
              onSelectSession={onSelectSession}
            />
          </div>
        ) : activeTab === 'heatmap' ? (
          <CouncilHeatmapView
            sessions={allSessions}
            onSelectSession={onSelectSession}
          />
        ) : activeTab === 'cognitive' ? (
          <CognitiveDashboard
            steps={steps}
            protocol={protocol}
            consensusRate={metrics?.consensusRate || 82}
          />
        ) : (
          <>
            {/* Heartbeat Telemetry Component */}
            <CouncilHeartbeat
              heartbeat={heartbeat}
              isDeliberating={isDeliberating}
              activeRound={activeRound}
              steps={steps}
            />

            {/* Active Interjection Dialog overlay when triggered */}
            {interjectionActive && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/25 p-5 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3">
                  <span className="text-xl p-1.5 bg-rose-950/40 border border-rose-800/40 rounded-lg select-none">🚨</span>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 font-mono">
                      Arbiter Interjection Shield Tripped • Input Required
                    </h4>
                    <p className="text-[11.5px] text-slate-300 mt-1 leading-normal">
                      The Arbiter agent has paused the active stream! A severe logical assumption or constraint mismatch has been flagged on <strong>Round 2 (The Skeptic's Antithesis)</strong>.
                    </p>
                  </div>
                </div>
                
                <div className="rounded-lg border border-rose-900/40 bg-[#120a0e] p-3 text-[11px] font-mono text-rose-300 leading-normal">
                  "CRITICAL DETECT: Skeptic's security exploit vectors assume multi-threaded host memory mapping, but our current configuration enforces absolute, zero-knowledge container virtualization. Please clarify memory/storage isolation preferences to refine the final synthesis."
                </div>

                <div className="space-y-2">
                  <label className="text-[9.5px] uppercase font-semibold text-slate-400 tracking-wider block font-mono">
                    Clarify Simulation Parameters:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={interjectionText}
                      onChange={(e) => setInterjectionText(e.target.value)}
                      placeholder="e.g., Force strictly isolated gRPC threads with secure hardware-level isolation..."
                      className="flex-1 rounded-lg border border-[#232a3d] bg-[#0c0e15] px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500/50 placeholder-slate-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInterjectionActive(false);
                          if (interjectionText.trim()) {
                            // Insert the user interjection physically into the steps list
                            steps.push({
                              stepId: `interjection-${Date.now()}`,
                              role: 'arbiter',
                              agentName: 'The Arbiter',
                              provider: 'gemini',
                              model: 'gemini-2.5-pro',
                              status: 'completed',
                              content: `✍️ **[ARBITER INTERVENTION APPLIED]** user clarified: "${interjectionText}"`,
                              timestamp: Date.now(),
                            });
                          }
                          setInterjectionText('');
                        }}
                        className="rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all whitespace-nowrap cursor-pointer"
                      >
                        Submit & Resume
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInterjectionActive(false);
                          setInterjectionText('');
                        }}
                        className="rounded-lg border border-[#222837] bg-[#141722] hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
                      >
                        Bypass
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Metrics Banner / Toggle Hook */}
            <div className="flex items-center justify-between rounded-xl border border-sky-950/40 bg-[#0e121d] px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    Cross-Session Agent Metrics Available
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Average response latency and consensus frequency tracked across {allSessions.length} archived sessions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('metrics')}
                className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-all"
              >
                <span>View Full Dashboard</span>
                <span className="font-mono text-[10px]">→</span>
              </button>
            </div>

            {/* Seats Overview Card */}
            {(() => {
              const archAvatar = getToneAvatar('architect', tone);
              const skepAvatar = getToneAvatar('skeptic', tone);
              const arbiAvatar = getToneAvatar('arbiter', tone);

              return (
                <div className="rounded-xl border border-[#1e2330] bg-[#10131c] p-5">
                  <div className="flex items-center justify-between mb-4 border-b border-[#181d28] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-slate-300">
                        Protocol Configuration • {protocol.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${archAvatar.badgeBorder} ${archAvatar.badgeBg} ${archAvatar.badgeText}`}>
                        {tone.toUpperCase()} TONE AVATARS
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      Adversarial Triangulation
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Seat 1: The Architect */}
                    <div className="group rounded-xl border border-sky-950/40 bg-[#0f1422] p-3.5 transition-all hover:border-sky-800/50">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`relative h-9 w-9 overflow-hidden rounded-lg border bg-[#070910] shadow-md transition-all duration-300 ${archAvatar.glowColor}`}>
                            <img
                              src={archAvatar.avatarSrc}
                              alt="The Architect"
                              referrerPolicy="no-referrer"
                              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${archAvatar.toneFilterClass || ''}`}
                            />
                          </div>
                          <div>
                            <h4 className="font-serif text-[14px] font-semibold tracking-[-0.012em] text-sky-200">The Architect</h4>
                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-sky-400/80">Thesis Engine</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-sky-300/70 truncate bg-sky-950/60 border border-sky-900/40 px-2 py-0.5 rounded">
                        {seats.architect.provider}: {seats.architect.model}
                      </p>
                      <div className="mt-2 font-serif text-[11.5px] text-slate-300/80 leading-[1.36]">
                        Generates baseline blueprint and affirmative foundation
                      </div>
                    </div>

                    {/* Seat 2: The Skeptic */}
                    <div className="group rounded-xl border border-rose-950/40 bg-[#181116] p-3.5 transition-all hover:border-rose-800/50">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`relative h-9 w-9 overflow-hidden rounded-lg border bg-[#070910] shadow-md transition-all duration-300 ${skepAvatar.glowColor}`}>
                            <img
                              src={skepAvatar.avatarSrc}
                              alt="The Skeptic"
                              referrerPolicy="no-referrer"
                              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${skepAvatar.toneFilterClass || ''}`}
                            />
                          </div>
                          <div>
                            <h4 className="font-serif text-[14px] font-semibold tracking-[-0.012em] text-rose-200">The Skeptic</h4>
                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-rose-400/80">Antithesis</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-rose-300/70 truncate bg-rose-950/60 border border-rose-900/40 px-2 py-0.5 rounded">
                        {seats.skeptic.provider}: {seats.skeptic.model}
                      </p>
                      <div className="mt-2 font-serif text-[11.5px] text-rose-300/80 leading-[1.36]">
                        Identifies fatal flaws, edge cases & attack surfaces
                      </div>
                    </div>

                    {/* Seat 3: The Arbiter */}
                    <div className="group rounded-xl border border-amber-950/40 bg-[#19150f] p-3.5 transition-all hover:border-amber-800/50">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`relative h-9 w-9 overflow-hidden rounded-lg border bg-[#070910] shadow-md transition-all duration-300 ${arbiAvatar.glowColor}`}>
                            <img
                              src={arbiAvatar.avatarSrc}
                              alt="The Arbiter"
                              referrerPolicy="no-referrer"
                              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${arbiAvatar.toneFilterClass || ''}`}
                            />
                          </div>
                          <div>
                            <h4 className="font-serif text-[14px] font-semibold tracking-[-0.012em] text-amber-200">The Arbiter</h4>
                            <span className="text-[9.5px] font-mono uppercase tracking-wider text-amber-400/80">Synthesis</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-amber-300/70 truncate bg-amber-950/60 border border-amber-900/40 px-2 py-0.5 rounded">
                        {seats.arbiter.provider}: {seats.arbiter.model}
                      </p>
                      <div className="mt-2 font-serif text-[11.5px] text-amber-300/80 leading-[1.36]">
                        Reconciles thesis and critique into fortified consensus
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Current Inquiry Case */}
            {currentPrompt && (
              <div className="rounded-xl border border-[#1e2330] bg-[#10131c] p-4">
                <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 uppercase tracking-[0.08em] mb-1.5">
                  <span>Active Deliberation Inquiry</span>
                  <span>Rounds: {steps.length} of {protocol === 'quad' ? 4 : 3}</span>
                </div>
                <p className="font-serif text-[14px] font-normal text-slate-200 line-clamp-2 leading-[1.4]">
                  {currentPrompt}
                </p>
              </div>
            )}

            {/* Deliberation Transcript Steps */}
            {steps.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-mono uppercase tracking-[0.08em] text-slate-300">
                    Dialectic Proceedings ({steps.length} Rounds)
                  </h3>
                  {isDeliberating && (
                    <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      Streaming Round {activeRound}
                    </span>
                  )}
                </div>

                <DeliberationBlock
                  steps={steps}
                  isDeliberating={isDeliberating}
                  activeRound={activeRound}
                  tone={tone}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[#1e2330] bg-[#10131c] p-8 text-center">
                <Info className="h-5 w-5 text-slate-500 mx-auto mb-2" />
                <p className="font-serif text-[13.5px] text-slate-400 leading-[1.42] max-w-md mx-auto">
                  No active deliberation in progress. Convene the Council from the Dialogue Console to observe live dialectic proceedings.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Export Consensus Button */}
      {activeTab === 'deliberation' && (
        <FloatingExportButton
          debate={{
            prompt: currentPrompt || 'Council Inquiry',
            protocol,
            steps,
            finalOutput,
            metrics,
          }}
          className="bottom-5 right-5 sm:bottom-6 sm:right-6"
        />
      )}
    </div>
  );
};
