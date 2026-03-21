"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useAppData } from "@/lib/useAppData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
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
  Plus,
  Trash2,
  FileText,
  GraduationCap,
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

  // Career history state
  type CareerRecord = { id: string; summary: string; detail: string; created_at: string };
  const [careerHistory, setCareerHistory] = useState<CareerRecord[]>([]);
  const [showCareerForm, setShowCareerForm] = useState(false);
  const [careerForm, setCareerForm] = useState({ summary: "", detail: "" });
  const [careerError, setCareerError] = useState("");

  const fetchCareerHistory = useCallback(async () => {
    if (!isSupabaseConfigured || !id) return;
    const { data } = await supabase
      .from("employee_career_history")
      .select("*")
      .eq("employee_id", id)
      .order("created_at", { ascending: false });
    if (data) setCareerHistory(data as CareerRecord[]);
  }, [id]);

  useEffect(() => {
    fetchCareerHistory();
  }, [fetchCareerHistory]);

  const addCareerRecord = async () => {
    if (!careerForm.summary.trim()) { setCareerError("概要は必須です"); return; }
    if (careerForm.summary.length > 20) { setCareerError("概要は20文字以内です"); return; }
    if (careerForm.detail.length > 200) { setCareerError("詳細は200文字以内です"); return; }
    setCareerError("");
    const { error: err } = await supabase.from("employee_career_history").insert({
      employee_id: id,
      summary: careerForm.summary.trim(),
      detail: careerForm.detail.trim(),
    });
    if (err) { setCareerError("保存に失敗しました"); return; }
    setCareerForm({ summary: "", detail: "" });
    setShowCareerForm(false);
    fetchCareerHistory();
  };

  const deleteCareerRecord = async (recordId: string) => {
    if (!confirm("この経歴レコードを削除しますか？")) return;
    await supabase.from("employee_career_history").delete().eq("id", recordId);
    fetchCareerHistory();
  };

  if (loading) {
    return (
      <PageLoading />
    );
  }

  if (!emp) notFound();

  // 研修期間の計算
  const trainingDays = (() => {
    if (!emp.joinDate) return null;
    if (emp.status === "training") {
      // まだ研修中
      const start = new Date(emp.joinDate);
      const now = new Date();
      return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    if (emp.trainingCompletedAt && !emp.leftDate) {
      // 研修完了済み（退職していない場合のみ集計）
      const start = new Date(emp.joinDate);
      const end = new Date(emp.trainingCompletedAt);
      return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    return null;
  })();

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
              <Link
                href="/departments"
                className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Building2 size={14} /> {emp.department}
              </Link>
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

      {/* 研修期間情報 */}
      {(emp.status === "training" || trainingDays !== null) && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <GraduationCap size={18} />
            研修情報
          </h2>
          <div className="flex flex-wrap gap-6 text-sm">
            {emp.status === "training" && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                  研修中
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  研修{trainingDays}日目
                </span>
              </div>
            )}
            {emp.trainingCompletedAt && (
              <div className="text-gray-600 dark:text-gray-400">
                研修完了日: {new Date(emp.trainingCompletedAt).toLocaleDateString("ja-JP")}
              </div>
            )}
            {trainingDays !== null && emp.status !== "training" && (
              <div className="text-gray-600 dark:text-gray-400">
                研修期間: {trainingDays}日間
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* 経歴コメント (T03) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <FileText size={18} />
            経歴・コメント
          </h2>
          <button
            onClick={() => setShowCareerForm(!showCareerForm)}
            className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus size={14} />
            レコード追加
          </button>
        </div>

        {showCareerForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            {careerError && (
              <p className="text-sm text-red-600 dark:text-red-400">{careerError}</p>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                概要（20文字以内）<span className="text-red-500">*</span>
              </label>
              <input
                value={careerForm.summary}
                onChange={(e) => setCareerForm({ ...careerForm, summary: e.target.value })}
                maxLength={20}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="例: 前職 - ABC株式会社"
              />
              <span className="text-xs text-gray-400 mt-0.5 block">{careerForm.summary.length}/20</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                詳細（200文字以内）
              </label>
              <textarea
                value={careerForm.detail}
                onChange={(e) => setCareerForm({ ...careerForm, detail: e.target.value })}
                maxLength={200}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="詳細な経歴内容を記入"
              />
              <span className="text-xs text-gray-400 mt-0.5 block">{careerForm.detail.length}/200</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addCareerRecord}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
              >
                保存
              </button>
              <button
                onClick={() => { setShowCareerForm(false); setCareerForm({ summary: "", detail: "" }); setCareerError(""); }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {careerHistory.length === 0 && !showCareerForm && (
            <p className="text-sm text-gray-400 dark:text-gray-500">経歴レコードがありません</p>
          )}
          {careerHistory.map((record) => (
            <div
              key={record.id}
              className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{record.summary}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(record.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {record.detail && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{record.detail}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteCareerRecord(record.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
