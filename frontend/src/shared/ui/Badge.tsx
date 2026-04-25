export default function Badge({
  children,
  variant = 'default',
  className = ''
}: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error'; className?: string }) {
  const variants = {
    default: 'bg-white/10 text-gray-300',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}