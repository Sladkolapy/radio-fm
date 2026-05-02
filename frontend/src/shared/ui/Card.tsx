export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-surface/90 backdrop-blur-lg rounded-xl border border-white/10 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
