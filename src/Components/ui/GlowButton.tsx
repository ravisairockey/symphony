import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  href?: string;
}

export function GlowButton({ children, onClick, className = '', href }: GlowButtonProps) {
  const Component = href ? motion.a : motion.button;

  return (
    <Component
      href={href}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden group cursor-pointer ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" />
      <span className="relative z-10">{children}</span>
    </Component>
  );
}
