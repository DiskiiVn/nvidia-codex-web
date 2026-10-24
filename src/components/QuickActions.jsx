import React from 'react';
import { Bug, Zap, TestTube2, BookOpen, RefreshCw, ShieldCheck, Languages } from 'lucide-react';

const ACTIONS = [
  {
    id: 'debug',
    label: 'Tìm & Sửa lỗi',
    icon: Bug,
    color: 'hover:border-red-500/50 hover:text-red-400',
    prefix: 'Hãy phân tích, tìm kiếm lỗi tiềm ẩn (syntax, runtime, logic, edge case) và cung cấp bản vá hoàn chỉnh cho đoạn mã sau:\n\n'
  },
  {
    id: 'optimize',
    label: 'Tối ưu O(n)',
    icon: Zap,
    color: 'hover:border-amber-500/50 hover:text-amber-400',
    prefix: 'Hãy tối ưu hóa hiệu năng, giảm độ phức tạp thời gian/bộ nhớ (Big-O) và cải thiện khả năng mở rộng của đoạn mã sau:\n\n'
  },
  {
    id: 'test',
    label: 'Viết Unit Test',
    icon: TestTube2,
    color: 'hover:border-blue-500/50 hover:text-blue-400',
    prefix: 'Hãy viết bộ kiểm thử đơn vị (Unit Tests) hoàn chỉnh, bao quát các trường hợp biên (edge cases) và lỗi có thể xảy ra cho đoạn code sau:\n\n'
  },
  {
    id: 'refactor',
    label: 'Refactor Clean Code',
    icon: RefreshCw,
    color: 'hover:border-emerald-500/50 hover:text-emerald-400',
    prefix: 'Hãy tái cấu trúc (refactor) đoạn mã sau theo chuẩn Clean Code, áp dụng các nguyên lý SOLID và đặt tên biến/hàm tường minh:\n\n'
  },
  {
    id: 'explain',
    label: 'Giải thích mã',
    icon: BookOpen,
    color: 'hover:border-purple-500/50 hover:text-purple-400',
    prefix: 'Hãy giải thích cặn kẽ từng bước hoạt động của đoạn mã này, luồng thực thi và các khái niệm kỹ thuật cốt lõi:\n\n'
  },
  {
    id: 'security',
    label: 'Kiểm toán bảo mật',
    icon: ShieldCheck,
    color: 'hover:border-cyan-500/50 hover:text-cyan-400',
    prefix: 'Hãy kiểm toán an ninh bảo mật (Security Audit) theo tiêu chuẩn OWASP, tìm kiếm các lỗ hổng (Injection, Auth, Buffer, Sanitization) và cách khắc phục trong đoạn code sau:\n\n'
  }
];

export default function QuickActions({ onSelectAction }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider pl-1 pr-2 flex-shrink-0 select-none">
        Tác vụ nhanh:
      </span>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => onSelectAction(action.prefix)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#131D30] text-gray-300 border border-codex-border transition flex-shrink-0 ${action.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
