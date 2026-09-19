import React, { useEffect, useState, useRef } from 'react';
import {
  Sliders,
  KeyRound,
  BookOpen,
  MessageSquare,
  Columns,
  LayoutGrid,
  History,
  Plus,
  Scale,
  Volume2,
  VolumeX,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Settings,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ProviderKeyConfig, WindowViewMode, HeartbeatState } from '../types';
import { HeartbeatIndicator } from './HeartbeatIndicator';
import { audioHeartbeat } from '../utils/audioHeartbeat';

interface HeaderProps {
  onOpenVault: () => void;
  onOpenCouncil: () => void;
  onOpenExplainer: () => void;
  onOpenHistory: () => void;
  onNewDebate: () => void;
  sessionCount: number;
  keys: ProviderKeyConfig;
  protocol: string;
  viewMode: WindowViewMode;
  onSelectViewMode: (mode: WindowViewMode) => void;
  heartbeat?: HeartbeatState;
  isDeliberating?: boolean;
  user: { name: string; email: string; picture: string; verified: boolean; joinedAt: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVault,
  onOpenCouncil,
  onOpenExplainer,
  onOpenHistory,
  onNewDebate,
  sessionCount,
  keys,
  protocol,
  viewMode,
  onSelectViewMode,
  heartbeat,
  isDeliberating,
  user,
  onOpenLogin,
  onLogout,
}) => {
  const activeKeyCount = Object.values(keys).filter((k) => Boolean(k && k.trim())).length;

  const [audioState, setAudioState] = useState(() => audioHeartbeat.getState());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = audioHeartbeat.subscribe((state) => {
      setAudioState(state);
    });
    return unsubscribe;
  }, []);

  // Sync ambient audio pulse with active deliberation state
  useEffect(() => {
    if (isDeliberating) {
      audioHeartbeat.start(heartbeat?.bpm || 74);
    } else {
      audioHeartbeat.stop();
    }
  }, [isDeliberating, heartbeat?.bpm]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleAudio = () => {
    const newEnabled = audioHeartbeat.toggle();
    if (isDeliberating) {
      if (newEnabled) {
        audioHeartbeat.start(heartbeat?.bpm || 74);
      } else {
        audioHeartbeat.stop();
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#1c212d] bg-[#0c0e15]/95 backdrop-blur-md select-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-600 bg-amber-950/20 text-amber-400 shadow-sm">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif italic text-[19px] font-normal tracking-[-0.02em] text-white">
                Synthexis
              </span>
              <span className="text-[9.5px] font-mono tracking-[0.14em] uppercase text-amber-400/90 font-semibold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/30">
                Strategic Lab
              </span>
            </div>
            <p className="hidden font-serif text-[11px] text-slate-400 lg:block font-normal leading-[1.3] tracking-[-0.005em]">
              Interactive Strategic Simulation & Threat-Modeling Chamber
            </p>
          </div>
        </div>

        {/* Center: Segmented View Switcher & Telemetry Pulse */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg border border-[#1e2433] bg-[#10131d] p-1">
            <button
              type="button"
              onClick={() => onSelectViewMode('chat')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
                viewMode === 'chat'
                   ? 'bg-[#1e2536] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151926]'
              }`}
              title="Dialogue Console"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dialogue</span>
              <span className="sm:hidden">Chat</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectViewMode('council')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
                viewMode === 'council'
                  ? 'bg-[#1e2536] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151926]'
              }`}
              title="Council Deliberation Ledger"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chamber</span>
              <span className="sm:hidden">Council</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectViewMode('split')}
              className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-[#1e2536] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#151926]'
              }`}
              title="Split View Side-by-Side"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Split</span>
            </button>
          </div>

          <HeartbeatIndicator
            heartbeat={heartbeat}
            isDeliberating={isDeliberating}
            onClick={() => onSelectViewMode('council')}
          />
        </div>

        {/* Action Controls - Decluttered with Settings Profile Dropdown */}
        <div className="flex items-center gap-2">
          {/* New Debate Button (Always accessible) */}
          <button
            type="button"
            onClick={onNewDebate}
            id="header-new-debate-btn"
            className="flex items-center gap-1.5 rounded-lg border border-[#262e40] bg-[#141824] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-all hover:border-[#3a4660] hover:bg-[#1b2130] hover:text-white"
            title="Start a new deliberation inquiry"
          >
            <Plus className="h-3.5 w-3.5 text-slate-300" />
            <span className="hidden sm:inline">New Inquiry</span>
          </button>

          {/* Transcripts History Button (Always accessible) */}
          <button
            type="button"
            onClick={onOpenHistory}
            id="header-sessions-history-btn"
            className="flex items-center gap-1.5 rounded-lg border border-[#1f2536] bg-[#111420] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-[#323d56] hover:bg-[#171c2b] hover:text-white"
            title="Browse saved debate transcripts"
          >
            <History className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Transcripts</span>
            <span className="rounded bg-[#1d2334] px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {sessionCount}
            </span>
          </button>

          {/* Profile & Chamber Settings Section */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-[#232a3c] bg-[#121622] p-1.5 hover:border-[#35405a] hover:bg-[#171c2a] transition-all"
                title="Account Settings & Chamber Setup"
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-5 w-5 rounded-full border border-slate-700 bg-slate-900"
                />
                <span className="hidden sm:inline text-xs text-slate-300 font-medium max-w-[70px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-all shadow-sm shadow-blue-500/10"
              >
                <LogIn className="h-3.5 w-3.5 text-blue-400" />
                <span>Google Login</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-2.5 w-72 rounded-xl border border-[#232a3d] bg-[#0a0d14] p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Account Header */}
                <div className="flex items-center gap-3 p-2.5 border-b border-[#1b212f] mb-2 bg-[#0d1018]/50 rounded-lg">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-slate-700 p-0.5 bg-slate-900"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1">
                      <span>{user.name}</span>
                      <span title="Verified Google Account">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      </span>
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 truncate leading-relaxed">
                      {user.email}
                    </p>
                    <p className="text-[9px] text-slate-500 font-serif">
                      Registered: {user.joinedAt}
                    </p>
                  </div>
                </div>

                {/* Section: Chamber Settings */}
                <div className="space-y-0.5">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    Chamber Configuration
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenCouncil();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#141a28] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sliders className="h-3.5 w-3.5 text-slate-500" />
                      <span>Protocol Settings</span>
                    </div>
                    <span className="rounded bg-[#171c26] px-1.5 py-0.2 text-[9px] font-mono text-slate-400 capitalize">
                      {protocol}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenVault();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#141a28] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                      <span>Provider Keys Vault</span>
                    </div>
                    {activeKeyCount > 0 ? (
                      <span className="rounded bg-emerald-950/40 border border-emerald-800/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-400">
                        {activeKeyCount} Keys
                      </span>
                    ) : (
                      <span className="rounded bg-[#171c26] px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                        Sandbox
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenExplainer();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#141a28] hover:text-white transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                    <span>Dialectic Methodology</span>
                  </button>
                </div>

                {/* Section: Custom preferences */}
                <div className="border-t border-[#1b212f]/60 mt-2 pt-2 space-y-0.5">
                  <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider text-slate-500">
                    Preferences
                  </div>

                  {/* Ambient Audio Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className="w-full flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#141a28] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {audioState.isEnabled ? (
                        <Volume2 className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5 text-slate-500" />
                      )}
                      <span>Ambient Chamber Pulse</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${audioState.isEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                      {audioState.isEnabled ? 'ON' : 'MUTED'}
                    </span>
                  </button>
                </div>

                {/* Section: Logout */}
                <div className="border-t border-[#1b212f]/60 mt-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
