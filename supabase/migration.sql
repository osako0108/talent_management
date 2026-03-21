-- タレントマネジメント データベーススキーマ
-- Supabase SQL Editor で実行してください

-- ========================================
-- 部署マスタ
-- ========================================
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  head TEXT NOT NULL DEFAULT '',
  head_count INTEGER NOT NULL DEFAULT 0,
  budget BIGINT NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- スキルカテゴリマスタ
-- ========================================
CREATE TABLE skill_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- スキルマスタ
-- ========================================
CREATE TABLE skill_masters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, category_id)
);

-- ========================================
-- 従業員（スタッフ）
-- ========================================
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_kana TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  grade TEXT NOT NULL DEFAULT 'J1',
  join_date DATE,
  email TEXT NOT NULL DEFAULT '',
  avatar TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'onLeave', 'remote')),
  salary BIGINT NOT NULL DEFAULT 0,
  left_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- 従業員スキル（中間テーブル）
-- ========================================
CREATE TABLE employee_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_master_id UUID NOT NULL REFERENCES skill_masters(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  UNIQUE(employee_id, skill_master_id)
);

-- ========================================
-- 従業員パフォーマンス
-- ========================================
CREATE TABLE employee_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  UNIQUE(employee_id, year)
);

-- ========================================
-- 従業員プロジェクト
-- ========================================
CREATE TABLE employee_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL
);

-- ========================================
-- updated_at 自動更新トリガー
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================================
-- RLS（Row Level Security）ポリシー
-- 認証なしフェーズ: anon ユーザーに全操作を許可
-- ※ 認証追加時にポリシーを変更してください
-- ========================================
-- TODO: 認証実装時に以下を実施すること
--   1. 下記の "Allow all" ポリシーを全て DROP する
--   2. auth.uid() ベースのポリシーに置き換える
--     例: CREATE POLICY "Authenticated read" ON employees
--          FOR SELECT USING (auth.role() = 'authenticated');
--   3. 管理者ロール (M1-M4) のみ INSERT/UPDATE/DELETE を許可
--   4. 一般ユーザーは自部署のデータのみ閲覧可能にする
-- ========================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_projects ENABLE ROW LEVEL SECURITY;

-- anon/authenticated 全ユーザーに CRUD を許可
CREATE POLICY "Allow all on departments" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_categories" ON skill_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_masters" ON skill_masters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_skills" ON employee_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_performance" ON employee_performance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_projects" ON employee_projects FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 初期データ（スキルカテゴリ）
-- ========================================
INSERT INTO skill_categories (name) VALUES
  ('技術'), ('インフラ'), ('マネジメント'), ('営業'),
  ('コミュニケーション'), ('マーケティング'), ('HR'),
  ('ファイナンス'), ('プロダクト'), ('デザイン'), ('ツール');

-- ========================================
-- スキルタグ
-- ========================================
CREATE TABLE IF NOT EXISTS skill_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skill_master_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_master_id UUID NOT NULL REFERENCES skill_masters(id) ON DELETE CASCADE,
  skill_tag_id UUID NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
  UNIQUE(skill_master_id, skill_tag_id)
);

ALTER TABLE skill_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_master_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on skill_tags" ON skill_tags FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_master_tags" ON skill_master_tags FOR ALL USING (true) WITH CHECK (true);

INSERT INTO skill_tags (name, color) VALUES
  ('開発', '#6366f1'),
  ('希少', '#f59e0b'),
  ('必須', '#ef4444'),
  ('新規', '#10b981')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 役職マスタ
-- ========================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on roles" ON roles FOR ALL USING (true) WITH CHECK (true);

INSERT INTO roles (name, description) VALUES
  ('エンジニアリングマネージャー', '技術チームの管理・育成'),
  ('シニアエンジニア', '上級エンジニア'),
  ('フロントエンドエンジニア', 'フロントエンド開発担当'),
  ('インフラエンジニア', 'インフラ構築・運用'),
  ('データエンジニア', 'データ基盤開発'),
  ('セールスマネージャー', '営業チーム管理'),
  ('アカウントエグゼクティブ', '法人営業担当'),
  ('カスタマーサクセスマネージャー', '顧客成功支援'),
  ('マーケティングマネージャー', 'マーケティング戦略'),
  ('コンテンツマーケター', 'コンテンツ制作・運用'),
  ('HRマネージャー', '人事管理'),
  ('採用担当', '採用業務'),
  ('CFO', '最高財務責任者'),
  ('プロダクトマネージャー', 'プロダクト管理'),
  ('UXデザイナー', 'UXデザイン')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- グレードマスタ
-- ========================================
CREATE TABLE IF NOT EXISTS grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  rank_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on grades" ON grades FOR ALL USING (true) WITH CHECK (true);

INSERT INTO grades (code, name, rank_order) VALUES
  ('J1', 'ジュニア1', 1),
  ('J2', 'ジュニア2', 2),
  ('J3', 'ジュニア3', 3),
  ('S1', 'シニア1', 4),
  ('S2', 'シニア2', 5),
  ('M1', 'マネージャー1', 6),
  ('M2', 'マネージャー2', 7),
  ('M3', 'マネージャー3', 8),
  ('M4', 'マネージャー4（役員）', 9)
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- ステータスマスタ
-- ========================================
CREATE TABLE IF NOT EXISTS statuses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on statuses" ON statuses FOR ALL USING (true) WITH CHECK (true);

INSERT INTO statuses (code, name, color) VALUES
  ('active', '在籍', '#22c55e'),
  ('onLeave', '休職中', '#eab308'),
  ('remote', 'リモート', '#3b82f6')
ON CONFLICT (code) DO NOTHING;

-- ========================================
-- プロジェクト管理
-- ========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- プロジェクト×部署アサイン
CREATE TABLE IF NOT EXISTS project_departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE(project_id, department_id)
);

-- プロジェクト×スタッフアサイン
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT DEFAULT '',
  UNIQUE(project_id, employee_id)
);

-- プロジェクト必要スキル
CREATE TABLE IF NOT EXISTS project_required_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_master_id UUID NOT NULL REFERENCES skill_masters(id) ON DELETE CASCADE,
  required_level INTEGER NOT NULL DEFAULT 1 CHECK (required_level BETWEEN 1 AND 5),
  UNIQUE(project_id, skill_master_id)
);

-- マイルストーン
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on project_departments" ON project_departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on project_members" ON project_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on project_required_skills" ON project_required_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on project_milestones" ON project_milestones FOR ALL USING (true) WITH CHECK (true);
