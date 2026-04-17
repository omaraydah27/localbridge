export default function LoadingSpinner({ label = 'Loading', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="h-10 w-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      <span className="text-sm text-stone-500">{label}</span>
    </div>
  );
}
