# Hướng Dẫn Triển Khai Vercel & Trỏ Domain ai.craftopics.online

Tài liệu này hướng dẫn bạn đưa toàn bộ dự án **NVIDIA Codex Studio** lên nền tảng đám mây **Vercel** và cấu hình tên miền riêng **`ai.craftopics.online`**.

---

## Cách 1: Triển khai qua GitHub (Khuyên dùng nhất)

### Bước 1: Khởi tạo Git & Đẩy mã nguồn lên GitHub
1. Mở PowerShell hoặc Terminal tại thư mục `nvidia-codex-web`:
   ```bash
   cd c:\Users\mtrii\Downloads\donate\nvidia-codex-web
   git init
   git add .
   git commit -m "feat: init NVIDIA Codex Studio web app"
   ```
2. Tạo một Repository mới trên [GitHub.com](https://github.com/new) (ví dụ: `nvidia-codex-web`).
3. Đẩy code lên GitHub:
   ```bash
   git remote add origin https://github.com/<tai-khoan-cua-ban>/nvidia-codex-web.git
   git branch -M main
   git push -u origin main
   ```

### Bước 2: Nhập vào Vercel (Import Project)
1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard).
2. Nhấn nút **"Add New..."** ➔ chọn **"Project"**.
3. Chọn Repository `nvidia-codex-web` từ tài khoản GitHub của bạn.
4. Cấu hình Vercel sẽ tự động phát hiện:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (để mặc định)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Tại mục **Environment Variables** (Biến môi trường), thêm biến:
   - **Key**: `NVIDIA_API_KEY`
   - **Value**: `nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (khóa API của bạn)
6. Nhấn nút **"Deploy"**. Vercel sẽ biên dịch và cấp link chạy thử nghiệm dạng `https://nvidia-codex-web.vercel.app` chỉ sau ~30 giây.

---

## Cách 2: Triển khai trực tiếp qua Vercel CLI (Không cần GitHub)

1. Mở PowerShell tại thư mục `nvidia-codex-web`:
   ```bash
   cd c:\Users\mtrii\Downloads\donate\nvidia-codex-web
   ```
2. Chạy lệnh:
   ```bash
   npx vercel
   ```
   *(Đăng nhập theo hướng dẫn trên màn hình, chọn các tùy chọn mặc định bằng phím Enter).*
3. Sau khi chạy thử xong, triển khai bản Production:
   ```bash
   npx vercel --prod
   ```

---

## Bước 3: Cấu hình Tên miền ai.craftopics.online trên Vercel

1. Trong trang quản lý dự án trên Vercel:
   - Nhấp vào tab **Settings** ➔ chọn mục **Domains** ở menu bên trái.
2. Tại ô **Add Domain**, nhập chính xác:
   ```text
   ai.craftopics.online
   ```
   Sau đó nhấn **Add**.
3. Vercel sẽ cung cấp bản ghi DNS cần trỏ:
   - **Type**: `CNAME`
   - **Name**: `ai`
   - **Value / Target**: `cname.vercel-dns.com`

---

## Bước 4: Cấu hình DNS tại nhà cung cấp tên miền (Cloudflare / Namecheap / Hostinger / ...)

Đăng nhập vào trang quản trị DNS của tên miền `craftopics.online` (ví dụ trên Cloudflare hoặc nhà cung cấp tên miền của bạn):

1. Thêm một bản ghi DNS mới:
   | Loại (Type) | Tên (Name / Subdomain) | Giá trị (Target / Content) | TTL | Proxy status (nếu dùng Cloudflare) |
   | :--- | :--- | :--- | :--- | :--- |
   | **CNAME** | `ai` | `cname.vercel-dns.com` | Auto | **DNS Only** (Tắt đám mây cam) |

> [!TIP]
> - Nếu dùng **Cloudflare**, hãy chuyển trạng thái đám mây sang **DNS Only (màu xám)** để Vercel tự động cấp chứng chỉ bảo mật SSL Let's Encrypt trong 1 phút.
> - Sau khi thêm bản ghi DNS, quay lại Vercel và nhấn nút **Refresh** bên cạnh tên miền `ai.craftopics.online`. Khi xuất hiện dấu tích xanh **Valid Configuration**, trang web của bạn đã chính thức hoạt động toàn cầu tại `https://ai.craftopics.online`!

---

## Các tính năng sẵn sàng phục vụ:
- ⚡ **Streaming SSE siêu tốc** qua Vercel Edge Function (`/api/chat`).
- 🖥️ **Web Sandbox Live Preview**: Xem trực tiếp giao diện HTML/Tailwind/JS trong khung iframe độc lập.
- 🐍 **Python Runner WebAssembly (Pyodide)**: Thực thi mã Python 3 trực tiếp trong trình duyệt người dùng với 0 chi phí server.
- 🔄 **Code Diff Viewer**: So sánh mã nguồn trước và sau khi tối ưu/sửa lỗi.
- 🔑 **Cài đặt API Key**: Người dùng có thể dùng key mặc định từ Vercel Env hoặc tự nhập key cá nhân trong modal Cài đặt.
