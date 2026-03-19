"use client";

import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Target,
  HelpCircle,
  MousePointerClick,
  ChevronDown,
  ChevronRight,
  ListChecks,
  AlertTriangle,
  MessageCircleQuestion,
  Layers,
  Shield,
  Workflow,
} from "lucide-react";

/* ─── Feature sections ─── */
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
];

/* ─── Usage tips ─── */
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
  {
    icon: Users,
    title: "テーブルの並び替え",
    description:
      "従業員一覧のテーブルでは、列ヘッダーをクリックして昇順・降順のソートができます。もう一度クリックするとソート解除になります。",
  },
];

/* ─── Step-by-step guides ─── */
const stepGuides = [
  {
    title: "従業員を新規登録する",
    steps: [
      "サイドバーの「従業員管理」をクリック",
      "右上の「新規追加」ボタンをクリック",
      "フォームに情報を入力（名前は必須）",
      "部署・グレード・ステータスをドロップダウンから選択",
      "必要に応じてプロフィール画像をアップロード（500KB以下のJPG/PNG）",
      "「保存」ボタンをクリックして登録完了",
    ],
  },
  {
    title: "従業員情報を編集する",
    steps: [
      "「従業員管理」ページを開く",
      "編集したい従業員の行にある鉛筆アイコンをクリック",
      "フォームに既存の情報が入力された状態で表示される",
      "変更したい項目を修正する",
      "「保存」をクリックして更新完了",
    ],
  },
  {
    title: "部署を登録・管理する",
    steps: [
      "サイドバーの「部署管理」をクリック",
      "「新規追加」ボタンで部署を追加",
      "部署名・部門長・予算・カラーコードを入力",
      "「保存」で登録完了",
      "登録した部署は従業員管理の部署選択に自動的に反映される",
    ],
  },
  {
    title: "スキルカテゴリとスキルを設定する",
    steps: [
      "サイドバーの「スキルマトリックス」をクリック",
      "まず「カテゴリを追加」でスキルカテゴリ（例: プログラミング、デザイン）を作成",
      "カテゴリごとに「スキルを追加」で個別スキル（例: JavaScript、Figma）を登録",
      "登録したスキルはスキルマトリクスに自動的に反映される",
    ],
  },
  {
    title: "スキルギャップを分析する",
    steps: [
      "「スキルマトリックス」ページを開く",
      "カテゴリフィルタで対象分野を絞り込む",
      "最低レベルフィルタを設定して、特定レベル以上のメンバーを表示",
      "保有者数が少ない・平均レベルが低いスキルがギャップの候補",
      "「戦略インサイト」ページの「スキルギャップ分析」でより詳細な分析を確認",
    ],
  },
  {
    title: "離職リスクが高い従業員を確認する",
    steps: [
      "「戦略インサイト」ページを開く",
      "「離職リスク評価」セクションを確認",
      "リスクレベルが高い従業員が赤色で表示される",
      "パフォーマンス低下・スキル停滞・在籍年数などが考慮される",
      "対象者のカードをクリックして詳細を確認し、フォローアップを検討",
    ],
  },
];

