import { GlassCard } from './ui/GlassCard';
import { SectionReveal } from './ui/SectionReveal';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const journeyItems = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h.01M10 12h.01" />
        <path d="M14 10l2 2-2 2" />
      </svg>
    ),
    title: 'Game Developer',
    subtitle: 'BA Communication Design — Game Arts',
    description:
      'Started with a passion for interactive design and visual storytelling. Built game experiences that blended art and technology.',
    accent: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-400',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'The Pivot',
    subtitle: 'Self-Taught AI Transition',
    description:
      'Discovered the power of AI/ML and began an intensive self-directed journey into neural networks, transformers, and local inference.',
    accent: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
        <path d="M12 18v4" />
        <path d="M8 22h8" />
        <path d="M6 14a6 6 0 0 0 12 0" />
        <path d="M6 14c0-2 1-3.5 2-4" />
        <path d="M18 14c0-2-1-3.5-2-4" />
      </svg>
    ),
    title: 'AI Engineer',
    subtitle: 'In Training',
    description:
      'Building with local LLMs, fine-tuning models with ComfyUI pipelines, running 30B models on consumer hardware, and crafting agentic workflows.',
    accent: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400',
  },
];

const hardwareItems = [
  { label: 'GPU', value: 'RTX 3060', detail: '12GB VRAM', icon: '⚡' },
  { label: 'RAM', value: '32GB', detail: 'DDR4', icon: '💾' },
  { label: 'OS', value: 'Arch Linux', detail: 'Rolling', icon: '🐧' },
  { label: 'Max Model', value: '30B Params', detail: 'Local', icon: '🧠' },
];

function CapabilityBadge({ text, index }: { text: string; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 font-medium"
    >
      {text}
    </motion.span>
  );
}

export function About() {
  return (
    <section id="about" className="relative py-28 sm:py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-20">
            <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/20 mb-5 block">
              About
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
              The <span className="text-gradient">Journey</span>
            </h2>
          </div>
        </SectionReveal>

        {/* Journey cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {journeyItems.map((item, i) => (
            <SectionReveal key={item.title} delay={i * 0.15}>
              <GlassCard className="p-7 sm:p-8 h-full group overflow-hidden">
                {/* Hover gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="relative z-10">
                  <div className={`${item.iconColor} mb-5 opacity-70 group-hover:opacity-100 transition-opacity duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-purple-400/80 font-medium mb-4">{item.subtitle}</p>
                  <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
                </div>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>

        {/* Hardware specs */}
        <SectionReveal delay={0.2}>
          <GlassCard className="p-7 sm:p-9" hover={false}>
            <h3 className="text-base font-semibold text-white/50 mb-7 text-center tracking-wide">
              The Rig
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hardwareItems.map((item) => (
                <div
                  key={item.label}
                  className="text-center p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="text-2xl mb-2.5">{item.icon}</div>
                  <div className="text-white font-bold text-lg">{item.value}</div>
                  <div className="text-white/25 text-[11px] mt-1 uppercase tracking-wider font-medium">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </SectionReveal>

        {/* Capabilities */}
        <SectionReveal delay={0.3}>
          <div className="mt-12 text-center">
            <h3 className="text-sm font-semibold text-white/30 mb-5 uppercase tracking-wider">
              Capabilities
            </h3>
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                '30B Local Models',
                'ComfyUI Pipelines',
                'GGUF Workflows',
                'Model Fine-tuning',
                'Agentic Systems',
                'CUDA Optimization',
              ].map((text, i) => (
                <CapabilityBadge key={text} text={text} index={i} />
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
