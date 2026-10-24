export const config = {
  runtime: 'edge',
};

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

export default async function handler(req) {
  return new Response(JSON.stringify({ success: true, models: CODING_MODELS }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
