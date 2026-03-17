"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Target,
  ChevronRight,
  Database,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/employees", label: "従業員管理", icon: Users },
  { href: "/departments", label: "部署管理", icon: Building2 },
  { href: "/skills", label: "スキルマトリックス", icon: BarChart3 },
  { href: "/strategy", label: "戦略インサイト", icon: Target },
];

const masterItems = [
  { href: "/master/departments", label: "部署マスタ" },
  { href: "/master/skills", label: "スキルマスタ" },
  { href: "/master/employees", label: "スタッフマスタ" },
];

const utilItems = [
  { href: "/manual", label: "マニュアル", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <div className="font-bold text-sm">タレント管理</div>
            <div className="text-xs text-gray-400">TalentOS v1.0</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}

        <div className="pt-3 pb-1 px-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
            <Database size={14} />
            マスタ管理
          </div>
        </div>
        {masterItems.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="w-[18px]" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}

        <div className="pt-3" />
        {utilItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
            管
          </div>
          <div>
            <div className="text-sm font-medium">管理者</div>
            <div className="text-xs text-gray-400">admin@company.co.jp</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
