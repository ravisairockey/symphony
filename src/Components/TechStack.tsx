import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionReveal } from './ui/SectionReveal';

interface TechItem {
  name: string;
  color: string;
}

const activeTech: TechItem[] = [
  { name: 'Python', color: '#3776AB' },
  { name: 'PyTorch', color: '#EE4C2C' },
  { name: 'Transformers', color: '#FFD21E' },
  { name: 'ComfyUI', color: '#7C3AED' },
  { name: 'GGUF', color: '#22D3EE' },
  { name: 'CUDA', color: '#76B900' },
  { name: 'Linux', color: '#FCC624' },
  { name: 'Git', color: '#F05032' },
  { name: 'Docker', color: '#2496ED' },
  { name: 'Llama.cpp', color: '#EC4899' },
  { name: 'LangChain', color: '#1C64F2' },
  { name: 'Stable Diffusion', color: '#A855F7' },
];

const learningTech: TechItem[] = [
  { name: 'Rust', color: '#CE422B' },
  { name: 'CUDA Kernels', color: '#76B900' },
  { name: 'ONNX', color: '#005A9E' },
  { name: 'TensorRT', color: '#76B900' },
  { name: 'vLLM', color: '#3B82F6' },
  { name: 'LoRA / QLoRA', color: '#F59E0B' },
  { name: 'Triton', color: '#3178C6' },
];

function TechBadge({ item, index }: { item: TechItem; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, y: 15 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.04,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{ scale: 1.08, y: -3 }}
      className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm flex items-center gap-2.5 cursor-default transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06]"
    >
      <div
        className="w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-black"
        style={{
          backgroundColor: item.color,
          boxShadow: `0 0 8px ${item.color}40`,
          ringColor: `${item.color}30`,
        }}
      />
      <span className="text-[13px] font-medium text-white/60">{item.name}</span>
    </motion.div>
  );
}

export function TechStack() {
  return (
    <section id="tech-stack" className="relative py-28 sm:py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-20">
            <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/20 mb-5 block">
              Tech Stack
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
              Tools & <span className="text-gradient">Technologies</span>
            </h2>
          </div>
        </SectionReveal>

        {/* Active */}
        <SectionReveal delay={0.1}>
          <div className="mb-14">
            <h3 className="text-sm font-semibold text-white/40 mb-6 flex items-center gap-2.5 tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              <span className="uppercase tracking-widest text-[11px]">Active</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {activeTech.map((item, i) => (
                <TechBadge key={item.name} item={item} index={i} />
              ))}
            </div>
          </div>
        </SectionReveal>

        {/* Learning */}
        <SectionReveal delay={0.2}>
          <div>
            <h3 className="text-sm font-semibold text-white/40 mb-6 flex items-center gap-2.5 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="uppercase tracking-widest text-[11px]">Learning</span>
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {learningTech.map((item, i) => (
                <TechBadge key={item.name} item={item} index={i} />
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