/* ─── FAQ ─── */
const faqItems = [
  {
    q: "従業員を登録したのにダッシュボードや従業員管理ページに反映されません",
    a: "登録した従業員は、Supabase経由で全ページに自動反映されます。ページをリロードしても表示されない場合は、ブラウザのキャッシュをクリア（Ctrl+Shift+R）してみてください。Supabaseが未設定の場合はモックデータが表示されるため、追加した従業員は表示されません。",
  },
  {
    q: "グレード体系はどうなっていますか？",
    a: "J1〜J3（ジュニア）、S1〜S2（シニア）、M1〜M4（マネージャー）の9段階です。J1が最も低く、M4が最上位です。ダッシュボードの円グラフではジュニア・シニア・マネージャーの3区分で分布を確認できます。",
  },
  {
    q: "ステータスにはどんな種類がありますか？",
    a: "「在籍（active）」「休職中（onLeave）」「リモート（remote）」の3種類です。従業員一覧でステータスのフィルタリング・ソートが可能です。休職者がいる場合はダッシュボードにアラートが表示されます。",
  },
  {
    q: "スキルレベルの1〜5はどう解釈すればよいですか？",
    a: "1: 初心者（基礎知識あり）、2: 初級（指導下で作業可能）、3: 中級（独力で作業可能）、4: 上級（チームをリード可能）、5: エキスパート（社内トップレベル）が目安です。スキルマトリクスでは色の濃さでレベルが視覚的に分かります。",
  },
  {
    q: "プロフィール画像をアップロードしましたがぼやけて表示されます",
    a: "画像は500KB以下の制限があります。できるだけ正方形（例: 200×200px〜400×400px）のJPGまたはPNG画像をお使いください。円形にトリミングされて表示されるため、顔が中央にある画像が最適です。",
  },
  {
    q: "データのバックアップはどうすればいいですか？",
    a: "データはSupabase（PostgreSQL）に保存されています。Supabaseダッシュボード（https://supabase.com/dashboard）からデータベースのバックアップ・エクスポートが可能です。日次の自動バックアップもSupabase側で有効になっています。",
  },
  {
    q: "複数人で同時に操作しても大丈夫ですか？",
    a: "はい。Supabaseはリアルタイムデータベースのため、複数のユーザーが同時に操作可能です。ただし、同じ従業員を同時に編集した場合は、最後に保存した内容が反映されます。",
  },
];

/* ─── Troubleshooting ─── */
const troubleshooting = [
  {
    symptom: "「Supabaseに接続できません」と表示される",
    solutions: [
      ".env.local に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が設定されているか確認",
      "Supabaseダッシュボードで supabase/migration.sql を実行済みか確認",
      "環境変数を変更した場合は開発サーバー（npm run dev）を再起動",
      "ブラウザのコンソール（F12）でネットワークエラーを確認",
    ],
  },
  {
    symptom: "ページでデータが表示されない（読み込み中のまま）",
    solutions: [
      "Supabase接続設定を確認（上記参照）",
      "ブラウザのコンソールでエラーメッセージを確認",
      "ページ上の「再接続」ボタンをクリック",
      "ネットワーク接続を確認",
    ],
  },
  {
    symptom: "従業員を保存しようとすると「名前は必須です」と表示される",
    solutions: [
      "名前フィールドが空になっていないか確認",
      "空白文字のみ入力されている場合もエラーになるため、正しい名前を入力",
    ],
  },
  {
    symptom: "画像アップロード時に「画像サイズは500KB以下にしてください」と表示される",
    solutions: [
      "画像を圧縮ツール（TinyPNG等）でサイズを縮小してから再アップロード",
      "解像度を下げる（200×200px〜400×400px程度で十分）",
      "JPG形式はPNGより軽量になりやすい",
    ],
  },
  {
    symptom: "削除ボタンを押したが従業員が削除されない",
    solutions: [
      "確認ダイアログで「OK」をクリックしたか確認",
      "ブラウザのコンソールでエラーを確認",
      "RLS（Row Level Security）ポリシーの設定を確認",
    ],
  },
  {
    symptom: "チャートやグラフが表示されない",
    solutions: [
      "表示データが0件の場合はグラフが空になることがあります",
      "ブラウザを最新バージョンに更新",
      "ページを再読み込み（Ctrl+R）",
    ],
  },
];

/* ─── Glossary ─── */
const glossary = [
  { term: "KPI", desc: "Key Performance Indicator。組織の目標達成度を測る指標（総従業員数・平均パフォーマンス等）" },
  { term: "スキルマトリクス", desc: "スキル×メンバーの一覧表。誰がどのスキルをどのレベルで保有しているかを可視化" },
  { term: "スキルギャップ", desc: "現在のスキルレベルと目標レベルの差。不足分を把握して研修計画に活用" },
  { term: "離職リスク", desc: "パフォーマンス低下・スキル停滞・在籍年数などから算出した、退職リスクの高さ" },
  { term: "オンボーディング", desc: "新入社員が業務に慣れるまでの期間。部署別の推定期間を戦略インサイトで確認可能" },
  { term: "後継者計画", desc: "重要ポジションの後継者を事前に育成・選定しておく人材計画" },
  { term: "RLS", desc: "Row Level Security。データベースの行単位でアクセス制御する仕組み" },
  { term: "グレード", desc: "社員の等級。J（ジュニア）1-3、S（シニア）1-2、M（マネージャー）1-4" },
];

