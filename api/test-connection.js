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

    let body = {};
    try {
      body = await req.json();
    } catch (e) {}

    if (!apiKey && body.apiKey) {
      apiKey = body.apiKey.trim();
    }
    if (!apiKey && typeof process !== 'undefined' && process.env?.NVIDIA_API_KEY) {
      apiKey = process.env.NVIDIA_API_KEY.trim();
    }

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Chưa cung cấp API Key. Hãy nhập NVIDIA API Key (bắt đầu bằng nvapi-) trong Cài đặt hoặc Vercel Environment Variables.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
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

    if (!res.ok) {
      const errText = await res.text();
      let parsedErr = errText;
      try {
        const j = JSON.parse(errText);
        parsedErr = j.message || j.error?.message || errText;
      } catch (e) {}

      let customMsg = `Lỗi NVIDIA (${res.status}): ${parsedErr}`;
      if (res.status === 401) {
        customMsg = 'Khóa API không hợp lệ hoặc đã hết hạn. Hãy kiểm tra lại key tại https://build.nvidia.com';
      } else if (res.status === 402 || res.status === 429) {
        customMsg = 'Tài khoản NVIDIA đã dùng hết credit miễn phí hoặc chạm giới hạn Rate Limit.';
      }

      return new Response(JSON.stringify({
        success: false,
        status: res.status,
        message: customMsg
      }), {
        status: res.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify({
      success: true,
      message: 'Kết nối API NVIDIA NIM thành công! Sẵn sàng sinh mã code.',
      model: 'meta/llama-3.3-70b-instruct',
      sample: data.choices?.[0]?.message?.content || 'OK'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      message: `Không thể kết nối đến máy chủ NVIDIA: ${err.message}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
