import React from 'react';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Workspace Navigation',
      items: [
        { keyCombo: ['Cmd', 'K'], label: 'Focus Inquiry Prompt' },
        { keyCombo: ['Cmd', 'Enter'], label: 'Initiate Deliberation Council' },
        { keyCombo: ['1'], label: 'Switch to Dialogue View' },
        { keyCombo: ['2'], label: 'Switch to Chamber View' },
        { keyCombo: ['3'], label: 'Switch to Split View' },
      ],
    },
    {
      category: 'Deliberation & Controls',
      items: [
        { keyCombo: ['Space'], label: 'Play / Pause Session Replay' },
        { keyCombo: ['Shift', '?'], label: 'Open Keyboard Shortcuts Help' },
        { keyCombo: ['Esc'], label: 'Close Active Modal / Overlay' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-[#282f42] bg-[#0d1018] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-[#1a202c] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Keyboard className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 font-serif">
              <span>Keyboard Shortcuts</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            </h2>
            <p className="text-[11px] text-slate-400">
              Master rapid strategic navigation and session controls
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {shortcuts.map((sec) => (
            <div key={sec.category} className="space-y-2">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 border-b border-[#1c2233] pb-1">
                {sec.category}
              </h4>
              <div className="space-y-1.5">
                {sec.items.map((sc) => (
                  <div
                    key={sc.label}
                    className="flex items-center justify-between rounded-lg bg-[#121622] px-3 py-2 text-xs text-slate-300 border border-[#1d2334]"
                  >
                    <span>{sc.label}</span>
                    <div className="flex items-center gap-1 font-mono text-[10.5px]">
                      {sc.keyCombo.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-[#313b52] bg-[#1a2030] px-2 py-0.5 text-slate-200 shadow-xs font-semibold"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[#1a202c] pt-4 flex justify-between items-center text-[10.5px] font-mono text-slate-500">
          <span>Press <kbd className="px-1 py-0.5 bg-[#171c28] rounded border border-slate-700">Esc</kbd> to exit</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#181d2a] hover:bg-[#202738] px-3 py-1.5 text-slate-200 border border-[#293246] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
