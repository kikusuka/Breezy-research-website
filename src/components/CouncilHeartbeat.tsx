import React, { useEffect, useState } from 'react';
import { Activity, Heart, Radio, ShieldAlert, Cpu, Scale, CheckCircle2 } from 'lucide-react';
import { HeartbeatState, AgentRole, DebateStep } from '../types';
import { getAgentAvatar } from '../data/agentAvatars';

interface CouncilHeartbeatProps {
  heartbeat?: HeartbeatState;
  isDeliberating: boolean;
  activeRound: number;
  steps?: DebateStep[];
}

export const CouncilHeartbeat: React.FC<CouncilHeartbeatProps> = ({
  heartbeat,
  isDeliberating,
  activeRound,
  steps = [],
}) => {
  const [pulseTick, setPulseTick] = useState(false);
  const [tokenSpeed, setTokenSpeed] = useState(0);
  const [prevLength, setPrevLength] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [agentElapsedMs, setAgentElapsedMs] = useState(0);

  // Active agent live elapsed timer
  useEffect(() => {
    let timer: any = null;
    if (isDeliberating) {
      const startTime = Date.now();
      timer = setInterval(() => {
        setAgentElapsedMs(Date.now() - startTime);
      }, 100);
    } else {
      setAgentElapsedMs(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isDeliberating, heartbeat?.agentName]);

  const formattedTimer = `${Math.floor(agentElapsedMs / 1000)}.${Math.floor((agentElapsedMs % 1000) / 100)}s`;

  // Find currently running step content
  const runningStep = steps.find((s) => s.status === 'running');
  const runningContent = runningStep?.content || '';

  // Track stream generation velocity to calculate token speed (chars/sec)
  useEffect(() => {
    if (!isDeliberating || !runningStep) {
      setTokenSpeed(0);
      setPrevLength(0);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeDelta = now - lastCheckTime;
      if (timeDelta <= 0) return;

      const currentLength = runningContent.length;
      const charsWritten = currentLength - prevLength;
      
      // Calculate character rate per second
      const speed = Math.round((charsWritten / timeDelta) * 1000);
      setTokenSpeed(Math.max(0, speed));
      setPrevLength(currentLength);
      setLastCheckTime(now);
    }, 500);

    return () => clearInterval(interval);
  }, [isDeliberating, runningContent, prevLength, lastCheckTime, runningStep]);

  // Dynamically map token generation speed directly to EKG pulse rate (BPM)
  // Base rate of 72 BPM + up to 90 additional BPM depending on generation speed
  const speedBonus = Math.min(Math.round(tokenSpeed * 0.4), 90);
  const currentBpm = isDeliberating 
    ? (72 + speedBonus) 
    : 58;

  // Trigger pulse animation tick based on current mapped BPM
  useEffect(() => {
    if (!isDeliberating) return;
    const intervalMs = Math.round((60 / currentBpm) * 1000);

    const timer = setInterval(() => {
      setPulseTick((prev) => !prev);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isDeliberating, currentBpm]);

  const currentTask = heartbeat?.taskReminder || (
    isDeliberating
      ? `Council is actively streaming output at ~${tokenSpeed} chars/sec. High-density synthesis active.`
      : 'Council on standby — ready to stress-test your next prompt'
  );

  const getRoleIcon = (role?: AgentRole) => {
    switch (role) {
      case 'architect':
        return <Cpu className="h-3.5 w-3.5 text-slate-300" />;
      case 'skeptic':
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />;
      case 'arbiter':
        return <Scale className="h-3.5 w-3.5 text-sky-300" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-400" />;
    }
  };

  return (
    <div
      id="council-heartbeat-monitor"
      className="relative overflow-hidden rounded-2xl border border-[#1e2332] bg-[#0c0e15] p-5 shadow-2xl transition-all"
    >
      {/* Subtle background ambient pulse */}
      <div
        className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full transition-opacity duration-700 blur-3xl ${
          isDeliberating ? 'bg-sky-500/10 opacity-100' : 'bg-slate-700/5 opacity-40'
        }`}
      />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#181d2a] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[#23293a] bg-[#121520]">
              {isDeliberating && (
                <span
                  className="absolute -inset-1 rounded-lg border border-rose-500/30 heartbeat-rippling pointer-events-none"
                  style={{ animationDuration: `${(60 / currentBpm).toFixed(2)}s` }}
                />
              )}
              <Heart
                className={`h-4 w-4 transition-colors duration-300 ${
                  isDeliberating
                    ? 'text-rose-400 fill-rose-500/30 heartbeat-pulsing'
                    : 'text-slate-500'
                }`}
                style={{
                  animationDuration: `${(60 / currentBpm).toFixed(2)}s`,
                }}
              />
              {isDeliberating && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Council Heartbeat
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                    isDeliberating
                      ? 'border border-sky-900/40 bg-sky-950/30 text-sky-300'
                      : 'border border-[#1f2434] bg-[#141722] text-[#64748b]'
                  }`}
                >
                  <Radio className={`h-2.5 w-2.5 ${isDeliberating ? 'animate-pulse text-sky-400' : ''}`} />
                  {isDeliberating ? 'Pulse Active' : 'Standby'}
                </span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                Cadence frequency keeping AI agents focused on their exact role constraints
              </p>
            </div>
          </div>

          {/* BPM & Processing Timer Readout */}
          <div className="flex items-center gap-2">
            {isDeliberating && (
              <div className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 font-mono text-xs text-amber-300">
                <span className="text-[10px] text-amber-400/70 uppercase">Agent Processing:</span>
                <span className="font-bold">{formattedTimer}</span>
              </div>
            )}

            <div className="flex items-baseline gap-1.5 rounded-xl border border-[#1f2537] bg-[#121520] px-3.5 py-1.5 font-mono">
              <span
                className={`text-lg font-bold tracking-tight transition-colors ${
                  isDeliberating ? 'text-white' : 'text-[#64748b]'
                }`}
              >
                {currentBpm}
              </span>
              <span className="text-[10px] text-[#64748b] uppercase">BPM</span>
            </div>
          </div>
        </div>

        {/* Dynamic EKG Heartbeat Waveform */}
        <div className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-xl border border-[#181c28] bg-[#090a10] px-4">
          <svg
            className="h-10 w-full"
            viewBox="0 0 500 50"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Grid Lines */}
            <line x1="0" y1="25" x2="500" y2="25" stroke="#171b28" strokeWidth="1" strokeDasharray="4 4" />

            {/* Simulated ECG wave */}
            <path
              d={
                isDeliberating
                  ? pulseTick
                    ? "M 0 25 L 80 25 L 95 24 L 105 28 L 115 10 L 125 42 L 135 18 L 145 27 L 160 25 L 240 25 L 255 23 L 265 29 L 275 8 L 285 44 L 295 16 L 305 26 L 320 25 L 400 25 L 415 24 L 425 28 L 435 9 L 445 42 L 455 17 L 465 26 L 500 25"
                    : "M 0 25 L 80 25 L 95 25 L 105 27 L 115 12 L 125 40 L 135 20 L 145 26 L 160 25 L 240 25 L 255 24 L 265 28 L 275 11 L 285 41 L 295 19 L 305 26 L 320 25 L 400 25 L 415 25 L 425 27 L 435 12 L 445 39 L 455 20 L 465 25 L 500 25"
                  : "M 0 25 L 200 25 L 210 24 L 220 20 L 225 32 L 230 25 L 500 25"
              }
              stroke={isDeliberating ? "#f59e0b" : "#334155"}
              strokeWidth={isDeliberating ? "1.75" : "1.25"}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          </svg>

          {/* Visual Scan line */}
          {isDeliberating && (
            <div className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-[pulse_2s_infinite]" />
          )}
        </div>

        {/* Active AI Task Reminder Signal */}
        <div className="flex items-start gap-2.5 rounded-xl border border-[#1d2232] bg-[#11141e] p-3">
          {heartbeat?.role ? (
            <div className="relative mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-lg border border-slate-700/60 bg-[#121520]">
              <img
                src={getAgentAvatar(heartbeat.role).avatarSrc}
                alt={heartbeat.agentName || heartbeat.role}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#191e2c]">
              {getRoleIcon(heartbeat?.role)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="font-semibold text-[#cbd5e1]">
                Active AI Task Reminder {heartbeat?.agentName ? `• ${heartbeat.agentName}` : ''}
              </span>
              <span className="text-[10px] text-[#64748b]">
                {isDeliberating ? 'Heartbeat ping: Active' : 'Idle'}
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              {currentTask}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
