"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, Search, AlertTriangle, RefreshCw, Upload, ArrowUp, ArrowDown, ArrowUpDown, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { InlineLoading } from "@/components/LoadingSpinner";

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

type SortKey = "name" | "role" | "department" | "grade" | "status" | "join_date";
type SortDir = "asc" | "desc";

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

const MAX_IMAGE_SIZE = 500 * 1024; // 500KB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Supabaseエラーをユーザー向けメッセージに変換 */
function toUserError(error: { code?: string; message?: string }, context: "fetch" | "save" | "delete"): string {
  if (error.code === "23505") return "同じデータが既に存在します";
  if (error.code === "23503") return "関連データが存在するため操作できません";
  const labels = { fetch: "データの取得", save: "保存", delete: "削除" };
  return `${labels[context]}に失敗しました。しばらくしてから再度お試しください。`;
}

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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

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
        setError(toUserError(empRes.error, "fetch"));
        if (empRes.error.message?.includes("fetch") || empRes.error.code === "PGRST301") {
          setConnectionError(true);
        }
      } else {
        setEmployees(empRes.data || []);
      }
      if (deptRes.error) {
        setError(toUserError(deptRes.error, "fetch"));
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPG、PNG、GIF、WebP形式の画像ファイルを選択してください");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("画像サイズは500KB以下にしてください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImagePreview(dataUrl);
      setForm({ ...form, avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm({ ...form, avatar: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isImageAvatar = (avatar: string) => {
    return avatar && (avatar.startsWith("data:image") || avatar.startsWith("http"));
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("名前は必須です");
      return;
    }
    if (form.email && !EMAIL_REGEX.test(form.email)) {
      setError("有効なメールアドレスを入力してください");
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
        if (error) { setError(toUserError(error, "save")); setSaving(false); return; }
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) { setError(toUserError(error, "save")); setSaving(false); return; }
      }

      setEditingId(null);
      setIsAdding(false);
      setForm(emptyForm);
      setImagePreview(null);
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
      if (error) { setError(toUserError(error, "delete")); return; }
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
    setImagePreview(isImageAvatar(emp.avatar) ? emp.avatar : null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setImagePreview(null);
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

  // Sorting
  const gradeOrder = (g: string) => grades.indexOf(g);

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "ja");
        break;
      case "role":
        cmp = (a.role ?? "").localeCompare(b.role ?? "", "ja");
        break;
      case "department":
        cmp = (a.departments?.name ?? "").localeCompare(b.departments?.name ?? "", "ja");
        break;
      case "grade":
        cmp = gradeOrder(a.grade) - gradeOrder(b.grade);
        break;
      case "status":
        cmp = (a.status ?? "").localeCompare(b.status ?? "");
        break;
      case "join_date":
        cmp = (a.join_date ?? "").localeCompare(b.join_date ?? "");
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paged = sorted.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Reset to page 1 when search or sort changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortKey, sortDir]);

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

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      onLeave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      remote: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    const labelMap: Record<string, string> = {
      active: "在籍",
      onLeave: "休職中",
      remote: "リモート",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}
      >
        {labelMap[status] || status || "-"}
      </span>
    );
  };

  if (connectionError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">スタッフマスタ管理</h1>
        <div className="p-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Supabaseに接続できません</h2>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">{error}</p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1 mb-4">
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
          <h1 className="text-2xl font-bold dark:text-gray-100">スタッフマスタ管理</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
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
              className="pl-9 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          {!isAdding && !editingId && (
            <button
              onClick={() => {
                setIsAdding(true);
                setForm(emptyForm);
                setImagePreview(null);
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
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="font-semibold mb-4 dark:text-gray-100">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="たなか たろう"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                役職
              </label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="エンジニア"
              />
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              >
                {grades.map((g) => (
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              >
                {statuses.map((s) => (
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="tanaka@company.co.jp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                プロフィール画像
              </label>
              <div className="flex items-center gap-3">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-600">
                    <ImageIcon size={20} />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-300"
                  >
                    <Upload size={14} />
                    画像を選択
                  </button>
                  <p className="text-xs text-gray-400 mt-1">500KB以下のJPG/PNG</p>
                </div>
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
      ) : paged.length === 0 && sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {searchQuery
            ? "該当する従業員が見つかりません"
            : "従業員が登録されていません"}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    名前 <SortIcon col="name" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("role")}
                >
                  <div className="flex items-center gap-1">
                    役職 <SortIcon col="role" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("department")}
                >
                  <div className="flex items-center gap-1">
                    部署 <SortIcon col="department" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("grade")}
                >
                  <div className="flex items-center gap-1">
                    グレード <SortIcon col="grade" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    ステータス <SortIcon col="status" />
                  </div>
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                  onClick={() => toggleSort("join_date")}
                >
                  <div className="flex items-center gap-1">
                    入社日 <SortIcon col="join_date" />
                  </div>
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isImageAvatar(emp.avatar) ? (
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {emp.avatar || (emp.name ? emp.name.charAt(0) : "?")}
                        </div>
                      )}
                      <div>
                        <div className="font-medium dark:text-gray-100">{emp.name || "-"}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {emp.name_kana || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{emp.role || "-"}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">
                    {emp.departments?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-300">{emp.grade || "-"}</td>
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

      {/* Pagination */}
      {!loading && sorted.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{sorted.length}件中 {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, sorted.length)}件を表示</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="ml-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-100"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}件/ページ</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dot-${i}`} className="px-2 text-gray-400 dark:text-gray-500 text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                      currentPage === p
                        ? "bg-indigo-600 text-white"
                        : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
