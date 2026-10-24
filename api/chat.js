export const config = {
  runtime: 'edge',
};

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-nvidia-api-key'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('authorization') || '';
    let apiKey = '';
    if (authHeader.startsWith('Bearer ')) {
      apiKey = authHeader.substring(7).trim();
    }
    const customHeader = req.headers.get('x-nvidia-api-key');
    if (customHeader) {
      apiKey = customHeader.trim();
    }

    const body = await req.json();
    if (!apiKey && body.apiKey) {
      apiKey = body.apiKey.trim();
    }
    if (!apiKey && typeof process !== 'undefined' && process.env?.NVIDIA_API_KEY) {
      apiKey = process.env.NVIDIA_API_KEY.trim();
    }

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'Vui lòng cung cấp NVIDIA API Key (nhập trong Cài đặt Web hoặc thêm NVIDIA_API_KEY trong Vercel Environment Variables).'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const {
      messages,
      model = 'meta/llama-3.3-70b-instruct',
      temperature = 0.3,
      max_tokens = 4096,
      top_p = 0.95
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Danh sách tin nhắn (messages) không hợp lệ.' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const nvidiaPayload = {
      model,
      messages,
      temperature: Number(temperature),
      max_tokens: Number(max_tokens),
      top_p: Number(top_p),
      stream: true
    };

    const nvidiaRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(nvidiaPayload)
    });

    if (!nvidiaRes.ok) {
      const errText = await nvidiaRes.text();
      let errMsg = `NVIDIA API lỗi ${nvidiaRes.status}: ${errText}`;
      try {
        const j = JSON.parse(errText);
        errMsg = j.error?.message || j.message || errMsg;
      } catch (e) {}

      return new Response(JSON.stringify({ error: errMsg }), {
        status: nvidiaRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Edge streaming transform: reads SSE from NVIDIA and yields to client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8');

    // Run background stream pipe
    (async () => {
      try {
        const reader = nvidiaRes.body.getReader();
        let buffer = '';

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
              await writer.write(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.substring(6).trim();
              try {
                const data = JSON.parse(jsonStr);
                const content = data.choices?.[0]?.delta?.content;
                if (content !== undefined && content !== null) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              } catch (e) {
                await writer.write(encoder.encode(`${trimmed}\n\n`));
              }
            }
          }
        }

        if (buffer.trim()) {
          if (buffer.trim() === 'data: [DONE]') {
            await writer.write(encoder.encode('data: [DONE]\n\n'));
          } else if (buffer.startsWith('data: ')) {
            try {
              const data = JSON.parse(buffer.substring(6).trim());
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
              }
            } catch (e) {}
          }
        }

        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (streamErr) {
        console.error('Edge stream error:', streamErr);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: streamErr.message })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: `Lỗi kết nối Edge Function: ${err.message}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
