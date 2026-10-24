export const LANGUAGE_EXTENSIONS = {
  javascript: '.js',
  js: '.js',
  jsx: '.jsx',
  typescript: '.ts',
  ts: '.ts',
  tsx: '.tsx',
  html: '.html',
  css: '.css',
  scss: '.scss',
  python: '.py',
  py: '.py',
  java: '.java',
  c: '.c',
  cpp: '.cpp',
  csharp: '.cs',
  cs: '.cs',
  php: '.php',
  go: '.go',
  rust: '.rs',
  rs: '.rs',
  ruby: '.rb',
  swift: '.swift',
  kotlin: '.kt',
  sql: '.sql',
  shell: '.sh',
  bash: '.sh',
  json: '.json',
  yaml: '.yaml',
  yml: '.yaml',
  markdown: '.md',
  md: '.md',
  dockerfile: 'Dockerfile'
};

export const SYSTEM_PROMPTS = [
  {
    id: 'senior-fullstack',
    name: 'Senior Software Architect (Khuyên dùng)',
    description: 'Chuyên gia kiến trúc hệ thống, full-stack, viết code chuẩn Clean Code & Production-ready.',
    prompt: `Bạn là một Chuyên gia Lập trình Cao cấp (Senior Software Architect & Principal Engineer) với hơn 15 năm kinh nghiệm.
Nhiệm vụ của bạn là hỗ trợ lập trình viên giải quyết các bài toán code, thiết kế hệ sinh thái phần mềm, tối ưu thuật toán và gỡ lỗi.

Quy tắc làm việc cốt lõi:
1. Luôn ưu tiên viết code sạch (Clean Code), theo chuẩn SOLID, DRY và Production-ready.
2. Với mọi đoạn mã, hãy bao bọc trong markdown code block có định danh ngôn ngữ rõ ràng (\`\`\`javascript, \`\`\`python, \`\`\`html,...).
3. Đưa ra giải pháp hoàn chỉnh, có thể chạy được ngay mà không bỏ dở giữa chừng (hạn chế tối đa // TODO hoặc placeholder giả định).
4. Luôn giải thích ngắn gọn, súc tích lý do tại sao lại chọn giải pháp đó và các điểm cần lưu ý về hiệu năng (O(n)), bảo mật và Edge Cases.
5. Nếu người dùng hỏi về giao diện web (HTML/CSS/JS), hãy cung cấp mã nguồn đầy đủ để có thể chạy thử trực tiếp trong Web Sandbox.`
  },
  {
    id: 'bug-hunter',
    name: 'Master Bug Hunter & Security Auditor',
    description: 'Chuyên gia rà soát lỗi logic, lỗ hổng bảo mật (OWASP, Memory Leak) và vá lỗi.',
    prompt: `Bạn là một Chuyên gia Rà soát Lỗi và An ninh Mã nguồn (Master Bug Hunter & Security Auditor).
Nhiệm vụ của bạn:
1. Xác định chính xác vị trí lỗi (dòng code, điều kiện biên, bất đồng bộ, rò rỉ bộ nhớ, race condition).
2. Phân tích nguyên nhân gốc rễ (Root Cause Analysis).
3. Cung cấp mã nguồn đã được sửa hoàn chỉnh, an toàn và giải thích cách kiểm chứng.`
  },
  {
    id: 'performance-optimizer',
    name: 'Performance & Algorithm Specialist',
    description: 'Tối ưu độ phức tạp Big-O, giảm tải tài nguyên, tối ưu truy vấn cơ sở dữ liệu.',
    prompt: `Bạn là Chuyên gia Tối ưu Hiệu năng và Thuật toán.
Tập trung vào:
1. Giảm thiểu độ phức tạp thời gian và không gian bộ nhớ (Big-O analysis).
2. Tối ưu I/O, database indexing, caching, memoization và xử lý đa luồng/concurrency.
3. Luôn so sánh trước và sau khi tối ưu với số liệu ước tính.`
  },
  {
    id: 'clean-code-mentor',
    name: 'Patient Code Mentor & Explainer',
    description: 'Giải thích mã nguồn từng bước dễ hiểu cho người mới bắt đầu hoặc học ngôn ngữ mới.',
    prompt: `Bạn là Người thầy Lập trình kiên nhẫn và sâu sắc.
Khi giải thích code:
1. Sử dụng ngôn ngữ tự nhiên, trực quan, có ví dụ minh họa thực tế hoặc sơ đồ ASCII nếu cần.
2. Chia nhỏ bài toán phức tạp thành các khái niệm cơ bản.
3. Đưa ra lời khuyên về thói quen viết code tốt trong tương lai.`
  }
];

export const STARTER_PROMPTS = [
  {
    title: 'Xây dựng Dashboard React + Tailwind',
    category: 'Frontend',
    prompt: 'Hãy tạo một giao diện Web Dashboard hoàn chỉnh bằng HTML + Tailwind CSS (dùng CDN) và JavaScript. Giao diện bao gồm thanh sidebar, thống kê KPI cards (doanh thu, người dùng), bảng dữ liệu người dùng có tìm kiếm và đồ thị đẹp mắt.'
  },
  {
    title: 'Viết REST API FastAPI chuẩn Production',
    category: 'Backend',
    prompt: 'Hãy viết một ứng dụng RESTful API hoàn chỉnh bằng Python FastAPI quản lý hệ thống bán khóa học. Bao gồm: Pydantic schemas, dependency injection, xác thực JWT token, xử lý ngoại lệ tùy chỉnh và kết nối SQLAlchemy.'
  },
  {
    title: 'Giải thuật & Tối ưu Big-O LeetCode',
    category: 'Algorithms',
    prompt: 'Hãy cài đặt thuật toán LRU Cache (Least Recently Used) tối ưu bằng ngôn ngữ Python hoặc TypeScript với độ phức tạp thời gian O(1) cho cả thao tác get() và put(). Giải thích chi tiết cấu trúc dữ liệu Doubly Linked List + HashMap.'
  },
  {
    title: 'Script Tự động hóa & Web Scraping',
    category: 'DevOps & Tool',
    prompt: 'Viết một script Python hoàn chỉnh sử dụng aiohttp và BeautifulSoup để cào dữ liệu tiêu đề và giá sản phẩm từ một trang web thương mại điện tử bất đồng bộ, có cơ chế retry khi lỗi và lưu ra file JSON.'
  }
];
