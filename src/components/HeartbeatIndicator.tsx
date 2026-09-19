import React from 'react';
import { Heart, Activity, Radio, Cpu, ShieldAlert, Scale, CheckCircle2 } from 'lucide-react';
import { HeartbeatState, AgentRole } from '../types';

export interface HeartbeatIndicatorProps {
  heartbeat?: HeartbeatState;
  isDeliberating?: boolean;
  onClick?: () => void;
  className?: string;
}

export const HeartbeatIndicator: React.FC<HeartbeatIndicatorProps> = ({
  heartbeat,
  isDeliberating = false,
  onClick,
  className = '',
}) => {
  const bpm = isDeliberating ? (heartbeat?.bpm || 75) : 60;
  // Calculate period in seconds: T = 60 / bpm
  const durationSec = Number((60 / bpm).toFixed(2));

  // Determine role-specific styling
  const getRoleTheme = (role?: AgentRole) => {
    if (!isDeliberating) {
      return {
        textColor: 'text-slate-400',
        borderColor: 'border-[#1e2433]',
        bgColor: 'bg-[#10131d]',
        glowColor: 'transparent',
        iconColor: 'text-slate-500 fill-slate-500/20',
        ringColor: 'border-slate-600/20',
        badgeBg: 'bg-[#141824] text-slate-400 border-[#202636]',
      };
    }

    switch (role) {
      case 'architect':
        return {
          textColor: 'text-slate-200',
          borderColor: 'border-[#334155]',
          bgColor: 'bg-[#131722]',
          glowColor: 'transparent',
          iconColor: 'text-slate-300 fill-slate-400/20',
          ringColor: 'border-slate-400/30',
          badgeBg: 'bg-[#182030] text-slate-200 border-[#2d3a4e]',
        };
      case 'skeptic':
        return {
          textColor: 'text-rose-300',
          borderColor: 'border-rose-900/40',
          bgColor: 'bg-[#181116]',
          glowColor: 'transparent',
          iconColor: 'text-rose-400 fill-rose-400/20',
          ringColor: 'border-rose-500/30',
          badgeBg: 'bg-rose-950/40 text-rose-300 border-rose-900/40',
        };
      case 'arbiter':
        return {
          textColor: 'text-amber-300',
          borderColor: 'border-amber-900/40',
          bgColor: 'bg-[#18140f]',
          glowColor: 'transparent',
          iconColor: 'text-amber-400 fill-amber-400/20',
          ringColor: 'border-amber-500/30',
          badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-900/40',
        };
      case 'verifier':
        return {
          textColor: 'text-emerald-300',
          borderColor: 'border-emerald-900/40',
          bgColor: 'bg-[#0f1714]',
          glowColor: 'transparent',
          iconColor: 'text-emerald-400 fill-emerald-400/20',
          ringColor: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40',
        };
      default:
        return {
          textColor: 'text-slate-200',
          borderColor: 'border-[#2e374d]',
          bgColor: 'bg-[#121622]',
          glowColor: 'transparent',
          iconColor: 'text-slate-300 fill-slate-300/20',
          ringColor: 'border-slate-500/30',
          badgeBg: 'bg-[#181e2e] text-slate-200 border-[#273248]',
        };
    }
  };

  const theme = getRoleTheme(heartbeat?.role);

  const getAgentShortLabel = () => {
    if (!isDeliberating) return 'Resting Cadence';
    if (heartbeat?.agentName) return heartbeat.agentName;
    return 'Council Pulse';
  };

  return (
    <button
      type="button"
      id="header-heartbeat-indicator"
      onClick={onClick}
      title={
        isDeliberating
          ? `Council Heartbeat: ${bpm} BPM • ${heartbeat?.agentName || 'Agent'} active: ${heartbeat?.taskReminder || 'Deliberating'}`
          : 'Council Heartbeat: 60 BPM (Resting). Click to open Council Chamber.'
      }
      className={`group relative flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${theme.borderColor} ${theme.bgColor} ${className}`}
      style={{
        boxShadow: isDeliberating ? `0 0 14px ${theme.glowColor}` : 'none',
      }}
    >
      {/* Visual Pulsing Heart / Cadence Node */}
      <div className="relative flex h-5 w-5 items-center justify-center">
        {/* CSS Keyframe Ripple Ring reflecting BPM */}
        <span
          className={`absolute -inset-0.5 rounded-full border ${theme.ringColor} heartbeat-rippling pointer-events-none`}
          style={{
            animationDuration: `${durationSec}s`,
            opacity: isDeliberating ? 0.7 : 0.25,
          }}
        />

        {/* CSS Keyframe Beating Heart Core reflecting BPM */}
        <span
          className="relative flex items-center justify-center heartbeat-pulsing pointer-events-none"
          style={{
            animationDuration: `${durationSec}s`,
          }}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors duration-300 ${theme.iconColor}`}
          />
        </span>
      </div>

      {/* BPM Readout */}
      <div className="flex items-baseline gap-1 font-mono leading-none">
        <span className="text-xs font-bold tracking-tight text-white">
          {bpm}
        </span>
        <span className="text-[10px] font-medium text-slate-400">
          BPM
        </span>
      </div>

      {/* Role / Status Badge (hidden on very small viewports) */}
      <span
        className={`hidden xl:inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase max-w-[130px] truncate ${theme.badgeBg}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isDeliberating ? 'bg-current heartbeat-pulsing' : 'bg-slate-500'
          }`}
          style={{ animationDuration: `${durationSec}s` }}
        />
        <span className="truncate">{getAgentShortLabel()}</span>
      </span>

      {/* Mini Activity Line */}
      <Activity
        className={`hidden sm:block h-3 w-3 transition-opacity ${
          isDeliberating ? 'text-slate-400 opacity-80' : 'text-slate-600 opacity-40'
        }`}
      />
    </button>
  );
};
