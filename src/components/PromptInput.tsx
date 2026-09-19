import React, { useState, useRef, useEffect } from 'react';
import { StopCircle, ArrowUp, CornerDownLeft } from 'lucide-react';
import { PRESET_QUESTIONS } from '../data/presets';
import { PresetQuestion } from '../types';

interface PromptInputProps {
  onStartDebate: (promptText: string) => void;
  isDeliberating: boolean;
  onCancel?: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onStartDebate,
  isDeliberating,
  onCancel,
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isDeliberating) return;
    onStartDebate(prompt.trim());
  };

  const handleSelectPreset = (preset: PresetQuestion) => {
    setPrompt(preset.prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Auto resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  return (
    <div className="w-full space-y-3">
      {/* Preset Inquiries */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10.5px] font-mono text-slate-400 uppercase tracking-[0.08em] mr-1">
          Sample Inquiries:
        </span>
        {PRESET_QUESTIONS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="rounded-md border border-[#202534] bg-[#11141e] px-2.5 py-1 text-xs text-slate-300 transition-all hover:border-[#323b4e] hover:bg-[#161a26] hover:text-white"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* Main Input Box */}
      <div className="relative rounded-xl border border-[#222837] bg-[#10131d] p-3 transition-all focus-within:border-[#3a445c] focus-within:bg-[#121520]">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="State your technical hypothesis, architectural question, or audit request for the Council..."
          rows={2}
          disabled={isDeliberating}
          className="w-full resize-none bg-transparent px-2 py-1.5 font-serif text-[15px] text-slate-100 placeholder:font-serif placeholder:text-[14px] placeholder:text-slate-500 focus:outline-none disabled:opacity-50 leading-[1.44]"
        />

        <div className="flex items-center justify-between border-t border-[#1b202c] px-2 pt-2.5 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Press <kbd className="rounded border border-[#242b3c] bg-[#141824] px-1.5 py-0.5 text-[10px] text-slate-300">Enter</kbd> to submit</span>
            <span className="text-slate-600">•</span>
            <span><kbd className="rounded border border-[#242b3c] bg-[#141824] px-1.5 py-0.5 text-[10px] text-slate-300">Shift+Enter</kbd> new line</span>
          </div>

          <div className="flex items-center gap-2">
            {isDeliberating ? (
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/30 px-3 py-1.5 text-xs font-medium text-rose-300 transition-all hover:bg-rose-900/50 hover:text-rose-200"
              >
                <StopCircle className="h-3.5 w-3.5" />
                <span>Halt Deliberation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!prompt.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-[#2e374c] bg-[#1a2130] px-3.5 py-1.5 text-xs font-medium text-slate-100 transition-all hover:bg-[#222b40] hover:border-[#3d4b68] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Convene Council</span>
                <CornerDownLeft className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
