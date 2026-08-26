import React from 'react';
import { motion } from 'motion/react';

export const AppPreloader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-teal-500/30">
      {/* Soft Ambient Glow */}
      <motion.div 
        className="absolute w-[300px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5] 
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Minimal Illustration Animation */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Static background track */}
          <svg className="absolute inset-0 w-full h-full text-zinc-800" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 4C16.536 4 4 16.536 4 32c0 15.464 12.536 28 28 28 15.464 0 28-12.536 28-28C60 16.536 47.464 4 32 4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-20"
            />
          </svg>

          {/* Animated Ribbon / Infinity-like loader */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" /> {/* teal-400 */}
                <stop offset="100%" stopColor="#10b981" /> {/* emerald-500 */}
              </linearGradient>
            </defs>
            <motion.path
              d="M32 4C16.536 4 4 16.536 4 32c0 15.464 12.536 28 28 28 15.464 0 28-12.536 28-28C60 16.536 47.464 4 32 4z"
              stroke="url(#loader-gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              initial={{ strokeDasharray: "0 176", strokeDashoffset: 0, rotate: 0 }}
              animate={{
                strokeDasharray: ["0 176", "88 176", "0 176"],
                strokeDashoffset: [0, -88, -176],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ originX: 0.5, originY: 0.5 }}
            />
            {/* Inner rotating diamond */}
            <motion.rect
              x="26"
              y="26"
              width="12"
              height="12"
              rx="3"
              fill="#2dd4bf"
              initial={{ rotate: 45, opacity: 0.5, scale: 0.8 }}
              animate={{ 
                rotate: [45, 225, 405],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ originX: 0.5, originY: 0.5 }}
            />
          </svg>
        </div>

        {/* Text Area */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <h1 className="text-white font-extrabold text-xl tracking-tight">GymFlow</h1>
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300 font-medium tracking-widest uppercase">
              Workspace
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-zinc-500 text-sm font-medium tracking-wide flex items-center gap-1"
          >
            Verifying secure session
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              ...
            </motion.span>
          </motion.p>
        </div>
      </div>
    </div>
  );
};
