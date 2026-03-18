"use client";

import { useAppData } from "@/lib/useAppData";
import Link from "next/link";
import { Users, TrendingUp, ChevronRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DepartmentsPage() {
  const { employees, departments, loading } = useAppData();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const deptStats = departments.map((dept) => {
    const deptEmployees = employees.filter(
      (e) => e.department === dept.name
    );
    const avgScore =
      deptEmployees.length > 0
        ? deptEmployees.reduce((sum, e) => {
            const p = e.performance.find((p) => p.year === 2024);
            return sum + (p?.score ?? 0);
          }, 0) / deptEmployees.length
        : 0;
    const managerCount = deptEmployees.filter((e) =>
      e.grade.startsWith("M")
    ).length;

    return {
      ...dept,
      actualCount: deptEmployees.length,
      avgScore: Math.round(avgScore * 10) / 10,
      managerCount,
      members: deptEmployees,
    };
  });

  const barData = deptStats.map((d) => ({
    name: d.name.length > 5 ? d.name.slice(0, 5) + "…" : d.name,
    fullName: d.name,
    評価: d.avgScore,
    fill: d.color,
  }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">部署管理</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {departments.length}部署の人員・スキル・パフォーマンスを管理
        </p>
      </div>

      {/* 部署別平均評価チャート */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">部署別平均パフォーマンス（2024年度）</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(v) => [`${v}点`]}
              labelFormatter={(label) =>
                barData.find((d) => d.name === label)?.fullName ?? label
              }
            />
            <Bar dataKey="評価" radius={[6, 6, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {deptStats.map((dept) => (
          <div
            key={dept.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{ backgroundColor: dept.color }}
                />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{dept.name}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {dept.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {dept.actualCount}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">名</div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {dept.avgScore}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">平均評価</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {dept.managerCount}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">管理職</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {(dept.budget / 1000000).toFixed(0)}M
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">予算(円)</div>
              </div>
            </div>

            {/* Head */}
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-gray-400 dark:text-gray-500">責任者:</span>
              <span className="font-medium">{dept.head}</span>
            </div>

            {/* Members */}
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                <Users size={12} /> メンバー
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dept.members.slice(0, 6).map((m) => (
                  <Link href={`/employees/${m.id}`} key={m.id}>
                    <div
                      className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:ring-2 hover:ring-indigo-400 transition-all"
                      title={m.name}
                    >
                      {m.avatar}
                    </div>
                  </Link>
                ))}
                {dept.members.length > 6 && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                    +{dept.members.length - 6}
                  </div>
                )}
              </div>
            </div>

            {/* View All */}
            <Link
              href={`/employees?dept=${dept.name}`}
              className="mt-4 flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              メンバー一覧を見る <ChevronRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      {/* Org Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
          部署間連携マップ（プロジェクト共有）
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              from: "エンジニアリング",
              to: "プロダクト",
              project: "基幹システムリプレイス・デザインシステム構築",
              strength: "strong",
            },
            {
              from: "セールス",
              to: "マーケティング",
              project: "ブランドリニューアル・エンタープライズ開拓",
              strength: "medium",
            },
            {
              from: "エンジニアリング",
              to: "財務・経理",
              project: "データ基盤整備・コスト最適化",
              strength: "medium",
            },
            {
              from: "人事",
              to: "全部署",
              project: "採用ブランディング・評価制度改定",
              strength: "strong",
            },
          ].map((link, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <TrendingUp
                size={16}
                className={
                  link.strength === "strong"
                    ? "text-indigo-500 mt-0.5"
                    : "text-gray-400 mt-0.5"
                }
              />
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {link.from} ↔ {link.to}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {link.project}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
