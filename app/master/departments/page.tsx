"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, AlertTriangle, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { InlineLoading } from "@/components/LoadingSpinner";

type Department = {
  id: string;
  name: string;
  head: string;
  head_count: number;
  budget: number;
  description: string;
  color: string;
};

type SortKey = "name" | "head" | "head_count" | "budget" | "description";
type SortDir = "asc" | "desc";

const emptyDept: Omit<Department, "id"> = {
  name: "",
  head: "",
  head_count: 0,
  budget: 0,
  description: "",
  color: "#6366f1",
};

export default function DepartmentsMasterPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Department, "id">>(emptyDept);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setConnectionError(false);
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("created_at");
      if (error) {
        setError(error.message);
        if (error.message.includes("fetch") || error.message.includes("network") || error.code === "PGRST301") {
          setConnectionError(true);
        }
      } else {
        setDepartments(data || []);
        setError("");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "データの取得に失敗しました";
      setError(msg);
      setConnectionError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabaseの環境変数が設定されていません。.env.local を確認してください。");
      setConnectionError(true);
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("部署名は必須です");
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
          setError(error.message);
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from("departments").insert(form);
        if (error) {
          setError(
            error.code === "23505"
              ? "同じ名前の部署が既に存在します"
              : error.message
          );
          setSaving(false);
          return;
        }
      }

      setEditingId(null);
      setIsAdding(false);
      setForm(emptyDept);
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この部署を削除しますか？所属する従業員の部署が未所属になります。")) return;
    try {
      const { error } = await supabase.from("departments").delete().eq("id", id);
      if (error) {
        setError(error.message);
        return;
      }
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  const startEdit = (dept: Department) => {
    setEditingId(dept.id);
    setIsAdding(false);
    setForm({
      name: dept.name ?? "",
      head: dept.head ?? "",
      head_count: dept.head_count ?? 0,
      budget: dept.budget ?? 0,
      description: dept.description ?? "",
      color: dept.color ?? "#6366f1",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyDept);
    setError("");
  };

  // Sorting
  const sorted = [...departments].sort((a, b) => {
    if (!sortKey) return 0;
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "ja");
        break;
      case "head":
        cmp = (a.head ?? "").localeCompare(b.head ?? "", "ja");
        break;
      case "head_count":
        cmp = (a.head_count ?? 0) - (b.head_count ?? 0);
        break;
      case "budget":
        cmp = (a.budget ?? 0) - (b.budget ?? 0);
        break;
      case "description":
        cmp = (a.description ?? "").localeCompare(b.description ?? "", "ja");
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={14} className="text-gray-300" />;
    return sortDir === "asc" ? <ArrowUp size={14} className="text-indigo-500" /> : <ArrowDown size={14} className="text-indigo-500" />;
  };

  if (connectionError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">部署マスタ管理</h1>
        <div className="p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Supabaseに接続できません</h2>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">{error}</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                以下を確認してください:
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 mb-4">
                <li>1. .env.local に NEXT_PUBLIC_SUPABASE_URL を設定済みか</li>
                <li>2. .env.local に NEXT_PUBLIC_SUPABASE_ANON_KEY を設定済みか</li>
                <li>3. Supabase ダッシュボードで migration.sql を実行済みか</li>
                <li>4. 開発サーバーを再起動したか（env変更後は必要）</li>
              </ul>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
              >
                <RefreshCw size={16} />
                再接続
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-gray-100">部署マスタ管理</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">部署の追加・編集・削除</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyDept);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            新規追加
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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

      {loading ? (
        <InlineLoading />
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          部署が登録されていません
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  カラー
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    部署名 <SortIcon col="name" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("head")}
                >
                  <div className="flex items-center gap-1">
                    部署長 <SortIcon col="head" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("head_count")}
                >
                  <div className="flex items-center gap-1">
                    目標人数 <SortIcon col="head_count" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("budget")}
                >
                  <div className="flex items-center gap-1">
                    予算 <SortIcon col="budget" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("description")}
                >
                  <div className="flex items-center gap-1">
                    説明 <SortIcon col="description" />
                  </div>
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: dept.color || "#ccc" }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium dark:text-gray-100">{dept.name || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {dept.head || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{dept.head_count ?? 0}人</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">
                    {((dept.budget ?? 0) / 10000).toLocaleString()}万円
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {dept.description || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(dept)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
