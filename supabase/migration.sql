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
  avatar_icon TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL DEFAULT '' CHECK (gender IN ('', 'male', 'female')),
  status TEXT NOT NULL DEFAULT 'training' CHECK (status IN ('active', 'training', 'onLeave', 'remote')),
  training_completed_at TIMESTAMPTZ,
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
-- 従業員経歴コメント（前職・経歴記録）
-- ========================================
CREATE TABLE employee_career_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  summary TEXT NOT NULL DEFAULT '' CHECK (char_length(summary) <= 20),
  detail TEXT NOT NULL DEFAULT '' CHECK (char_length(detail) <= 200),
  created_at TIMESTAMPTZ DEFAULT NOW()
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
ALTER TABLE employee_career_history ENABLE ROW LEVEL SECURITY;

-- anon/authenticated 全ユーザーに CRUD を許可
CREATE POLICY "Allow all on departments" ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_categories" ON skill_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skill_masters" ON skill_masters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_skills" ON employee_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_performance" ON employee_performance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_projects" ON employee_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on employee_career_history" ON employee_career_history FOR ALL USING (true) WITH CHECK (true);

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
