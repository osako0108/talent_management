"use client";

import { use } from "react";
import { useAppData } from "@/lib/useAppData";
import { PageLoading } from "@/components/LoadingSpinner";
import { statusLabels, statusColors, gradeLabels } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Briefcase,
  Building2,
  FolderOpen,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { employees, loading } = useAppData();
  const emp = employees.find((e) => e.id === id);

  if (loading) {
    return (
      <PageLoading />
    );
  }

  if (!emp) notFound();

  const skillByCategory: Record<string, typeof emp.skills> = {};
  emp.skills.forEach((s) => {
    if (!skillByCategory[s.category]) skillByCategory[s.category] = [];
    skillByCategory[s.category].push(s);
  });

  const radarData = emp.skills.map((s) => ({
    skill: s.name.length > 6 ? s.name.slice(0, 6) + "…" : s.name,
    value: s.level * 20,
  }));

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Back */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} /> 従業員一覧に戻る
      </Link>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden">
            {emp.avatar && (emp.avatar.startsWith("data:image") || emp.avatar.startsWith("http")) ? (
              <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {emp.avatar || emp.name.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{emp.name}</h1>
              <span className="text-sm text-gray-400 dark:text-gray-500">{emp.nameKana}</span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[emp.status]}`}
              >
                {statusLabels[emp.status]}
              </span>
              {emp.leftDate && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                  退職済
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{emp.role}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} /> {emp.department}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} /> {gradeLabels[emp.grade] ?? emp.grade}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} /> 入社: {emp.joinDate}
              </span>
              {emp.leftDate && (
                <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Calendar size={14} /> 退職: {emp.leftDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Mail size={14} /> {emp.email}
              </span>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">2024年度評価</div>
            <div className="text-4xl font-bold text-indigo-600">
              {emp.performance.find((p) => p.year === 2024)?.score ?? "—"}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500">/ 100点</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">スキル一覧</h2>
          <div className="space-y-4">
            {Object.entries(skillByCategory).map(([cat, skills]) => (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {skills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-36 truncate">
                        {skill.name}
                      </span>
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4, 5].map((lv) => (
                          <div
                            key={lv}
                            className={`h-2 flex-1 rounded-full ${
                              lv <= skill.level
                                ? "bg-indigo-500"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 w-4">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
            パフォーマンス推移
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={emp.performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}点`]} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
              スキルレーダー
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                <Radar
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">参加プロジェクト</h2>
        <div className="flex flex-wrap gap-2">
          {emp.projects.map((proj) => (
            <span
              key={proj}
              className="flex items-center gap-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg"
            >
              <FolderOpen size={14} /> {proj}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
