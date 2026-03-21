"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, ArrowUpDown } from "lucide-react";

type Status = {
  id: string;
  code: string;
  name: string;
  color: string;
};

const emptyForm = {
  code: "",
  name: "",
  color: "#6b7280",
};

type SortKey = "code" | "name" | "color";
type SortDir = "asc" | "desc";

export default function StatusesMasterPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("code");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("statuses")
      .select("*")
      .order("created_at");
    if (error) {
      setError(error.message);
    } else {
      setStatuses(data || []);
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

  const sortedStatuses = [...statuses].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
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
      color: form.color,
    };

    if (editingId) {
      const { error } = await supabase
        .from("statuses")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("statuses").insert(payload);
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
    if (!confirm("このステータスを削除しますか？")) return;
    const { error } = await supabase.from("statuses").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchData();
  };

  const startEdit = (status: Status) => {
    setEditingId(status.id);
    setIsAdding(false);
    setForm({
      code: status.code,
      name: status.name,
      color: status.color,
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
      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={14} className={sortKey === field ? "text-indigo-600" : "text-gray-400"} />
      </div>
    </th>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">ステータスマスタ管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            ステータスの追加・編集・削除
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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-semibold mb-4">
            {editingId ? "ステータスを編集" : "新規ステータスを追加"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                コード <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="active"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="在籍"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カラー
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-500">{form.color}</span>
              </div>
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
              キャンセル
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">読み込み中...</div>
      ) : statuses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          ステータスが登録されていません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortHeader label="コード" field="code" />
                <SortHeader label="名称" field="name" />
                <SortHeader label="カラー" field="color" />
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStatuses.map((status) => (
                <tr
                  key={status.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{status.code}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-gray-500">{status.color}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(status)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(status.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
