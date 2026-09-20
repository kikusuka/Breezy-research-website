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
  ShieldCheck,
  Sun,
  Moon,
  HelpCircle,
  Keyboard,
  Compass,
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
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  interjectionEnabled?: boolean;
  onToggleInterjection?: () => void;
  onOpenShortcuts?: () => void;
  onOpenTour?: () => void;
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
  theme = 'dark',
  onToggleTheme,
  interjectionEnabled = true,
  onToggleInterjection,
  onOpenShortcuts,
  onOpenTour,
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

  useEffect(() => {
    if (isDeliberating) {
      audioHeartbeat.start(heartbeat?.bpm || 74);
    } else {
      audioHeartbeat.stop();
    }
  }, [isDeliberating, heartbeat?.bpm]);

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
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-lg text-slate-900 dark:text-white">
                Synthexis
              </span>
              <span className="text-xs font-medium tracking-wide uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                Lab
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 lg:block">
              Strategic Simulation Platform
            </p>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 p-1">
            <button
              type="button"
              onClick={() => onSelectViewMode('chat')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
                viewMode === 'chat'
                   ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Chat View"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectViewMode('council')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
                viewMode === 'council'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Council View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Council</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectViewMode('split')}
              className={`hidden md:flex items-center gap-1.5 rounded-md px-2.5 sm:px-3 py-1 text-xs font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Split View"
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewDebate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            title="New Debate"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            title="Session History"
          >
            <History className="h-3.5 w-3.5" />
            <span className="hidden md:inline">History</span>
            <span className="rounded bg-slate-200 dark:bg-slate-600 px-1.5 py-0.2 text-xs font-mono text-slate-600 dark:text-slate-300">
              {sessionCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>

          {onOpenTour && (
            <button
              type="button"
              onClick={onOpenTour}
              className="hidden lg:flex items-center gap-1 rounded-lg border border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
              title="Guided Tour"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Tour</span>
            </button>
          )}

          {onOpenShortcuts && (
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
              title="Keyboard Shortcuts"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"
              >
                <img
                  src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                  alt={user.name}
                  className="h-6 w-6 rounded-full"
                />
                <span className="hidden sm:inline text-xs text-slate-700 dark:text-slate-200 font-medium max-w-[80px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-lg z-50">
                <div className="flex items-center gap-3 p-3 border-b border-slate-200 dark:border-slate-700 mb-2">
                  <img
                    src={user.picture || ''}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      {user.name}
                      {user.verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => { onOpenCouncil(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Sliders className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => { onOpenVault(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>API Keys</span>
                  </button>

                  <button
                    onClick={() => { onOpenExplainer(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>How it Works</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                  <button
                    onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
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
