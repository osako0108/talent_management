"use client";

import {
  BookOpen,
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Target,
  Database,
  HelpCircle,
  MousePointerClick,
} from "lucide-react";

const sections = [
  {
    icon: LayoutDashboard,
    title: "ダッシュボード",
    description:
      "組織全体のKPI、部署別人数、グレード分布、スキルバランス、トップパフォーマー、アラートを一覧で確認できます。",
    features: [
      "総従業員数・部署数・平均パフォーマンスの表示",
      "部署別人数の棒グラフ",
      "グレード分布の円グラフ（ジュニア/シニア/マネージャー）",
      "スキルバランスのレーダーチャート",
      "トップ5パフォーマーの表示",
      "スキルギャップ・休職者・後継者不足のアラート",
    ],
  },
  {
    icon: Users,
    title: "従業員管理",
    description:
      "全従業員の一覧表示、検索、フィルタリング、個別の詳細情報を確認できます。",
    features: [
      "名前・役職・スキルでの検索",
      "部署・ステータスによるフィルタ",
      "従業員カードでスキル・パフォーマンスを表示",
      "個別詳細ページでパフォーマンス推移・スキルレーダーチャートを確認",
    ],
  },
  {
    icon: Building2,
    title: "部署管理",
    description:
      "部署ごとのパフォーマンス、人員構成、予算、連携状況を可視化します。",
    features: [
      "部署別平均パフォーマンスの比較",
      "実員数 vs 計画人数の表示",
      "予算・マネージャー数の確認",
      "部署間連携マップ",
    ],
  },
  {
    icon: BarChart3,
    title: "スキルマトリックス",
    description:
      "組織全体のスキル分布を一覧で確認し、スキルギャップの特定に活用できます。",
    features: [
      "カテゴリ・部署・スキルレベルでのフィルタ",
      "スキルごとの保有者数・平均レベル",
      "スキル×メンバーの詳細マトリクス表",
      "レベル別の色分け表示（1〜5段階）",
    ],
  },
  {
    icon: Target,
    title: "戦略インサイト",
    description:
      "組織の戦略的課題を数値で把握し、意思決定をサポートします。",
    features: [
      "全社パフォーマンストレンド",
      "部署別オンボーディング期間の推定",
      "スキルギャップ分析（現在レベル vs 目標レベル）",
      "離職リスク評価",
      "在籍年数 vs パフォーマンスの散布図",
      "後継者計画の管理",
    ],
  },
  {
    icon: Database,
    title: "マスタ管理",
    description:
      "各種マスタデータの登録・編集・削除を行います。",
    features: [
      "部署マスタ: 部署の追加・編集・削除、予算・カラー設定",
      "スキルマスタ: スキルカテゴリとスキルの管理",
      "スタッフマスタ: 従業員情報の登録・編集・削除",
    ],
  },
];

const tips = [
  {
    icon: MousePointerClick,
    title: "従業員の詳細を見るには",
    description:
      "「従業員管理」ページで従業員カードをクリックすると、スキル詳細やパフォーマンス推移を確認できます。",
  },
  {
    icon: BarChart3,
    title: "スキルの絞り込み",
    description:
      "「スキルマトリックス」ページでカテゴリ・部署・最低レベルを指定して、必要なスキルを持つメンバーを素早く見つけられます。",
  },
  {
    icon: Target,
    title: "離職リスクの確認",
    description:
      "「戦略インサイト」ページの離職リスク評価セクションで、リスクの高い従業員を把握し、早期にフォローアップできます。",
  },
];

export default function ManualPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={28} className="text-indigo-600" />
        <h1 className="text-2xl font-bold dark:text-gray-100">操作マニュアル</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        TalentOS の各機能と操作方法について説明します。
      </p>

      {/* Feature Sections */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
        <HelpCircle size={20} />
        各機能の説明
      </h2>
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-lg dark:text-gray-100">{section.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                {section.description}
              </p>
              <ul className="space-y-1">
                {section.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                    <span className="text-indigo-400 flex-shrink-0">-</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Usage Tips */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
          <MousePointerClick size={20} />
          便利な使い方
        </h2>
        <div className="space-y-4">
          {tips.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.title}
                className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm dark:text-gray-100">{tip.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {tip.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
