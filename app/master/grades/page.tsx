"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, ArrowUpDown } from "lucide-react";

type Grade = {
  id: string;
  code: string;
  name: string;
  rank_order: number;
};

const emptyForm = {
  code: "",
  name: "",
  rank_order: 0,
};

type SortKey = "code" | "name" | "rank_order";
type SortDir = "asc" | "desc";

export default function GradesMasterPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank_order");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("grades")
      .select("*")
      .order("rank_order");
    if (error) {
      setError(error.message);
    } else {
      setGrades(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedGrades = [...grades].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number") {
      return sortDir === "asc" ? av - bv : bv - av;
    }
    return sortDir === "asc"
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const handleSave = async () => {
    setError("");
    if (!form.code.trim()) {
      setError("コードは必須です");
      return;
    }
    if (!form.name.trim()) {
      setError("名称は必須です");
      return;
    }

    const payload = {
      code: form.code,
      name: form.name,
      rank_order: form.rank_order,
    };

    if (editingId) {
      const { error } = await supabase
        .from("grades")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("grades").insert(payload);
      if (error) {
        setError(error.message);
        return;
      }
    }

    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このグレードを削除しますか？")) return;
    const { error } = await supabase.from("grades").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchData();
  };

  const startEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setIsAdding(false);
    setForm({
      code: grade.code,
      name: grade.name,
      rank_order: grade.rank_order,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setError("");
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer select-none hover:text-gray-900 dark:hover:text-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={14} className={sortKey === field ? "text-indigo-600" : "text-gray-400 dark:text-gray-500"} />
      </div>
    </th>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">グレードマスタ管理</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            グレードの追加・編集・削除
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            新規追加
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "グレードを編集" : "新規グレードを追加"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                コード <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="J1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="ジュニア1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                表示順
              </label>
              <input
                type="number"
                value={form.rank_order}
                onChange={(e) =>
                  setForm({ ...form, rank_order: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={16} />
              保存
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
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">読み込み中...</div>
      ) : grades.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          グレードが登録されていません
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <SortHeader label="コード" field="code" />
                <SortHeader label="名称" field="name" />
                <SortHeader label="表示順" field="rank_order" />
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedGrades.map((grade) => (
                <tr
                  key={grade.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3 font-medium">{grade.code}</td>
                  <td className="px-4 py-3 text-sm">{grade.name}</td>
                  <td className="px-4 py-3 text-sm">{grade.rank_order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(grade)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
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
