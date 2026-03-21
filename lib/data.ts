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
  status: "active" | "training" | "onLeave" | "remote";
  leftDate: string;
  trainingCompletedAt: string;
  gender: "male" | "female" | "";
  avatarIcon: string;
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
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  onLeave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  remote: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};
