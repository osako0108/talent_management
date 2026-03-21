# TalentOS - タレントマネジメントシステム

## プロジェクト概要
社内の人材管理・スキル可視化・組織最適化を行うダッシュボードアプリケーション。

## 技術スタック
- **フレームワーク**: Next.js 16 (App Router) + TypeScript 5
- **スタイリング**: Tailwind CSS 4
- **チャート**: Recharts 3
- **バックエンド**: Supabase (PostgreSQL + RLS)
- **アイコン**: Lucide React

## ディレクトリ構成
```
app/
├── page.tsx                    # ダッシュボード（KPI・チャート・アラート）
├── employees/
│   ├── page.tsx               # 従業員一覧（検索・フィルタ）
│   └── [id]/page.tsx          # 従業員詳細（スキル・パフォーマンス推移）
├── departments/page.tsx       # 部署管理（パフォーマンス比較・連携マップ）
├── skills/page.tsx            # スキルマトリクス（スキル×メンバー表）
├── projects/page.tsx          # プロジェクト管理（部署/スタッフアサイン・マイルストーン）
├── strategy/page.tsx          # 戦略インサイト（ギャップ分析・離職リスク）
├── manual/page.tsx            # 操作マニュアル
├── layout.tsx                 # ルートレイアウト（サイドバー付き）
└── globals.css
components/
└── Sidebar.tsx                # サイドバーナビゲーション
lib/
├── data.ts                    # 型定義＆モックデータ（既存ページ用）
└── supabase.ts                # Supabaseクライアント
supabase/
└── migration.sql              # DBスキーマ（テーブル・RLS・初期データ）
```

## データベース構成（Supabase）
| テーブル | 説明 |
|---------|------|
| departments | 部署マスタ（name, head, head_count, budget, description, color） |
| skill_categories | スキルカテゴリマスタ（name） |
| skill_masters | スキルマスタ（name, category_id → skill_categories） |
| employees | 従業員（name, name_kana, role, department_id, grade, join_date, email, avatar, status, salary） |
| employee_skills | 従業員スキル（employee_id, skill_master_id, level 1-5） |
| employee_performance | パフォーマンス評価（employee_id, year, score 0-100） |
| employee_projects | プロジェクト担当（employee_id, project_name） |

## セキュリティ方針
- 環境変数は `.env.local` で管理（.gitignore に含まれる）
- コードにシークレット（パスワード・service_role キー等）は一切含めない
- `.env.example` にプレースホルダーのみ記載
- RLS（Row Level Security）が全テーブルで有効
- 現在は anon ユーザーに全操作を許可するポリシー（認証追加時に変更予定）

## データソース
- 全ページ → Supabase から取得（未設定時は `lib/data.ts` のモックデータにフォールバック）

## グレード体系
J1-J3（ジュニア）、S1-S2（シニア）、M1-M4（マネージャー）

## ステータス
active（在籍）、onLeave（休職中）、remote（リモート）

## 開発メモ
- `npm run dev` で開発サーバー起動
- Supabase未設定の場合はモックデータで動作
- 日本語UI（全テキスト日本語）

## バージョニング
- サイドバー左下にバージョン番号を表示（`components/Sidebar.tsx`）
- リリースノートは `RELEASE_NOTES.md` に記録
- ブランチ名には採番する（例: `claude/001-feature-name-xxx`）

## 今後の拡張予定（優先度順）

### フェーズ1: 認証基盤（最優先）
- [ ] ログイン画面の作成（Supabase Auth UI）
- [ ] ユーザー認証の実装（Supabase Auth + ミドルウェアによるルート保護）
- [ ] RLSポリシーを `auth.uid()` ベースに変更（自分のデータのみ閲覧可能に）

### フェーズ2: スタッフ向けマイページ（モバイル対応）
- [ ] スタッフ用マイページ画面（自分のスキル・評価・プロジェクト閲覧）
- [ ] レスポンシブUI対応（スマホ最適化）
- [ ] PWA化（manifest.json・Service Worker・ホーム追加対応）
- [ ] ロール別アクセス制御（管理者=全機能 / スタッフ=マイページのみ）

### フェーズ3: API層構築・外部連携
- [ ] API Route Handlers の整備（`app/api/` ディレクトリ）
- [ ] API認証（APIキー or OAuth）
- [ ] 外部システム連携用REST API（従業員・スキル・評価データの取得・更新）
- [ ] Webhook対応（従業員追加・更新時の通知）

### フェーズ4: 機能拡充
- [ ] UIの調整（デザイン改善）
- [ ] 従業員スキル・パフォーマンスの一括編集
- [ ] CSVインポート/エクスポート
- [ ] 1on1フィードバック・エンゲージメント調査

### フェーズ5: メンター記録・1on1管理
- [ ] メンター記録機能（ログインユーザーが他ユーザーに対して非公開で対応履歴を残す）
- [ ] 1on1記録（自分のアカウントだけに表示、上長・メンター用の記録管理）
- [ ] 相互公開オプション（記録を対象者にも公開できるようにする）
- [ ] 日報管理機能

### フェーズ6: 目標管理（OKR/MBOツリー）
- [ ] 会社目標の設定（トップレベル目標）
- [ ] 目標ツリー構造（会社→部署→個人の階層的目標展開）
- [ ] 期間マスタ管理（半期・通年・四半期を会社単位で設定可能に）
- [ ] マイルストーン設定と毎月の達成度記入
- [ ] 達成度のツリー可視化（個人→部署→会社へ積み上げ）
- [ ] アラート機能（未達・遅延をツリー上で可視化、上長・余裕ある人にフォロー通知）

### フェーズ7: 採用管理
- [ ] 採用予実管理（計画 vs 実績）
- [ ] タレントプール管理（これから入る人材の管理）
- [ ] 退職者管理（出て行った人材の記録・分析）

### フェーズ8: ログインユーザー個人機能
- [ ] お気に入り機能（従業員・部署等のブックマーク）
- [ ] その他ユーザー単位のパーソナライズ機能

### フェーズ9: SaaS基盤・マルチテナント化
- [ ] 会社単位のSaaS型導入対応（マルチテナントアーキテクチャ）
- [ ] スーパーユーザー実装（全社の管理画面にアクセス可能、company_id + user_id をキーに）
- [ ] 運用管理サイト（アカウント作成・顧客管理・停止/解約・請求管理）
- [ ] admin権限の柔軟な設定機能

### プロダクトビジョン
> 単なるタレントマネジメントではなく、**人材戦略を軸にした経営管理ツール**として確立させる。
> 今いる人材・出て行った人材・これから入る人材（タレントプール）を一元管理。
> 操作性はシンプルに。

## 環境構成
- **本番(PROD)**: Vercel本番環境 + Supabase本番プロジェクト
- **開発(DEV)**: Vercelプレビュー環境 + Supabase DEVプロジェクト（別プロジェクト）
- リポジトリは共通、環境変数で接続先を切り替え
- Vercelのプレビューデプロイ（PR単位）でDEV環境を自動構築

```
本番: Vercel Production → NEXT_PUBLIC_SUPABASE_URL=本番URL
DEV:  Vercel Preview    → NEXT_PUBLIC_SUPABASE_URL=DEV用URL
ローカル: .env.local    → 開発者ごとに設定
```

## デプロイ
- **ホスティング**: Vercel（GitHub連携で自動デプロイ）
- **環境変数**: Vercelダッシュボードで NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を設定済み
- **Supabase**: プロジェクトRefは .env.local を参照
