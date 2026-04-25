import { motion } from 'framer-motion';

export function Loader() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-purple-500/[0.07] blur-[120px] animate-pulse-glow" />
      </div>

      {/* Logo / Initials */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
        className="relative mb-10"
      >
        <div className="text-5xl md:text-7xl font-bold tracking-tighter">
          <span className="text-gradient">RSV</span>
        </div>
        {/* Underline glow */}
        <motion.div
          className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Loading bar */}
      <div className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-6 text-white/25 text-xs tracking-[0.4em] uppercase font-light"
      >
        Loading Experience
      </motion.p>
    </motion.div>
  );
}
