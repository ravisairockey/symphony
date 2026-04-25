import { GlassCard } from './ui/GlassCard';
import { SectionReveal } from './ui/SectionReveal';
import { AnimatedCounter } from './ui/AnimatedCounter';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  {
    label: 'Max Model Size',
    value: 30,
    suffix: 'B',
    description: 'Parameters',
    icon: '🧠',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    label: 'GPU VRAM',
    value: 12,
    suffix: 'GB',
    description: 'RTX 3060',
    icon: '⚡',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    label: 'System RAM',
    value: 32,
    suffix: 'GB',
    description: 'DDR4',
    icon: '💾',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    label: 'Local Inference',
    value: 100,
    suffix: '%',
    description: 'On-Premise',
    icon: '🔒',
    gradient: 'from-green-500 to-emerald-500',
  },
];

function ContributionGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Generate a realistic-looking contribution grid
  const cells = Array.from({ length: 91 }, (_, i) => {
    const rand = Math.random();
    let level = 0;
    if (rand > 0.3) level = 1;
    if (rand > 0.55) level = 2;
    if (rand > 0.75) level = 3;
    if (rand > 0.9) level = 4;

    // Make recent cells more active
    if (i > 60 && rand > 0.2) level = Math.min(level + 1, 4);

    return level;
  });

  const colors = [
    'bg-white/[0.03]',
    'bg-purple-500/20',
    'bg-purple-500/40',
    'bg-purple-500/60',
    'bg-purple-500/80',
  ];

  return (
    <div ref={ref} className="flex gap-[3px] justify-center flex-wrap max-w-md mx-auto">
      {cells.map((level, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{
            duration: 0.3,
            delay: i * 0.008,
            ease: 'easeOut',
          }}
          className={`w-[10px] h-[10px] rounded-[2px] ${colors[level]}`}
        />
      ))}
    </div>
  );
}

export function Stats() {
  return (
    <section id="stats" className="relative py-28 sm:py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-20">
            <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/20 mb-5 block">
              Stats
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
              By The <span className="text-gradient">Numbers</span>
            </h2>
          </div>
        </SectionReveal>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-16">
          {stats.map((stat, i) => (
            <SectionReveal key={stat.label} delay={i * 0.1}>
              <GlassCard className="p-6 sm:p-8 text-center group" hover={false}>
                <div className="text-2xl mb-3">{stat.icon}</div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/50 font-medium text-sm mb-1">{stat.label}</div>
                <div className="text-white/20 text-[11px] uppercase tracking-wider font-medium">
                  {stat.description}
                </div>
              </GlassCard>
            </SectionReveal>
          ))}
        </div>

        {/* Activity grid */}
        <SectionReveal delay={0.3}>
          <GlassCard className="p-7 sm:p-9" hover={false}>
            <div className="text-center mb-6">
              <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest">
                Activity
              </h3>
              <p className="text-white/20 text-xs mt-1">Learning activity over the past 13 weeks</p>
            </div>
            <ContributionGrid />
          </GlassCard>
        </SectionReveal>
      </div>
    </section>
  );
}
