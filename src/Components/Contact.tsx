import { SectionReveal } from './ui/SectionReveal';
import { GlassCard } from './ui/GlassCard';
import { motion } from 'framer-motion';

const socials = [
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'X / Twitter',
    href: 'https://x.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export function Contact() {
  return (
    <section id="contact" className="relative py-28 sm:py-36 px-6">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[600px] rounded-full bg-purple-500/[0.04] blur-[160px]" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-16">
            <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-white/20 mb-5 block">
              Contact
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.02em] mb-6">
              Let's <span className="text-gradient">Connect</span>
            </h2>
            <p className="text-white/30 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
              Interested in collaborating on AI projects, discussing local LLMs, or just want to chat?
              Let's talk.
            </p>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.2}>
          <GlassCard className="p-8 sm:p-12 text-center" hover={false}>
            {/* CTA Button */}
            <div className="mb-10">
              <motion.a
                href="mailto:ravisai@example.com"
                className="relative inline-flex items-center justify-center px-10 py-5 rounded-2xl font-semibold text-white overflow-hidden group cursor-pointer text-base sm:text-lg"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-0 group-hover:opacity-25 blur-3xl transition-opacity duration-500" />
                <span className="relative z-10 flex items-center gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Get In Touch
                </span>
              </motion.a>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-[1px] bg-white/[0.04]" />
              <span className="text-white/15 text-[10px] uppercase tracking-[0.3em] font-medium">
                or find me on
              </span>
              <div className="flex-1 h-[1px] bg-white/[0.04]" />
            </div>

            {/* Social links */}
            <div className="flex justify-center gap-3">
              {socials.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/70 hover:border-white/[0.12] hover:bg-white/[0.06] transition-all duration-300"
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </GlassCard>
        </SectionReveal>

        {/* Footer */}
        <SectionReveal delay={0.3}>
          <div className="text-center mt-20 space-y-4">
            <div className="flex justify-center">
              <span className="text-2xl font-bold tracking-tighter text-gradient">RSV</span>
            </div>
            <p className="text-white/15 text-xs tracking-wide">
              © {new Date().getFullYear()} Ravi Sai Vigneswara. Crafted with passion in Karnataka.
            </p>
            <div className="flex items-center justify-center gap-2 text-white/10 text-[10px]">
              <span>Arch Linux</span>
              <span>·</span>
              <span>RTX 3060</span>
              <span>·</span>
              <span>32GB RAM</span>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
