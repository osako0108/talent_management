"use client";

import { useState, useEffect, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  type Employee,
  type Department,
} from "@/lib/data";

type UseAppDataResult = {
  employees: Employee[];
  departments: Department[];
  skillCategories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useAppData(): UseAppDataResult {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [skillCategories, setSkillCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 並列でデータ取得
      const [deptRes, empRes, skillsRes, perfRes, projRes, catRes] = await Promise.all([
        supabase.from("departments").select("*").order("name"),
        supabase.from("employees").select("*, departments(name)").order("created_at"),
        supabase
          .from("employee_skills")
          .select("employee_id, level, skill_masters(name, skill_categories(name))"),
        supabase.from("employee_performance").select("employee_id, year, score"),
        supabase.from("employee_projects").select("employee_id, project_name"),
        supabase.from("skill_categories").select("name").order("name"),
      ]);

      if (deptRes.error) throw deptRes.error;
      if (empRes.error) throw empRes.error;
      if (skillsRes.error) throw skillsRes.error;
      if (perfRes.error) throw perfRes.error;
      if (projRes.error) throw projRes.error;
      if (catRes.error) throw catRes.error;

      // 部署をマッピング
      const deptList: Department[] = (deptRes.data || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        name: d.name as string,
        head: (d.head as string) || "",
        headCount: (d.head_count as number) || 0,
        budget: Number(d.budget) || 0,
        description: (d.description as string) || "",
        color: (d.color as string) || "#6366f1",
      }));

      // スキルをemployee_id別にグループ化
      const skillsByEmp: Record<string, { name: string; category: string; level: number }[]> = {};
      for (const row of skillsRes.data || []) {
        const empId = row.employee_id as string;
        if (!skillsByEmp[empId]) skillsByEmp[empId] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sm = row.skill_masters as any;
        if (sm) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sc = sm.skill_categories as any;
          skillsByEmp[empId].push({
            name: (sm.name as string) || "",
            category: sc ? (sc.name as string) || "" : "",
            level: (row.level as number) || 1,
          });
        }
      }

      // パフォーマンスをemployee_id別にグループ化
      const perfByEmp: Record<string, { year: number; score: number }[]> = {};
      for (const row of perfRes.data || []) {
        const empId = row.employee_id as string;
        if (!perfByEmp[empId]) perfByEmp[empId] = [];
        perfByEmp[empId].push({
          year: row.year as number,
          score: row.score as number,
        });
      }

      // プロジェクトをemployee_id別にグループ化
      const projByEmp: Record<string, string[]> = {};
      for (const row of projRes.data || []) {
        const empId = row.employee_id as string;
        if (!projByEmp[empId]) projByEmp[empId] = [];
        projByEmp[empId].push(row.project_name as string);
      }

      // 従業員をマッピング
      const empList: Employee[] = (empRes.data || []).map((e: Record<string, unknown>) => {
        const id = e.id as string;
        const dept = e.departments as Record<string, unknown> | null;
        return {
          id,
          name: (e.name as string) || "",
          nameKana: (e.name_kana as string) || "",
          role: (e.role as string) || "",
          department: dept ? (dept.name as string) || "" : "",
          grade: (e.grade as string) || "J1",
          joinDate: (e.join_date as string) || "",
          email: (e.email as string) || "",
          avatar: (e.avatar as string) || ((e.name as string) || "?").charAt(0),
          avatarIcon: (e.avatar_icon as string) || "",
          gender: ((e.gender as string) || "") as "" | "male" | "female",
          status: ((e.status as string) || "active") as "active" | "training" | "onLeave" | "remote",
          trainingCompletedAt: (e.training_completed_at as string) || "",
          leftDate: (e.left_date as string) || "",
          skills: (skillsByEmp[id] || []) as Employee["skills"],
          performance: (perfByEmp[id] || []).sort((a, b) => a.year - b.year),
          projects: projByEmp[id] || [],
        };
      });

      // スキルカテゴリ
      const cats = (catRes.data || []).map((c: Record<string, unknown>) => c.name as string);

      setDepartments(deptList);
      setEmployees(empList);
      setSkillCategories(cats);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("データの取得に失敗しました。しばらくしてから再度お試しください。");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { employees, departments, skillCategories, loading, error, refetch: fetchData };
}