/* ─── Collapsible Section Component ─── */
function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
      >
        <Icon size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <span className="font-bold text-lg flex-1 dark:text-gray-100">{title}</span>
        {open ? (
          <ChevronDown size={20} className="text-gray-400" />
        ) : (
          <ChevronRight size={20} className="text-gray-400" />
        )}
      </button>
      {open && <div className="p-4 pt-0 bg-white dark:bg-gray-800">{children}</div>}
    </div>
  );
}

export default function ManualPage() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={28} className="text-indigo-600 dark:text-indigo-400" />
        <h1 className="text-2xl font-bold dark:text-gray-100">操作マニュアル</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        TalentOS の各機能と操作方法について説明します。目次から項目をクリックして該当セクションにジャンプできます。
      </p>

      {/* Table of Contents */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">目次</h2>
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {[
            { href: "#features", label: "各機能の説明" },
            { href: "#guides", label: "操作手順ガイド" },
            { href: "#tips", label: "便利な使い方" },
            { href: "#faq", label: "よくある質問（FAQ）" },
            { href: "#troubleshooting", label: "トラブルシューティング" },
            { href: "#glossary", label: "用語集" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* ────── 1. Feature Sections ────── */}
      <section id="features">
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
      </section>

      {/* ────── 2. Step-by-step Guides ────── */}
      <section id="guides" className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
          <ListChecks size={20} />
          操作手順ガイド
        </h2>
        <div className="space-y-3">
          {stepGuides.map((guide) => (
            <CollapsibleSection key={guide.title} title={guide.title} icon={Workflow}>
              <ol className="space-y-2 mt-3">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </CollapsibleSection>
          ))}
        </div>
      </section>

      {/* ────── 3. Usage Tips ────── */}
      <section id="tips" className="mt-10">
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
      </section>

      {/* ────── 4. FAQ ────── */}
      <section id="faq" className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
          <MessageCircleQuestion size={20} />
          よくある質問（FAQ）
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <CollapsibleSection key={i} title={item.q} icon={HelpCircle}>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">
                {item.a}
              </p>
            </CollapsibleSection>
          ))}
        </div>
      </section>

      {/* ────── 5. Troubleshooting ────── */}
      <section id="troubleshooting" className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
          <AlertTriangle size={20} />
          トラブルシューティング
        </h2>
        <div className="space-y-4">
          {troubleshooting.map((item, i) => (
            <div
              key={i}
              className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <h3 className="font-semibold text-sm text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                {item.symptom}
              </h3>
              <ul className="space-y-2">
                {item.solutions.map((sol, j) => (
                  <li key={j} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                    <span className="text-green-500 flex-shrink-0 font-bold">&#10003;</span>
                    {sol}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ────── 6. Glossary ────── */}
      <section id="glossary" className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
          <Layers size={20} />
          用語集
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 w-1/4">用語</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">説明</th>
              </tr>
            </thead>
            <tbody>
              {glossary.map((item, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">{item.term}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ────── 7. Data flow overview ────── */}
      <section className="mt-10 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-gray-100">
          <Shield size={20} />
          データの流れと権限
        </h2>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <h3 className="font-semibold text-sm dark:text-gray-100 mb-2">データの保存先</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              すべてのデータはSupabase（PostgreSQL）に保存されます。登録したデータは、ダッシュボード・従業員管理・部署管理・スキルマトリクス・戦略インサイトの各ページにリアルタイムで反映されます。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm dark:text-gray-100 mb-2">アクセス権限</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              現在は全ユーザーに全操作（閲覧・追加・編集・削除）が許可されています。今後のアップデートで、ユーザー認証とページ別・部署別の権限管理が追加される予定です。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm dark:text-gray-100 mb-2">モックデータとの関係</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Supabaseが設定済みの場合は実データ、未設定の場合はサンプルのモックデータが表示されます。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
