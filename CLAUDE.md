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
├── strategy/page.tsx          # 戦略インサイト（ギャップ分析・離職リスク）
├── master/
│   ├── departments/page.tsx   # 部署マスタCRUD
│   ├── skills/page.tsx        # スキルカテゴリ＆スキルマスタCRUD
│   └── employees/page.tsx     # スタッフマスタCRUD
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
| employees | 従業員（name, name_kana, role, department_id, grade, join_date, email, avatar, status） |
| employee_skills | 従業員スキル（employee_id, skill_master_id, level 1-5） |
| employee_performance | パフォーマンス評価（employee_id, year, score 0-100） |
| employee_projects | プロジェクト担当（employee_id, project_name） |

## セキュリティ方針
- 環境変数は `.env.local` で管理（.gitignore に含まれる）
- コードにシークレット（パスワード・service_role キー等）は一切含めない
- `.env.example` にプレースホルダーのみ記載
- RLS（Row Level Security）が全テーブルで有効
- 現在は anon ユーザーに全操作を許可するポリシー（認証追加時に変更予定）

## 既存ページのデータソース
- ダッシュボード、従業員管理、部署管理、スキルマトリクス、戦略インサイト → `lib/data.ts` のモックデータを使用
- マスタ管理ページ → Supabase から直接取得

## グレード体系
J1-J3（ジュニア）、S1-S2（シニア）、M1-M4（マネージャー）

## ステータス
active（在籍）、onLeave（休職中）、remote（リモート）

## 開発メモ
- `npm run dev` で開発サーバー起動
- Supabase未設定の場合、マスタ管理ページでエラーが出る（既存ページはモックデータで動作）
- 日本語UI（全テキスト日本語）

## 今後の拡張予定（優先度順）

### 直近タスク
- [ ] ログイン画面の作成（Supabase Auth UI）
- [ ] ユーザー認証の実装（Supabase Auth + ミドルウェアによるルート保護）
- [ ] UIの調整（レスポンシブ対応・デザイン改善）

### 次フェーズ
- [ ] ページ別・部署別の閲覧権限管理（RLSポリシーをauth.uid()ベースに変更）
- [ ] 既存ページのSupabase連携（モックデータからの移行）
- [ ] 従業員スキル・パフォーマンスの一括編集
- [ ] CSVインポート/エクスポート
- [ ] 1on1フィードバック・エンゲージメント調査

## デプロイ
- **ホスティング**: Vercel（GitHub連携で自動デプロイ）
- **環境変数**: Vercelダッシュボードで NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY を設定済み
- **Supabase**: プロジェクトRef: veihgwwmrnmyohzbcsjz
