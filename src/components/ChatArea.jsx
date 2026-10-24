import React, { useRef, useEffect } from 'react';
import { Terminal, Bot, User, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import CodeBlock from './CodeBlock';
import { STARTER_PROMPTS } from '../utils/templates';

// Helper to parse content into text chunks and code blocks
function parseMarkdownContent(content) {
  if (!content) return [];
  const regex = /```([a-zA-Z0-9_\-\+\.]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Code block
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      content: match[2].trimEnd()
    });

    lastIndex = regex.lastIndex;
  }

  // Trailing text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return parts;
}

// Render formatted text (bold, inline code, lists)
function FormattedText({ text }) {
  // Simple paragraph & line break renderer with inline code style
  const lines = text.split('\n');

  return (
    <div className="prose-codex text-sm space-y-2">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Process markdown inline patterns: `code`, **bold**, *italic*
        const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

        return (
          <p key={idx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return (
                  <code key={pIdx} className="text-nvidia-green bg-codex-surface px-1.5 py-0.5 rounded text-xs font-mono border border-nvidia-green/20">
                    {part.slice(1, -1)}
                  </code>
                );
              }
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="text-white font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatArea({
  messages = [],
  isStreaming = false,
  onSelectStarterPrompt,
  onOpenPreview,
  onOpenPythonRunner,
  onOpenDiff,
  modelName
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // If no messages yet, show Welcome Starter Screen
  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-6">
          {/* Logo Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-nvidia-green/10 border border-nvidia-green/30 text-nvidia-green text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-nvidia-green animate-pulse"></span>
            <span>NVIDIA NIM AI Acceleration</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            NVIDIA <span className="text-nvidia-green">Codex</span> Studio
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Môi trường lập trình AI chuyên sâu được hỗ trợ bởi các mô hình Code hàng đầu thế giới trên nền tảng NVIDIA NIM. Hỗ trợ chạy thử Web trực tiếp và thực thi Python trong trình duyệt.
          </p>

          {/* Starter Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-4">
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSelectStarterPrompt(prompt.prompt)}
                className="group p-4 bg-[#111827] hover:bg-[#162238] border border-codex-border hover:border-nvidia-green/40 rounded-xl transition text-left flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold tracking-wider text-nvidia-green uppercase block mb-1">
                    {prompt.category}
                  </span>
                  <div className="text-xs font-semibold text-gray-200 group-hover:text-white line-clamp-1">
                    {prompt.title}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {prompt.prompt}
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-[11px] text-gray-500 group-hover:text-nvidia-green pt-3 font-medium">
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const parsedParts = !isUser ? parseMarkdownContent(msg.content) : [];

          return (
            <div
              key={index}
              className={`flex items-start space-x-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant Avatar */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#142338] border border-nvidia-green/30 flex items-center justify-center flex-shrink-0 text-nvidia-green shadow-md">
                  <Terminal className="w-4 h-4" />
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 sm:p-5 shadow-lg ${
                  isUser
                    ? 'bg-[#1C2A44] border border-[#2D3E5E] text-gray-100 rounded-tr-none'
                    : 'bg-[#101726] border border-codex-border text-gray-200 rounded-tl-none w-full'
                }`}
              >
                {/* Header label */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-codex-border/40 text-[11px] text-gray-400">
                  <span className="font-semibold text-gray-300">
                    {isUser ? 'Bạn' : `NVIDIA Codex AI (${modelName || 'NIM Engine'})`}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>

                {/* Body */}
                {isUser ? (
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                ) : (
                  <div>
                    {parsedParts.map((part, partIdx) => {
                      if (part.type === 'code') {
                        return (
                          <CodeBlock
                            key={partIdx}
                            language={part.language}
                            code={part.content}
                            onOpenPreview={onOpenPreview}
                            onOpenPythonRunner={onOpenPythonRunner}
                            onOpenDiff={onOpenDiff}
                          />
                        );
                      }
                      return <FormattedText key={partIdx} text={part.content} />;
                    })}

                    {/* Blinking cursor while streaming */}
                    {isStreaming && index === messages.length - 1 && (
                      <span className="inline-block w-2 h-4 bg-nvidia-green animate-pulse ml-1 align-middle rounded-sm" />
                    )}
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-gray-700/60 border border-gray-600 flex items-center justify-center flex-shrink-0 text-gray-300 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
