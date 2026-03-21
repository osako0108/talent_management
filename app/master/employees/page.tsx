"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, Search } from "lucide-react";

type Department = { id: string; name: string };
type Role = { id: string; name: string };
type GradeMaster = { id: string; code: string; name: string; rank_order: number };
type StatusMaster = { id: string; code: string; name: string; color: string };

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

const fallbackGrades = ["J1", "J2", "J3", "S1", "S2", "M1", "M2", "M3", "M4"];
const fallbackStatuses = [
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [gradeMasters, setGradeMasters] = useState<GradeMaster[]>([]);
  const [statusMasters, setStatusMasters] = useState<StatusMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomRole, setShowCustomRole] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const gradeOptions = gradeMasters.length > 0
    ? gradeMasters.map((g) => g.code)
    : fallbackGrades;

  const statusOptions = statusMasters.length > 0
    ? statusMasters.map((s) => ({ value: s.code, label: s.name }))
    : fallbackStatuses;

  const fetchData = async () => {
    setLoading(true);
    const [empRes, deptRes, roleRes, gradeRes, statusRes] = await Promise.all([
      supabase
        .from("employees")
        .select("*, departments(name)")
        .order("created_at"),
      supabase.from("departments").select("id, name").order("name"),
      supabase.from("roles").select("id, name").order("name"),
      supabase.from("grades").select("*").order("rank_order"),
      supabase.from("statuses").select("*").order("created_at"),
    ]);
    if (empRes.error) setError(empRes.error.message);
    else setEmployees(empRes.data || []);
    if (deptRes.error) setError(deptRes.error.message);
    else setDepartments(deptRes.data || []);
    if (roleRes.error) setError(roleRes.error.message);
    else setRoles(roleRes.data || []);
    if (gradeRes.data) setGradeMasters(gradeRes.data);
    if (statusRes.data) setStatusMasters(statusRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("名前は必須です");
      return;
    }

    const payload = {
      name: form.name,
      name_kana: form.name_kana,
      role: form.role,
      department_id: form.department_id || null,
      grade: form.grade,
      join_date: form.join_date || null,
      email: form.email,
      avatar: form.avatar || form.name.charAt(0),
      status: form.status,
    };

    if (editingId) {
      const { error } = await supabase
        .from("employees")
        .update(payload)
        .eq("id", editingId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("employees").insert(payload);
      if (error) {
        setError(error.message);
        return;
      }
    }

    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setShowCustomRole(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この従業員を削除しますか？関連データも削除されます。"))
      return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchData();
  };

  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setIsAdding(false);
    const isCustomRole = emp.role !== "" && !roles.some((r) => r.name === emp.role);
    setShowCustomRole(isCustomRole);
    setForm({
      name: emp.name,
      name_kana: emp.name_kana,
      role: emp.role,
      department_id: emp.department_id || "",
      grade: emp.grade,
      join_date: emp.join_date || "",
      email: emp.email,
      avatar: emp.avatar,
      status: emp.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setShowCustomRole(false);
    setError("");
  };

  const filtered = employees.filter(
    (emp) =>
      emp.name.includes(searchQuery) ||
      emp.name_kana.includes(searchQuery) ||
      emp.role.includes(searchQuery) ||
      emp.email.includes(searchQuery)
  );

  const statusBadge = (status: string) => {
    const masterMatch = statusMasters.find((s) => s.code === status);
    if (masterMatch) {
      return (
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: masterMatch.color }}
        >
          {masterMatch.name}
        </span>
      );
    }
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
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ""}`}
      >
        {labelMap[status] || status}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">スタッフマスタ管理</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            従業員の追加・編集・削除
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="検索..."
              className="pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "従業員を編集" : "新規従業員を追加"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="田中 太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                名前（カナ）
              </label>
              <input
                type="text"
                value={form.name_kana}
                onChange={(e) =>
                  setForm({ ...form, name_kana: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="たなか たろう"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                役職
              </label>
              {showCustomRole ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="役職名を入力"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomRole(false);
                      setForm({ ...form, role: "" });
                    }}
                    className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg whitespace-nowrap"
                  >
                    一覧に戻す
                  </button>
                </div>
              ) : (
                <select
                  value={roles.some((r) => r.name === form.role) ? form.role : form.role === "" ? "" : "__other__"}
                  onChange={(e) => {
                    if (e.target.value === "__other__") {
                      setShowCustomRole(true);
                      setForm({ ...form, role: "" });
                    } else {
                      setForm({ ...form, role: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">選択してください</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                  <option value="__other__">その他</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                部署
              </label>
              <select
                value={form.department_id}
                onChange={(e) =>
                  setForm({ ...form, department_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                グレード
              </label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ステータス
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                入社日
              </label>
              <input
                type="date"
                value={form.join_date}
                onChange={(e) =>
                  setForm({ ...form, join_date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                メール
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="tanaka@company.co.jp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                アバター（1文字）
              </label>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) =>
                  setForm({ ...form, avatar: e.target.value.slice(0, 1) })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                maxLength={1}
                placeholder="田"
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchQuery
            ? "該当する従業員が見つかりません"
            : "従業員が登録されていません"}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  名前
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  役職
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  部署
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  グレード
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  ステータス
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  入社日
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {emp.avatar && (emp.avatar.startsWith("data:image") || emp.avatar.startsWith("http")) ? (
                        <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold">
                          {emp.avatar || emp.name.charAt(0) || "?"}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {emp.name_kana}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{emp.role}</td>
                  <td className="px-4 py-3 text-sm">
                    {emp.departments?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">{emp.grade}</td>
                  <td className="px-4 py-3">{statusBadge(emp.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {emp.join_date || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(emp)}
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
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
