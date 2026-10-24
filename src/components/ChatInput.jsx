import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, X, FileCode, CornerDownLeft, Sparkles } from 'lucide-react';
import QuickActions from './QuickActions';

export default function ChatInput({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  models = [],
  currentModel,
  onChangeModel,
  disabled = false
}) {
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!input.trim() && attachedFiles.length === 0) || isStreaming) return;

    let fullMessage = input.trim();

    // Attach file contents if any
    if (attachedFiles.length > 0) {
      const fileContexts = attachedFiles
        .map((f) => `### Tệp đính kèm: \`${f.name}\`\n\`\`\`${f.extension || 'text'}\n${f.content}\n\`\`\``)
        .join('\n\n');

      fullMessage = `${fullMessage ? `${fullMessage}\n\n` : ''}${fileContexts}`;
    }

    onSendMessage(fullMessage);
    setInput('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    e.target.value = '';
  };

  const processFiles = (files) => {
    files.forEach((file) => {
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        alert(`Tệp ${file.name} quá lớn (tối đa 5MB)`);
        return;
      }
      const reader = new FileReader();
      const ext = file.name.split('.').pop() || '';
      reader.onload = (event) => {
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            extension: ext,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            content: event.target.result
          }
        ]);
      };
      reader.readAsText(file);
    });
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuickAction = (prefix) => {
    setInput((prev) => `${prefix}${prev}`);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Quick Action Shortcuts */}
      <QuickActions onSelectAction={handleQuickAction} />

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative bg-[#101827] border border-codex-border rounded-2xl shadow-2xl focus-within:border-nvidia-green/60 focus-within:shadow-nvidia-green/10 transition-all p-3"
      >
        {/* Attached Files List */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-1.5 bg-[#0A0F1A] rounded-xl border border-codex-border">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141F36] border border-codex-border text-xs text-gray-200"
              >
                <FileCode className="w-3.5 h-3.5 text-nvidia-green" />
                <span className="font-mono">{file.name}</span>
                <span className="text-[10px] text-gray-500">({file.size})</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-0.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về mã nguồn, dán lỗi cần sửa, hoặc kéo thả tệp code vào đây... (Shift + Enter để xuống dòng)"
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-sm focus:outline-none resize-none max-h-56 leading-relaxed pr-10"
        />

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-codex-border/60">
          <div className="flex items-center space-x-2">
            {/* Upload File Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-gray-400 hover:text-nvidia-green hover:bg-[#1A253A] transition"
              title="Đính kèm tệp mã nguồn (.py, .js, .ts, .html, .css, .json, .sql...)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Quick Model Selector Dropdown */}
            <div className="flex items-center bg-[#090D17] border border-codex-border rounded-lg px-2 py-1">
              <Sparkles className="w-3 h-3 text-nvidia-green mr-1.5" />
              <select
                value={currentModel}
                onChange={(e) => onChangeModel(e.target.value)}
                className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[220px] truncate"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#111827] text-gray-200">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Button: Send or Stop */}
          <div className="flex items-center space-x-2">
            {isStreaming ? (
              <button
                onClick={onStopGeneration}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/40 text-xs font-semibold transition"
                title="Dừng phản hồi"
              >
                <Square className="w-3.5 h-3.5 fill-red-400" />
                <span>Dừng lại</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() && attachedFiles.length === 0}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-nvidia-green hover:bg-nvidia-darkgreen text-gray-950 font-semibold text-xs transition shadow-md shadow-nvidia-green/20 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Gửi (Enter)"
              >
                <span>Gửi</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
