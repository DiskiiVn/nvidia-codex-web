export async function fetchModels() {
  try {
    const res = await fetch('/api/models');
    if (!res.ok) throw new Error('Không thể tải danh sách model');
    const data = await res.json();
    return data.models || [];
  } catch (err) {
    console.error('fetchModels error:', err);
    return [];
  }
}

export async function testConnection(apiKey) {
  try {
    const res = await fetch('/api/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey ? `Bearer ${apiKey}` : ''
      },
      body: JSON.stringify({ apiKey })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: `Không thể kết nối đến máy chủ: ${err.message}`
    };
  }
}

export async function streamChat({
  messages,
  model = 'meta/llama-3.3-70b-instruct',
  temperature = 0.3,
  maxTokens = 4096,
  topP = 0.95,
  apiKey = '',
  onChunk,
  onError,
  onFinish,
  signal
}) {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
        apiKey
      }),
      signal
    });

    if (!response.ok) {
      let errMsg = `Lỗi yêu cầu (${response.status})`;
      try {
        const errJson = await response.json();
        errMsg = errJson.error || errJson.message || errMsg;
      } catch (e) {
        errMsg = await response.text();
      }
      throw new Error(errMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
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
          onFinish?.();
          return;
        }

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.substring(6).trim();
          try {
            const data = JSON.parse(jsonStr);
            if (data.error) {
              onError?.(new Error(data.error));
              return;
            }
            if (data.content) {
              onChunk?.(data.content);
            }
          } catch (e) {
            // Raw text fallback
          }
        }
      }
    }

    onFinish?.();
  } catch (err) {
    if (err.name === 'AbortError') {
      onFinish?.();
      return;
    }
    console.error('streamChat error:', err);
    onError?.(err);
  }
}
