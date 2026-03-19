"use client";

import { useState, useRef, useEffect } from "react";
import { useAppData } from "@/lib/useAppData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PageLoading } from "@/components/LoadingSpinner";
import { statusLabels, statusColors } from "@/lib/data";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, X, Plus, Pencil, Trash2, Save, Upload, ImageIcon } from "lucide-react";

type SortKey = "name" | "role" | "department" | "grade" | "joinDate" | "score";
type SortDir = "asc" | "desc";

const grades = ["J1", "J2", "J3", "S1", "S2", "M1", "M2", "M3", "M4"];
const gradeOrder = (g: string) => grades.indexOf(g);

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
  left_date: "",
  email: "",
  avatar: "",
  status: "active",
  salary: 0,
};

const MAX_IMAGE_SIZE = 500 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[120px] dark:bg-gray-700 dark:text-gray-100"
      >
        <span className="text-gray-700 dark:text-gray-200">
          {selected.length === 0
            ? label
            : `${label} (${selected.length})`}
        </span>
        <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
      </button>
      {selected.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange([]);
          }}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white rounded-full flex items-center justify-center"
        >
          <X size={10} />
        </button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="dark:text-gray-200">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

type SupaDepartment = { id: string; name: string };

export default function EmployeesPage() {
  const { employees, departments, loading, refetch } = useAppData();
  const [search, setSearch] = useState("");
  const [deptFilters, setDeptFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [gradeFilters, setGradeFilters] = useState<string[]>([]);
  const [showRetired, setShowRetired] = useState(false);

  // CRUD state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [supaDepts, setSupaDepts] = useState<SupaDepartment[]>([]);

  // Fetch supabase departments for the form (need id for department_id)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("departments")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setSupaDepts(data);
      });
  }, []);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const isRetired = (emp: { leftDate: string }) => !!emp.leftDate;

  const filtered = employees.filter((emp) => {
    // Hide retired by default
    if (!showRetired && isRetired(emp)) return false;

    const matchSearch =
      !search ||
      emp.name.includes(search) ||
      emp.role.includes(search) ||
      emp.skills.some((s) => s.name.includes(search));
    const matchDept =
      deptFilters.length === 0 || deptFilters.includes(emp.department);
    const matchStatus =
      statusFilters.length === 0 || statusFilters.includes(emp.status);
    const matchGrade =
      gradeFilters.length === 0 || gradeFilters.includes(emp.grade);
    return matchSearch && matchDept && matchStatus && matchGrade;
  });

  const activeCount = employees.filter((e) => !isRetired(e)).length;

  const getScore = (emp: (typeof employees)[0]) =>
    emp.performance.find((p) => p.year === 2024)?.score ?? 0;

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = a.name.localeCompare(b.name, "ja");
        break;
      case "role":
        cmp = a.role.localeCompare(b.role, "ja");
        break;
      case "department":
        cmp = a.department.localeCompare(b.department, "ja");
        break;
      case "grade":
        cmp = gradeOrder(a.grade) - gradeOrder(b.grade);
        break;
      case "joinDate":
        cmp = a.joinDate.localeCompare(b.joinDate);
        break;
      case "score":
        cmp = getScore(a) - getScore(b);
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

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "name", label: "名前" },
    { key: "role", label: "役職" },
    { key: "department", label: "部署" },
    { key: "grade", label: "グレード" },
    { key: "joinDate", label: "入社日" },
    { key: "score", label: "パフォーマンス" },
  ];

  const deptOptions = departments.map((d) => ({
    value: d.name,
    label: d.name,
  }));

  const statusOptions = [
    { value: "active", label: "在籍" },
    { value: "remote", label: "リモート" },
    { value: "onLeave", label: "休職中" },
  ];

  const gradeOptions = grades.map((g) => ({ value: g, label: g }));

  const activeFilterCount = deptFilters.length + statusFilters.length + gradeFilters.length;

  // Image handling
  const isImageAvatar = (avatar: string) => {
    return avatar && (avatar.startsWith("data:image") || avatar.startsWith("http"));
  };

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

  // CRUD handlers
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
    if (!isSupabaseConfigured) {
      setError("Supabaseが設定されていないため保存できません");
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
        left_date: form.left_date || null,
        email: form.email,
        avatar: form.avatar || form.name.charAt(0) || "?",
        status: form.status,
        salary: form.salary,
      };

      if (editingId) {
        const { error } = await supabase
          .from("employees")
          .update(payload)
          .eq("id", editingId);
        if (error) {
          setError("保存に失敗しました。しばらくしてから再度お試しください。");
          setSaving(false);
          return;
        }
      } else {
        const { error } = await supabase.from("employees").insert(payload);
        if (error) {
          setError("保存に失敗しました。しばらくしてから再度お試しください。");
          setSaving(false);
          return;
        }
      }

      setEditingId(null);
      setIsAdding(false);
      setForm(emptyForm);
      setImagePreview(null);
      refetch();
    } catch {
      setError("保存に失敗しました");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？関連データ（スキル・パフォーマンス等）も削除されます。`)) return;
    if (!isSupabaseConfigured) {
      setError("Supabaseが設定されていないため削除できません");
      return;
    }
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) {
        setError("削除に失敗しました。しばらくしてから再度お試しください。");
        return;
      }
      refetch();
    } catch {
      setError("削除に失敗しました");
    }
  };

  const startEdit = (emp: (typeof employees)[0]) => {
    // We need to look up department_id from the department name
    const deptMatch = supaDepts.find((d) => d.name === emp.department);
    setEditingId(emp.id);
    setIsAdding(false);
    setForm({
      name: emp.name ?? "",
      name_kana: emp.nameKana ?? "",
      role: emp.role ?? "",
      department_id: deptMatch?.id || "",
      grade: emp.grade ?? "J1",
      join_date: emp.joinDate || "",
      left_date: emp.leftDate || "",
      email: emp.email ?? "",
      avatar: emp.avatar ?? "",
      status: emp.status ?? "active",
      salary: 0,
    });
    setImagePreview(isImageAvatar(emp.avatar) ? emp.avatar : null);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
    setImagePreview(null);
    setError("");
  };

  if (loading) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">従業員管理</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {activeCount}名の従業員情報を管理・検索
          </p>
        </div>
        {!isAdding && !editingId && isSupabaseConfigured && (
          <button
            onClick={() => {
              setIsAdding(true);
              setForm(emptyForm);
              setImagePreview(null);
              setError("");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            従業員を追加
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Inline Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
                onChange={(e) => setForm({ ...form, name_kana: e.target.value })}
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
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">未所属</option>
                {supaDepts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
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
                  <option key={g} value={g}>{g}</option>
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
                  <option key={s.value} value={s.value}>{s.label}</option>
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
                onChange={(e) => setForm({ ...form, join_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                退職日
              </label>
              <input
                type="date"
                value={form.left_date}
                onChange={(e) => setForm({ ...form, left_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                人件費（円/年）
              </label>
              <input
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="5000000"
                min="0"
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="名前・役職・スキルで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <MultiSelectDropdown
            label="部署"
            options={deptOptions}
            selected={deptFilters}
            onChange={setDeptFilters}
          />
          <MultiSelectDropdown
            label="ステータス"
            options={statusOptions}
            selected={statusFilters}
            onChange={setStatusFilters}
          />
          <MultiSelectDropdown
            label="グレード"
            options={gradeOptions}
            selected={gradeFilters}
            onChange={setGradeFilters}
          />
        </div>

        {/* Retired toggle */}
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showRetired}
            onChange={(e) => setShowRetired(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
          />
          退職済を含む
        </label>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">並び替え:</span>
          <div className="flex gap-1 flex-wrap">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleSort(opt.key)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                  sortKey === opt.key
                    ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {opt.label}
                {sortKey === opt.key ? (
                  sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                ) : (
                  <ArrowUpDown size={12} className="opacity-30" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">絞り込み中:</span>
          {deptFilters.map((d) => (
            <span key={`dept-${d}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
              {d}
              <button onClick={() => setDeptFilters(deptFilters.filter((v) => v !== d))}><X size={10} /></button>
            </span>
          ))}
          {statusFilters.map((s) => (
            <span key={`status-${s}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
              {statusLabels[s] || s}
              <button onClick={() => setStatusFilters(statusFilters.filter((v) => v !== s))}><X size={10} /></button>
            </span>
          ))}
          {gradeFilters.map((g) => (
            <span key={`grade-${g}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
              {g}
              <button onClick={() => setGradeFilters(gradeFilters.filter((v) => v !== g))}><X size={10} /></button>
            </span>
          ))}
          <button
            onClick={() => { setDeptFilters([]); setStatusFilters([]); setGradeFilters([]); }}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
          >
            すべて解除
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {sorted.length}件表示 / {activeCount}件中
        {showRetired && ` (退職済含む: ${employees.length}件)`}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((emp) => {
          const score = getScore(emp);
          const retired = isRetired(emp);
          return (
            <div key={emp.id} className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5 transition-all ${retired ? "border-gray-300 dark:border-gray-600 opacity-75" : "border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-600"}`}>
              <div className="flex items-start gap-4">
                <Link href={`/employees/${emp.id}`} className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {emp.avatar && (emp.avatar.startsWith("data:image") || emp.avatar.startsWith("http")) ? (
                      <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-lg font-bold text-indigo-700 dark:text-indigo-300">
                        {emp.avatar || emp.name.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/employees/${emp.id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors">
                        {emp.name}
                      </h3>
                    </Link>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[emp.status]}`}
                    >
                      {statusLabels[emp.status]}
                    </span>
                    {retired && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        退職済
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{emp.role}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {emp.department} · {emp.grade}
                  </p>
                </div>
                {/* Edit/Delete actions */}
                {isSupabaseConfigured && !isAdding && !editingId && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => { e.preventDefault(); startEdit(emp); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                      title="編集"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(emp.id, emp.name); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <Link href={`/employees/${emp.id}`}>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill.name}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {emp.skills.length > 4 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        +{emp.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-gray-700 pt-3">
                  <span>入社: {emp.joinDate.slice(0, 7)}{retired && ` / 退職: ${emp.leftDate}`}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="font-medium text-indigo-600">
                      {score}点
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>該当する従業員が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
}
