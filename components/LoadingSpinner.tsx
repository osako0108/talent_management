export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${dims} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-surface-container" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-container animate-spin" />
      </div>
      {size !== "sm" && (
        <p className="text-sm text-on-surface-variant animate-pulse">
          読み込み中
        </p>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="p-8 flex items-center justify-center h-64">
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
