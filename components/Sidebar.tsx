"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Target,
  FolderKanban,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Briefcase,
  Award,
  ToggleLeft,
  Database,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const STORAGE_KEY = "sidebar-collapsed";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/employees", label: "従業員管理", icon: Users },
  { href: "/departments", label: "部署管理", icon: Building2 },
  { href: "/skills", label: "スキルマトリックス", icon: BarChart3 },
  { href: "/projects", label: "プロジェクト管理", icon: FolderKanban },
  { href: "/strategy", label: "戦略インサイト", icon: Target },
];

const masterItems = [
  { href: "/master/departments", label: "部署マスタ", icon: undefined },
  { href: "/master/roles", label: "役職マスタ", icon: Briefcase },
  { href: "/master/skills", label: "スキルマスタ", icon: undefined },
  { href: "/master/grades", label: "グレードマスタ", icon: Award },
  { href: "/master/statuses", label: "ステータスマスタ", icon: ToggleLeft },
  { href: "/master/employees", label: "スタッフマスタ", icon: undefined },
];

const utilItems = [
  { href: "/manual", label: "マニュアル", icon: BookOpen },
];

const themeConfig = {
  light: { icon: Sun, label: "ライト", next: "dark" as const },
  dark: { icon: Moon, label: "ダーク", next: "system" as const },
  system: { icon: Monitor, label: "システム", next: "light" as const },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const currentTheme = themeConfig[theme];
  const ThemeIcon = currentTheme.icon;

  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setCollapsed(true);
    }
    setMounted(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-64"
      } bg-gray-900 dark:bg-gray-950 text-white flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}
    >
      {/* ヘッダー + 折りたたみトグル */}
      <div className="px-4 py-5 border-b border-gray-700">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
          <div className={`flex items-center ${collapsed ? "" : "gap-2"}`}>
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users size={18} />
            </div>
            {!collapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="font-bold text-sm">タレント管理</div>
                <div className="text-xs text-gray-400">TalentOS v1.0</div>
              </div>
            )}
          </div>
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title={collapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
              {!collapsed && active && <ChevronRight size={14} />}
            </Link>
          );
        })}

        {!collapsed && (
          <div className="pt-3 pb-1 px-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <Database size={14} />
              マスタ管理
            </div>
          </div>
        )}
        {collapsed && <div className="pt-3" />}
        {masterItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {Icon ? (
                <Icon size={18} className="flex-shrink-0" />
              ) : collapsed ? (
                <Database size={16} className="flex-shrink-0" />
              ) : (
                <span className="w-[18px]" />
              )}
              {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
              {!collapsed && active && <ChevronRight size={14} />}
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
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
              {!collapsed && active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* テーマ切替 */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setTheme(currentTheme.next)}
          title={collapsed ? `${currentTheme.label}モード` : undefined}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <ThemeIcon size={18} className="flex-shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-left whitespace-nowrap">
              {currentTheme.label}モード
            </span>
          )}
        </button>
      </div>

      {/* ユーザープロフィール */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-2"}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
            管
          </div>
          {!collapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <div className="text-sm font-medium">管理者</div>
              <div className="text-xs text-gray-400">admin@company.co.jp</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3 text-center text-[10px] text-gray-600">
            TalentOS v1.1.0
          </div>
        )}
      </div>
    </aside>
  );
}
