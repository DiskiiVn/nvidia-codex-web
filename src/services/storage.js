const SESSIONS_KEY = 'nvidia_codex_sessions_v1';
const SETTINGS_KEY = 'nvidia_codex_settings_v1';

export const defaultSettings = {
  apiKey: '',
  model: 'meta/llama-3.3-70b-instruct',
  systemPromptId: 'senior-fullstack',
  customSystemPrompt: '',
  temperature: 0.3,
  maxTokens: 4096,
  topP: 0.95,
  autoScroll: true
};

export const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const loadSessions = () => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load sessions:', e);
    return [];
  }
};

export const saveSessions = (sessions) => {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
};

export const createNewSession = (title = 'Hội thoại mới') => {
  const newSession = {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
    messages: []
  };
  return newSession;
};

// Export session as Markdown file
export const exportSessionAsMarkdown = (session) => {
  if (!session || !session.messages || session.messages.length === 0) return;
  let md = `# ${session.title}\n*Thời gian: ${new Date(session.createdAt).toLocaleString('vi-VN')}*\n\n---\n\n`;

  session.messages.forEach((msg, idx) => {
    const roleName = msg.role === 'user' ? '👤 Người dùng' : '🤖 NVIDIA Codex AI';
    md += `### ${roleName} (${new Date(msg.timestamp || Date.now()).toLocaleTimeString()})\n\n`;
    md += `${msg.content}\n\n---\n\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export session as JSON file
export const exportSessionAsJSON = (session) => {
  if (!session) return;
  const jsonStr = JSON.stringify(session, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${session.title.replace(/[^a-zA-Z0-9_\-\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
