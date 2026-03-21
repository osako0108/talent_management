"use client";

import { useAppData } from "@/lib/useAppData";
import { PageLoading } from "@/components/LoadingSpinner";
import {
  Users,
  Building2,
  TrendingUp,
  AlertTriangle,
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
  const { employees, departments, loading } = useAppData();

  if (loading) {
    return <PageLoading />;
  }

  const totalEmployees = employees.length;
  const activeCount = employees.filter((e) => e.status === "active").length;
  const remoteCount = employees.filter((e) => e.status === "remote").length;
  const onLeaveCount = employees.filter((e) => e.status === "onLeave").length;

  const deptData = departments.map((d) => ({
    name: d.name.length > 5 ? d.name.slice(0, 5) + "\u2026" : d.name,
    fullName: d.name,
    count: employees.filter((e) => e.department === d.name).length,
    fill: d.color,
  }));

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

  const gradeMap: Record<string, number> = {};
  employees.forEach((e) => {
    const prefix = e.grade[0];
    const label =
      prefix === "J" ? "\u30b8\u30e5\u30cb\u30a2" : prefix === "S" ? "\u30b7\u30cb\u30a2" : "\u30de\u30cd\u30fc\u30b8\u30e3\u30fc";
    gradeMap[label] = (gradeMap[label] || 0) + 1;
  });
  const gradeData = Object.entries(gradeMap).map(([name, value]) => ({ name, value }));
  const GRADE_COLORS = ["#c4c0ff", "#6366f1", "#3525cd"];

  const avgPerf2024 =
    employees.reduce((sum, e) => {
      const p = e.performance.find((p) => p.year === 2024);
      return sum + (p ? p.score : 0);
    }, 0) / employees.length;

  const topPerformers = [...employees]
    .sort((a, b) => {
      const sa = a.performance.find((p) => p.year === 2024)?.score ?? 0;
      const sb = b.performance.find((p) => p.year === 2024)?.score ?? 0;
      return sb - sa;
    })
    .slice(0, 5);

  const radarCategories = ["\u6280\u8853", "\u30de\u30cd\u30b8\u30e1\u30f3\u30c8", "\u55b6\u696d", "\u30b3\u30df\u30e5\u30cb\u30b1\u30fc\u30b7\u30e7\u30f3", "\u30de\u30fc\u30b1\u30c6\u30a3\u30f3\u30b0", "HR"];
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9</h1>
          <p className="text-on-surface-variant mt-1">\u8ab0\u3067\u3082\u308f\u304b\u308b\u7d44\u7e54\u306e\u73fe\u5728\u5730</p>
        </div>
        <Link
          href="/employees"
          className="gradient-primary text-on-primary px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 min-h-[48px] hover:opacity-90 transition-opacity"
        >
          + \u5f93\u696d\u54e1\u3092\u8ffd\u52a0
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="\u7dcf\u5f93\u696d\u54e1\u6570"
          value={totalEmployees}
          unit="\u540d"
          icon={<Users size={22} />}
          iconBg="bg-primary-fixed text-primary"
          trend={`+2%`}
        />
        <KpiCard
          title="\u90e8\u7f72\u6570"
          value={departments.length}
          unit="\u90e8\u7f72"
          icon={<Building2 size={22} />}
          iconBg="bg-surface-container text-on-surface-variant"
        />
        <KpiCard
          title="\u5e73\u5747\u30d1\u30d5\u30a9\u30fc\u30de\u30f3\u30b9"
          value={(avgPerf2024 / 20).toFixed(1)}
          unit="/ 5.0"
          icon={<Star size={22} />}
          iconBg="bg-warning-bg text-warning-text"
          trend="\u826f\u597d"
          trendColor="text-success-text"
        />
        <KpiCard
          title="\u96e2\u8077\u30ea\u30b9\u30af"
          value={onLeaveCount}
          unit="\u540d"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-error-bg text-error"
          trend="\u6ce8\u610f"
          trendColor="text-error"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6 lg:col-span-2">
          <h2 className="font-semibold text-on-surface mb-5">\u90e8\u7f72\u5225\u306e\u4eba\u54e1\u69cb\u6210</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
              <Tooltip
                formatter={(val) => [`${val}\u540d`, "\u4eba\u6570"]}
                labelFormatter={(label) =>
                  deptData.find((d) => d.name === label)?.fullName ?? label
                }
                contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 24px rgba(53,37,205,0.08)" }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {deptData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
          <h2 className="font-semibold text-on-surface mb-5">\u30b0\u30ec\u30fc\u30c9\u5206\u5e03</h2>
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
                  <span className="text-xs text-on-surface-variant">{value}</span>
                )}
              />
              <Tooltip formatter={(val) => [`${val}\u540d`]} contentStyle={{ borderRadius: "16px", border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
          <h2 className="font-semibold text-on-surface mb-5">\u7d44\u7e54\u30b9\u30ad\u30eb\u30d0\u30e9\u30f3\u30b9</h2>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--surface-container-high)" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} />
              <Radar
                name="\u5e73\u5747\u30ec\u30d9\u30eb"
                dataKey="value"
                stroke="var(--primary-container)"
                fill="var(--primary-container)"
                fillOpacity={0.2}
              />
              <Tooltip formatter={(v) => [`${v}\u70b9`]} contentStyle={{ borderRadius: "16px", border: "none" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
          <h2 className="font-semibold text-on-surface mb-5">\u30b9\u30ad\u30eb\u30ab\u30c6\u30b4\u30ea\u5206\u5e03</h2>
          <div className="space-y-3 mt-2">
            {skillData.map((item) => {
              const maxVal = skillData[0].count;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>{item.category}</span>
                    <span className="font-medium">{item.count}\u4ef6</span>
                  </div>
                  <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all"
                      style={{ width: `${(item.count / maxVal) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-on-surface">\u4eca\u6708\u306eMVP</h2>
            <Link
              href="/employees"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              \u5168\u54e1\u3092\u898b\u308b <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {topPerformers.map((emp, i) => {
              const score =
                emp.performance.find((p) => p.year === 2024)?.score ?? 0;
              return (
                <Link href={`/employees/${emp.id}`} key={emp.id}>
                  <div className="flex items-center gap-3 hover:bg-surface-low rounded-2xl p-2.5 transition-colors cursor-pointer">
                    <div className="relative">
                      {emp.avatar && (emp.avatar.startsWith("data:image") || emp.avatar.startsWith("http")) ? (
                        <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center font-bold text-primary">
                          {emp.avatar || emp.name.charAt(0) || "?"}
                        </div>
                      )}
                      {i === 0 && (
                        <Star
                          size={12}
                          className="absolute -top-1 -right-1 text-amber-400 fill-amber-400"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-on-surface truncate">
                        {emp.name}
                      </div>
                      <div className="text-xs text-on-surface-variant truncate">
                        {emp.department} / {emp.role}
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-xl bg-success-bg text-success-text text-xs font-semibold">
                      {(score / 20).toFixed(1)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-warning-bg rounded-3xl p-6">
        <h2 className="font-semibold text-warning-text mb-4 flex items-center gap-2">
          <AlertTriangle size={18} />
          \u30a2\u30af\u30b7\u30e7\u30f3\u304c\u5fc5\u8981\u306a\u4e8b\u9805
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AlertItem
            title="\u30b9\u30ad\u30eb\u30ae\u30e3\u30c3\u30d7\u691c\u51fa"
            desc="\u30c7\u30fc\u30bf\u30b5\u30a4\u30a8\u30f3\u30b9\u9818\u57df\u306e\u30b9\u30ad\u30eb\u4fdd\u6709\u8005\u304c0\u540d\u3067\u3059\u3002\u63a1\u7528\u30fb\u80b2\u6210\u3092\u691c\u8a0e\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
          />
          <AlertItem
            title="\u4f11\u8077\u8005\u30d5\u30a9\u30ed\u30fc"
            desc="\u5ca1\u7530 \u9f8d\u4e4b\u4ecb\uff08\u30d7\u30ed\u30c0\u30af\u30c8\u90e8\uff09\u304c\u4f11\u8077\u4e2d\u3067\u3059\u3002\u5fa9\u5e30\u652f\u63f4\u30d7\u30e9\u30f3\u3092\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002"
          />
          <AlertItem
            title="\u5f8c\u7d99\u8005\u5019\u88dc\u306e\u80b2\u6210"
            desc="CFO\u30fbHR\u30de\u30cd\u30fc\u30b8\u30e3\u30fc\u30dd\u30b8\u30b7\u30e7\u30f3\u306e\u5f8c\u7d99\u8005\u5019\u88dc\u304c\u4e0d\u660e\u3067\u3059\u3002"
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
  iconBg,
  trend,
  trendColor,
}: {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  trendColor?: string;
}) {
  return (
    <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl ${trendColor || "text-success-text"} bg-surface-low`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs text-on-surface-variant font-medium mb-1">{title}</p>
      <div className="flex items-end gap-1.5">
        <span className="text-3xl font-bold text-on-surface tracking-tight">{value}</span>
        <span className="text-sm text-on-surface-variant mb-0.5">{unit}</span>
      </div>
    </div>
  );
}

function AlertItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-surface-lowest rounded-2xl p-4">
      <span className="text-sm font-semibold text-on-surface">{title}</span>
      <p className="text-xs text-on-surface-variant leading-relaxed mt-1">{desc}</p>
    </div>
  );
}
