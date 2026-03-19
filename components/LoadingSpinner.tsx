export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${dims} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
      </div>
      {size !== "sm" && (
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
          読み込み中
        </p>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="p-6 flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function InlineLoading() {
  return (
    <div className="text-center py-12">
      <LoadingSpinner size="md" />
    </div>
  );
}
