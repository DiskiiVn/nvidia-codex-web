import React, { useState, useEffect, useRef } from 'react';
import { Menu, Plus, Settings, Sparkles, Terminal } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import SettingsModal from './components/SettingsModal';
import LivePreviewModal from './components/LivePreviewModal';
import PythonRunnerModal from './components/PythonRunnerModal';
import DiffModal from './components/DiffModal';
import {
  loadSettings,
  saveSettings,
  loadSessions,
  saveSessions,
  createNewSession
} from './services/storage';
import { fetchModels, streamChat } from './services/nvidiaApi';
import { SYSTEM_PROMPTS } from './utils/templates';

export default function App() {
  const [sessions, setSessions] = useState(() => {
    const saved = loadSessions();
    if (saved.length > 0) return saved;
    const initial = createNewSession();
    return [initial];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = loadSessions();
    return saved.length > 0 ? saved[0].id : null;
  });

  const [settings, setSettings] = useState(loadSettings);
  const [models, setModels] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, code: '' });
  const [pythonModal, setPythonModal] = useState({ isOpen: false, code: '' });
  const [diffModal, setDiffModal] = useState({ isOpen: false, code: '' });

  const abortControllerRef = useRef(null);

  // Sync sessions to localStorage
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Load models on mount
  useEffect(() => {
    async function init() {
      const fetched = await fetchModels();
      if (fetched.length > 0) {
        setModels(fetched);
      }
    }
    init();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Shift + O: New chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleNewSession();
      }
      // Ctrl + , : Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
      // Esc: Close modals
      if (e.key === 'Escape') {
        setPreviewModal((prev) => ({ ...prev, isOpen: false }));
        setPythonModal((prev) => ({ ...prev, isOpen: false }));
        setDiffModal((prev) => ({ ...prev, isOpen: false }));
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create new session
  const handleNewSession = () => {
    const newChat = createNewSession();
    setSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newChat.id);
    setIsSidebarOpen(false);
  };

  // Delete session
  const handleDeleteSession = (id) => {
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const fresh = createNewSession();
      setSessions([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // Rename session
  const handleRenameSession = (id, newTitle) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: new Date().toISOString() } : s))
    );
  };

  // Toggle pin
  const handleTogglePinSession = (id) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Update Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Send message
  const handleSendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    let targetSessionId = activeSessionId;
    if (!targetSessionId || !sessions.find((s) => s.id === targetSessionId)) {
      const newChat = createNewSession();
      setSessions((prev) => [newChat, ...prev]);
      targetSessionId = newChat.id;
      setActiveSessionId(targetSessionId);
    }

    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const assistantPlaceholder = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    // Update session state
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          const isInitial = s.messages.length === 0;
          const autoTitle = isInitial
            ? text.slice(0, 32).trim() + (text.length > 32 ? '...' : '')
            : s.title;

          return {
            ...s,
            title: autoTitle,
            updatedAt: new Date().toISOString(),
            messages: [...s.messages, userMessage, assistantPlaceholder]
          };
        }
        return s;
      })
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    // Prepare system prompt
    let systemPromptContent = '';
    const selectedPreset = SYSTEM_PROMPTS.find((p) => p.id === settings.systemPromptId);
    if (settings.systemPromptId === 'custom' && settings.customSystemPrompt) {
      systemPromptContent = settings.customSystemPrompt;
    } else if (selectedPreset) {
      systemPromptContent = selectedPreset.prompt;
    } else {
      systemPromptContent = SYSTEM_PROMPTS[0].prompt;
    }

    // Build message list for API
    const history = (activeSession?.messages || []).slice(-8).map((m) => ({
      role: m.role,
      content: m.content
    }));

    const apiMessages = [
      { role: 'system', content: systemPromptContent },
      ...history,
      { role: 'user', content: text }
    ];

    const currentModelId = settings.model === 'custom' ? settings.customModel : settings.model;

    try {
      await streamChat({
        messages: apiMessages,
        model: currentModelId,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        topP: settings.topP,
        apiKey: settings.apiKey,
        signal: abortControllerRef.current?.signal,
        onChunk: (chunk) => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                const msgs = [...s.messages];
                const lastIdx = msgs.length - 1;
                if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
                  msgs[lastIdx] = {
                    ...msgs[lastIdx],
                    content: msgs[lastIdx].content + chunk
                  };
                }
                return { ...s, messages: msgs };
              }
              return s;
            })
          );
        },
        onError: (err) => {
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                const msgs = [...s.messages];
                const lastIdx = msgs.length - 1;
                if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
                  msgs[lastIdx] = {
                    ...msgs[lastIdx],
                    content:
                      msgs[lastIdx].content +
                      `\n\n> ⚠️ **Lỗi:** ${err.message}\n> *Vui lòng kiểm tra lại NVIDIA API Key trong Cài đặt hoặc thử lại.*`
                  };
                }
                return { ...s, messages: msgs };
              }
              return s;
            })
          );
          setIsStreaming(false);
        },
        onFinish: () => {
          setIsStreaming(false);
        }
      });
    } catch (err) {
      setIsStreaming(false);
    }
  };

  const currentModelName =
    models.find((m) => m.id === (settings.model === 'custom' ? settings.customModel : settings.model))
      ?.name || settings.model;

  return (
    <div className="flex h-screen w-screen bg-[#0B0F17] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setIsSidebarOpen(false);
        }}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(settings.apiKey?.trim())}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-14 border-b border-codex-border flex items-center justify-between px-4 bg-[#0D131F]/90 backdrop-blur-md z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A253A]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-200">
                {activeSession?.title || 'Cuộc trò chuyện mới'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#162338] text-nvidia-green border border-nvidia-green/30">
                {currentModelName}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewSession}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141E30] hover:bg-[#1C2B44] text-gray-300 border border-codex-border transition"
            >
              <Plus className="w-3.5 h-3.5 text-nvidia-green" />
              <span>Đoạn chat mới</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A253A] transition"
              title="Cài đặt"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat message display area */}
        <ChatArea
          messages={activeSession?.messages || []}
          isStreaming={isStreaming}
          onSelectStarterPrompt={handleSendMessage}
          onOpenPreview={(code) => setPreviewModal({ isOpen: true, code })}
          onOpenPythonRunner={(code) => setPythonModal({ isOpen: true, code })}
          onOpenDiff={(code) => setDiffModal({ isOpen: true, code })}
          modelName={currentModelName}
        />

        {/* Input area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
          models={models}
          currentModel={settings.model}
          onChangeModel={(newModel) => {
            const updated = { ...settings, model: newModel };
            setSettings(updated);
            saveSettings(updated);
          }}
        />
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        models={models}
      />

      <LivePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, code: '' })}
        code={previewModal.code}
      />

      <PythonRunnerModal
        isOpen={pythonModal.isOpen}
        onClose={() => setPythonModal({ isOpen: false, code: '' })}
        code={pythonModal.code}
      />

      <DiffModal
        isOpen={diffModal.isOpen}
        onClose={() => setDiffModal({ isOpen: false, code: '' })}
        initialNewCode={diffModal.code}
      />
    </div>
  );
}
