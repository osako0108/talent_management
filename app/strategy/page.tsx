"use client";

/**
 * 戦略インサイトページ
 *
 * 将来の拡張メモ:
 * - DB導入時: Prisma + PostgreSQL を推奨。Employee テーブルに
 *   leaveDate, tenureMonths 等を追加して本番の退職率を算出
 * - 同時編集: API Routes (or Server Actions) で楽観的ロック
 *   (version カラム) を使い競合を防ぐ
 * - 権限管理: NextAuth.js + ロールベース(admin/manager/member)
 *   で /api/employees/:id を保護
 * - 分析強化: 独り立ち期間は入社日〜最初の単独アサイン日を
 *   projects テーブルから集計する設計が最適
 */

import { employees, departments } from "@/lib/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from "recharts";
import { AlertTriangle, TrendingUp, Users, Clock } from "lucide-react";

export default function StrategyPage() {
  // --- 在籍年数計算 ---
  const today = new Date("2026-03-17");
  const empWithTenure = employees.map((e) => {
    const joinDate = new Date(e.joinDate);
    const months =
      (today.getFullYear() - joinDate.getFullYear()) * 12 +
      (today.getMonth() - joinDate.getMonth());
    const years = months / 12;
    const score2024 = e.performance.find((p) => p.year === 2024)?.score ?? 0;
    return { ...e, tenureMonths: months, tenureYears: years, score2024 };
  });

  // --- 独り立ち期間の擬似推定
  // 実DB導入後はプロジェクトアサイン履歴から算出
  // 現在はグレードと入社日から推定
  const onboardingData = departments.map((dept) => {
    const members = empWithTenure.filter((e) => e.department === dept.name);
    const juniors = members.filter((e) => e.grade.startsWith("J"));
    // ジュニアの平均在籍月数をオンボーディング期間の目安とする
    const avgOnboarding =
      juniors.length > 0
        ? juniors.reduce((s, e) => s + Math.min(e.tenureMonths, 24), 0) /
          juniors.length
        : 12;
    return {
      dept: dept.name.length > 5 ? dept.name.slice(0, 5) + "…" : dept.name,
      fullDept: dept.name,
      months: Math.round(avgOnboarding),
      color: dept.color,
    };
  });

  // --- パフォーマンス vs 在籍年数（散布図）---
  const scatterData = empWithTenure.map((e) => ({
    x: Math.round(e.tenureYears * 10) / 10,
    y: e.score2024,
    name: e.name,
    dept: e.department,
  }));

  // --- 年度別パフォーマンス推移（全社平均）---
  const perfTrend = [2022, 2023, 2024].map((year) => ({
    year,
    全社平均:
      Math.round(
        (employees.reduce((s, e) => {
          const p = e.performance.find((p) => p.year === year);
          return s + (p?.score ?? 0);
        }, 0) /
          employees.length) *
          10
      ) / 10,
  }));

  // --- スキルギャップ（目標レベル - 現状平均）---
  const skillGaps = [
    { skill: "データサイエンス", current: 0, target: 3, category: "技術" },
    { skill: "AI/ML", current: 0.5, target: 3, category: "技術" },
    {
      skill: "プロジェクト管理",
      current: 3.5,
      target: 4,
      category: "マネジメント",
    },
    { skill: "セキュリティ", current: 2.5, target: 4, category: "インフラ" },
    {
      skill: "デジタルマーケ",
      current: 3.5,
      target: 4.5,
      category: "マーケティング",
    },
    { skill: "財務リテラシー", current: 2, target: 3.5, category: "ファイナンス" },
  ].map((g) => ({ ...g, gap: g.target - g.current }));

  // --- 退職リスク（擬似スコア: パフォーマンス低下 + 休職中）---
  // 実DB導入後: アンケートや1on1データから算出
  const retentionRisks = empWithTenure
    .map((e) => {
      const perfDrop =
        (e.performance.find((p) => p.year === 2022)?.score ?? 0) -
        (e.performance.find((p) => p.year === 2024)?.score ?? 0);
      const leaveRisk = e.status === "onLeave" ? 30 : 0;
      // 短期間でスコアが下がっている場合リスク高
      const riskScore = Math.max(0, perfDrop * 2 + leaveRisk);
      return { ...e, riskScore };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  // --- サクセッションプラン ---
  const successionRoles = [
    {
      role: "エンジニアリングマネージャー",
      current: "田中 雄一",
      candidates: ["中村 翔太", "松本 大地"],
      readiness: "6〜12ヶ月",
    },
    {
      role: "セールスマネージャー",
      current: "山田 花子",
      candidates: ["木村 俊介", "林 奈央"],
      readiness: "12〜18ヶ月",
    },
    {
      role: "CFO",
      current: "伊藤 健太",
      candidates: ["—（要育成）"],
      readiness: "未定",
    },
    {
      role: "HRマネージャー",
      current: "鈴木 美咲",
      candidates: ["—（要採用）"],
      readiness: "未定",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">戦略インサイト</h1>
        <p className="text-gray-500 mt-1">
          人材データをもとに経営戦略を立案するためのインサイト
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          icon={<TrendingUp size={18} className="text-indigo-600" />}
          bg="bg-indigo-50"
          title="全社平均評価 (2024)"
          value={`${(employees.reduce((s, e) => s + (e.performance.find((p) => p.year === 2024)?.score ?? 0), 0) / employees.length).toFixed(1)}点`}
          sub="前年比 +3.2点"
        />
        <InsightCard
          icon={<Clock size={18} className="text-amber-600" />}
          bg="bg-amber-50"
          title="平均在籍年数"
          value={`${(empWithTenure.reduce((s, e) => s + e.tenureYears, 0) / empWithTenure.length).toFixed(1)}年`}
          sub="定着率は良好"
        />
        <InsightCard
          icon={<Users size={18} className="text-emerald-600" />}
          bg="bg-emerald-50"
          title="推定退職リスク者"
          value={`${retentionRisks.filter((e) => e.riskScore > 0).length}名`}
          sub="要フォローアップ"
        />
        <InsightCard
          icon={<AlertTriangle size={18} className="text-rose-600" />}
          bg="bg-rose-50"
          title="スキルギャップ数"
          value={`${skillGaps.filter((g) => g.gap >= 2).length}件`}
          sub="緊急度の高いギャップ"
        />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* パフォーマンス推移 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            全社パフォーマンス推移
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={perfTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis domain={[80, 95]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`${v}点`]} />
              <Line
                type="monotone"
                dataKey="全社平均"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 独り立ち期間 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">
            部署別・独り立ちまでの推定期間
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            ※ 現在はサンプル推定値。DB導入後はプロジェクトアサイン履歴から算出予定
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={onboardingData} barSize={36} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                label={{ value: "ヶ月", position: "insideRight", offset: 10, fontSize: 11 }}
              />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={(v) => [`${v}ヶ月`]}
                labelFormatter={(label) =>
                  onboardingData.find((d) => d.dept === label)?.fullDept ?? label
                }
              />
              <Bar dataKey="months" radius={[0, 6, 6, 0]}>
                {onboardingData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* スキルギャップ */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">
            スキルギャップ分析
          </h2>
          <div className="space-y-3">
            {skillGaps.map((g) => (
              <div key={g.skill}>
                <div className="flex justify-between text-sm mb-1">
                  <div>
                    <span className="font-medium text-gray-800">{g.skill}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {g.category}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      g.gap >= 2.5
                        ? "text-rose-600"
                        : g.gap >= 1
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}
                  >
                    {g.gap >= 2.5 ? "🔴" : g.gap >= 1 ? "🟡" : "🟢"} ギャップ{" "}
                    {g.gap}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full"
                      style={{ width: `${(g.current / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    現状 {g.current}
                  </span>
                </div>
                <div className="flex gap-2 items-center mt-0.5">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-300 rounded-full"
                      style={{ width: `${(g.target / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">
                    目標 {g.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 退職リスク */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">
            リテンションリスク
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            ※ 現在はパフォーマンス傾向から推定。DB導入後はエンゲージメント調査・1on1データを活用予定
          </p>
          <div className="space-y-3">
            {retentionRisks.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 flex-shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{emp.name}</span>
                    <span
                      className={`text-xs font-bold ${
                        emp.riskScore > 20
                          ? "text-rose-600"
                          : emp.riskScore > 0
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {emp.riskScore > 20
                        ? "高リスク"
                        : emp.riskScore > 0
                        ? "中リスク"
                        : "低リスク"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {emp.department} · {emp.role}
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        emp.riskScore > 20
                          ? "bg-rose-500"
                          : emp.riskScore > 0
                          ? "bg-amber-400"
                          : "bg-green-400"
                      }`}
                      style={{ width: `${Math.min(emp.riskScore * 2, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* パフォーマンス vs 在籍年数 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">
          在籍年数 × パフォーマンス
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="x"
              name="在籍年数"
              unit="年"
              tick={{ fontSize: 12 }}
              label={{ value: "在籍年数", position: "insideBottom", offset: -5, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="評価"
              domain={[65, 100]}
              tick={{ fontSize: 12 }}
              label={{ value: "評価点", angle: -90, position: "insideLeft", fontSize: 12 }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-2 shadow text-xs">
                      <div className="font-semibold">{d.name}</div>
                      <div className="text-gray-500">{d.dept}</div>
                      <div>在籍 {d.x}年 · {d.y}点</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* サクセッションプラン */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">
          サクセッションプラン（後継者候補）
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-gray-500 font-semibold">
                  ポジション
                </th>
                <th className="text-left py-2 pr-4 text-gray-500 font-semibold">
                  現任者
                </th>
                <th className="text-left py-2 pr-4 text-gray-500 font-semibold">
                  後継者候補
                </th>
                <th className="text-left py-2 text-gray-500 font-semibold">
                  準備期間目安
                </th>
              </tr>
            </thead>
            <tbody>
              {successionRoles.map((r) => (
                <tr key={r.role} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium text-gray-800">
                    {r.role}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{r.current}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {r.candidates.map((c) => (
                        <span
                          key={c}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            c.startsWith("—")
                              ? "bg-rose-50 text-rose-600"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        r.readiness === "未定"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {r.readiness}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  bg,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  bg: string;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div
          className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
