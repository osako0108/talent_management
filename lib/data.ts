export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export type Skill = {
  name: string;
  category: string;
  level: SkillLevel;
};

export type Employee = {
  id: string;
  name: string;
  nameKana: string;
  role: string;
  department: string;
  grade: string;
  joinDate: string;
  email: string;
  avatar: string;
  skills: Skill[];
  performance: { year: number; score: number }[];
  projects: string[];
  status: "active" | "onLeave" | "remote";
  leftDate: string;
};

export type Department = {
  id: string;
  name: string;
  head: string;
  headCount: number;
  budget: number;
  description: string;
  color: string;
};

export const departments: Department[] = [
  {
    id: "eng",
    name: "エンジニアリング",
    head: "田中 雄一",
    headCount: 12,
    budget: 120000000,
    description: "プロダクト開発・インフラ管理",
    color: "#6366f1",
  },
  {
    id: "sales",
    name: "セールス",
    head: "山田 花子",
    headCount: 8,
    budget: 80000000,
    description: "法人営業・カスタマーサクセス",
    color: "#f59e0b",
  },
  {
    id: "marketing",
    name: "マーケティング",
    head: "佐藤 誠",
    headCount: 6,
    budget: 60000000,
    description: "ブランド戦略・デジタルマーケ",
    color: "#10b981",
  },
  {
    id: "hr",
    name: "人事",
    head: "鈴木 美咲",
    headCount: 4,
    budget: 40000000,
    description: "採用・育成・労務管理",
    color: "#ec4899",
  },
  {
    id: "finance",
    name: "財務・経理",
    head: "伊藤 健太",
    headCount: 4,
    budget: 35000000,
    description: "予算管理・財務戦略",
    color: "#14b8a6",
  },
  {
    id: "product",
    name: "プロダクト",
    head: "渡辺 さくら",
    headCount: 5,
    budget: 50000000,
    description: "プロダクト戦略・ロードマップ",
    color: "#8b5cf6",
  },
];

