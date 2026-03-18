"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type Role = {
  id: string;
  name: string;
  description: string;
};

const emptyForm = {
  name: "",
  description: "",
};

type SortKey = "name" | "description";
type SortOrder = "asc" | "desc" | null;

export default function RolesMasterPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("created_at");
    if (error) {
      setError(error.message);
    } else {
      setRoles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("役職名は必須です");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("roles")
        .update(form)
        .eq("id", editingId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("roles").insert(form);
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
    if (!confirm("この役職を削除しますか？")) return;
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchData();
  };

  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setIsAdding(false);
    setForm({
      name: role.name,
      description: role.description,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setError("");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortKey(null);
        setSortOrder(null);
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return null;
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="inline ml-1" />
    ) : (
      <ArrowDown size={14} className="inline ml-1" />
    );
  };

  const filtered = roles.filter(
    (role) =>
      role.name.includes(searchQuery) ||
      role.description.includes(searchQuery)
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey || !sortOrder) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp = aVal.localeCompare(bVal, "ja");
    return sortOrder === "asc" ? cmp : -cmp;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">役職マスタ管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            役職の追加・編集・削除
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
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
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h2 className="font-semibold mb-4">
            {editingId ? "役職を編集" : "新規役職を追加"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                役職名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="エンジニア"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="役職の説明"
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
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery
            ? "該当する役職が見つかりません"
            : "役職が登録されていません"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort("name")}
                >
                  役職名{sortIcon("name")}
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => handleSort("description")}
                >
                  説明{sortIcon("description")}
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{role.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {role.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(role)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
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
