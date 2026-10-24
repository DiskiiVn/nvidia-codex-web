import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev middleware plugin for local development without running a separate server
function nvidiaDevPlugin() {
  const CODING_MODELS = [
    {
      id: 'meta/llama-3.3-70b-instruct',
      name: 'Llama 3.3 70B Instruct',
      provider: 'Meta',
      badge: 'Toàn diện & Cân bằng nhất',
      description: 'Mô hình siêu mạnh mẽ cho kiến trúc phần mềm, full-stack, giải thuật và tối ưu hóa code.',
      contextWindow: '128k',
      recommended: true
    },
    {
      id: 'deepseek-ai/deepseek-r1',
      name: 'DeepSeek R1',
      provider: 'DeepSeek',
      badge: 'Đỉnh cao Suy luận & Thuật toán',
      description: 'Mô hình suy luận chuyên sâu vượt trội, giải quyết các thuật toán phức tạp, debug logic hóc búa.',
      contextWindow: '64k',
      recommended: true
    },
    {
      id: 'qwen/qwen2.5-coder-32b-instruct',
      name: 'Qwen 2.5 Coder 32B',
      provider: 'Alibaba Cloud',
      badge: 'Chuyên gia Code hàng đầu',
      description: 'Chuyên biệt cho lập trình, sinh mã chính xác, sửa lỗi nhanh và hiểu sâu cú pháp hơn 92 ngôn ngữ.',
      contextWindow: '32k',
      recommended: true
    },
    {
      id: 'mistralai/codestral-22b-instruct-v0.1',
      name: 'Codestral 22B Instruct',
      provider: 'Mistral AI',
      badge: 'Chuyên sinh mã đa ngôn ngữ',
      description: 'Tối ưu cho việc sinh code, hoàn thiện hàm, hỗ trợ hơn 80+ ngôn ngữ lập trình phổ biến.',
      contextWindow: '32k',
      recommended: false
    },
    {
      id: 'nvidia/llama-3.1-nemotron-70b-instruct',
      name: 'Llama 3.1 Nemotron 70B',
      provider: 'NVIDIA',
      badge: 'NVIDIA Tinh chỉnh',
      description: 'Mô hình do chính NVIDIA tinh chỉnh với độ chính xác cao và khả năng trả lời chi tiết, mạch lạc.',
      contextWindow: '128k',
      recommended: false
    },
    {
      id: 'deepseek-ai/deepseek-coder-6.7b-instruct',
      name: 'DeepSeek Coder 6.7B',
      provider: 'DeepSeek',
      badge: 'Tốc độ cực nhanh',
      description: 'Phản hồi siêu tốc, thích hợp cho các tác vụ viết hàm nhanh, kiểm tra cú pháp và script ngắn.',
      contextWindow: '16k',
      recommended: false
    }
  ];

  const readJson = (req) =>
    new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });

  return {
    name: 'nvidia-dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        // 1. /api/models
        if (req.url === '/api/models' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, models: CODING_MODELS }));
          return;
        }

        // Helper to extract API key
        const getApiKey = (headers, body) => {
          const auth = headers['authorization'] || '';
          if (auth.startsWith('Bearer ')) return auth.substring(7).trim();
          const custom = headers['x-nvidia-api-key'];
          if (custom) return custom.trim();
          if (body?.apiKey) return body.apiKey.trim();
          return process.env.NVIDIA_API_KEY || '';
        };

        // 2. /api/test-connection
        if (req.url === '/api/test-connection' && req.method === 'POST') {
          const body = await readJson(req);
          const apiKey = getApiKey(req.headers, body);
          res.setHeader('Content-Type', 'application/json');

          if (!apiKey) {
            res.statusCode = 400;
            res.end(JSON.stringify({
              success: false,
              message: 'Chưa có API Key. Hãy nhập NVIDIA API Key trong Cài đặt (bắt đầu bằng nvapi-).'
            }));
            return;
          }

          try {
            const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify({
                model: 'meta/llama-3.3-70b-instruct',
                messages: [{ role: 'user', content: 'Say "OK"' }],
                max_tokens: 5,
                temperature: 0.1
              })
            });

            if (!nvRes.ok) {
              const errTxt = await nvRes.text();
              res.statusCode = nvRes.status;
              let msg = `NVIDIA API (${nvRes.status}): ${errTxt}`;
              if (nvRes.status === 401) msg = 'API Key NVIDIA không hợp lệ hoặc đã hết hạn.';
              if (nvRes.status === 429) msg = 'Hết lượt credit hoặc đạt giới hạn Rate Limit.';
              res.end(JSON.stringify({ success: false, message: msg }));
              return;
            }

            const data = await nvRes.json();
            res.end(JSON.stringify({
              success: true,
              message: 'Kết nối API NVIDIA NIM thành công! Sẵn sàng sinh mã code.',
              model: 'meta/llama-3.3-70b-instruct',
              sample: data.choices?.[0]?.message?.content || 'OK'
            }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: e.message }));
          }
          return;
        }

        // 3. /api/chat
        if (req.url === '/api/chat' && req.method === 'POST') {
          const body = await readJson(req);
          const apiKey = getApiKey(req.headers, body);

          if (!apiKey) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Chưa cung cấp NVIDIA API Key.' }));
            return;
          }

          const {
            messages,
            model = 'meta/llama-3.3-70b-instruct',
            temperature = 0.3,
            max_tokens = 4096,
            top_p = 0.95
          } = body;

          try {
            const nvRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'text/event-stream'
              },
              body: JSON.stringify({
                model,
                messages,
                temperature: Number(temperature),
                max_tokens: Number(max_tokens),
                top_p: Number(top_p),
                stream: true
              })
            });

            if (!nvRes.ok) {
              const errText = await nvRes.text();
              res.statusCode = nvRes.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `NVIDIA API lỗi ${nvRes.status}: ${errText}` }));
              return;
            }

            res.writeHead(200, {
              'Content-Type': 'text/event-stream; charset=utf-8',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
              'Access-Control-Allow-Origin': '*'
            });

            const reader = nvRes.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            req.on('close', () => {
              try { reader.cancel(); } catch (e) {}
            });

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(':')) continue;

                if (trimmed === 'data: [DONE]') {
                  res.write('data: [DONE]\n\n');
                  continue;
                }

                if (trimmed.startsWith('data: ')) {
                  const jsonStr = trimmed.substring(6).trim();
                  try {
                    const data = JSON.parse(jsonStr);
                    const content = data.choices?.[0]?.delta?.content;
                    if (content !== undefined && content !== null) {
                      res.write(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                  } catch (e) {
                    res.write(`${trimmed}\n\n`);
                  }
                }
              }
            }

            if (buffer.trim()) {
              if (buffer.trim() === 'data: [DONE]') {
                res.write('data: [DONE]\n\n');
              } else if (buffer.startsWith('data: ')) {
                try {
                  const data = JSON.parse(buffer.substring(6).trim());
                  const content = data.choices?.[0]?.delta?.content;
                  if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
                } catch (e) {}
              }
            }

            res.write('data: [DONE]\n\n');
            res.end();
          } catch (err) {
            console.error('Chat dev error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            } else {
              res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
              res.end();
            }
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), nvidiaDevPlugin()],
  server: {
    port: 5173
  }
});
