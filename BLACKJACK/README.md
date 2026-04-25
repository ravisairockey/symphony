# 🃏 NEON-GLASS BLACKJACK PRO

A prestige-grade, provably fair Blackjack experience built with Next.js 15, TypeScript, Zustand, Framer Motion, and Tailwind CSS.

## ✨ Features

- **🎴 Liquid Glass UI** — Glassmorphism 2.0 with dynamic mouse-following ambient lighting
- **🔐 Provably Fair** — SHA-256 seed hashing with client/server seed verification
- **🎰 Full Game Logic** — Hit, Stand, Double Down, Split, Surrender
- **🤖 Dealer AI** — Stands on hard 17, hits on soft 17 with realistic thinking delays
- **🎵 Soundscape** — Web Audio API generated card foley and glass UI sounds
- **📳 Haptic Feedback** — Device vibration on Bust and Blackjack (mobile)
- **🧲 Magnetic Buttons** — Buttons that physically lean toward your cursor
- **💾 Persistence** — localStorage saves balance, stats, and game history
- **📱 Responsive** — Scales from 4K monitors to iPhone SE

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript (Strict Mode)
- **State**: Zustand + Immer middleware
- **Motion**: Framer Motion with spring physics
- **Styling**: Tailwind CSS 3.4 with custom glass utilities
- **Fairness**: SHA-256 + seedrandom deterministic shuffle
- **Audio**: Web Audio API (no external files)

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗 Build for Production

```bash
npm run build
```

Static export outputs to `./dist` for GitHub Pages deployment.

## 🌐 Deployment

GitHub Actions CI/CD is configured to auto-deploy to GitHub Pages on every push to `main`.

### 🔧 Required GitHub Repository Settings

Before deployment will work, you must enable GitHub Pages in your repository settings:

1. Go to **Settings → Pages** in your repository (`https://github.com/ravisairockey/BlackJack/settings/pages`)
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. Save the changes

The workflow will then run automatically on each push to `main`.

## 📁 Architecture

```
src/
├── app/              # Next.js App Router
├── core/             # Deterministic game engine
│   ├── deck.ts       # Fisher-Yates + seedrandom
│   ├── fairness.ts   # SHA-256 hashing
│   ├── scoring.ts    # Hand value logic
│   ├── state-machine.ts  # Phase validation
│   └── dealer-ai.ts  # Dealer decisions
├── components/       # Liquid Glass UI
├── hooks/            # Mouse, haptics, soundscape
├── stores/           # Zustand + Immer store
└── lib/              # Utilities
```

## 🎮 Game Rules

- 6-deck shoe with cryptographic seeding
- Dealer stands on all hard 17s, hits soft 17
- Blackjack pays 3:2
- Double down on any first two cards
- Split pairs (one split per hand)
- Late surrender available on first action

---

Built with precision. Play with confidence.
