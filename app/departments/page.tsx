"use client";

import { useState } from "react";
import { useAppData } from "@/lib/useAppData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PageLoading } from "@/components/LoadingSpinner";
import Link from "next/link";
import { Users, TrendingUp, ChevronRight, Plus, Pencil, Trash2, Save, X } from "lucide-react";
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

type DeptForm = {
  name: string;
  head: string;
  head_count: number;
  budget: number;
  description: string;
  color: string;
};

const emptyForm: DeptForm = {
  name: "",
  head: "",
  head_count: 0,
  budget: 0,
  description: "",
  color: "#6366f1",
};

/** Supabaseエラーをユーザー向けメッセージに変換 */
function toUserError(error: { code?: string; message?: string }, context: "save" | "delete"): string {
  if (error.code === "23505") return "同じ名前の部署が既に存在します";
  if (error.code === "23503") return "関連データが存在するため操作できません";
  const labels = { save: "保存", delete: "削除" };
  return `${labels[context]}に失敗しました。しばらくしてから再度お試しください。`;
}

export default function DepartmentsPage() {
  const { employees, departments, loading, refetch } = useAppData();

  // CRUD state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) {
    return <PageLoading />;
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
    name: d.name.length > 5 ? d.name.slice(0, 5) + "\u2026" : d.name,
    fullName: d.name,
    評価: d.avgScore,
    fill: d.color,
  }));

  // CRUD handlers
  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("部署名は必須です");
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Supabaseが設定されていないため保存できません");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("departments")
          .update(form)
          .eq("id", editingId);
        if (error) {
          setError(toUserError(error, "save"));
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from("departments").insert(form);
        if (error) {
          setError(toUserError(error, "save"));
          setSaving(false);
          return;
        }
      }

      setEditingId(null);
      setIsAdding(false);
      setForm(emptyForm);
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この部署を削除しますか？所属する従業員の部署が未所属になります。")) return;
    if (!isSupabaseConfigured) {
      setError("Supabaseが設定されていないため削除できません");
      return;
    }
    try {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) {
        setError(toUserError(error, "delete"));
        return;
      }
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  const startEdit = (dept: typeof deptStats[number]) => {
    setEditingId(dept.id);
    setIsAdding(false);
    setForm({
      name: dept.name ?? "",
      head: dept.head ?? "",
      head_count: dept.headCount ?? 0,
      budget: dept.budget ?? 0,
      description: dept.description ?? "",
      color: dept.color ?? "#6366f1",
    });
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setError("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">部署管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {departments.length}部署の人員・スキル・パフォーマンスを管理
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyForm);
              setError("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            部署を追加
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold mb-4 dark:text-gray-100">
            {editingId ? "部署を編集" : "新規部署を追加"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                部署名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="エンジニアリング"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                部署長
              </label>
              <input
                type="text"
                value={form.head}
                onChange={(e) => setForm({ ...form, head: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="田中 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                目標人数
              </label>
              <input
                type="number"
                value={form.head_count}
                onChange={(e) =>
                  setForm({ ...form, head_count: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                予算（円）
              </label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) =>
                  setForm({ ...form, budget: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                説明
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="プロダクト開発・インフラ管理"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                カラー
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{form.color}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={16} />
              キャンセル
            </button>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(dept)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                  title="編集"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {dept.actualCount}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">人数</div>
              </div>
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
            </div>

            {/* Budget & Head */}
            <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="text-gray-400 dark:text-gray-500">責任者:</span>{" "}
                <span className="font-medium">{dept.head}</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                予算 {(dept.budget / 1000000).toFixed(0)}M
              </div>
            </div>

            {/* Members */}
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                <Users size={12} /> メンバー
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dept.members.slice(0, 6).map((m) => (
                  <Link href={`/employees/${m.id}`} key={m.id}>
                    {m.avatar && (m.avatar.startsWith("data:image") || m.avatar.startsWith("http")) ? (
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-indigo-400 transition-all"
                        title={m.name}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:ring-2 hover:ring-indigo-400 transition-all"
                        title={m.name}
                      >
                        {m.avatar || m.name.charAt(0)}
                      </div>
                    )}
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
