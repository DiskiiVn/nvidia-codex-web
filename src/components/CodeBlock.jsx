import React, { useState, useEffect, useMemo } from 'react';
import hljs from 'highlight.js';
import { Copy, Check, Download, Play, Eye, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import { LANGUAGE_EXTENSIONS } from '../utils/templates';

export default function CodeBlock({
  language = 'text',
  code = '',
  onOpenPreview,
  onOpenPythonRunner,
  onOpenDiff
}) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Normalize language name
  const cleanLang = useMemo(() => {
    const raw = (language || '').toLowerCase().trim();
    if (['js', 'jsx', 'javascript'].includes(raw)) return 'javascript';
    if (['ts', 'tsx', 'typescript'].includes(raw)) return 'typescript';
    if (['py', 'python'].includes(raw)) return 'python';
    if (['htm', 'html'].includes(raw)) return 'html';
    if (['sh', 'bash', 'zsh'].includes(raw)) return 'bash';
    if (['yml', 'yaml'].includes(raw)) return 'yaml';
    return raw || 'plaintext';
  }, [language]);

  // Syntax highlighting
  const highlightedCode = useMemo(() => {
    try {
      if (cleanLang && hljs.getLanguage(cleanLang)) {
        return hljs.highlight(code, { language: cleanLang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch (e) {
      return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [code, cleanLang]);

  // Line count
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Download code file
  const handleDownload = () => {
    const ext = LANGUAGE_EXTENSIONS[cleanLang] || '.txt';
    const filename = `snippet_${Date.now().toString().slice(-4)}${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check capabilities
  const isWebPreviewable = ['html', 'javascript'].includes(cleanLang) || code.includes('<html') || code.includes('<!DOCTYPE') || (cleanLang === 'javascript' && (code.includes('document.') || code.includes('React')));
  const isPythonRunnable = ['python', 'py'].includes(cleanLang);

  return (
    <div className="my-4 rounded-xl border border-codex-border bg-[#0D131F] shadow-xl overflow-hidden font-mono text-xs">
      {/* Code Block Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141C2B] border-b border-codex-border text-gray-300">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-[#1C273C] text-nvidia-green border border-nvidia-green/20">
            {cleanLang}
          </span>
          <span className="text-[11px] text-gray-500">{lineCount} dòng</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Web Preview Button */}
          {isWebPreviewable && onOpenPreview && (
            <button
              onClick={() => onOpenPreview(code)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-sans font-medium bg-[#76B900]/15 text-[#76B900] hover:bg-[#76B900]/25 transition border border-[#76B900]/30 shadow-sm"
              title="Xem trực tiếp giao diện Web (Live Preview)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem Web</span>
            </button>
          )}

          {/* Python Run Button */}
          {isPythonRunnable && onOpenPythonRunner && (
            <button
              onClick={() => onOpenPythonRunner(code)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-sans font-medium bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition border border-blue-500/30 shadow-sm"
              title="Chạy code Python trực tiếp bằng WebAssembly"
            >
              <Play className="w-3.5 h-3.5 fill-blue-400" />
              <span>Chạy Python</span>
            </button>
          )}

          {/* Diff View Button */}
          {onOpenDiff && (
            <button
              onClick={() => onOpenDiff(code)}
              className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-sans text-gray-400 hover:text-gray-200 hover:bg-[#1E293B] transition"
              title="So sánh với code gốc (Diff View)"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Diff</span>
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-sans text-gray-400 hover:text-gray-200 hover:bg-[#1E293B] transition"
            title="Tải về máy tính"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lưu tệp</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-sans font-medium bg-[#1F2B3E] hover:bg-[#2A3A54] text-gray-200 transition border border-[#2B3A50]"
            title="Sao chép toàn bộ code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-nvidia-green" />
                <span className="text-nvidia-green">Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {/* Collapse/Expand for long code */}
          {lineCount > 25 && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-[#1E293B] transition"
              title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Code Body */}
      <div className={`overflow-x-auto p-4 transition-all ${isCollapsed ? 'max-h-36 overflow-hidden relative' : 'max-h-[650px]'}`}>
        <pre className="text-gray-200 leading-relaxed font-mono">
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
        {isCollapsed && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0D131F] to-transparent flex items-end justify-center pb-2">
            <button
              onClick={() => setIsCollapsed(false)}
              className="px-3 py-1 rounded-full text-xs bg-[#1F2B3E] text-nvidia-green border border-nvidia-green/30 hover:bg-[#283852] shadow-md"
            >
              Xem thêm ({lineCount} dòng)...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
