"use client";

import { useState } from "react";
import { Building2, Briefcase, BarChart3, Award, ToggleLeft } from "lucide-react";

// 各マスタページをインポート
import DepartmentsMasterPage from "../master/departments/page";
import RolesMasterPage from "../master/roles/page";
import SkillsMasterPage from "../master/skills/page";
import GradesMasterPage from "../master/grades/page";
import StatusesMasterPage from "../master/statuses/page";

const tabs = [
  { key: "departments", label: "部署", icon: Building2 },
  { key: "roles", label: "役職", icon: Briefcase },
  { key: "skills", label: "スキル", icon: BarChart3 },
  { key: "grades", label: "グレード", icon: Award },
  { key: "statuses", label: "ステータス", icon: ToggleLeft },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("departments");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">全体設定</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          システム全体で使用するマスタデータの管理
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 overflow-x-auto">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === key
                ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="-mx-8 -mb-6">
        {activeTab === "departments" && <DepartmentsMasterPage />}
        {activeTab === "roles" && <RolesMasterPage />}
        {activeTab === "skills" && <SkillsMasterPage />}
        {activeTab === "grades" && <GradesMasterPage />}
        {activeTab === "statuses" && <StatusesMasterPage />}
      </div>
    </div>
  );
}
