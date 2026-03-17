"use client";

import {
  BookOpen,
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Target,
  Database,
  Shield,
  Settings,
  HelpCircle,
} from "lucide-react";

const sections = [
  {
    icon: LayoutDashboard,
    title: "ダッシュボード",
    path: "/",
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
    path: "/employees",
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
    path: "/departments",
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
    path: "/skills",
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
    path: "/strategy",
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
    path: "",
    description:
      "各種マスタデータの登録・編集・削除を行います。",
    features: [
      "部署マスタ（/master/departments）: 部署の追加・編集・削除、予算・カラー設定",
      "スキルマスタ（/master/skills）: スキルカテゴリとスキルの管理",
      "スタッフマスタ（/master/employees）: 従業員情報の登録・編集・削除",
    ],
  },
];

const setupSteps = [
  {
    step: 1,
    title: "Supabaseプロジェクトの作成",
    description:
      "supabase.com でアカウント作成し、新規プロジェクトを作成します。",
  },
  {
    step: 2,
    title: "データベーススキーマの適用",
    description:
      "Supabase ダッシュボードの SQL Editor で supabase/migration.sql を実行します。テーブル、RLSポリシー、初期データが作成されます。",
  },
  {
    step: 3,
    title: "環境変数の設定",
    description:
      ".env.example を .env.local にコピーし、Supabase ダッシュボード > Settings > API から URL と anon key を設定します。",
  },
  {
    step: 4,
    title: "開発サーバーの起動",
    description: "npm run dev でローカル開発サーバーを起動します。",
  },
];

export default function ManualPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={28} className="text-indigo-600" />
        <h1 className="text-2xl font-bold">操作マニュアル</h1>
      </div>
      <p className="text-gray-500 mb-8">
        TalentOS v1.0 の各機能と操作方法について説明します。
      </p>

      {/* Setup Guide */}
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings size={20} />
          セットアップガイド
        </h2>
        <div className="space-y-4">
          {setupSteps.map((s) => (
            <div
              key={s.step}
              className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notes */}
      <div className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-amber-800">
          <Shield size={20} />
          セキュリティに関する注意事項
        </h2>
        <ul className="space-y-2 text-sm text-amber-900">
          <li>
            - 環境変数（.env.local）はリポジトリにコミットしないでください（.gitignore
            に設定済み）
          </li>
          <li>
            - NEXT_PUBLIC_SUPABASE_ANON_KEY はクライアントサイドで使用する公開キーです
          </li>
          <li>
            - Supabase の service_role キーは絶対にクライアントコードに含めないでください
          </li>
          <li>
            - RLS（Row Level Security）が全テーブルで有効になっています
          </li>
          <li>
            - 現在は認証なしで全操作を許可するポリシーです。本番運用前に必ず認証を追加してください
          </li>
          <li>
            - 認証追加時は RLS ポリシーを
            auth.uid() ベースに変更してください
          </li>
        </ul>
      </div>

      {/* Feature Sections */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <HelpCircle size={20} />
        各機能の説明
      </h2>
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="p-6 bg-white rounded-xl border border-gray-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  {section.path && (
                    <span className="text-xs text-gray-400 font-mono">
                      {section.path}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {section.description}
              </p>
              <ul className="space-y-1">
                {section.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-indigo-400 flex-shrink-0">-</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* DB Schema */}
      <div className="mt-10 mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Database size={20} />
          データベース構成
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                table: "departments",
                desc: "部署マスタ",
                cols: "name, head, head_count, budget, description, color",
              },
              {
                table: "skill_categories",
                desc: "スキルカテゴリマスタ",
                cols: "name",
              },
              {
                table: "skill_masters",
                desc: "スキルマスタ",
                cols: "name, category_id",
              },
              {
                table: "employees",
                desc: "従業員",
                cols: "name, name_kana, role, department_id, grade, join_date, email, avatar, status",
              },
              {
                table: "employee_skills",
                desc: "従業員スキル",
                cols: "employee_id, skill_master_id, level",
              },
              {
                table: "employee_performance",
                desc: "パフォーマンス評価",
                cols: "employee_id, year, score",
              },
              {
                table: "employee_projects",
                desc: "プロジェクト担当",
                cols: "employee_id, project_name",
              },
            ].map((t) => (
              <div key={t.table} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-mono text-sm font-bold text-indigo-700">
                  {t.table}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                <div className="text-xs text-gray-400 mt-1 font-mono">
                  {t.cols}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future Plans */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
        <h2 className="text-lg font-bold mb-3">今後の拡張予定</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>- Supabase Auth による認証・ログイン機能</li>
          <li>- ページ別・部署別の閲覧権限管理</li>
          <li>- 従業員スキル・パフォーマンスの一括編集</li>
          <li>- CSVインポート/エクスポート</li>
          <li>- 1on1フィードバック・エンゲージメント調査</li>
        </ul>
      </div>
    </div>
  );
}
