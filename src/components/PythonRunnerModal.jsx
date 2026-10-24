import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RefreshCw, Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PythonRunnerModal({ isOpen, onClose, code: initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading_pyodide | running | success | error
  const [executionTime, setExecutionTime] = useState(null);
  const pyodideRef = useRef(null);

  useEffect(() => {
    setCode(initialCode);
    setOutput([]);
    setStatus('idle');
  }, [initialCode, isOpen]);

  // Load Pyodide from CDN dynamically
  const initPyodide = async () => {
    if (pyodideRef.current) return pyodideRef.current;

    setStatus('loading_pyodide');
    // Check if script tag is already in document
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Không thể tải Pyodide từ CDN'));
        document.body.appendChild(script);
      });
    }

    const pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
    });
    pyodideRef.current = pyodide;
    return pyodide;
  };

  const handleRunPython = async () => {
    setOutput([]);
    const logs = [];
    const startTime = performance.now();

    try {
      const pyodide = await initPyodide();
      setStatus('running');

      // Intercept stdout and stderr
      pyodide.setStdout({
        batched: (str) => {
          logs.push({ type: 'stdout', text: str });
          setOutput([...logs]);
        }
      });
      pyodide.setStderr({
        batched: (str) => {
          logs.push({ type: 'stderr', text: str });
          setOutput([...logs]);
        }
      });

      // Execute code
      const result = await pyodide.runPythonAsync(code);
      if (result !== undefined && result !== null) {
        logs.push({ type: 'return', text: `Return value: ${String(result)}` });
      }

      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      setOutput([...logs]);
      setStatus('success');
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      logs.push({ type: 'stderr', text: err.message });
      setOutput([...logs]);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="flex flex-col w-[94vw] max-w-4xl h-[85vh] bg-[#0E1626] border border-codex-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141F36] border-b border-codex-border">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-2 text-sm font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Python 3 WebAssembly Sandbox (Pyodide)</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Zero Server Setup
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunPython}
              disabled={status === 'loading_pyodide' || status === 'running'}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-nvidia-green hover:bg-nvidia-darkgreen text-gray-950 transition shadow-md disabled:opacity-50"
            >
              {status === 'loading_pyodide' || status === 'running' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{status === 'loading_pyodide' ? 'Nạp Pyodide...' : 'Đang chạy...'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-gray-950" />
                  <span>Chạy Code</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content: Split Editor & Output */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-codex-border overflow-hidden">
          {/* Code Editor */}
          <div className="flex flex-col h-full bg-[#0A0F1A]">
            <div className="px-4 py-2 bg-[#101827] border-b border-codex-border flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Mã Python</span>
              <span>Chỉnh sửa trực tiếp trước khi chạy</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent text-gray-200 font-mono text-xs focus:outline-none resize-none leading-relaxed selection:bg-blue-500/30"
              placeholder="# Nhập mã nguồn Python tại đây..."
              spellCheck="false"
            />
          </div>

          {/* Execution Output */}
          <div className="flex flex-col h-full bg-[#070B14]">
            <div className="px-4 py-2 bg-[#101827] border-b border-codex-border flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-semibold text-gray-300">Terminal Output</span>
              </span>
              {executionTime !== null && (
                <span className="text-[11px] text-gray-400">
                  Thời gian: <span className="text-nvidia-green font-semibold">{executionTime}ms</span>
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
              {status === 'idle' && output.length === 0 && (
                <div className="text-gray-500 italic">
                  Nhấn <span className="text-nvidia-green font-semibold">"Chạy Code"</span> ở trên để bắt đầu thực thi...
                </div>
              )}

              {status === 'loading_pyodide' && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải môi trường Python WebAssembly (chỉ mất vài giây lần đầu)...</span>
                </div>
              )}

              {output.map((line, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed whitespace-pre-wrap break-all ${
                    line.type === 'stderr'
                      ? 'text-red-400 bg-red-950/20 p-2 rounded border border-red-900/30'
                      : line.type === 'return'
                      ? 'text-nvidia-green font-semibold'
                      : 'text-gray-200'
                  }`}
                >
                  {line.text}
                </div>
              ))}

              {status === 'success' && (
                <div className="flex items-center space-x-1.5 text-xs text-nvidia-green pt-2 border-t border-gray-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Chương trình đã thực thi thành công!</span>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center space-x-1.5 text-xs text-red-400 pt-2 border-t border-gray-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Xảy ra lỗi trong quá trình thực thi Python.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
