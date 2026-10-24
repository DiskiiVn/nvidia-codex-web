import React, { useState } from 'react';
import { X, Key, Cpu, Sliders, CheckCircle2, AlertCircle, Loader2, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { SYSTEM_PROMPTS } from '../utils/templates';
import { testConnection } from '../services/nvidiaApi';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  models = []
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection(formData.apiKey);
      setTestResult(res);
    } catch (e) {
      setTestResult({ success: false, message: e.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="flex flex-col w-[94vw] max-w-2xl max-h-[90vh] bg-[#0E1626] border border-codex-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141F36] border-b border-codex-border">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-nvidia-green" />
            <h2 className="text-base font-semibold text-white">Cài đặt Hệ thống NVIDIA Codex AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. NVIDIA API Key Section */}
          <div className="bg-[#121B2F] p-4 rounded-xl border border-codex-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-semibold text-white">
                <Key className="w-4 h-4 text-nvidia-green" />
                <span>NVIDIA API Key</span>
              </label>
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-xs text-nvidia-green hover:underline"
              >
                <span>Nhận 1.000 credits miễn phí</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => {
                  setFormData({ ...formData, apiKey: e.target.value });
                  setTestResult(null);
                }}
                placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="flex-1 px-3.5 py-2.5 bg-[#090D17] border border-codex-border rounded-lg text-sm text-gray-200 placeholder-gray-500 font-mono focus:outline-none focus:border-nvidia-green/60"
              />
              <button
                onClick={handleTestKey}
                disabled={testing}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#1F2B3E] hover:bg-[#283852] text-gray-200 border border-codex-border transition disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin text-nvidia-green" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Kiểm tra</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`flex items-start space-x-2 p-3 rounded-lg text-xs border ${
                  testResult.success
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40'
                    : 'bg-rose-950/30 text-rose-300 border-rose-800/40'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <div className="font-semibold">{testResult.message}</div>
                  {testResult.model && (
                    <div className="text-[11px] opacity-80 mt-0.5">Model thử nghiệm: {testResult.model}</div>
                  )}
                </div>
              </div>
            )}
            <p className="text-[11px] text-gray-400">
              * Khóa API được lưu an toàn trong trình duyệt (LocalStorage) của bạn hoặc qua biến môi trường NVIDIA_API_KEY trên Vercel.
            </p>
          </div>

          {/* 2. Model Selection */}
          <div className="bg-[#121B2F] p-4 rounded-xl border border-codex-border space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Cpu className="w-4 h-4 text-nvidia-green" />
              <span>Mô hình AI mặc định (NVIDIA NIM)</span>
            </label>

            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#090D17] border border-codex-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-nvidia-green/60"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider}) - {m.badge}
                </option>
              ))}
              <option value="custom">-- Nhập tên mô hình tùy chỉnh --</option>
            </select>

            {formData.model === 'custom' && (
              <input
                type="text"
                placeholder="VD: deepseek-ai/deepseek-r1"
                value={formData.customModel || ''}
                onChange={(e) => setFormData({ ...formData, customModel: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#090D17] border border-codex-border rounded-lg text-sm text-gray-200"
              />
            )}
          </div>

          {/* 3. System Prompt Persona */}
          <div className="bg-[#121B2F] p-4 rounded-xl border border-codex-border space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-white">
              <Sparkles className="w-4 h-4 text-nvidia-green" />
              <span>Chuyên môn / Vai trò của AI (System Prompt)</span>
            </label>

            <select
              value={formData.systemPromptId}
              onChange={(e) => setFormData({ ...formData, systemPromptId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#090D17] border border-codex-border rounded-lg text-sm text-gray-200 focus:outline-none focus:border-nvidia-green/60"
            >
              {SYSTEM_PROMPTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              <option value="custom">Tùy biến chỉ thị riêng (Custom Prompt)</option>
            </select>

            {formData.systemPromptId === 'custom' && (
              <textarea
                value={formData.customSystemPrompt}
                onChange={(e) => setFormData({ ...formData, customSystemPrompt: e.target.value })}
                rows={4}
                placeholder="Nhập hướng dẫn vai trò dành cho AI..."
                className="w-full p-3 bg-[#090D17] border border-codex-border rounded-lg text-xs text-gray-200 focus:outline-none focus:border-nvidia-green/60 resize-none font-mono"
              />
            )}
          </div>

          {/* 4. Generation Hyperparameters */}
          <div className="bg-[#121B2F] p-4 rounded-xl border border-codex-border space-y-4">
            <h3 className="text-sm font-semibold text-white">Thông số suy luận (Parameters)</h3>

            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Nhiệt độ sáng tạo (Temperature): <strong className="text-nvidia-green">{formData.temperature}</strong></span>
                <span className="text-[11px] text-gray-400">Thấp = code chuẩn xác, cao = sáng tạo</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                className="w-full accent-[#76B900] bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Max Tokens */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-300">
                <span>Độ dài tối đa (Max Tokens): <strong className="text-nvidia-green">{formData.maxTokens}</strong></span>
                <span className="text-[11px] text-gray-400">Giới hạn số token đầu ra</span>
              </div>
              <input
                type="range"
                min="1024"
                max="8192"
                step="512"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                className="w-full accent-[#76B900] bg-gray-700 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-[#141F36] border-t border-codex-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-xs font-semibold bg-nvidia-green hover:bg-nvidia-darkgreen text-gray-950 transition shadow-lg shadow-nvidia-green/20"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
