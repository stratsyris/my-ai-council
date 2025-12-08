import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedCard({ children, delay = 0 }: AnimatedCardProps) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 duration-500 border rounded-lg p-4 bg-card text-card-foreground shadow-md hover:shadow-lg transition-shadow"
      style={{
        animationDelay: `${delay * 100}ms`,
      }}
    >
      {children}
    </div>
  );
}
