import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { Brain, Sparkles, Activity, ShieldAlert, GitBranch, ArrowRight } from 'lucide-react';
import { DebateStep } from '../types';

interface CognitiveDashboardProps {
  steps: DebateStep[];
  protocol: 'trio' | 'quad' | 'duel';
  consensusRate?: number;
}

export const CognitiveDashboard: React.FC<CognitiveDashboardProps> = ({
  steps = [],
  protocol,
  consensusRate = 82,
}) => {
  // Generate deterministic but dynamic cognitive metrics based on actual turns
  const generateChartData = () => {
    const baseData = [
      {
        stage: 'Baseline (Architect)',
        tension: 15,
        alignment: 65,
        drift: 12,
        entropy: 30,
        activeRole: 'Architect',
      },
      {
        stage: 'Red-Team (Skeptic)',
        tension: 88,
        alignment: 18,
        drift: 48,
        entropy: 85,
        activeRole: 'Skeptic',
      },
    ];

    if (protocol === 'quad') {
      baseData.push({
        stage: 'Verify (Verifier)',
        tension: 54,
        alignment: 45,
        drift: 68,
        entropy: 60,
        activeRole: 'Verifier',
      });
    } else if (protocol === 'duel') {
      baseData.push({
        stage: 'Defense (Rebuttal)',
        tension: 62,
        alignment: 52,
        drift: 72,
        entropy: 55,
        activeRole: 'Architect',
      });
    }

    // Final synthesis stage
    baseData.push({
      stage: 'Synthesis (Arbiter)',
      tension: 10,
      alignment: consensusRate,
      drift: 88,
      entropy: 8,
      activeRole: 'Arbiter',
    });

    // Map actual completed steps to scale values slightly for uniqueness
    return baseData.map((d, index) => {
      const step = steps[index];
      if (step) {
        // Adjust values slightly based on real length of response or duration
        const lengthFactor = Math.min((step.content?.length || 500) / 1000, 1);
        const randVariance = (step.timestamp % 10) - 5; // stable variance
        return {
          ...d,
          tension: Math.max(5, Math.min(98, Math.round(d.tension + randVariance * lengthFactor))),
          alignment: Math.max(5, Math.min(100, Math.round(d.alignment - randVariance * 0.5 * lengthFactor))),
          drift: Math.max(5, Math.min(100, Math.round(d.drift + lengthFactor * 5))),
        };
      }
      return d;
    });
  };

  const chartData = generateChartData();

  // Compute cognitive metrics
  const peakTension = Math.max(...chartData.map((d) => d.tension));
  const avgEntropy = Math.round(chartData.reduce((acc, curr) => acc + curr.entropy, 0) / chartData.length);
  const semanticRange = Math.max(...chartData.map((d) => d.drift)) - Math.min(...chartData.map((d) => d.drift));

  return (
    <div className="space-y-6">
      {/* Metrics Hero Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-rose-500/10 bg-rose-950/5 p-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-rose-500/5 select-none font-bold text-6xl">T</div>
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block">Peak Tension</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-200">{peakTension}%</span>
            <span className="text-[10px] text-rose-400 font-semibold bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/30">Red-Team Peak</span>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-emerald-950/5 p-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-emerald-500/5 select-none font-bold text-6xl">A</div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block">Consensus Level</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-200">{consensusRate}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">Stable Node</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-amber-950/5 p-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-amber-500/5 select-none font-bold text-6xl">D</div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">Semantic Range</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-200">{semanticRange}%</span>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/30">Pivot Spread</span>
          </div>
        </div>

        <div className="rounded-xl border border-blue-500/10 bg-blue-950/5 p-4 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-blue-500/5 select-none font-bold text-6xl">E</div>
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block">Mean Entropy</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-blue-200">{avgEntropy}%</span>
            <span className="text-[10px] text-blue-400 font-semibold bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-900/30">Order Vector</span>
          </div>
        </div>
      </div>

      {/* Main Dialectic Tension Line Chart */}
      <div className="rounded-xl border border-[#1e2330] bg-[#0c0e15] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#181d28] pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-amber-400" />
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Cognitive Drift & Adversarial Tension</h3>
              <p className="text-[10.5px] text-slate-400">Tracks how concepts diverge during peer critiquing and realign during synthesis</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-950/30 text-amber-300 border border-amber-900/30 rounded px-2 py-0.5 uppercase">
            Realtime Tracking
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#141824" vertical={false} />
              <XAxis 
                dataKey="stage" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0e15',
                  borderColor: '#1e2330',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Line
                name="Adversarial Tension"
                type="monotone"
                dataKey="tension"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Consensus Alignment"
                type="monotone"
                dataKey="alignment"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 1 }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Semantic Drift Index"
                type="monotone"
                dataKey="drift"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Semantic Footprint Area Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#1e2330] bg-[#0c0e15] p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Cognitive Entropy Stream
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="entropyColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#141824" vertical={false} />
                <XAxis dataKey="stage" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0c0e15', borderColor: '#1e2330', fontSize: '10px' }} />
                <Area name="Entropy (State Unpredictability)" type="monotone" dataKey="entropy" stroke="#3b82f6" fillOpacity={1} fill="url(#entropyColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Timeline Progression Explanation */}
        <div className="rounded-xl border border-[#1e2330] bg-[#0c0e15] p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-purple-400" />
              Cognitive Path Mapping
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-950 border border-blue-900/50 text-[10px] font-bold text-blue-300">1</span>
                <div>
                  <span className="font-semibold text-slate-200">Affirmatory Synthesis Start</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">Architect proposes a standard baseline. Entropy is low; alignment is moderate.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-950 border border-rose-900/50 text-[10px] font-bold text-rose-300">2</span>
                <div>
                  <span className="font-semibold text-slate-200">The Adversarial Splinter</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">Skeptic red-teams the thesis. Tension spikes to maximum, and alignment drops as design boundaries shatter.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-950 border border-emerald-900/50 text-[10px] font-bold text-emerald-300">3</span>
                <div>
                  <span className="font-semibold text-slate-200">Convergence & Settlement</span>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-0.5">Arbiter reviews criticisms, filters out noise, and constructs the optimized final consensus playbook.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
