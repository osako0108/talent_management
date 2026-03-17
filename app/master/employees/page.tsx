"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, Search, AlertTriangle, RefreshCw } from "lucide-react";

type Department = { id: string; name: string };

type Employee = {
  id: string;
  name: string;
  name_kana: string;
  role: string;
  department_id: string | null;
  grade: string;
  join_date: string | null;
  email: string;
  avatar: string;
  status: string;
  departments?: { name: string } | null;
};

const grades = ["J1", "J2", "J3", "S1", "S2", "M1", "M2", "M3", "M4"];
const statuses = [
  { value: "active", label: "在籍" },
  { value: "onLeave", label: "休職中" },
  { value: "remote", label: "リモート" },
];

const emptyForm = {
  name: "",
  name_kana: "",
  role: "",
  department_id: "" as string,
  grade: "J1",
  join_date: "",
  email: "",
  avatar: "",
  status: "active",
};

export default function EmployeesMasterPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setConnectionError(false);
    try {
      const [empRes, deptRes] = await Promise.all([
        supabase
          .from("employees")
          .select("*, departments(name)")
          .order("created_at"),
        supabase.from("departments").select("id, name").order("name"),
      ]);
      if (empRes.error) {
        setError(empRes.error.message);
        if (empRes.error.message.includes("fetch") || empRes.error.code === "PGRST301") {
          setConnectionError(true);
        }
      } else {
        setEmployees(empRes.data || []);
      }
      if (deptRes.error) {
        setError(deptRes.error.message);
      } else {
        setDepartments(deptRes.data || []);
      }
      if (!empRes.error && !deptRes.error) setError("");
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
      setError("名前は必須です");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        name_kana: form.name_kana,
        role: form.role,
        department_id: form.department_id || null,
        grade: form.grade,
        join_date: form.join_date || null,
        email: form.email,
        avatar: form.avatar || form.name.charAt(0) || "?",
        status: form.status,
      };

      if (editingId) {
        const { error } = await supabase
          .from("employees")
          .update(payload)
          .eq("id", editingId);
        if (error) { setError(error.message); setSaving(false); return; }
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) { setError(error.message); setSaving(false); return; }
      }

      setEditingId(null);
      setIsAdding(false);
      setForm(emptyForm);
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この従業員を削除しますか？関連データ（スキル・パフォーマンス等）も削除されます。"))
      return;
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) { setError(error.message); return; }
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setIsAdding(false);
    setForm({
      name: emp.name ?? "",
      name_kana: emp.name_kana ?? "",
      role: emp.role ?? "",
      department_id: emp.department_id || "",
      grade: emp.grade ?? "J1",
      join_date: emp.join_date || "",
      email: emp.email ?? "",
      avatar: emp.avatar ?? "",
      status: emp.status ?? "active",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setError("");
  };

  const filtered = employees.filter((emp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (emp.name ?? "").toLowerCase().includes(q) ||
      (emp.name_kana ?? "").toLowerCase().includes(q) ||
      (emp.role ?? "").toLowerCase().includes(q) ||
      (emp.email ?? "").toLowerCase().includes(q)
    );
  });

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      onLeave: "bg-yellow-100 text-yellow-800",
      remote: "bg-blue-100 text-blue-800",
    };
    const labelMap: Record<string, string> = {
      active: "在籍",
      onLeave: "休職中",
      remote: "リモート",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}
      >
        {labelMap[status] || status || "-"}
      </span>
    );
  };

  if (connectionError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">スタッフマスタ管理</h1>
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-amber-800 mb-2">Supabaseに接続できません</h2>
              <p className="text-sm text-amber-700 mb-3">{error}</p>
              <ul className="text-sm text-amber-700 space-y-1 mb-4">
                <li>1. .env.local に NEXT_PUBLIC_SUPABASE_URL を設定済みか</li>
                <li>2. .env.local に NEXT_PUBLIC_SUPABASE_ANON_KEY を設定済みか</li>
                <li>3. Supabase ダッシュボードで migration.sql を実行済みか</li>
                <li>4. 開発サーバーを再起動したか（env変更後は必要）</li>
              </ul>
              <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm">
                <RefreshCw size={16} /> 再接続
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
          <h1 className="text-2xl font-bold">スタッフマスタ管理</h1>
          <p className="text-gray-500 text-sm mt-1">
            従業員の追加・編集・削除
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
            {editingId ? "従業員を編集" : "新規従業員を追加"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="田中 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名前（カナ）
              </label>
              <input
                type="text"
                value={form.name_kana}
                onChange={(e) =>
                  setForm({ ...form, name_kana: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="たなか たろう"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                役職
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="エンジニア"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                部署
              </label>
              <select
                value={form.department_id}
                onChange={(e) =>
                  setForm({ ...form, department_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">未所属</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                グレード
              </label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                入社日
              </label>
              <input
                type="date"
                value={form.join_date}
                onChange={(e) =>
                  setForm({ ...form, join_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メール
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="tanaka@company.co.jp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                アバター（1文字）
              </label>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) =>
                  setForm({ ...form, avatar: e.target.value.slice(0, 1) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={1}
                placeholder="田"
              />
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery
            ? "該当する従業員が見つかりません"
            : "従業員が登録されていません"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  名前
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  役職
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  部署
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  グレード
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  ステータス
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                  入社日
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">
                        {emp.avatar || (emp.name ? emp.name.charAt(0) : "?")}
                      </div>
                      <div>
                        <div className="font-medium">{emp.name || "-"}</div>
                        <div className="text-xs text-gray-400">
                          {emp.name_kana || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{emp.role || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {emp.departments?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{emp.grade || "-"}</td>
                  <td className="px-4 py-3">{statusBadge(emp.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {emp.join_date || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(emp)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
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
