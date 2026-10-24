import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Smartphone, Tablet, Monitor, ExternalLink, Terminal, Maximize2, Minimize2 } from 'lucide-react';

export default function LivePreviewModal({ isOpen, onClose, code = '' }) {
  const [device, setDevice] = useState('desktop'); // desktop | tablet | mobile
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const iframeRef = useRef(null);

  // Build sandboxed HTML
  const generatePreviewHtml = (rawCode) => {
    // If it's already a full HTML document
    let fullHtml = rawCode;
    const hasHtmlTag = rawCode.toLowerCase().includes('<html') || rawCode.toLowerCase().includes('<!doctype');

    if (!hasHtmlTag) {
      // Wrap snippet in clean HTML5 template with Tailwind CDN and FontAwesome
      fullHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 1.5rem; }
  </style>
</head>
<body>
  ${rawCode}
</body>
</html>
      `;
    }

    // Inject console interceptor script
    const consoleInterceptor = `
<script>
  (function() {
    function sendLog(type, args) {
      window.parent.postMessage({
        type: 'SANDBOX_CONSOLE',
        logType: type,
        messages: Array.from(args).map(a => {
          try {
            return typeof a === 'object' ? JSON.stringify(a) : String(a);
          } catch(e) {
            return String(a);
          }
        })
      }, '*');
    }
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    console.log = function() { sendLog('info', arguments); origLog.apply(console, arguments); };
    console.warn = function() { sendLog('warn', arguments); origWarn.apply(console, arguments); };
    console.error = function() { sendLog('error', arguments); origError.apply(console, arguments); };
    window.onerror = function(msg, url, line) {
      sendLog('error', [msg + ' (line ' + line + ')']);
    };
  })();
</script>
    `;

    return fullHtml.replace('<head>', `<head>${consoleInterceptor}`);
  };

  const reloadIframe = () => {
    if (!iframeRef.current) return;
    setConsoleLogs([]);
    const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(generatePreviewHtml(code));
      doc.close();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setConsoleLogs([]);
      // allow modal to mount then inject html
      setTimeout(reloadIframe, 100);
    }
  }, [isOpen, code]);

  // Listen for console logs from iframe
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'SANDBOX_CONSOLE') {
        setConsoleLogs((prev) => [
          ...prev,
          {
            type: e.data.logType,
            text: e.data.messages.join(' '),
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Open preview in new window
  const handleOpenNewWindow = () => {
    const blob = new Blob([generatePreviewHtml(code)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className={`flex flex-col bg-[#0F172A] border border-codex-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-[96vw] max-w-6xl h-[90vh]'
      }`}>
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#131E33] border-b border-codex-border">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-2 text-sm font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-nvidia-green animate-pulse"></span>
              <span>Web Sandbox Live Preview</span>
            </span>

            {/* Viewport switcher */}
            <div className="hidden sm:flex items-center bg-[#0B1220] p-0.5 rounded-lg border border-codex-border">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-md transition ${device === 'desktop' ? 'bg-[#1E293B] text-nvidia-green' : 'text-gray-400 hover:text-white'}`}
                title="Desktop (100%)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-1.5 rounded-md transition ${device === 'tablet' ? 'bg-[#1E293B] text-nvidia-green' : 'text-gray-400 hover:text-white'}`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-md transition ${device === 'mobile' ? 'bg-[#1E293B] text-nvidia-green' : 'text-gray-400 hover:text-white'}`}
                title="Mobile (375px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Console toggle */}
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                showConsole
                  ? 'bg-nvidia-green/20 text-nvidia-green border-nvidia-green/40'
                  : 'bg-[#1E293B] text-gray-300 border-codex-border hover:bg-[#283852]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console ({consoleLogs.length})</span>
            </button>

            {/* Refresh */}
            <button
              onClick={reloadIframe}
              className="p-1.5 rounded-lg bg-[#1E293B] text-gray-300 hover:text-white border border-codex-border hover:bg-[#283852] transition"
              title="Tải lại trang"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Open in new tab */}
            <button
              onClick={handleOpenNewWindow}
              className="p-1.5 rounded-lg bg-[#1E293B] text-gray-300 hover:text-white border border-codex-border hover:bg-[#283852] transition"
              title="Mở trong tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-[#1E293B] text-gray-300 hover:text-white border border-codex-border hover:bg-[#283852] transition"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
              title="Đóng cửa sổ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Frame Container */}
        <div className="flex-1 bg-[#090D16] flex justify-center items-center overflow-auto p-2 relative">
          <iframe
            ref={iframeRef}
            title="Sandbox Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className={`h-full bg-white rounded-lg shadow-2xl transition-all duration-300 border border-gray-700 ${deviceWidths[device]}`}
          />
        </div>

        {/* Console Drawer */}
        {showConsole && (
          <div className="h-44 bg-[#0A0E17] border-t border-codex-border flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#111827] border-b border-codex-border text-gray-400">
              <span className="flex items-center space-x-1.5 text-[11px] font-semibold text-gray-300">
                <Terminal className="w-3.5 h-3.5 text-nvidia-green" />
                <span>Sandbox Developer Console</span>
              </span>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-[11px] text-gray-400 hover:text-white hover:underline"
              >
                Xóa logs
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {consoleLogs.length === 0 ? (
                <div className="text-gray-500 italic">Chưa có thông điệp console nào...</div>
              ) : (
                consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`flex items-start space-x-2 py-0.5 border-b border-gray-800/50 ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'warn'
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    <span className="text-gray-600 text-[10px] select-none">[{log.time}]</span>
                    <span className="font-semibold text-[11px] uppercase select-none w-12">
                      {log.type}:
                    </span>
                    <span className="flex-1 break-all whitespace-pre-wrap">{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
