import React, { useState, useMemo } from 'react';
import * as Diff from 'diff';
import { X, Copy, Check, GitCompare, ArrowRightLeft } from 'lucide-react';

export default function DiffModal({ isOpen, onClose, initialNewCode = '' }) {
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState(initialNewCode);
  const [copied, setCopied] = useState(false);

  const diffResult = useMemo(() => {
    return Diff.diffLines(oldCode, newCode);
  }, [oldCode, newCode]);

  const handleCopyNew = async () => {
    await navigator.clipboard.writeText(newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="flex flex-col w-[94vw] max-w-5xl h-[88vh] bg-[#0E1626] border border-codex-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141F36] border-b border-codex-border">
          <div className="flex items-center space-x-2">
            <GitCompare className="w-4 h-4 text-nvidia-green" />
            <span className="text-sm font-semibold text-white">So sánh khác biệt mã nguồn (Code Diff Viewer)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyNew}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1F2B3E] hover:bg-[#2A3A54] text-gray-200 border border-[#2B3A50] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-nvidia-green" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép code mới' : 'Chép mã mới'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-codex-border border-b border-codex-border h-44">
          <div className="flex flex-col p-3 bg-[#0A0F1A]">
            <span className="text-xs font-semibold text-red-400 mb-1">Mã nguồn ban đầu (Code cũ)</span>
            <textarea
              value={oldCode}
              onChange={(e) => setOldCode(e.target.value)}
              placeholder="Dán mã nguồn gốc cần đối chiếu vào đây..."
              className="flex-1 w-full bg-[#111827] border border-codex-border rounded-lg p-2 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-red-500/50"
            />
          </div>
          <div className="flex flex-col p-3 bg-[#0A0F1A]">
            <span className="text-xs font-semibold text-nvidia-green mb-1">Mã nguồn mới (AI Refactor / Fix)</span>
            <textarea
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="Mã nguồn mới..."
              className="flex-1 w-full bg-[#111827] border border-codex-border rounded-lg p-2 text-xs font-mono text-gray-300 resize-none focus:outline-none focus:border-nvidia-green/50"
            />
          </div>
        </div>

        {/* Diff Result Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#080C14] font-mono text-xs">
          <div className="text-gray-400 mb-2 font-sans text-xs">Kết quả đối chiếu dòng:</div>
          <div className="rounded-lg border border-codex-border overflow-hidden bg-[#0A0F1A]">
            {diffResult.map((part, index) => {
              const bgColor = part.added
                ? 'bg-emerald-950/40 text-emerald-300 border-l-4 border-emerald-500'
                : part.removed
                ? 'bg-rose-950/40 text-rose-300 border-l-4 border-rose-500'
                : 'text-gray-300 border-l-4 border-transparent';

              const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';

              return (
                <div key={index} className={`px-3 py-1 whitespace-pre-wrap font-mono ${bgColor}`}>
                  {part.value.split('\n').filter((l, i, arr) => !(i === arr.length - 1 && l === '')).map((line, lineIdx) => (
                    <div key={lineIdx} className="leading-5">
                      <span className="select-none opacity-60 mr-2">{prefix}</span>
                      {line}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
