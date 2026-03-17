"use client";

import { useState } from "react";
import { employees, departments, statusLabels, statusColors } from "@/lib/data";
import Link from "next/link";
import { Search, Filter } from "lucide-react";

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.includes(search) ||
      emp.role.includes(search) ||
      emp.skills.some((s) => s.name.includes(search));
    const matchDept =
      deptFilter === "all" || emp.department === deptFilter;
    const matchStatus =
      statusFilter === "all" || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">従業員管理</h1>
        <p className="text-gray-500 mt-1">
          {employees.length}名の従業員情報を管理・検索
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
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
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">全ステータス</option>
            <option value="active">在籍</option>
            <option value="remote">リモート</option>
            <option value="onLeave">休職中</option>
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const score =
            emp.performance.find((p) => p.year === 2024)?.score ?? 0;
          return (
            <Link href={`/employees/${emp.id}`} key={emp.id}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-700 flex-shrink-0">
                    {emp.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {emp.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[emp.status]}`}
                      >
                        {statusLabels[emp.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{emp.role}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {emp.department} · {emp.grade}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {emp.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill.name}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {emp.skills.length > 4 && (
                      <span className="text-xs text-gray-400">
                        +{emp.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50 pt-3">
                  <span>入社: {emp.joinDate.slice(0, 7)}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>該当する従業員が見つかりませんでした</p>
        </div>
      )}
    </div>
  );
}
