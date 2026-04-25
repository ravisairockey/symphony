import { GlassCard } from './ui/GlassCard';
import { TiltCard } from './ui/TiltCard';
import { SectionReveal } from './ui/SectionReveal';

interface Project {
  title: string;
  description: string;
  tech: string[];
  status: string;
  statusColor: string;
  gradient: string;
  icon: string;
}

const projects: Project[] = [
  {
    title: 'ComfyUI Mastery',
    description:
      'Building advanced image generation pipelines with custom nodes, workflows, and optimized inference for high-quality AI art generation with ControlNet and LoRA integration.',
    tech: ['ComfyUI', 'Stable Diffusion', 'ControlNet', 'LoRA'],
    status: 'Active',
    statusColor: 'bg-green-400',
    gradient: 'from-pink-500/10 to-purple-500/10',
    icon: '🎨',
  },
  {
    title: 'Mythology MoE Fine-tuning',
    description:
      'Fine-tuning Mixture-of-Experts models on mythology datasets, creating specialized knowledge models with deep domain expertise in ancient narratives.',
    tech: ['PyTorch', 'Transformers', 'GGUF', 'LoRA'],
    status: 'In Progress',
    statusColor: 'bg-amber-400',
    gradient: 'from-purple-500/10 to-cyan-500/10',
    icon: '📚',
  },
  {
    title: 'Local LLM Infrastructure',
    description:
      'Building robust local inference infrastructure capable of running 30B parameter models efficiently on consumer hardware with quantized formats.',
    tech: ['Llama.cpp', 'CUDA', 'GGUF', 'Python'],
    status: 'Active',
    statusColor: 'bg-green-400',
    gradient: 'from-cyan-500/10 to-blue-500/10',
    icon: '🖥️',
  },
  {
    title: 'Agentic Workflow Automation',
    description:
      'Designing and implementing autonomous AI agent systems for complex multi-step task execution, tool use, and intelligent workflow automation.',
    tech: ['LangChain', 'Python', 'Transformers', 'Docker'],
    status: 'Exploring',
    statusColor: 'bg-blue-400',
    gradient: 'from-pink-500/10 to-amber-500/10',
    icon: '🤖',
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <SectionReveal delay={index * 0.12}>
      <TiltCard className="h-full">
        <GlassCard className="p-7 sm:p-8 h-full overflow-hidden group">
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
          />

          {/* Glow */}
          <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-cyan-500/5 blur-2xl" />
          </div>

          <div className="relative z-10">
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              <span className="text-3xl">{project.icon}</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                <span className={`w-1.5 h-1.5 rounded-full ${project.statusColor} animate-pulse`} />
                <span className="text-[11px] font-medium text-white/35 uppercase tracking-wider">
                  {project.status}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-[-0.01em]">
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-white/35 text-sm leading-relaxed mb-7">{project.description}</p>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/45 uppercase tracking-wider"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </GlassCard>
      </TiltCard>
    </SectionReveal>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative py-28 sm:py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-20">
            <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/20 mb-5 block">
              Projects
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em]">
              What I'm <span className="text-gradient">Building</span>
            </h2>
          </div>
        </SectionReveal>

        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
