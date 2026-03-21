"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PageLoading } from "@/components/LoadingSpinner";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Calendar,
  Users,
  Building2,
  Zap,
  Flag,
} from "lucide-react";

// ===== 型定義 =====
type Project = {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "on_hold";
  start_date: string | null;
  end_date: string | null;
};

type Milestone = {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string | null;
  completed: boolean;
  sort_order: number;
};

type ProjectMember = {
  id: string;
  project_id: string;
  employee_id: string;
  role: string;
  employee_name?: string;
  department_name?: string;
};

type ProjectDepartment = {
  id: string;
  project_id: string;
  department_id: string;
  department_name?: string;
};

type ProjectRequiredSkill = {
  id: string;
  project_id: string;
  skill_master_id: string;
  required_level: number;
  skill_name?: string;
  category_name?: string;
};

type DeptOption = { id: string; name: string };
type EmpOption = { id: string; name: string; department: string };
type SkillOption = { id: string; name: string; category: string };

const statusConfig: Record<
  Project["status"],
  { label: string; color: string; bg: string }
> = {
  planning: { label: "計画中", color: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/40" },
  active: { label: "進行中", color: "text-green-700 dark:text-green-300", bg: "bg-green-100 dark:bg-green-900/40" },
  completed: { label: "完了", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
  on_hold: { label: "保留", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/40" },
};

type ProjectForm = {
  name: string;
  description: string;
  status: Project["status"];
  start_date: string;
  end_date: string;
};

const emptyForm: ProjectForm = {
  name: "",
  description: "",
  status: "planning",
  start_date: "",
  end_date: "",
};

function toUserError(
  error: { code?: string; message?: string },
  context: "save" | "delete"
): string {
  if (error.code === "23505") return "同じ名前のプロジェクトが既に存在します";
  if (error.code === "23503") return "関連データが存在するため操作できません";
  const labels = { save: "保存", delete: "削除" };
  return `${labels[context]}に失敗しました。しばらくしてから再度お試しください。`;
}

export default function ProjectsPage() {
  // ===== データ =====
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [departments, setDepartments] = useState<ProjectDepartment[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<ProjectRequiredSkill[]>([]);
  const [deptOptions, setDeptOptions] = useState<DeptOption[]>([]);
  const [empOptions, setEmpOptions] = useState<EmpOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== UI State =====
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ===== Milestone form =====
  const [msForm, setMsForm] = useState({ title: "", description: "", due_date: "" });
  const [addingMsFor, setAddingMsFor] = useState<string | null>(null);

  // ===== Member/Dept/Skill add state =====
  const [addMemberFor, setAddMemberFor] = useState<string | null>(null);
  const [memberEmpId, setMemberEmpId] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [addDeptFor, setAddDeptFor] = useState<string | null>(null);
  const [deptSelectId, setDeptSelectId] = useState("");
  const [addSkillFor, setAddSkillFor] = useState<string | null>(null);
  const [skillSelectId, setSkillSelectId] = useState("");
  const [skillLevel, setSkillLevel] = useState(3);

  // ===== Fetch =====
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [projRes, msRes, memRes, deptRes, skillRes, deptOptRes, empOptRes, skillOptRes] =
        await Promise.all([
          supabase.from("projects").select("*").order("created_at", { ascending: false }),
          supabase.from("project_milestones").select("*").order("sort_order"),
          supabase.from("project_members").select("*, employees(name, departments(name))"),
          supabase.from("project_departments").select("*, departments(name)"),
          supabase
            .from("project_required_skills")
            .select("*, skill_masters(name, skill_categories(name))"),
          supabase.from("departments").select("id, name").order("name"),
          supabase.from("employees").select("id, name, departments(name)").order("name"),
          supabase
            .from("skill_masters")
            .select("id, name, skill_categories(name)")
            .order("name"),
        ]);

      if (projRes.error) throw projRes.error;
      setProjects(
        (projRes.data || []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          name: p.name as string,
          description: (p.description as string) || "",
          status: (p.status as Project["status"]) || "planning",
          start_date: (p.start_date as string) || null,
          end_date: (p.end_date as string) || null,
        }))
      );

      setMilestones(
        (msRes.data || []).map((m: Record<string, unknown>) => ({
          id: m.id as string,
          project_id: m.project_id as string,
          title: m.title as string,
          description: (m.description as string) || "",
          due_date: (m.due_date as string) || null,
          completed: (m.completed as boolean) || false,
          sort_order: (m.sort_order as number) || 0,
        }))
      );

      setMembers(
        (memRes.data || []).map((m: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const emp = m.employees as any;
          return {
            id: m.id as string,
            project_id: m.project_id as string,
            employee_id: m.employee_id as string,
            role: (m.role as string) || "",
            employee_name: emp?.name || "",
            department_name: emp?.departments?.name || "",
          };
        })
      );

      setDepartments(
        (deptRes.data || []).map((d: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dept = d.departments as any;
          return {
            id: d.id as string,
            project_id: d.project_id as string,
            department_id: d.department_id as string,
            department_name: dept?.name || "",
          };
        })
      );

      setRequiredSkills(
        (skillRes.data || []).map((s: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sm = s.skill_masters as any;
          return {
            id: s.id as string,
            project_id: s.project_id as string,
            skill_master_id: s.skill_master_id as string,
            required_level: (s.required_level as number) || 1,
            skill_name: sm?.name || "",
            category_name: sm?.skill_categories?.name || "",
          };
        })
      );

      setDeptOptions(
        (deptOptRes.data || []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          name: d.name as string,
        }))
      );

      setEmpOptions(
        (empOptRes.data || []).map((e: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dept = e.departments as any;
          return {
            id: e.id as string,
            name: e.name as string,
            department: dept?.name || "",
          };
        })
      );

      setSkillOptions(
        (skillOptRes.data || []).map((s: Record<string, unknown>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cat = s.skill_categories as any;
          return {
            id: s.id as string,
            name: s.name as string,
            category: cat?.name || "",
          };
        })
      );
    } catch (err) {
      setError("データの取得に失敗しました");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== CRUD =====
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    if (editId) {
      const { error: err } = await supabase.from("projects").update(payload).eq("id", editId);
      if (err) { setError(toUserError(err, "save")); return; }
    } else {
      const { error: err } = await supabase.from("projects").insert(payload);
      if (err) { setError(toUserError(err, "save")); return; }
    }
    setIsAdding(false);
    setEditId(null);
    setForm(emptyForm);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このプロジェクトを削除しますか？関連するマイルストーン・メンバー情報も全て削除されます。")) return;
    const { error: err } = await supabase.from("projects").delete().eq("id", id);
    if (err) { setError(toUserError(err, "delete")); return; }
    if (expandedId === id) setExpandedId(null);
    fetchData();
  };

  const startEdit = (p: Project) => {
    setEditId(p.id);
    setIsAdding(true);
    setForm({
      name: p.name,
      description: p.description,
      status: p.status,
      start_date: p.start_date || "",
      end_date: p.end_date || "",
    });
  };

  // ===== Milestone CRUD =====
  const handleAddMilestone = async (projectId: string) => {
    if (!msForm.title.trim()) return;
    const maxOrder = milestones
      .filter((m) => m.project_id === projectId)
      .reduce((max, m) => Math.max(max, m.sort_order), 0);
    const { error: err } = await supabase.from("project_milestones").insert({
      project_id: projectId,
      title: msForm.title.trim(),
      description: msForm.description.trim(),
      due_date: msForm.due_date || null,
      sort_order: maxOrder + 1,
    });
    if (err) { setError("マイルストーンの追加に失敗しました"); return; }
    setMsForm({ title: "", description: "", due_date: "" });
    setAddingMsFor(null);
    fetchData();
  };

  const toggleMilestone = async (ms: Milestone) => {
    const { error: err } = await supabase
      .from("project_milestones")
      .update({
        completed: !ms.completed,
        completed_at: !ms.completed ? new Date().toISOString() : null,
      })
      .eq("id", ms.id);
    if (err) { setError("更新に失敗しました"); return; }
    fetchData();
  };

  const deleteMilestone = async (id: string) => {
    await supabase.from("project_milestones").delete().eq("id", id);
    fetchData();
  };

  // ===== Member CRUD =====
  const handleAddMember = async (projectId: string) => {
    if (!memberEmpId) return;
    const { error: err } = await supabase.from("project_members").insert({
      project_id: projectId,
      employee_id: memberEmpId,
      role: memberRole.trim(),
    });
    if (err) {
      if (err.code === "23505") setError("このメンバーは既にアサインされています");
      else setError("メンバーの追加に失敗しました");
      return;
    }
    setMemberEmpId("");
    setMemberRole("");
    setAddMemberFor(null);
    fetchData();
  };

  const removeMember = async (id: string) => {
    await supabase.from("project_members").delete().eq("id", id);
    fetchData();
  };

  // ===== Department CRUD =====
  const handleAddDept = async (projectId: string) => {
    if (!deptSelectId) return;
    const { error: err } = await supabase.from("project_departments").insert({
      project_id: projectId,
      department_id: deptSelectId,
    });
    if (err) {
      if (err.code === "23505") setError("この部署は既にアサインされています");
      else setError("部署の追加に失敗しました");
      return;
    }
    setDeptSelectId("");
    setAddDeptFor(null);
    fetchData();
  };

  const removeDept = async (id: string) => {
    await supabase.from("project_departments").delete().eq("id", id);
    fetchData();
  };

  // ===== Required Skill CRUD =====
  const handleAddSkill = async (projectId: string) => {
    if (!skillSelectId) return;
    const { error: err } = await supabase.from("project_required_skills").insert({
      project_id: projectId,
      skill_master_id: skillSelectId,
      required_level: skillLevel,
    });
    if (err) {
      if (err.code === "23505") setError("このスキルは既に追加されています");
      else setError("スキルの追加に失敗しました");
      return;
    }
    setSkillSelectId("");
    setSkillLevel(3);
    setAddSkillFor(null);
    fetchData();
  };

  const removeSkill = async (id: string) => {
    await supabase.from("project_required_skills").delete().eq("id", id);
    fetchData();
  };

  // ===== Computed =====
  const filtered = filterStatus === "all" ? projects : projects.filter((p) => p.status === filterStatus);

  const getMilestones = (pid: string) => milestones.filter((m) => m.project_id === pid);
  const getMembers = (pid: string) => members.filter((m) => m.project_id === pid);
  const getDepts = (pid: string) => departments.filter((d) => d.project_id === pid);
  const getSkills = (pid: string) => requiredSkills.filter((s) => s.project_id === pid);
  const getMilestoneProgress = (pid: string) => {
    const ms = getMilestones(pid);
    if (ms.length === 0) return null;
    const done = ms.filter((m) => m.completed).length;
    return { done, total: ms.length, pct: Math.round((done / ms.length) * 100) };
  };

  // ===== Render =====
  if (!isSupabaseConfigured) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">プロジェクト管理</h1>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-800 dark:text-amber-200">
          Supabaseが設定されていません。.env.localに環境変数を設定してください。
        </div>
      </div>
    );
  }

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">プロジェクト管理</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            プロジェクトの進捗・メンバー・マイルストーンを管理
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditId(null);
            setForm(emptyForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
        >
          <Plus size={16} />
          新規プロジェクト
        </button>
      </div>

      {/* エラー */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* フィルタ */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "すべて" },
          ...Object.entries(statusConfig).map(([key, { label }]) => ({ key, label })),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterStatus === key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {label} {key === "all" ? `(${projects.length})` : `(${projects.filter((p) => p.status === key).length})`}
          </button>
        ))}
      </div>

      {/* 追加/編集フォーム */}
      {isAdding && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {editId ? "プロジェクトを編集" : "新規プロジェクト"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                プロジェクト名 <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="プロジェクト名を入力"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                説明
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="プロジェクトの説明"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                ステータス
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Project["status"] })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  開始日
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  終了日
                </label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              <Save size={14} />
              {editId ? "更新" : "追加"}
            </button>
            <button
              onClick={() => { setIsAdding(false); setEditId(null); setForm(emptyForm); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              <X size={14} />
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* プロジェクト一覧 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Flag size={48} className="mx-auto mb-3 opacity-30" />
          <p>プロジェクトがありません</p>
          <p className="text-sm mt-1">「新規プロジェクト」から追加してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const isExpanded = expandedId === p.id;
            const progress = getMilestoneProgress(p.id);
            const pMembers = getMembers(p.id);
            const pDepts = getDepts(p.id);
            const pSkills = getSkills(p.id);
            const pMilestones = getMilestones(p.id);
            const sc = statusConfig[p.status];

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden"
              >
                {/* ヘッダー */}
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {p.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    {p.start_date && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {p.start_date}{p.end_date ? ` ~ ${p.end_date}` : ""}
                      </span>
                    )}
                    {progress && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${progress.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {progress.done}/{progress.total}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Users size={12} />
                      {pMembers.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* 展開コンテンツ */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5 space-y-6">
                    {/* 部署セクション */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Building2 size={15} />
                          アサイン部署
                        </h4>
                        <button
                          onClick={() => { setAddDeptFor(addDeptFor === p.id ? null : p.id); setDeptSelectId(""); }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {addDeptFor === p.id ? "閉じる" : "+ 追加"}
                        </button>
                      </div>
                      {addDeptFor === p.id && (
                        <div className="flex gap-2 mb-3">
                          <select
                            value={deptSelectId}
                            onChange={(e) => setDeptSelectId(e.target.value)}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">部署を選択</option>
                            {deptOptions
                              .filter((d) => !pDepts.some((pd) => pd.department_id === d.id))
                              .map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                          </select>
                          <button
                            onClick={() => handleAddDept(p.id)}
                            disabled={!deptSelectId}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            追加
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {pDepts.length === 0 && (
                          <span className="text-xs text-gray-400">部署が割り当てられていません</span>
                        )}
                        {pDepts.map((d) => (
                          <span
                            key={d.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                          >
                            <Building2 size={12} />
                            {d.department_name}
                            <button
                              onClick={() => removeDept(d.id)}
                              className="ml-0.5 text-blue-400 hover:text-blue-600"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* メンバーセクション */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Users size={15} />
                          メンバー ({pMembers.length})
                        </h4>
                        <button
                          onClick={() => { setAddMemberFor(addMemberFor === p.id ? null : p.id); setMemberEmpId(""); setMemberRole(""); }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {addMemberFor === p.id ? "閉じる" : "+ 追加"}
                        </button>
                      </div>
                      {addMemberFor === p.id && (
                        <div className="flex gap-2 mb-3">
                          <select
                            value={memberEmpId}
                            onChange={(e) => setMemberEmpId(e.target.value)}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">メンバーを選択</option>
                            {empOptions
                              .filter((e) => !pMembers.some((pm) => pm.employee_id === e.id))
                              .map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.name} ({e.department})
                                </option>
                              ))}
                          </select>
                          <input
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value)}
                            placeholder="役割"
                            className="w-32 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleAddMember(p.id)}
                            disabled={!memberEmpId}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            追加
                          </button>
                        </div>
                      )}
                      <div className="space-y-1">
                        {pMembers.length === 0 && (
                          <span className="text-xs text-gray-400">メンバーが割り当てられていません</span>
                        )}
                        {pMembers.map((m) => (
                          <div key={m.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs text-indigo-600 dark:text-indigo-400">
                                {m.employee_name?.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-900 dark:text-white">{m.employee_name}</span>
                              {m.role && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">({m.role})</span>
                              )}
                              <span className="text-xs text-gray-400">{m.department_name}</span>
                            </div>
                            <button onClick={() => removeMember(m.id)} className="text-gray-400 hover:text-red-500">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 必要スキルセクション */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Zap size={15} />
                          必要スキル
                        </h4>
                        <button
                          onClick={() => { setAddSkillFor(addSkillFor === p.id ? null : p.id); setSkillSelectId(""); setSkillLevel(3); }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {addSkillFor === p.id ? "閉じる" : "+ 追加"}
                        </button>
                      </div>
                      {addSkillFor === p.id && (
                        <div className="flex gap-2 mb-3">
                          <select
                            value={skillSelectId}
                            onChange={(e) => setSkillSelectId(e.target.value)}
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="">スキルを選択</option>
                            {skillOptions
                              .filter((s) => !pSkills.some((ps) => ps.skill_master_id === s.id))
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  [{s.category}] {s.name}
                                </option>
                              ))}
                          </select>
                          <select
                            value={skillLevel}
                            onChange={(e) => setSkillLevel(Number(e.target.value))}
                            className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            {[1, 2, 3, 4, 5].map((l) => (
                              <option key={l} value={l}>Lv.{l}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAddSkill(p.id)}
                            disabled={!skillSelectId}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            追加
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {pSkills.length === 0 && (
                          <span className="text-xs text-gray-400">必要スキルが設定されていません</span>
                        )}
                        {pSkills.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                          >
                            <Zap size={11} />
                            {s.skill_name} Lv.{s.required_level}
                            <button
                              onClick={() => removeSkill(s.id)}
                              className="ml-0.5 text-purple-400 hover:text-purple-600"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* マイルストーンセクション */}
                    <section>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Flag size={15} />
                          マイルストーン ({pMilestones.length})
                        </h4>
                        <button
                          onClick={() => {
                            setAddingMsFor(addingMsFor === p.id ? null : p.id);
                            setMsForm({ title: "", description: "", due_date: "" });
                          }}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {addingMsFor === p.id ? "閉じる" : "+ 追加"}
                        </button>
                      </div>
                      {addingMsFor === p.id && (
                        <div className="flex gap-2 mb-3 items-end">
                          <div className="flex-1">
                            <input
                              value={msForm.title}
                              onChange={(e) => setMsForm({ ...msForm, title: e.target.value })}
                              placeholder="マイルストーン名"
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <input
                              type="date"
                              value={msForm.due_date}
                              onChange={(e) => setMsForm({ ...msForm, due_date: e.target.value })}
                              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <button
                            onClick={() => handleAddMilestone(p.id)}
                            disabled={!msForm.title.trim()}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            追加
                          </button>
                        </div>
                      )}
                      <div className="space-y-1">
                        {pMilestones.length === 0 && (
                          <span className="text-xs text-gray-400">マイルストーンが設定されていません</span>
                        )}
                        {pMilestones.map((ms) => (
                          <div
                            key={ms.id}
                            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                          >
                            <button
                              onClick={() => toggleMilestone(ms)}
                              className={`flex-shrink-0 ${ms.completed ? "text-green-500" : "text-gray-300 dark:text-gray-600 hover:text-gray-500"}`}
                            >
                              {ms.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${ms.completed ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                                {ms.title}
                              </span>
                            </div>
                            {ms.due_date && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={11} />
                                {ms.due_date}
                              </span>
                            )}
                            <button
                              onClick={() => deleteMilestone(ms.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
