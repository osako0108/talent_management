-- テストデータ投入用シードSQL
-- migration.sql 実行後に Supabase SQL Editor で実行してください

-- ========================================
-- 部署データ
-- ========================================
INSERT INTO departments (name, head, head_count, budget, description, color) VALUES
  ('エンジニアリング', '田中 雄一', 12, 120000000, 'プロダクト開発・インフラ管理', '#6366f1'),
  ('セールス', '山田 花子', 8, 80000000, '法人営業・カスタマーサクセス', '#f59e0b'),
  ('マーケティング', '佐藤 誠', 6, 60000000, 'ブランド戦略・デジタルマーケ', '#10b981'),
  ('人事', '鈴木 美咲', 4, 40000000, '採用・育成・労務管理', '#ec4899'),
  ('財務・経理', '伊藤 健太', 4, 35000000, '予算管理・財務戦略', '#14b8a6'),
  ('プロダクト', '渡辺 さくら', 5, 50000000, 'プロダクト戦略・ロードマップ', '#8b5cf6');

-- ========================================
-- スキルマスタ（カテゴリは migration.sql で投入済み）
-- ========================================
INSERT INTO skill_masters (name, category_id) VALUES
  -- 技術
  ('TypeScript', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('React', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('Node.js', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('Go', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('Python', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('PostgreSQL', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('SQL', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('gRPC', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('CSS/Tailwind', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('パフォーマンス最適化', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('BigQuery', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('dbt', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('Airflow', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('コードレビュー', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('データ分析', (SELECT id FROM skill_categories WHERE name = '技術')),
  ('アーキテクチャ設計', (SELECT id FROM skill_categories WHERE name = '技術')),
  -- インフラ
  ('AWS', (SELECT id FROM skill_categories WHERE name = 'インフラ')),
  ('Kubernetes', (SELECT id FROM skill_categories WHERE name = 'インフラ')),
  ('Docker', (SELECT id FROM skill_categories WHERE name = 'インフラ')),
  ('Terraform', (SELECT id FROM skill_categories WHERE name = 'インフラ')),
  ('CI/CD', (SELECT id FROM skill_categories WHERE name = 'インフラ')),
  ('セキュリティ', (SELECT id FROM skill_categories WHERE name = 'インフラ')),
  -- マネジメント
  ('チームマネジメント', (SELECT id FROM skill_categories WHERE name = 'マネジメント')),
  ('プロジェクト管理', (SELECT id FROM skill_categories WHERE name = 'マネジメント')),
  ('ステークホルダー管理', (SELECT id FROM skill_categories WHERE name = 'マネジメント')),
  -- 営業
  ('法人営業', (SELECT id FROM skill_categories WHERE name = '営業')),
  ('カスタマーサクセス', (SELECT id FROM skill_categories WHERE name = '営業')),
  ('契約交渉', (SELECT id FROM skill_categories WHERE name = '営業')),
  -- コミュニケーション
  ('交渉力', (SELECT id FROM skill_categories WHERE name = 'コミュニケーション')),
  ('プレゼンテーション', (SELECT id FROM skill_categories WHERE name = 'コミュニケーション')),
  ('提案力', (SELECT id FROM skill_categories WHERE name = 'コミュニケーション')),
  ('顧客折衝', (SELECT id FROM skill_categories WHERE name = 'コミュニケーション')),
  ('投資家対応', (SELECT id FROM skill_categories WHERE name = 'コミュニケーション')),
  -- マーケティング
  ('デジタルマーケティング', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  ('SEO/SEM', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  ('コンテンツ戦略', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  ('コンテンツライティング', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  ('SEO', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  ('SNS運用', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  ('採用広報', (SELECT id FROM skill_categories WHERE name = 'マーケティング')),
  -- HR
  ('採用管理', (SELECT id FROM skill_categories WHERE name = 'HR')),
  ('労務管理', (SELECT id FROM skill_categories WHERE name = 'HR')),
  ('組織開発', (SELECT id FROM skill_categories WHERE name = 'HR')),
  ('研修設計', (SELECT id FROM skill_categories WHERE name = 'HR')),
  ('スカウト', (SELECT id FROM skill_categories WHERE name = 'HR')),
  ('面接', (SELECT id FROM skill_categories WHERE name = 'HR')),
  -- ファイナンス
  ('財務戦略', (SELECT id FROM skill_categories WHERE name = 'ファイナンス')),
  ('会計', (SELECT id FROM skill_categories WHERE name = 'ファイナンス')),
  ('M&A', (SELECT id FROM skill_categories WHERE name = 'ファイナンス')),
  ('リスク管理', (SELECT id FROM skill_categories WHERE name = 'ファイナンス')),
  -- プロダクト
  ('プロダクト戦略', (SELECT id FROM skill_categories WHERE name = 'プロダクト')),
  ('ユーザーリサーチ', (SELECT id FROM skill_categories WHERE name = 'プロダクト')),
  ('ロードマップ管理', (SELECT id FROM skill_categories WHERE name = 'プロダクト')),
  -- デザイン
  ('UIデザイン', (SELECT id FROM skill_categories WHERE name = 'デザイン')),
  ('UXリサーチ', (SELECT id FROM skill_categories WHERE name = 'デザイン')),
  ('プロトタイピング', (SELECT id FROM skill_categories WHERE name = 'デザイン')),
  ('アクセシビリティ', (SELECT id FROM skill_categories WHERE name = 'デザイン')),
  ('Figma', (SELECT id FROM skill_categories WHERE name = 'デザイン')),
  -- ツール
  ('CRM管理', (SELECT id FROM skill_categories WHERE name = 'ツール')),
  ('Salesforce', (SELECT id FROM skill_categories WHERE name = 'ツール')),
  ('WordPress', (SELECT id FROM skill_categories WHERE name = 'ツール'));

-- ========================================
-- 従業員データ
-- ========================================
INSERT INTO employees (name, name_kana, role, department_id, grade, join_date, email, avatar, status) VALUES
  ('田中 雄一', 'たなか ゆういち', 'エンジニアリングマネージャー',
   (SELECT id FROM departments WHERE name = 'エンジニアリング'), 'M3', '2018-04-01', 'y.tanaka@company.co.jp', '田', 'active'),
  ('中村 翔太', 'なかむら しょうた', 'シニアエンジニア',
   (SELECT id FROM departments WHERE name = 'エンジニアリング'), 'S2', '2019-07-01', 's.nakamura@company.co.jp', '中', 'active'),
  ('小林 あゆみ', 'こばやし あゆみ', 'フロントエンドエンジニア',
   (SELECT id FROM departments WHERE name = 'エンジニアリング'), 'S1', '2021-04-01', 'a.kobayashi@company.co.jp', '小', 'remote'),
  ('松本 大地', 'まつもと だいち', 'インフラエンジニア',
   (SELECT id FROM departments WHERE name = 'エンジニアリング'), 'S2', '2020-01-01', 'd.matsumoto@company.co.jp', '松', 'active'),
  ('井上 麻衣', 'いのうえ まい', 'データエンジニア',
   (SELECT id FROM departments WHERE name = 'エンジニアリング'), 'S1', '2022-04-01', 'm.inoue@company.co.jp', '井', 'active'),
  ('山田 花子', 'やまだ はなこ', 'セールスマネージャー',
   (SELECT id FROM departments WHERE name = 'セールス'), 'M2', '2017-04-01', 'h.yamada@company.co.jp', '山', 'active'),
  ('木村 俊介', 'きむら しゅんすけ', 'アカウントエグゼクティブ',
   (SELECT id FROM departments WHERE name = 'セールス'), 'S2', '2019-10-01', 's.kimura@company.co.jp', '木', 'active'),
  ('林 奈央', 'はやし なお', 'カスタマーサクセスマネージャー',
   (SELECT id FROM departments WHERE name = 'セールス'), 'S2', '2020-07-01', 'n.hayashi@company.co.jp', '林', 'active'),
  ('佐藤 誠', 'さとう まこと', 'マーケティングマネージャー',
   (SELECT id FROM departments WHERE name = 'マーケティング'), 'M2', '2018-10-01', 'm.sato@company.co.jp', '佐', 'active'),
  ('加藤 友美', 'かとう ともみ', 'コンテンツマーケター',
   (SELECT id FROM departments WHERE name = 'マーケティング'), 'S1', '2021-10-01', 't.kato@company.co.jp', '加', 'remote'),
  ('鈴木 美咲', 'すずき みさき', 'HRマネージャー',
   (SELECT id FROM departments WHERE name = '人事'), 'M2', '2016-04-01', 'm.suzuki@company.co.jp', '鈴', 'active'),
  ('西村 拓也', 'にしむら たくや', '採用担当',
   (SELECT id FROM departments WHERE name = '人事'), 'J3', '2022-07-01', 't.nishimura@company.co.jp', '西', 'active'),
  ('伊藤 健太', 'いとう けんた', 'CFO',
   (SELECT id FROM departments WHERE name = '財務・経理'), 'M4', '2015-04-01', 'k.ito@company.co.jp', '伊', 'active'),
  ('渡辺 さくら', 'わたなべ さくら', 'プロダクトマネージャー',
   (SELECT id FROM departments WHERE name = 'プロダクト'), 'M2', '2019-04-01', 's.watanabe@company.co.jp', '渡', 'active'),
  ('岡田 龍之介', 'おかだ りゅうのすけ', 'UXデザイナー',
   (SELECT id FROM departments WHERE name = 'プロダクト'), 'S2', '2020-04-01', 'r.okada@company.co.jp', '岡', 'onLeave');

-- ========================================
-- 従業員スキル（代表的なものを投入）
-- ========================================
-- 田中 雄一
INSERT INTO employee_skills (employee_id, skill_master_id, level) VALUES
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'TypeScript' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'React' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'Node.js' LIMIT 1), 4),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'チームマネジメント' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'アーキテクチャ設計' LIMIT 1), 4);
-- 中村 翔太
INSERT INTO employee_skills (employee_id, skill_master_id, level) VALUES
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'Go' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'Kubernetes' LIMIT 1), 4),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'Docker' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'コードレビュー' LIMIT 1), 5);
-- 山田 花子
INSERT INTO employee_skills (employee_id, skill_master_id, level) VALUES
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), (SELECT id FROM skill_masters WHERE name = '法人営業' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), (SELECT id FROM skill_masters WHERE name = '交渉力' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'CRM管理' LIMIT 1), 4),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'プレゼンテーション' LIMIT 1), 5);
-- 渡辺 さくら
INSERT INTO employee_skills (employee_id, skill_master_id, level) VALUES
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'プロダクト戦略' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'ユーザーリサーチ' LIMIT 1), 4),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'ロードマップ管理' LIMIT 1), 5),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), (SELECT id FROM skill_masters WHERE name = 'データ分析' LIMIT 1), 4);

-- ========================================
-- パフォーマンスデータ
-- ========================================
INSERT INTO employee_performance (employee_id, year, score) VALUES
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), 2022, 85),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), 2023, 88),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), 2024, 92),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), 2022, 80),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), 2023, 84),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), 2024, 89),
  ((SELECT id FROM employees WHERE email = 'a.kobayashi@company.co.jp'), 2022, 78),
  ((SELECT id FROM employees WHERE email = 'a.kobayashi@company.co.jp'), 2023, 83),
  ((SELECT id FROM employees WHERE email = 'a.kobayashi@company.co.jp'), 2024, 87),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), 2022, 90),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), 2023, 93),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), 2024, 95),
  ((SELECT id FROM employees WHERE email = 'm.suzuki@company.co.jp'), 2022, 87),
  ((SELECT id FROM employees WHERE email = 'm.suzuki@company.co.jp'), 2023, 90),
  ((SELECT id FROM employees WHERE email = 'm.suzuki@company.co.jp'), 2024, 92),
  ((SELECT id FROM employees WHERE email = 'k.ito@company.co.jp'), 2022, 88),
  ((SELECT id FROM employees WHERE email = 'k.ito@company.co.jp'), 2023, 91),
  ((SELECT id FROM employees WHERE email = 'k.ito@company.co.jp'), 2024, 93),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), 2022, 85),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), 2023, 89),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), 2024, 92),
  ((SELECT id FROM employees WHERE email = 'r.okada@company.co.jp'), 2022, 82),
  ((SELECT id FROM employees WHERE email = 'r.okada@company.co.jp'), 2023, 85),
  ((SELECT id FROM employees WHERE email = 'r.okada@company.co.jp'), 2024, 87);

-- ========================================
-- プロジェクト担当
-- ========================================
INSERT INTO employee_projects (employee_id, project_name) VALUES
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), '基幹システムリプレイス'),
  ((SELECT id FROM employees WHERE email = 'y.tanaka@company.co.jp'), 'データ基盤整備'),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), '基幹システムリプレイス'),
  ((SELECT id FROM employees WHERE email = 's.nakamura@company.co.jp'), 'API開発'),
  ((SELECT id FROM employees WHERE email = 'a.kobayashi@company.co.jp'), 'デザインシステム構築'),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), 'エンタープライズ開拓'),
  ((SELECT id FROM employees WHERE email = 'h.yamada@company.co.jp'), 'パートナー戦略'),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), 'プロダクトロードマップ策定'),
  ((SELECT id FROM employees WHERE email = 's.watanabe@company.co.jp'), 'ユーザーリサーチ'),
  ((SELECT id FROM employees WHERE email = 'r.okada@company.co.jp'), 'デザインシステム構築');
