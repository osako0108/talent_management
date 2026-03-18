"use client";

import { employees, departments } from "@/lib/data";
import {
  Users,
  Building2,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === "active").length;
  const remoteCount = employees.filter((e) => e.status === "remote").length;
  const onLeaveCount = employees.filter((e) => e.status === "onLeave").length;

  // 部署別人員
  const deptData = departments.map((d) => ({
    name: d.name.length > 5 ? d.name.slice(0, 5) + "…" : d.name,
    fullName: d.name,
    人数: employees.filter((e) => e.department === d.name).length,
    fill: d.color,
  }));

  // スキルカテゴリ分布
  const skillCountMap: Record<string, number> = {};
  employees.forEach((emp) => {
    emp.skills.forEach((skill) => {
      skillCountMap[skill.category] = (skillCountMap[skill.category] || 0) + 1;
    });
  });
  const skillData = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category, count]) => ({ category, count }));

  // グレード分布
  const gradeMap: Record<string, number> = {};
  employees.forEach((e) => {
    const prefix = e.grade[0];
    const label =
      prefix === "J" ? "ジュニア" : prefix === "S" ? "シニア" : "マネージャー";
    gradeMap[label] = (gradeMap[label] || 0) + 1;
  });
  const gradeData = Object.entries(gradeMap).map(([name, value]) => ({
    name,
    value,
  }));
  const GRADE_COLORS = ["#a5b4fc", "#6366f1", "#4338ca"];

  // 平均パフォーマンス(2024)
  const avgPerf2024 =
    employees.reduce((sum, e) => {
      const p = e.performance.find((p) => p.year === 2024);
      return sum + (p ? p.score : 0);
    }, 0) / employees.length;

  // トップパフォーマー
  const topPerformers = [...employees]
    .sort((a, b) => {
      const sa = a.performance.find((p) => p.year === 2024)?.score ?? 0;
      const sb = b.performance.find((p) => p.year === 2024)?.score ?? 0;
      return sb - sa;
    })
    .slice(0, 5);

  // 組織スキルレーダー
  const radarCategories = [
    "技術",
    "マネジメント",
    "営業",
    "コミュニケーション",
    "マーケティング",
    "HR",
  ];
  const radarData = radarCategories.map((cat) => {
    const catSkills = employees.flatMap((e) =>
      e.skills.filter((s) => s.category === cat)
    );
    const avg =
      catSkills.length > 0
        ? catSkills.reduce((s, sk) => s + sk.level, 0) / catSkills.length
        : 0;
    return { category: cat, value: Math.round(avg * 20) };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">ダッシュボード</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">組織全体の人材状況を一目で把握</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="総従業員数"
          value={totalEmployees}
          unit="名"
          icon={<Users size={20} className="text-indigo-600" />}
          bg="bg-indigo-50 dark:bg-indigo-900/30"
          sub={`在籍 ${activeCount}名 / リモート ${remoteCount}名`}
        />
        <KpiCard
          title="部署数"
          value={departments.length}
          unit="部署"
          icon={<Building2 size={20} className="text-emerald-600" />}
          bg="bg-emerald-50 dark:bg-emerald-900/30"
          sub="全社横断組織を含む"
        />
        <KpiCard
          title="平均パフォーマンス"
          value={avgPerf2024.toFixed(1)}
          unit="点"
          icon={<TrendingUp size={20} className="text-amber-600" />}
          bg="bg-amber-50 dark:bg-amber-900/30"
          sub="2024年度評価（100点満点）"
        />
        <KpiCard
          title="要注目"
          value={onLeaveCount}
          unit="名"
          icon={<AlertCircle size={20} className="text-rose-600" />}
          bg="bg-rose-50 dark:bg-rose-900/30"
          sub="休職中・ケア対象者"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">部署別人員構成</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val) => [`${val}名`, "人数"]}
                labelFormatter={(label) =>
                  deptData.find((d) => d.name === label)?.fullName ?? label
                }
              />
              <Bar dataKey="人数" radius={[6, 6, 0, 0]}>
                {deptData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">グレード分布</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={gradeData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {gradeData.map((_, i) => (
                  <Cell key={i} fill={GRADE_COLORS[i % GRADE_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
                )}
              />
              <Tooltip formatter={(val) => [`${val}名`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">組織スキルバランス</h2>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
              <Radar
                name="平均レベル"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
              />
              <Tooltip formatter={(v) => [`${v}点`]} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">スキルカテゴリ分布</h2>
          <div className="space-y-2 mt-2">
            {skillData.map((item) => {
              const maxVal = skillData[0].count;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                    <span>{item.category}</span>
                    <span>{item.count}件</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${(item.count / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">トップパフォーマー</h2>
            <Link
              href="/employees"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              全員 <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topPerformers.map((emp, i) => {
              const score =
                emp.performance.find((p) => p.year === 2024)?.score ?? 0;
              return (
                <Link href={`/employees/${emp.id}`} key={emp.id}>
                  <div className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1.5 transition-colors cursor-pointer">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                        {emp.avatar}
                      </div>
                      {i === 0 && (
                        <Star
                          size={12}
                          className="absolute -top-1 -right-1 text-amber-400 fill-amber-400"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {emp.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {emp.role}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-600">
                        {score}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">点</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">
          アクションが必要な事項
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AlertItem
            color="yellow"
            title="スキルギャップ検出"
            desc="データサイエンス領域のスキル保有者が0名です。採用・育成を検討してください。"
          />
          <AlertItem
            color="rose"
            title="休職者フォロー"
            desc="岡田 龍之介（プロダクト部）が休職中です。復帰支援プランを確認してください。"
          />
          <AlertItem
            color="indigo"
            title="後継者候補の育成"
            desc="CFO・HRマネージャーポジションの後継者候補が不明です。サクセッションプランが必要です。"
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  unit,
  icon,
  bg,
  sub,
}: {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  bg: string;
  sub: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <div
          className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">{unit}</span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function AlertItem({
  color,
  title,
  desc,
}: {
  color: "yellow" | "rose" | "indigo";
  title: string;
  desc: string;
}) {
  const borderBg = {
    yellow: "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700",
    rose: "border-rose-300 bg-rose-50 dark:bg-rose-900/30 dark:border-rose-700",
    indigo: "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700",
  };
  const dot = {
    yellow: "bg-yellow-400",
    rose: "bg-rose-400",
    indigo: "bg-indigo-400",
  };
  return (
    <div className={`rounded-lg border-l-4 p-4 ${borderBg[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${dot[color]}`} />
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</span>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
