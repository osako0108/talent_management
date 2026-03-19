"use client";

import { useState, useRef, useEffect } from "react";
import { useAppData } from "@/lib/useAppData";
import { PageLoading } from "@/components/LoadingSpinner";
import { statusLabels, statusColors } from "@/lib/data";
import Link from "next/link";
import { Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, X } from "lucide-react";

type SortKey = "name" | "role" | "department" | "grade" | "joinDate" | "score";
type SortDir = "asc" | "desc";

const grades = ["J1", "J2", "J3", "S1", "S2", "M1", "M2", "M3", "M4"];
const gradeOrder = (g: string) => grades.indexOf(g);

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

export default function EmployeesPage() {
  const { employees, departments, loading } = useAppData();
  const [search, setSearch] = useState("");
  const [deptFilters, setDeptFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [gradeFilters, setGradeFilters] = useState<string[]>([]);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = employees.filter((emp) => {
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

  if (loading) {
    return (
      <PageLoading />
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">従業員管理</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {employees.length}名の従業員情報を管理・検索
        </p>
      </div>

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
        {sorted.length}件表示 / {employees.length}件中
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((emp) => {
          const score = getScore(emp);
          return (
            <Link href={`/employees/${emp.id}`} key={emp.id}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-600 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-lg font-bold text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {emp.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[emp.status]}`}
                      >
                        {statusLabels[emp.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{emp.role}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {emp.department} · {emp.grade}
                    </p>
                  </div>
                </div>

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
                  <span>入社: {emp.joinDate.slice(0, 7)}</span>
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
              </div>
            </Link>
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
