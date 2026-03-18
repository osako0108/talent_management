"use client";

import { useState, useMemo, useEffect } from "react";
import { employees, departments, skillCategories } from "@/lib/data";

const LEVEL_LABELS = ["", "入門", "基礎", "中級", "上級", "エキスパート"];
const LEVEL_BG = [
  "",
  "bg-gray-100 text-gray-500",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-600 text-white",
];

type SkillTag = {
  id: string;
  name: string;
  color: string;
};

type SkillMasterTag = {
  skill_master_id: string;
  skill_tag_id: string;
  skill_masters: { name: string };
  skill_tags: SkillTag;
};

// Default fallback tags when Supabase is not connected
const FALLBACK_TAGS: SkillTag[] = [
  { id: "1", name: "開発", color: "#6366f1" },
  { id: "2", name: "希少", color: "#f59e0b" },
  { id: "3", name: "必須", color: "#ef4444" },
  { id: "4", name: "新規", color: "#10b981" },
];

export default function SkillsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [minLevel, setMinLevel] = useState(1);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tags, setTags] = useState<SkillTag[]>(FALLBACK_TAGS);
  const [skillTagMap, setSkillTagMap] = useState<Record<string, SkillTag[]>>({});

  // Fetch tags from Supabase (with fallback)
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const [tagRes, mappingRes] = await Promise.all([
          supabase.from("skill_tags").select("*").order("name"),
          supabase
            .from("skill_master_tags")
            .select("skill_master_id, skill_tag_id, skill_masters(name), skill_tags(*)")
        ]);

        if (tagRes.data && tagRes.data.length > 0) {
          setTags(tagRes.data);
        }

        if (mappingRes.data) {
          const map: Record<string, SkillTag[]> = {};
          (mappingRes.data as unknown as SkillMasterTag[]).forEach((mt) => {
            const skillName = mt.skill_masters?.name;
            if (skillName && mt.skill_tags) {
              if (!map[skillName]) map[skillName] = [];
              map[skillName].push(mt.skill_tags);
            }
          });
          setSkillTagMap(map);
        }
      } catch {
        // Supabase not configured, use fallback tags
      }
    };
    fetchTags();
  }, []);

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
      tags: skillTagMap[name] || [],
    }));
  }, [skillTagMap]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const filtered = useMemo(
    () =>
      allSkills.filter((sk) => {
        const matchCat =
          categoryFilter === "all" || sk.category === categoryFilter;
        const matchDept =
          deptFilter === "all" ||
          sk.holders.some((h) => h.dept === deptFilter);
        const matchLevel = sk.maxLevel >= minLevel;
        const matchTags =
          selectedTagIds.length === 0 ||
          sk.tags.some((t) => selectedTagIds.includes(t.id));
        return matchCat && matchDept && matchLevel && matchTags;
      }),
    [allSkills, categoryFilter, deptFilter, minLevel, selectedTagIds]
  );

  // スキルマトリックス: 従業員 × スキル
  const matrixEmployees =
    deptFilter === "all"
      ? employees
      : employees.filter((e) => e.department === deptFilter);
  const matrixSkills = filtered.slice(0, 15); // 表示スキル数を制限

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">スキルマトリックス</h1>
        <p className="text-gray-500 mt-1">組織全体のスキル保有状況を可視化</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="all">全部署</option>
          {departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">最低レベル:</span>
          {[1, 2, 3, 4, 5].map((lv) => (
            <button
              key={lv}
              onClick={() => setMinLevel(lv)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                minLevel === lv
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {lv}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">タグ:</span>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border-2 ${
                selectedTagIds.includes(tag.id)
                  ? "text-white border-transparent"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              style={
                selectedTagIds.includes(tag.id)
                  ? { backgroundColor: tag.color, borderColor: tag.color }
                  : { color: tag.color }
              }
            >
              {tag.name}
            </button>
          ))}
          {selectedTagIds.length > 0 && (
            <button
              onClick={() => setSelectedTagIds([])}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((skill) => (
          <div
            key={skill.name}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm text-gray-900">
                  {skill.name}
                </h3>
                <span className="text-xs text-gray-400">{skill.category}</span>
                {skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skill.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: tag.color, fontSize: "10px" }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-lg font-bold text-indigo-600">
                {skill.count}
              </span>
            </div>

            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((lv) => (
                <div
                  key={lv}
                  className={`h-1.5 flex-1 rounded-full ${
                    lv <= Math.round(skill.avgLevel)
                      ? "bg-indigo-500"
                      : "bg-gray-100"
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
                  <span className="text-xs text-gray-600 truncate flex-1">
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
                <div className="text-xs text-gray-400">
                  +{skill.holders.length - 3}名
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-x-auto">
        <h2 className="font-semibold text-gray-800 mb-4">
          スキル×メンバーマトリックス
          <span className="text-xs text-gray-400 font-normal ml-2">
            （表示: 上位{matrixSkills.length}スキル）
          </span>
        </h2>
        <table className="text-xs w-full">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-semibold text-gray-600 sticky left-0 bg-white min-w-28">
                メンバー
              </th>
              {matrixSkills.map((sk) => (
                <th
                  key={sk.name}
                  className="text-center py-2 px-1 font-medium text-gray-500 min-w-16"
                >
                  <div className="writing-mode-vertical">{sk.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixEmployees.map((emp) => (
              <tr key={emp.id} className="border-t border-gray-50">
                <td className="py-2 pr-4 font-medium text-gray-800 sticky left-0 bg-white">
                  <div>{emp.name}</div>
                  <div className="text-gray-400 font-normal">
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
                        <div className="w-7 h-7 rounded-full bg-gray-50 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {[1, 2, 3, 4, 5].map((lv) => (
            <div key={lv} className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${LEVEL_BG[lv]}`}
              >
                {lv}
              </div>
              <span className="text-xs text-gray-500">{LEVEL_LABELS[lv]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
