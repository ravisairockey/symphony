import { motion } from 'framer-motion';
import { useTypingEffect } from '../hooks/useTypingEffect';

export function Hero() {
  const typedText = useTypingEffect(
    ['AI Engineer in Training', 'Local LLM Builder', 'ComfyUI Enthusiast', 'Game Dev → AI'],
    80,
    35,
    2500
  );

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] rounded-full bg-purple-500/[0.07] blur-[140px] animate-float" />
      <div
        className="absolute bottom-1/4 right-1/6 w-[400px] h-[400px] rounded-full bg-pink-500/[0.06] blur-[120px] animate-float"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/[0.05] blur-[100px] animate-float"
        style={{ animationDelay: '4s' }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* Radial fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl mb-10"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
          </span>
          <span className="text-[13px] text-white/50 font-medium">Available for collaboration</span>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.03em] leading-[1.05] mb-8"
        >
          <span className="text-white">Ravi Sai</span>
          <br />
          <span className="text-gradient animate-gradient-text bg-[length:200%_auto]">Vigneswara</span>
        </motion.h1>

        {/* Typing text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-xl sm:text-2xl md:text-3xl text-white/50 font-light mb-3 h-10 sm:h-12 flex items-center justify-center"
        >
          <span>{typedText}</span>
          <span className="inline-block w-[2px] h-6 sm:h-7 bg-gradient-to-b from-pink-500 to-cyan-400 ml-1 animate-pulse" />
        </motion.div>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-white/20 text-xs sm:text-sm tracking-[0.25em] uppercase mb-14 font-medium"
        >
          Karnataka, India
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* Primary CTA */}
          <a
            href="#projects"
            className="relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden group cursor-pointer inline-flex items-center text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              View Projects
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </span>
          </a>

          {/* Secondary CTA */}
          <a
            href="#about"
            className="px-8 py-4 rounded-2xl font-semibold text-white/50 hover:text-white/80 border border-white/[0.06] hover:border-white/[0.15] backdrop-blur-xl transition-all duration-300 inline-flex items-center text-sm"
          >
            Learn More
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-white/15 text-[10px] tracking-[0.4em] uppercase font-medium">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
