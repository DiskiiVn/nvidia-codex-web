# ⚡ NVIDIA Codex Studio - Nền Tảng Lập Trình AI Chuyên Sâu

Web AI chuyên về lập trình thế hệ mới tương tự ChatGPT / OpenAI Codex / Cursor, được hỗ trợ bởi các mô hình AI lập trình hàng đầu thế giới thông qua **NVIDIA NIM API** (`integrate.api.nvidia.com`).

Hệ thống được tối ưu hóa cho việc triển khai trên **Vercel** với tên miền tùy chỉnh **`ai.craftopics.online`**.

---

## 🚀 Tính Năng Chính

- **AI Engine Siêu Tốc (Streaming SSE)**:
  - Phản hồi mượt mà từng token qua Vercel Edge Serverless Functions (`/api/chat`).
  - Hỗ trợ các model lập trình hàng đầu:
    - `deepseek-ai/deepseek-r1` (Suy luận thuật toán, toán học & debug logic)
    - `meta/llama-3.3-70b-instruct` (Toàn diện, kiến trúc hệ thống fullstack)
    - `qwen/qwen2.5-coder-32b-instruct` (Đỉnh cao giải quyết bài toán lập trình)
    - `mistralai/codestral-22b-instruct-v0.1` (Tối ưu sinh mã hơn 80+ ngôn ngữ)
    - `nvidia/llama-3.1-nemotron-70b-instruct` (Mô hình tinh chỉnh từ NVIDIA)
- **Live Sandbox & Trình Xem Trước Trực Tiếp**:
  - 🖥️ **Web Live Preview**: Xem trước giao diện HTML/CSS/Tailwind/JS trong khung iframe độc lập có bộ thu thập console logs.
  - 🐍 **Python WASM Runner (Pyodide)**: Thực thi code Python 3 ngay trên trình duyệt qua WebAssembly với 0 chi phí máy chủ.
  - 🔄 **Code Diff Viewer**: So sánh đối chiếu mã nguồn trước và sau khi refactor/sửa lỗi.
- **Tiện Ích Cho Developer**:
  - Thanh tác vụ nhanh: 🐞 Tìm & Sửa lỗi, ⚡ Tối ưu O(n), 🧪 Viết Unit Test, 🔄 Refactor Clean Code, 📖 Giải thích mã, 🛡️ Kiểm toán bảo mật.
  - Đính kèm tệp mã nguồn (`.py`, `.ts`, `.js`, `.sql`, `.html`, `.json`,...).
  - Lưu trữ lịch sử hội thoại trên LocalStorage, ghim chat, đổi tên, tìm kiếm, xuất file `.md` / `.json`.
  - Nút **Test Connection** kiểm tra nhanh API key trong modal Cài đặt.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Highlight.js
- **Sandboxes**: Pyodide (Python WebAssembly), Sandboxed Iframe, jsdiff
- **Backend / Deployment**: Vercel Edge Functions, Server-Sent Events (SSE)

---

## 💻 Chạy Thử Tại Local

```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển
npm run dev
# Hoặc nhấp đúp vào start-dev.bat trên Windows
```

Mở trình duyệt tại: `http://localhost:5173`

---

## 🌐 Triển Khai Lên Vercel & Trỏ Domain `ai.craftopics.online`

Xem hướng dẫn chi tiết tại [HUONG_DAN_VERCEL.md](./HUONG_DAN_VERCEL.md).
