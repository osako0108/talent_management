"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAppData } from "@/lib/useAppData";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PageLoading } from "@/components/LoadingSpinner";
import { Plus, Pencil, Trash2, Save, X, Tag, ChevronDown, ChevronUp } from "lucide-react";

const LEVEL_LABELS = ["", "入門", "基礎", "中級", "上級", "エキスパート"];
const LEVEL_BG = [
  "",
  "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "bg-indigo-600 text-white",
];

type SkillCategory = { id: string; name: string };
type SkillMaster = {
  id: string;
  name: string;
  category_id: string;
  skill_categories?: { name: string } | null;
};

/** Supabaseエラーをユーザー向けメッセージに変換 */
function toUserError(error: { code?: string; message?: string }, context: "save" | "delete"): string {
  if (error.code === "23505") {
    return context === "save" ? "同じ名前が既に存在します" : "重複エラーが発生しました";
  }
  if (error.code === "23503") return "関連データが存在するため操作できません";
  const labels = { save: "保存", delete: "削除" };
  return `${labels[context]}に失敗しました。しばらくしてから再度お試しください。`;
}

export default function SkillsPage() {
  const { employees, departments, skillCategories, loading, refetch } = useAppData();
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [minLevel, setMinLevel] = useState(1);

  // CRUD state
  const [crudError, setCrudError] = useState("");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skillMasters, setSkillMasters] = useState<SkillMaster[]>([]);
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);

  // Category form
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");

  // Skill form
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillCategoryId, setSkillCategoryId] = useState("");

  // Fetch categories and skill masters from Supabase for CRUD forms
  const fetchCrudData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [catRes, skillRes] = await Promise.all([
        supabase.from("skill_categories").select("*").order("name"),
        supabase.from("skill_masters").select("*, skill_categories(name)").order("name"),
      ]);
      if (!catRes.error) setCategories(catRes.data || []);
      if (!skillRes.error) setSkillMasters(skillRes.data || []);
    } catch {
      // Supabase未接続時は無視
    }
  }, []);

  useEffect(() => {
    fetchCrudData();
  }, [fetchCrudData]);

  // Category CRUD
  const saveCategory = async () => {
    setCrudError("");
    if (!catName.trim()) {
      setCrudError("カテゴリ名は必須です");
      return;
    }
    setSaving(true);
    try {
      if (editingCatId) {
        const { error } = await supabase
          .from("skill_categories")
          .update({ name: catName })
          .eq("id", editingCatId);
        if (error) { setCrudError(toUserError(error, "save")); setSaving(false); return; }
      } else {
        const { error } = await supabase
          .from("skill_categories")
          .insert({ name: catName });
        if (error) {
          setCrudError(error.code === "23505" ? "同じ名前のカテゴリが既に存在します" : toUserError(error, "save"));
          setSaving(false);
          return;
        }
      }
      setCatFormOpen(false);
      setEditingCatId(null);
      setCatName("");
      fetchCrudData();
      refetch();
    } catch (e) {
      setCrudError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("このカテゴリと紐づくスキルも削除されます。よろしいですか？")) return;
    try {
      const { error } = await supabase.from("skill_categories").delete().eq("id", id);
      if (error) { setCrudError(toUserError(error, "delete")); return; }
      fetchCrudData();
      refetch();
    } catch {
      setCrudError("削除に失敗しました。しばらくしてから再度お試しください。");
    }
  };

  // Skill CRUD
  const saveSkill = async () => {
    setCrudError("");
    if (!skillName.trim()) {
      setCrudError("スキル名は必須です");
      return;
    }
    if (!skillCategoryId) {
      setCrudError("カテゴリを選択してください");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: skillName, category_id: skillCategoryId };
      if (editingSkillId) {
        const { error } = await supabase.from("skill_masters").update(payload).eq("id", editingSkillId);
        if (error) { setCrudError(toUserError(error, "save")); setSaving(false); return; }
      } else {
        const { error } = await supabase.from("skill_masters").insert(payload);
        if (error) {
          setCrudError(error.code === "23505" ? "同じカテゴリ内に同名のスキルが既に存在します" : toUserError(error, "save"));
          setSaving(false);
          return;
        }
      }
      setSkillFormOpen(false);
      setEditingSkillId(null);
      setSkillName("");
      setSkillCategoryId("");
      fetchCrudData();
      refetch();
    } catch (e) {
      setCrudError(e instanceof Error ? e.message : "保存に失敗しました");
    }
    setSaving(false);
  };

  const deleteSkill = async (id: string) => {
    if (!confirm("このスキルを削除しますか？")) return;
    try {
      const { error } = await supabase.from("skill_masters").delete().eq("id", id);
      if (error) { setCrudError(toUserError(error, "delete")); return; }
      fetchCrudData();
      refetch();
    } catch {
      setCrudError("削除に失敗しました。しばらくしてから再度お試しください。");
    }
  };

  // Find skill master ID by name for edit/delete on skill cards
  const findSkillMaster = (skillName: string): SkillMaster | undefined => {
    return skillMasters.find((sm) => sm.name === skillName);
  };

  // 全スキルを集計
  const allSkills = useMemo(() => {
    const map: Record<string, { category: string; holders: { name: string; dept: string; level: number; empId: string }[] }> = {};
    employees.forEach((emp) => {
      emp.skills.forEach((skill) => {
        if (!map[skill.name]) {
          map[skill.name] = { category: skill.category, holders: [] };
        }
        map[skill.name].holders.push({
          name: emp.name,
          dept: emp.department,
          level: skill.level,
          empId: emp.id,
        });
      });
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      category: data.category,
      holders: data.holders,
      avgLevel:
        data.holders.reduce((s, h) => s + h.level, 0) / data.holders.length,
      maxLevel: Math.max(...data.holders.map((h) => h.level)),
      count: data.holders.length,
    }));
  }, [employees]);

  const filtered = useMemo(
    () =>
      allSkills.filter((sk) => {
        const matchCat =
          categoryFilter === "all" || sk.category === categoryFilter;
        const matchDept =
          deptFilter === "all" ||
          sk.holders.some((h) => h.dept === deptFilter);
        const matchLevel = sk.maxLevel >= minLevel;
        return matchCat && matchDept && matchLevel;
      }),
    [allSkills, categoryFilter, deptFilter, minLevel]
  );

  // スキルマトリックス: 従業員 × スキル
  const matrixEmployees =
    deptFilter === "all"
      ? employees
      : employees.filter((e) => e.department === deptFilter);
  const matrixSkills = filtered.slice(0, 15); // 表示スキル数を制限

  if (loading) {
    return <PageLoading />;
  }

  const supabaseReady = isSupabaseConfigured && categories.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">スキルマトリックス</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">組織全体のスキル保有状況を可視化</p>
        </div>
        {supabaseReady && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSkillFormOpen(true);
                setEditingSkillId(null);
                setSkillName("");
                setSkillCategoryId(categories[0]?.id || "");
                setCrudError("");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              <Plus size={16} />
              スキルを追加
            </button>
            <button
              onClick={() => {
                setCategoryPanelOpen(!categoryPanelOpen);
                setCrudError("");
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              <Tag size={16} />
              カテゴリを管理
              {categoryPanelOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* Error display */}
      {crudError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {crudError}
        </div>
      )}

      {/* Skill add/edit form */}
      {skillFormOpen && supabaseReady && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {editingSkillId ? "スキルを編集" : "スキルを追加"}
          </h3>
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
                setCrudError("");
              }}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Category management panel */}
      {categoryPanelOpen && supabaseReady && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag size={16} />
              スキルカテゴリ管理
            </h3>
            {!catFormOpen && (
              <button
                onClick={() => {
                  setCatFormOpen(true);
                  setEditingCatId(null);
                  setCatName("");
                  setCrudError("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs"
              >
                <Plus size={14} />
                カテゴリを追加
              </button>
            )}
          </div>

          {catFormOpen && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-end gap-3">
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
                  setCrudError("");
                }}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {categories.length === 0 ? (
            <div className="text-gray-400 text-sm">カテゴリが登録されていません</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-sm dark:text-gray-200"
                >
                  <span>{cat.name || "(名称なし)"}</span>
                  <button
                    onClick={() => {
                      setCatFormOpen(true);
                      setEditingCatId(cat.id);
                      setCatName(cat.name ?? "");
                      setCrudError("");
                    }}
                    className="p-0.5 text-gray-400 hover:text-indigo-600"
                    title="編集"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-0.5 text-gray-400 hover:text-red-600"
                    title="削除"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="all">全カテゴリ</option>
          {skillCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="all">全部署</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">最低レベル:</span>
          {[1, 2, 3, 4, 5].map((lv) => (
            <button
              key={lv}
              onClick={() => setMinLevel(lv)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                minLevel === lv
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {lv}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((skill) => {
          const master = findSkillMaster(skill.name);
          return (
            <div
              key={skill.name}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {skill.name}
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{skill.category}</span>
                </div>
                <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                  <span className="text-lg font-bold text-indigo-600">
                    {skill.count}
                  </span>
                  {master && supabaseReady && (
                    <div className="flex items-center gap-0.5 ml-1">
                      <button
                        onClick={() => {
                          setSkillFormOpen(true);
                          setEditingSkillId(master.id);
                          setSkillName(master.name ?? "");
                          setSkillCategoryId(master.category_id ?? "");
                          setCrudError("");
                        }}
                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                        title="編集"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteSkill(master.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="削除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((lv) => (
                  <div
                    key={lv}
                    className={`h-1.5 flex-1 rounded-full ${
                      lv <= Math.round(skill.avgLevel)
                        ? "bg-indigo-500"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-1">
                {skill.holders.slice(0, 3).map((h) => (
                  <div
                    key={h.empId}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                      {h.name}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ml-1 ${LEVEL_BG[h.level]}`}
                    >
                      Lv{h.level}
                    </span>
                  </div>
                ))}
                {skill.holders.length > 3 && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    +{skill.holders.length - 3}名
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 overflow-x-auto">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
          スキル×メンバーマトリックス
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-2">
            （表示: 上位{matrixSkills.length}スキル）
          </span>
        </h2>
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-semibold text-gray-600 dark:text-gray-400 sticky left-0 bg-white dark:bg-gray-800 min-w-28">
                メンバー
              </th>
              {matrixSkills.map((sk) => (
                <th
                  key={sk.name}
                  className="text-center py-2 px-1 font-medium text-gray-500 dark:text-gray-400 min-w-16"
                >
                  <div className="writing-mode-vertical">{sk.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixEmployees.map((emp) => (
              <tr key={emp.id} className="border-t border-gray-50 dark:border-gray-700">
                <td className="py-2 pr-4 font-medium text-gray-800 dark:text-gray-200 sticky left-0 bg-white dark:bg-gray-800">
                  <div>{emp.name}</div>
                  <div className="text-gray-400 dark:text-gray-500 font-normal">
                    {emp.department}
                  </div>
                </td>
                {matrixSkills.map((sk) => {
                  const empSkill = emp.skills.find((s) => s.name === sk.name);
                  return (
                    <td key={sk.name} className="text-center py-2 px-1">
                      {empSkill ? (
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto ${LEVEL_BG[empSkill.level]}`}
                          title={LEVEL_LABELS[empSkill.level]}
                        >
                          {empSkill.level}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-900 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {[1, 2, 3, 4, 5].map((lv) => (
            <div key={lv} className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${LEVEL_BG[lv]}`}
              >
                {lv}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{LEVEL_LABELS[lv]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
