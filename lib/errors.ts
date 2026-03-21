// lib/errors.ts
export function toUserError(
  error: { code?: string; message?: string } | null,
  context: "save" | "delete" | "load"
): string {
  if (!error) return "";

  // PostgreSQL error codes
  if (error.code === "23505") return "同じデータが既に存在します";
  if (error.code === "23503") return "関連するデータが存在するため操作できません";
  if (error.code === "42P01") return "テーブルが見つかりません。DB設定を確認してください";
  if (error.code === "PGRST301") return "認証エラー: ログインし直してください";
  if (error.code === "PGRST204") return "該当するデータが見つかりませんでした";

  const labels = { save: "保存", delete: "削除", load: "読み込み" };
  return `${labels[context]}に失敗しました。しばらくしてから再度お試しください。`;
}
