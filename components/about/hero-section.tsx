"use client"

import { motion } from "framer-motion"

export function HeroSection() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    }

    return (
        <section className="relative h-screen flex flex-col justify-center items-center px-4 overflow-hidden bg-black text-white">
            {/* Premium Background with Parallax Feel */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1.05 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 bg-[url('/about-hero-bg.png')] bg-cover bg-center bg-no-repeat opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
            </div>

            <div className="relative z-10 text-center max-w-6xl mx-auto space-y-10 mt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-brand-green/30 bg-black/60 backdrop-blur-xl text-brand-green font-mono text-xs tracking-[0.2em] uppercase shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]"
                >
                    <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                    The Future of Ownership
                </motion.div>

                <motion.h1
                    className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    Build global <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-green to-emerald-300 animate-gradient-x">
                        REAL ESTATE
                    </span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative inline-block"
                >
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                        RENTAL INCOME
                    </h2>
                    <div className="absolute -inset-4 bg-brand-green/20 blur-xl -z-10 rounded-full opacity-50" />
                </motion.div>

                <motion.p
                    className="text-2xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    Own pieces of the world's most iconic buildings. <br />
                    <span className="text-white font-medium border-b border-brand-green/50">Starting from just $50.</span>
                </motion.p>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <div className="w-[1px] h-24 bg-gradient-to-b from-brand-green to-transparent" />
            </motion.div>
        </section>
    )
}
