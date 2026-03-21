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
    name: d.name.length > 5 ? d.name.slice(0, 5) + "…" : d.name,
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
      prefix === "J" ? "ジュニア" : prefix === "S" ? "シニア" : "マネージャー";
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

  const radarCategories = ["技術", "マネジメント", "営業", "コミュニケーション", "マーケティング", "HR"];
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
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">ダッシュボード</h1>
          <p className="text-on-surface-variant mt-1">誰でもわかる組織の現在地</p>
        </div>
        <Link
          href="/employees"
          className="gradient-primary text-on-primary px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 min-h-[48px] hover:opacity-90 transition-opacity"
        >
          + 従業員を追加
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="総従業員数"
          value={totalEmployees}
          unit="名"
          icon={<Users size={22} />}
          iconBg="bg-primary-fixed text-primary"
          trend={`+2%`}
        />
        <KpiCard
          title="部署数"
          value={departments.length}
          unit="部署"
          icon={<Building2 size={22} />}
          iconBg="bg-surface-container text-on-surface-variant"
        />
        <KpiCard
          title="平均パフォーマンス"
          value={(avgPerf2024 / 20).toFixed(1)}
          unit="/ 5.0"
          icon={<Star size={22} />}
          iconBg="bg-warning-bg text-warning-text"
          trend="良好"
          trendColor="text-success-text"
        />
        <KpiCard
          title="離職リスク"
          value={onLeaveCount}
          unit="名"
          icon={<AlertTriangle size={22} />}
          iconBg="bg-error-bg text-error"
          trend="注意"
          trendColor="text-error"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6 lg:col-span-2">
          <h2 className="font-semibold text-on-surface mb-5">部署別の人員構成</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--on-surface-variant)" }} />
              <Tooltip
                formatter={(val) => [`${val}名`, "人数"]}
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
          <h2 className="font-semibold text-on-surface mb-5">グレード分布</h2>
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
              <Tooltip formatter={(val) => [`${val}名`]} contentStyle={{ borderRadius: "16px", border: "none" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
          <h2 className="font-semibold text-on-surface mb-5">組織スキルバランス</h2>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--surface-container-high)" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "var(--on-surface-variant)" }} />
              <Radar
                name="平均レベル"
                dataKey="value"
                stroke="var(--primary-container)"
                fill="var(--primary-container)"
                fillOpacity={0.2}
              />
              <Tooltip formatter={(v) => [`${v}点`]} contentStyle={{ borderRadius: "16px", border: "none" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-lowest rounded-3xl shadow-ambient p-6">
          <h2 className="font-semibold text-on-surface mb-5">スキルカテゴリ分布</h2>
          <div className="space-y-3 mt-2">
            {skillData.map((item) => {
              const maxVal = skillData[0].count;
              return (
                <div key={item.category}>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>{item.category}</span>
                    <span className="font-medium">{item.count}件</span>
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
            <h2 className="font-semibold text-on-surface">今月のMVP</h2>
            <Link
              href="/employees"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              全員を見る <ArrowUpRight size={12} />
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
      {(() => {
        const alerts: { title: string; desc: string }[] = [];

        // 休職者アラート
        const onLeaveEmps = employees.filter((e) => e.status === "onLeave");
        if (onLeaveEmps.length > 0) {
          alerts.push({
            title: "休職者フォロー",
            desc: `${onLeaveEmps.map((e) => `${e.name}（${e.department}）`).join("、")}が休職中です。復帰支援プランを確認してください。`,
          });
        }

        // スキル保有者0のカテゴリ
        const allCategories = new Set<string>();
        employees.forEach((e) => e.skills.forEach((s) => allCategories.add(s.category)));
        const emptyCategories = radarCategories.filter(
          (cat) => !employees.some((e) => e.skills.some((s) => s.category === cat))
        );
        if (emptyCategories.length > 0) {
          alerts.push({
            title: "スキルギャップ検出",
            desc: `${emptyCategories.join("・")}領域のスキル保有者が0名です。採用・育成を検討してください。`,
          });
        }

        // パフォーマンス低下アラート
        const lowPerformers = employees.filter((e) => {
          const p2024 = e.performance.find((p) => p.year === 2024)?.score ?? 0;
          return p2024 > 0 && p2024 < 50;
        });
        if (lowPerformers.length > 0) {
          alerts.push({
            title: "パフォーマンス低下",
            desc: `${lowPerformers.length}名のパフォーマンススコアが50未満です。1on1面談を推奨します。`,
          });
        }

        // スキル未登録アラート
        const noSkillEmps = employees.filter((e) => e.skills.length === 0);
        if (noSkillEmps.length > 0) {
          alerts.push({
            title: "スキル未登録",
            desc: `${noSkillEmps.length}名のスキル情報が未登録です。スキルマトリックスから登録してください。`,
          });
        }

        if (alerts.length === 0) return null;

        return (
          <div className="bg-warning-bg rounded-3xl p-6">
            <h2 className="font-semibold text-warning-text mb-4 flex items-center gap-2">
              <AlertTriangle size={18} />
              アクションが必要な事項
            </h2>
            <div className={`grid grid-cols-1 ${alerts.length >= 3 ? "md:grid-cols-3" : alerts.length === 2 ? "md:grid-cols-2" : ""} gap-4`}>
              {alerts.map((alert, i) => (
                <AlertItem key={i} title={alert.title} desc={alert.desc} />
              ))}
            </div>
          </div>
        );
      })()}
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
