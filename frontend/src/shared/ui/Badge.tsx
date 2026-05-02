export default function Badge({
  children,
  variant = 'default',
  className = ''
}: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error'; className?: string }) {
  const variants = {
    default: 'bg-white/10 text-slate-200',
    success: 'bg-emerald-500/20 text-emerald-300',
    warning: 'bg-amber-500/20 text-amber-300',
    error: 'bg-red-500/20 text-red-300'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