export const employees: Employee[] = [
  // Engineering
  {
    id: "e001",
    name: "田中 雄一",
    nameKana: "たなか ゆういち",
    role: "エンジニアリングマネージャー",
    department: "エンジニアリング",
    grade: "M3",
    joinDate: "2018-04-01",
    email: "y.tanaka@company.co.jp",
    avatar: "田",
    status: "active",
    projects: ["基幹システムリプレイス", "データ基盤整備"],
    skills: [
      { name: "TypeScript", category: "技術", level: 5 },
      { name: "React", category: "技術", level: 5 },
      { name: "Node.js", category: "技術", level: 4 },
      { name: "チームマネジメント", category: "マネジメント", level: 5 },
      { name: "アーキテクチャ設計", category: "技術", level: 4 },
      { name: "プロジェクト管理", category: "マネジメント", level: 4 },
    ],
    performance: [
      { year: 2022, score: 85 },
      { year: 2023, score: 88 },
      { year: 2024, score: 92 },
    ],
    leftDate: "",
  },
  {
    id: "e002",
    name: "中村 翔太",
    nameKana: "なかむら しょうた",
    role: "シニアエンジニア",
    department: "エンジニアリング",
    grade: "S2",
    joinDate: "2019-07-01",
    email: "s.nakamura@company.co.jp",
    avatar: "中",
    status: "active",
    projects: ["基幹システムリプレイス", "API開発"],
    skills: [
      { name: "Go", category: "技術", level: 5 },
      { name: "Kubernetes", category: "インフラ", level: 4 },
      { name: "PostgreSQL", category: "技術", level: 4 },
      { name: "gRPC", category: "技術", level: 4 },
      { name: "Docker", category: "インフラ", level: 5 },
      { name: "コードレビュー", category: "技術", level: 5 },
    ],
    performance: [
      { year: 2022, score: 80 },
      { year: 2023, score: 84 },
      { year: 2024, score: 89 },
    ],
    leftDate: "",
  },
  {
    id: "e003",
    name: "小林 あゆみ",
    nameKana: "こばやし あゆみ",
    role: "フロントエンドエンジニア",
    department: "エンジニアリング",
    grade: "S1",
    joinDate: "2021-04-01",
    email: "a.kobayashi@company.co.jp",
    avatar: "小",
    status: "remote",
    projects: ["デザインシステム構築", "ダッシュボード開発"],
    skills: [
      { name: "React", category: "技術", level: 5 },
      { name: "TypeScript", category: "技術", level: 4 },
      { name: "CSS/Tailwind", category: "技術", level: 5 },
      { name: "Figma", category: "デザイン", level: 3 },
      { name: "パフォーマンス最適化", category: "技術", level: 4 },
    ],
    performance: [
      { year: 2022, score: 78 },
      { year: 2023, score: 83 },
      { year: 2024, score: 87 },
    ],
    leftDate: "",
  },
  {
    id: "e004",
    name: "松本 大地",
    nameKana: "まつもと だいち",
    role: "インフラエンジニア",
    department: "エンジニアリング",
    grade: "S2",
    joinDate: "2020-01-01",
    email: "d.matsumoto@company.co.jp",
    avatar: "松",
    status: "active",
    projects: ["データ基盤整備", "セキュリティ強化"],
    skills: [
      { name: "AWS", category: "インフラ", level: 5 },
      { name: "Terraform", category: "インフラ", level: 4 },
      { name: "Kubernetes", category: "インフラ", level: 5 },
      { name: "セキュリティ", category: "インフラ", level: 4 },
      { name: "CI/CD", category: "インフラ", level: 4 },
    ],
    performance: [
      { year: 2022, score: 81 },
      { year: 2023, score: 85 },
      { year: 2024, score: 88 },
    ],
    leftDate: "",
  },
  {
    id: "e005",
    name: "井上 麻衣",
    nameKana: "いのうえ まい",
    role: "データエンジニア",
    department: "エンジニアリング",
    grade: "S1",
    joinDate: "2022-04-01",
    email: "m.inoue@company.co.jp",
    avatar: "井",
    status: "active",
    projects: ["データ基盤整備", "分析基盤構築"],
    skills: [
      { name: "Python", category: "技術", level: 4 },
      { name: "BigQuery", category: "技術", level: 4 },
      { name: "dbt", category: "技術", level: 3 },
      { name: "Airflow", category: "技術", level: 3 },
      { name: "SQL", category: "技術", level: 5 },
    ],
    performance: [
      { year: 2022, score: 76 },
      { year: 2023, score: 80 },
      { year: 2024, score: 85 },
    ],
    leftDate: "",
  },
  // Sales
  {
    id: "s001",
    name: "山田 花子",
    nameKana: "やまだ はなこ",
    role: "セールスマネージャー",
    department: "セールス",
    grade: "M2",
    joinDate: "2017-04-01",
    email: "h.yamada@company.co.jp",
    avatar: "山",
    status: "active",
    projects: ["エンタープライズ開拓", "パートナー戦略"],
    skills: [
      { name: "法人営業", category: "営業", level: 5 },
      { name: "交渉力", category: "コミュニケーション", level: 5 },
      { name: "CRM管理", category: "ツール", level: 4 },
      { name: "チームマネジメント", category: "マネジメント", level: 4 },
      { name: "プレゼンテーション", category: "コミュニケーション", level: 5 },
    ],
    performance: [
      { year: 2022, score: 90 },
      { year: 2023, score: 93 },
      { year: 2024, score: 95 },
    ],
    leftDate: "",
  },
  {
    id: "s002",
    name: "木村 俊介",
    nameKana: "きむら しゅんすけ",
    role: "アカウントエグゼクティブ",
    department: "セールス",
    grade: "S2",
    joinDate: "2019-10-01",
    email: "s.kimura@company.co.jp",
    avatar: "木",
    status: "active",
    projects: ["エンタープライズ開拓"],
    skills: [
      { name: "法人営業", category: "営業", level: 4 },
      { name: "提案力", category: "コミュニケーション", level: 4 },
      { name: "Salesforce", category: "ツール", level: 4 },
      { name: "契約交渉", category: "営業", level: 4 },
    ],
    performance: [
      { year: 2022, score: 82 },
      { year: 2023, score: 86 },
      { year: 2024, score: 88 },
    ],
    leftDate: "",
  },
  {
    id: "s003",
    name: "林 奈央",
    nameKana: "はやし なお",
    role: "カスタマーサクセスマネージャー",
    department: "セールス",
    grade: "S2",
    joinDate: "2020-07-01",
    email: "n.hayashi@company.co.jp",
    avatar: "林",
    status: "active",
    projects: ["顧客継続率改善", "オンボーディング最適化"],
    skills: [
      { name: "カスタマーサクセス", category: "営業", level: 5 },
      { name: "データ分析", category: "技術", level: 3 },
      { name: "プロジェクト管理", category: "マネジメント", level: 3 },
      { name: "顧客折衝", category: "コミュニケーション", level: 5 },
    ],
    performance: [
      { year: 2022, score: 83 },
      { year: 2023, score: 87 },
      { year: 2024, score: 90 },
    ],
    leftDate: "",
  },
  // Marketing
  {
    id: "m001",
    name: "佐藤 誠",
    nameKana: "さとう まこと",
    role: "マーケティングマネージャー",
    department: "マーケティング",
    grade: "M2",
    joinDate: "2018-10-01",
    email: "m.sato@company.co.jp",
    avatar: "佐",
    status: "active",
    projects: ["ブランドリニューアル", "デジタルマーケ戦略"],
    skills: [
      { name: "デジタルマーケティング", category: "マーケティング", level: 5 },
      { name: "SEO/SEM", category: "マーケティング", level: 4 },
      { name: "コンテンツ戦略", category: "マーケティング", level: 5 },
      { name: "データ分析", category: "技術", level: 4 },
      { name: "チームマネジメント", category: "マネジメント", level: 4 },
    ],
    performance: [
      { year: 2022, score: 84 },
      { year: 2023, score: 88 },
      { year: 2024, score: 91 },
    ],
    leftDate: "",
  },
  {
    id: "m002",
    name: "加藤 友美",
    nameKana: "かとう ともみ",
    role: "コンテンツマーケター",
    department: "マーケティング",
    grade: "S1",
    joinDate: "2021-10-01",
    email: "t.kato@company.co.jp",
    avatar: "加",
    status: "remote",
    projects: ["コンテンツSEO強化", "SNSマーケティング"],
    skills: [
      { name: "コンテンツライティング", category: "マーケティング", level: 4 },
      { name: "SEO", category: "マーケティング", level: 4 },
      { name: "SNS運用", category: "マーケティング", level: 4 },
      { name: "WordPress", category: "ツール", level: 3 },
    ],
    performance: [
      { year: 2022, score: 77 },
      { year: 2023, score: 82 },
      { year: 2024, score: 85 },
    ],
    leftDate: "",
  },
  // HR
  {
    id: "h001",
    name: "鈴木 美咲",
    nameKana: "すずき みさき",
    role: "HRマネージャー",
    department: "人事",
    grade: "M2",
    joinDate: "2016-04-01",
    email: "m.suzuki@company.co.jp",
    avatar: "鈴",
    status: "active",
    projects: ["採用ブランディング", "評価制度改定"],
    skills: [
      { name: "採用管理", category: "HR", level: 5 },
      { name: "労務管理", category: "HR", level: 5 },
      { name: "組織開発", category: "HR", level: 4 },
      { name: "研修設計", category: "HR", level: 4 },
      { name: "データ分析", category: "技術", level: 3 },
    ],
    performance: [
      { year: 2022, score: 87 },
      { year: 2023, score: 90 },
      { year: 2024, score: 92 },
    ],
    leftDate: "",
  },
  {
    id: "h002",
    name: "西村 拓也",
    nameKana: "にしむら たくや",
    role: "採用担当",
    department: "人事",
    grade: "J3",
    joinDate: "2022-07-01",
    email: "t.nishimura@company.co.jp",
    avatar: "西",
    status: "active",
    projects: ["エンジニア採用強化", "採用ブランディング"],
    skills: [
      { name: "採用管理", category: "HR", level: 3 },
      { name: "スカウト", category: "HR", level: 3 },
      { name: "面接", category: "HR", level: 3 },
      { name: "採用広報", category: "マーケティング", level: 2 },
    ],
    performance: [
      { year: 2022, score: 72 },
      { year: 2023, score: 77 },
      { year: 2024, score: 81 },
    ],
    leftDate: "",
  },
  // Finance
  {
    id: "f001",
    name: "伊藤 健太",
    nameKana: "いとう けんた",
    role: "CFO",
    department: "財務・経理",
    grade: "M4",
    joinDate: "2015-04-01",
    email: "k.ito@company.co.jp",
    avatar: "伊",
    status: "active",
    projects: ["IPO準備", "コスト最適化"],
    skills: [
      { name: "財務戦略", category: "ファイナンス", level: 5 },
      { name: "会計", category: "ファイナンス", level: 5 },
      { name: "M&A", category: "ファイナンス", level: 4 },
      { name: "リスク管理", category: "ファイナンス", level: 4 },
      { name: "投資家対応", category: "コミュニケーション", level: 4 },
    ],
    performance: [
      { year: 2022, score: 88 },
      { year: 2023, score: 91 },
      { year: 2024, score: 93 },
    ],
    leftDate: "",
  },
  // Product
  {
    id: "p001",
    name: "渡辺 さくら",
    nameKana: "わたなべ さくら",
    role: "プロダクトマネージャー",
    department: "プロダクト",
    grade: "M2",
    joinDate: "2019-04-01",
    email: "s.watanabe@company.co.jp",
    avatar: "渡",
    status: "active",
    projects: ["プロダクトロードマップ策定", "ユーザーリサーチ"],
    skills: [
      { name: "プロダクト戦略", category: "プロダクト", level: 5 },
      { name: "ユーザーリサーチ", category: "プロダクト", level: 4 },
      { name: "データ分析", category: "技術", level: 4 },
      { name: "ロードマップ管理", category: "プロダクト", level: 5 },
      { name: "ステークホルダー管理", category: "マネジメント", level: 4 },
    ],
    performance: [
      { year: 2022, score: 85 },
      { year: 2023, score: 89 },
      { year: 2024, score: 92 },
    ],
    leftDate: "",
  },
  {
    id: "p002",
    name: "岡田 龍之介",
    nameKana: "おかだ りゅうのすけ",
    role: "UXデザイナー",
    department: "プロダクト",
    grade: "S2",
    joinDate: "2020-04-01",
    email: "r.okada@company.co.jp",
    avatar: "岡",
    status: "onLeave",
    projects: ["デザインシステム構築"],
    skills: [
      { name: "UIデザイン", category: "デザイン", level: 5 },
      { name: "UXリサーチ", category: "デザイン", level: 4 },
      { name: "Figma", category: "ツール", level: 5 },
      { name: "プロトタイピング", category: "デザイン", level: 4 },
      { name: "アクセシビリティ", category: "デザイン", level: 3 },
    ],
    performance: [
      { year: 2022, score: 82 },
      { year: 2023, score: 85 },
      { year: 2024, score: 87 },
    ],
    leftDate: "",
  },
];

export const skillCategories = [
  "技術",
  "インフラ",
  "マネジメント",
  "営業",
  "コミュニケーション",
  "マーケティング",
  "HR",
  "ファイナンス",
  "プロダクト",
  "デザイン",
  "ツール",
];

export const gradeLabels: Record<string, string> = {
  J1: "ジュニア1",
  J2: "ジュニア2",
  J3: "ジュニア3",
  S1: "シニア1",
  S2: "シニア2",
  M1: "マネージャー1",
  M2: "マネージャー2",
  M3: "マネージャー3",
  M4: "マネージャー4（役員）",
};

export const statusLabels: Record<string, string> = {
  active: "在籍",
  onLeave: "休職中",
  remote: "リモート",
};

export const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  onLeave: "bg-yellow-100 text-yellow-800",
  remote: "bg-blue-100 text-blue-800",
};
