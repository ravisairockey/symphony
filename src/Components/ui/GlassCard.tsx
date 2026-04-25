import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`relative rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl ${className}`}
      whileHover={
        hover
          ? {
              borderColor: 'rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.07)',
            }
          : undefined
      }
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
