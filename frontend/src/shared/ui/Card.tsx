export default function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-xl border border-white/20 p-6 ${className}`}>
      {children}
    </div>
  );
}