import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SectionReveal } from './ui/SectionReveal';
import { GlassCard } from './ui/GlassCard';

interface RoadmapItem {
  skill: string;
  progress: number;
  color: string;
  category: string;
}

const roadmapItems: RoadmapItem[] = [
  { skill: 'ComfyUI Pipelines', progress: 92, color: 'from-pink-500 to-rose-400', category: 'Creative AI' },
  { skill: 'GGUF / Quantization', progress: 87, color: 'from-rose-400 to-purple-500', category: 'Infrastructure' },
  { skill: 'LLM Fine-tuning', progress: 78, color: 'from-purple-500 to-indigo-500', category: 'ML Engineering' },
  { skill: 'Agentic Systems', progress: 72, color: 'from-indigo-500 to-blue-500', category: 'AI Architecture' },
  { skill: 'Model Architecture', progress: 62, color: 'from-blue-500 to-cyan-500', category: 'Deep Learning' },
  { skill: 'CUDA Programming', progress: 42, color: 'from-cyan-500 to-teal-400', category: 'Systems' },
];

function ProgressBar({ item, index }: { item: RoadmapItem; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <div className="flex justify-between items-baseline mb-2.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white/70">{item.skill}</span>
          <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider hidden sm:inline">
            {item.category}
          </span>
        </div>
        <span className="text-sm font-mono text-white/30 tabular-nums">{item.progress}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${item.color}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${item.progress}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.4 + index * 0.12,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${item.progress}%` } : { width: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.4 + index * 0.12,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          <div className="absolute inset-0 animate-shimmer" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function Roadmap() {
  return (
    <section id="roadmap" className="relative py-28 sm:py-36 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-20">
            <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/20 mb-5 block">
              Roadmap
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
              Skill <span className="text-gradient">Progression</span>
            </h2>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <GlassCard className="p-7 sm:p-10" hover={false}>
            <div className="space-y-7">
              {roadmapItems.map((item, i) => (
                <ProgressBar key={item.skill} item={item} index={i} />
              ))}
            </div>

            {/* Legend */}
            <div className="mt-10 pt-7 border-t border-white/[0.04] flex flex-wrap gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
                <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
                  Advanced
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
                  Intermediate
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" />
                <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
                  Learning
                </span>
              </div>
            </div>
          </GlassCard>
        </SectionReveal>
      </div>
    </section>
  );
}
