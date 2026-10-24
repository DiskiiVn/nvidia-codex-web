import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  Pin,
  PinOff,
  Settings,
  Download,
  Code2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { exportSessionAsMarkdown, exportSessionAsJSON } from '../services/storage';

export default function Sidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onOpenSettings,
  hasApiKey,
  isOpen,
  onToggleOpen
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const recentSessions = filteredSessions.filter((s) => !s.pinned);

  const startRename = (session, e) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const saveRename = (id, e) => {
    e?.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col w-72 bg-[#0B0F17] border-r border-codex-border transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-codex-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-nvidia-green/10 border border-nvidia-green/30 flex items-center justify-center text-nvidia-green shadow-md">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide flex items-center space-x-1.5">
                <span>NVIDIA CODEX</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-nvidia-green text-gray-950 font-extrabold uppercase">
                  NIM
                </span>
              </div>
              <div className="text-[10px] text-gray-400">AI Coding Assistant</div>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E293B]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#131D30] hover:bg-nvidia-green hover:text-gray-950 text-gray-200 border border-codex-border hover:border-nvidia-green text-xs font-semibold transition group shadow-sm"
          >
            <Plus className="w-4 h-4 text-nvidia-green group-hover:text-gray-950 transition" />
            <span>Tạo cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Search input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hội thoại..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#0E1524] border border-codex-border rounded-lg text-xs text-gray-300 placeholder-gray-500 focus:outline-none focus:border-nvidia-green/40"
            />
          </div>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-1">
          {/* Pinned sessions */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="flex items-center space-x-1 px-3 py-1 text-[10px] font-semibold tracking-wider text-nvidia-green uppercase">
                <Pin className="w-3 h-3" />
                <span>Đã ghim</span>
              </div>
              <div className="space-y-0.5">
                {pinnedSessions.map((session) => renderSessionItem(session))}
              </div>
            </div>
          )}

          {/* Recent sessions */}
          <div>
            <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              Lịch sử gần đây ({recentSessions.length})
            </div>
            {recentSessions.length === 0 && pinnedSessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-gray-500">
                Chưa có hội thoại nào.
              </div>
            ) : (
              <div className="space-y-0.5">
                {recentSessions.map((session) => renderSessionItem(session))}
              </div>
            )}
          </div>
        </div>

        {/* Export and Tools Bar */}
        {activeSession && activeSession.messages?.length > 0 && (
          <div className="px-3 py-2 border-t border-codex-border/60 bg-[#0E1524]/60 flex items-center justify-between text-xs text-gray-400">
            <span className="text-[11px]">Xuất hội thoại:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => exportSessionAsMarkdown(activeSession)}
                className="px-2 py-1 rounded bg-[#162033] hover:bg-[#202E4A] text-gray-300 text-[11px] font-mono border border-codex-border transition"
                title="Tải file Markdown .md"
              >
                .MD
              </button>
              <button
                onClick={() => exportSessionAsJSON(activeSession)}
                className="px-2 py-1 rounded bg-[#162033] hover:bg-[#202E4A] text-gray-300 text-[11px] font-mono border border-codex-border transition"
                title="Tải file JSON"
              >
                .JSON
              </button>
            </div>
          </div>
        )}

        {/* Footer info & Settings */}
        <div className="p-3 border-t border-codex-border bg-[#090D14]">
          {/* API Key Status Pill */}
          <div
            onClick={onOpenSettings}
            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer mb-2 transition border ${
              hasApiKey
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-950/40'
                : 'bg-amber-950/20 text-amber-400 border-amber-900/30 hover:bg-amber-950/40'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              {hasApiKey ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span className="font-medium text-[11px]">
                {hasApiKey ? 'NVIDIA API: Sẵn sàng' : 'Chưa nhập API Key'}
              </span>
            </div>
            <span className="text-[10px] underline">Cài đặt</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-[#152033] transition"
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Cấu hình & Tùy chọn</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">v1.0</span>
          </button>
        </div>
      </aside>
    </>
  );

  function renderSessionItem(session) {
    const isActive = session.id === activeSessionId;
    const isEditing = session.id === editingId;

    return (
      <div
        key={session.id}
        onClick={() => onSelectSession(session.id)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
          isActive
            ? 'bg-[#152238] text-white font-medium border border-nvidia-green/30 shadow-sm'
            : 'text-gray-400 hover:bg-[#101726] hover:text-gray-200'
        }`}
      >
        <div className="flex items-center space-x-2 truncate flex-1 mr-2">
          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-nvidia-green' : 'text-gray-500'}`} />
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              autoFocus
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveRename(session.id, e)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-[#0B0F17] border border-nvidia-green/50 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
            />
          ) : (
            <span className="truncate">{session.title}</span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <button
              onClick={(e) => saveRename(session.id, e)}
              className="p-1 rounded text-nvidia-green hover:bg-[#1E293B]"
            >
              <Check className="w-3 h-3" />
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePinSession(session.id);
                }}
                className="p-1 rounded text-gray-400 hover:text-nvidia-green hover:bg-[#1E293B]"
                title={session.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
              >
                {session.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
              </button>
              <button
                onClick={(e) => startRename(session, e)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1E293B]"
                title="Đổi tên"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Bạn có chắc muốn xóa cuộc trò chuyện này không?')) {
                    onDeleteSession(session.id);
                  }
                }}
                className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-[#1E293B]"
                title="Xóa"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}
