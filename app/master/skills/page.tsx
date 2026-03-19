"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, Tag, AlertTriangle, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { InlineLoading, LoadingSpinner } from "@/components/LoadingSpinner";

type SkillCategory = {
  id: string;
  name: string;
};

type SkillMaster = {
  id: string;
  name: string;
  category_id: string;
  skill_categories?: { name: string } | null;
};

type SortKey = "name" | "category";
type SortDir = "asc" | "desc";

/** Supabaseエラーをユーザー向けメッセージに変換 */
function toUserError(error: { code?: string; message?: string }, context: "fetch" | "save" | "delete"): string {
  if (error.code === "23505") {
    return context === "save" ? "同じ名前が既に存在します" : "重複エラーが発生しました";
  }
  if (error.code === "23503") return "関連データが存在するため操作できません";
  const labels = { fetch: "データの取得", save: "保存", delete: "削除" };
  return `${labels[context]}に失敗しました。しばらくしてから再度お試しください。`;
}

export default function SkillsMasterPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<SkillMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionError, setConnectionError] = useState(false);

  // Category form
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");

  // Skill form
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillCategoryId, setSkillCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterCategoryId, setFilterCategoryId] = useState("");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setConnectionError(false);
    try {
      const [catRes, skillRes] = await Promise.all([
        supabase.from("skill_categories").select("*").order("name"),
        supabase
          .from("skill_masters")
          .select("*, skill_categories(name)")
          .order("name"),
      ]);
      if (catRes.error) {
        setError(toUserError(catRes.error, "fetch"));
        if (catRes.error.message?.includes("fetch") || catRes.error.code === "PGRST301") {
          setConnectionError(true);
        }
      } else {
        setCategories(catRes.data || []);
      }
      if (skillRes.error) {
        setError(toUserError(skillRes.error, "fetch"));
      } else {
        setSkills(skillRes.data || []);
      }
      if (!catRes.error && !skillRes.error) setError("");
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

  // Category CRUD
  const saveCategory = async () => {
    setError("");
    if (!catName.trim()) {
      setError("カテゴリ名は必須です");
      return;
    }
    setSaving(true);
    try {
      if (editingCatId) {
        const { error } = await supabase
          .from("skill_categories")
          .update({ name: catName })
          .eq("id", editingCatId);
        if (error) { setError(toUserError(error, "save")); setSaving(false); return; }
      } else {
        const { error } = await supabase
          .from("skill_categories")
          .insert({ name: catName });
        if (error) {
          setError(error.code === "23505" ? "同じ名前のカテゴリが既に存在します" : toUserError(error, "save"));
          setSaving(false);
          return;
        }
      }
      setCatFormOpen(false);
      setEditingCatId(null);
      setCatName("");
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("このカテゴリと紐づくスキルも削除されます。よろしいですか？"))
      return;
    try {
      const { error } = await supabase
        .from("skill_categories")
        .delete()
        .eq("id", id);
      if (error) { setError(toUserError(error, "delete")); return; }
      fetchData();
    } catch (e) {
      setError("削除に失敗しました。しばらくしてから再度お試しください。");
    }
  };

  // Skill CRUD
  const saveSkill = async () => {
    setError("");
    if (!skillName.trim()) {
      setError("スキル名は必須です");
      return;
    }
    if (!skillCategoryId) {
      setError("カテゴリを選択してください");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: skillName, category_id: skillCategoryId };
      if (editingSkillId) {
        const { error } = await supabase
          .from("skill_masters")
          .update(payload)
          .eq("id", editingSkillId);
        if (error) { setError(toUserError(error, "save")); setSaving(false); return; }
      } else {
        const { error } = await supabase.from("skill_masters").insert(payload);
        if (error) {
          setError(error.code === "23505" ? "同じカテゴリ内に同名のスキルが既に存在します" : toUserError(error, "save"));
          setSaving(false);
          return;
        }
      }
      setSkillFormOpen(false);
      setEditingSkillId(null);
      setSkillName("");
      setSkillCategoryId("");
      fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const deleteSkill = async (id: string) => {
    if (!confirm("このスキルを削除しますか？")) return;
    try {
      const { error } = await supabase
        .from("skill_masters")
        .delete()
        .eq("id", id);
      if (error) { setError(toUserError(error, "delete")); return; }
      fetchData();
    } catch (e) {
      setError("削除に失敗しました。しばらくしてから再度お試しください。");
    }
  };

  const filteredSkills = filterCategoryId
    ? skills.filter((s) => s.category_id === filterCategoryId)
    : skills;

  // Sorting
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (!sortKey) return 0;
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = (a.name ?? "").localeCompare(b.name ?? "", "ja");
        break;
      case "category":
        cmp = (a.skill_categories?.name ?? "").localeCompare(b.skill_categories?.name ?? "", "ja");
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
        <h1 className="text-2xl font-bold mb-6 dark:text-gray-100">スキルマスタ管理</h1>
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
      <h1 className="text-2xl font-bold mb-1 dark:text-gray-100">スキルマスタ管理</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        スキルカテゴリとスキルの追加・編集・削除
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Skill Categories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 dark:text-gray-100">
            <Tag size={20} />
            スキルカテゴリ
          </h2>
          {!catFormOpen && (
            <button
              onClick={() => {
                setCatFormOpen(true);
                setEditingCatId(null);
                setCatName("");
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus size={16} />
              カテゴリ追加
            </button>
          )}
        </div>

        {catFormOpen && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                カテゴリ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="技術"
              />
            </div>
            <button
              onClick={saveCategory}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              onClick={() => {
                setCatFormOpen(false);
                setEditingCatId(null);
                setCatName("");
                setError("");
              }}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner size="sm" />
        ) : categories.length === 0 ? (
          <div className="text-gray-400 text-sm">カテゴリが登録されていません</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm dark:text-gray-200"
              >
                <span>{cat.name || "(名称なし)"}</span>
                <button
                  onClick={() => {
                    setCatFormOpen(true);
                    setEditingCatId(cat.id);
                    setCatName(cat.name ?? "");
                  }}
                  className="p-0.5 text-gray-400 hover:text-indigo-600"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-0.5 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold dark:text-gray-100">スキル一覧</h2>
          <div className="flex items-center gap-3">
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">全カテゴリ</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {!skillFormOpen && (
              <button
                onClick={() => {
                  setSkillFormOpen(true);
                  setEditingSkillId(null);
                  setSkillName("");
                  setSkillCategoryId(categories[0]?.id || "");
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Plus size={16} />
                スキル追加
              </button>
            )}
          </div>
        </div>

        {skillFormOpen && (
          <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  スキル名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="TypeScript"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  value={skillCategoryId}
                  onChange={(e) => setSkillCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">選択してください</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={saveSkill}
                disabled={saving}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? "保存中..." : "保存"}
              </button>
              <button
                onClick={() => {
                  setSkillFormOpen(false);
                  setEditingSkillId(null);
                  setError("");
                }}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <InlineLoading />
        ) : sortedSkills.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            スキルが登録されていません
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
                      スキル名 <SortIcon col="name" />
                    </div>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                    onClick={() => toggleSort("category")}
                  >
                    <div className="flex items-center gap-1">
                      カテゴリ <SortIcon col="category" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSkills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-3 font-medium dark:text-gray-100">{skill.name || "-"}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                        {skill.skill_categories?.name || "(未分類)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSkillFormOpen(true);
                            setEditingSkillId(skill.id);
                            setSkillName(skill.name ?? "");
                            setSkillCategoryId(skill.category_id ?? "");
                          }}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="編集"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id)}
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
    </div>
  );
}
