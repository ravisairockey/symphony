"use client";

import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

export function AmbientBackground() {
  const mouse = useMousePosition();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-[#050510]" />

      {/* Animated mesh gradient orbs */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px]"
        animate={{
          x: mouse.normalizedX * 200 - 400,
          y: mouse.normalizedY * 200 - 400,
        }}
        transition={{ type: "spring", damping: 50, stiffness: 30 }}
        style={{
          background: "radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)",
          top: "10%",
          left: "20%",
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
        animate={{
          x: (1 - mouse.normalizedX) * 150 - 300,
          y: (1 - mouse.normalizedY) * 150 - 300,
        }}
        transition={{ type: "spring", damping: 60, stiffness: 25 }}
        style={{
          background: "radial-gradient(circle, rgba(157,78,221,0.2) 0%, transparent 70%)",
          top: "40%",
          right: "10%",
        }}
      />
      <motion.div
        className="absolute w-[700px] h-[700px] rounded-full opacity-25 blur-[110px]"
        animate={{
          x: mouse.normalizedX * 100 - 350,
          y: (1 - mouse.normalizedY) * 100 - 350,
        }}
        transition={{ type: "spring", damping: 55, stiffness: 28 }}
        style={{
          background: "radial-gradient(circle, rgba(255,0,110,0.12) 0%, transparent 70%)",
          bottom: "10%",
          left: "30%",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
