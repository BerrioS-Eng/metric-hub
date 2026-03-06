"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              MetricHub
            </motion.h1>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 h-[calc(100vh-72px)]">
        <div className="grid lg:grid-cols-2 gap-8 items-center h-full">
          {/* Left Section - Login/Register Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center"
          >
            <AuthCard onTransition={() => setIsTransitioning(true)} />
          </motion.div>

          {/* Right Section - Animations */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative h-[600px] hidden lg:flex items-center justify-center"
          >
            {/* Animated Circles */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, -180, -360],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/30 to-orange-500/30 blur-3xl"
            />

            {/* Floating Cards */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 right-20 w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-2xl shadow-cyan-500/50"
            />
            <motion.div
              animate={{
                y: [0, 30, 0],
                x: [0, -15, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-32 left-20 w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-2xl shadow-purple-500/50"
            />
            <motion.div
              animate={{
                y: [0, -25, 0],
                x: [0, 20, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-1/2 left-1/3 w-28 h-28 rounded-2xl bg-gradient-to-br from-pink-400 to-orange-500 shadow-2xl shadow-pink-500/50"
            />
          </motion.div>
        </div>
      </div>
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [0, 1.2, 1], rotate: 360 }}
                transition={{ duration: 1 }}
                className="text-white text-6xl font-bold"
              >
                MetricHub
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}