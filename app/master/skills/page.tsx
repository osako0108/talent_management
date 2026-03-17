"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2, Save, X, Tag } from "lucide-react";

type SkillCategory = {
  id: string;
  name: string;
};

type SkillMaster = {
  id: string;
  name: string;
  category_id: string;
  skill_categories?: { name: string };
};

export default function SkillsMasterPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<SkillMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Category form
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");

  // Skill form
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillCategoryId, setSkillCategoryId] = useState("");

  // Filter
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [catRes, skillRes] = await Promise.all([
      supabase.from("skill_categories").select("*").order("name"),
      supabase
        .from("skill_masters")
        .select("*, skill_categories(name)")
        .order("name"),
    ]);
    if (catRes.error) setError(catRes.error.message);
    else setCategories(catRes.data || []);
    if (skillRes.error) setError(skillRes.error.message);
    else setSkills(skillRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category CRUD
  const saveCategory = async () => {
    setError("");
    if (!catName.trim()) {
      setError("カテゴリ名は必須です");
      return;
    }
    if (editingCatId) {
      const { error } = await supabase
        .from("skill_categories")
        .update({ name: catName })
        .eq("id", editingCatId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("skill_categories")
        .insert({ name: catName });
      if (error) {
        setError(error.message);
        return;
      }
    }
    setCatFormOpen(false);
    setEditingCatId(null);
    setCatName("");
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("このカテゴリと紐づくスキルも削除されます。よろしいですか？"))
      return;
    const { error } = await supabase
      .from("skill_categories")
      .delete()
      .eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchData();
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
    const payload = { name: skillName, category_id: skillCategoryId };
    if (editingSkillId) {
      const { error } = await supabase
        .from("skill_masters")
        .update(payload)
        .eq("id", editingSkillId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("skill_masters").insert(payload);
      if (error) {
        setError(error.message);
        return;
      }
    }
    setSkillFormOpen(false);
    setEditingSkillId(null);
    setSkillName("");
    setSkillCategoryId("");
    fetchData();
  };

  const deleteSkill = async (id: string) => {
    if (!confirm("このスキルを削除しますか？")) return;
    const { error } = await supabase
      .from("skill_masters")
      .delete()
      .eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    fetchData();
  };

  const filteredSkills = filterCategoryId
    ? skills.filter((s) => s.category_id === filterCategoryId)
    : skills;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">スキルマスタ管理</h1>
      <p className="text-gray-500 text-sm mb-6">
        スキルカテゴリとスキルの追加・編集・削除
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Skill Categories Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
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
          <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="技術"
              />
            </div>
            <button
              onClick={saveCategory}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              <Save size={16} />
              保存
            </button>
            <button
              onClick={() => {
                setCatFormOpen(false);
                setEditingCatId(null);
                setCatName("");
                setError("");
              }}
              className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm"
            >
              <span>{cat.name}</span>
              <button
                onClick={() => {
                  setCatFormOpen(true);
                  setEditingCatId(cat.id);
                  setCatName(cat.name);
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
      </div>

      {/* Skills Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">スキル一覧</h2>
          <div className="flex items-center gap-3">
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
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
          <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  スキル名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="TypeScript"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  value={skillCategoryId}
                  onChange={(e) => setSkillCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Save size={16} />
                保存
              </button>
              <button
                onClick={() => {
                  setSkillFormOpen(false);
                  setEditingSkillId(null);
                  setError("");
                }}
                className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            スキルが登録されていません
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    スキル名
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                    カテゴリ
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map((skill) => (
                  <tr
                    key={skill.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium">{skill.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {skill.skill_categories?.name || ""}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSkillFormOpen(true);
                            setEditingSkillId(skill.id);
                            setSkillName(skill.name);
                            setSkillCategoryId(skill.category_id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="編集"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => deleteSkill(skill.id)}
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
    </div>
  );
}
