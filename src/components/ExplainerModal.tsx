import React from 'react';
import { X, CheckCircle2, AlertTriangle, Zap, Shield, Scale, ArrowRight, Sliders } from 'lucide-react';

interface ExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#262b3c] bg-[#12141d] p-6 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#8c92a4] transition-colors hover:bg-[#1f2333] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/30 to-orange-500/30 text-amber-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">The Synthexis Vision & Strategic Lab</h2>
            <p className="text-xs text-[#9aa1b5]">
              Dynamic Strategic Simulation, Threat-Modeling, and Crisis Sandbox
            </p>
          </div>
        </div>

        {/* Concept Description Box */}
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
          <h3 className="mb-1 text-sm font-semibold text-amber-300">How Synthexis Differs from Simple Fact-Checkers</h3>
          <p className="text-xs leading-relaxed text-[#c4cbdf]">
            While basic multi-agent tools (like traditional fact-checkers) are designed to verify static historical trivia or trivia premises, <strong>Synthexis</strong> is a professional-grade <strong>Interactive Strategic Simulation Sandbox</strong>. It is built to model open-ended technical designs, business trade-offs, policy audits, and risk vectors under complex real-world conditions.
          </p>
        </div>

        {/* Is the idea good? Analysis */}
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase text-[11px]">
            Advanced Architecture: The Strategic Edge
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">Interactive What-If Perturbations</span>
              </div>
              <p className="text-[11px] leading-normal text-[#a6b0c7]">
                Unlike static systems, Synthexis lets you inject live, randomized, or custom "Black Swan" crises mid-debate (e.g. data compliance audits, pricing increases, security zero-days) to stress-test how your plans adapt under real-world distress.
              </p>
            </div>

            <div className="rounded-xl border border-[#2b354e] bg-[#141824] p-3.5">
              <div className="mb-1.5 flex items-center gap-2 text-slate-300">
                <Sliders className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">Dynamic Persona Deck</span>
              </div>
              <p className="text-[11px] leading-normal text-[#a6b0c7]">
                Configure exactly who sits in the Chamber. Mix and match experts like the <strong>CFO (Cost Optimizers)</strong>, <strong>UX Minimalists</strong>, <strong>Cyber Hacker Securers</strong>, or <strong>Compliance Officers</strong> to examine your ideas from diverse expert dimensions.
              </p>
            </div>
          </div>
        </div>

        {/* How the 3 Seats Work */}
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase text-[11px]">
            How the Simulation Chamber Deliberates
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-3 rounded-lg border border-[#222736] bg-[#161822] p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20 font-mono text-[11px] font-bold text-blue-400">
                1
              </div>
              <div>
                <span className="font-semibold text-white">Active Strategic Proposals</span>
                <p className="mt-0.5 text-[#8e95ab]">
                  Your chosen Lead baseline advisor models the initial strategy, mapping out architectural or financial blueprints from first principles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[#222736] bg-[#161822] p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/20 font-mono text-[11px] font-bold text-red-400">
                2
              </div>
              <div>
                <span className="font-semibold text-white">Adversarial Threat-Modeling</span>
                <p className="mt-0.5 text-[#8e95ab]">
                  The Red-Teamer (e.g. Skeptic/Hacker) ruthlessly tears into the baseline plan, identifying hidden assumptions, ROI failure modes, and security vulnerabilities.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-[#222736] bg-[#161822] p-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/20 font-mono text-[11px] font-bold text-amber-400">
                3
              </div>
              <div>
                <span className="font-semibold text-white">The Synthesized Playbook</span>
                <p className="mt-0.5 text-[#8e95ab]">
                  The Synthesizer (e.g. Pragmatic CTO or Venture Board) adjudicates the debate, integrates mandatory safeguards against real threats, and outputs the ultimate battle-tested final playbook.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-amber-500"
          >
            <span>Enter Simulation Chamber</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
