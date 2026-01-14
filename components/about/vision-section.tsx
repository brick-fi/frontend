"use client"

import { motion } from "framer-motion"
import { BrainCircuit, Box, Eye, Maximize } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function VisionSection() {
    return (
        <section className="py-32 bg-zinc-950 overflow-hidden">
            <div className="container mx-auto px-4 max-w-6xl space-y-32">

                {/* AI Insights & HUD */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    <div className="absolute inset-0 bg-[url('/about-hud-bg.png')] bg-cover bg-center opacity-80" />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 p-8 md:p-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-green/20 border border-brand-green/50 text-brand-green text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                <BrainCircuit size={14} />
                                <span className="animate-pulse">Live Analysis</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                Data, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Unfiltered.</span>
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                                Our AI engine cuts through the sales talk. Get raw, objective yield forecasts and risk assessments instantly.
                            </p>
                        </div>

                        {/* Augmented AI Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            className="bg-black/80 backdrop-blur-md border border-brand-green/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-green/20 blur-2xl rounded-full group-hover:bg-brand-green/30 transition-all" />

                            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                                    <span className="font-mono text-brand-green text-sm tracking-wider">AI INSIGHTS v2.0</span>
                                </div>
                                <span className="text-xs font-mono text-gray-500">ID: #8829-X</span>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2 text-gray-400">
                                        <span>Yield Forecast</span>
                                        <span className="text-white font-bold">12.4% APY</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "85%" }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-brand-green to-emerald-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <span className="text-xs text-gray-500 block mb-1">Risk Score</span>
                                        <span className="text-xl font-bold text-white">A+</span>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <span className="text-xs text-gray-500 block mb-1">Confidence</span>
                                        <span className="text-xl font-bold text-emerald-400">98.2%</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Future Vision: 3D & RWAs */}
                <div className="text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 blur-[100px] rounded-full -z-10" />
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-20 tracking-tight">The Future of RWA</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Beyond Real Estate - Holographic Grid */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="p-8 pb-0 text-left relative z-10">
                                <Box className="w-10 h-10 text-purple-400 mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-4">Beyond Real Estate</h3>
                                <p className="text-gray-400 mb-8 max-w-sm">
                                    One platform for the world's most valuable asset classes. From fine art to infrastructure.
                                </p>
                            </div>

                            {/* Holographic Asset Grid */}
                            <div className="grid grid-cols-2 gap-px bg-white/5 mt-8 border-t border-white/5">
                                {[
                                    { icon: "🛥️", name: "Superyachts", val: "+14.2%" },
                                    { icon: "🏎️", name: "Supercars", val: "+9.5%" },
                                    { icon: "🎨", name: "Fine Art", val: "+12.4%" },
                                    { icon: "⌚️", name: "Luxury", val: "+8.2%" },
                                ].map((item, i) => (
                                    <div key={i} className="bg-zinc-900/80 backdrop-blur-sm p-6 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group/item cursor-pointer h-32">
                                        <span className="text-2xl mb-1 grayscale group-hover/item:grayscale-0 transition-all scale-90 group-hover/item:scale-110 duration-300">{item.icon}</span>
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{item.name}</span>
                                        <span className="text-xs text-emerald-400 font-mono">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Remote Presence - 3D Scanner View */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden relative group text-left"
                        >
                            {/* Simulated 3D Viewport Background */}
                            <div className="absolute inset-0 z-0">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
                                {/* Scanning Line Effect */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-green/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-[scan_3s_ease-in-out_infinite]" />
                            </div>

                            <div className="p-8 relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-6">
                                    <Maximize className="w-10 h-10 text-brand-green" />
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 rounded bg-black/50 border border-white/10 text-[10px] font-mono text-brand-green flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                                            LiDAR ACTIVE
                                        </div>
                                        <div className="px-2 py-1 rounded bg-black/50 border border-white/10 text-[10px] font-mono text-gray-400">
                                            1% MARGIN
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-4">3D Virtual Tours</h3>
                                <p className="text-gray-400 mb-8 max-w-sm">
                                    Don't rely on photos. Walk the property with 3D Virtual Tours. Verify condition, layout, and finishings from anywhere.
                                </p>

                                {/* 3D Example Image */}
                                <div className="mt-8 rounded-xl border border-white/10 overflow-hidden relative group/image aspect-square bg-black/50">
                                    <div className="absolute inset-0 bg-brand-green/10 opacity-0 group-hover/image:opacity-100 transition-opacity z-10" />
                                    <img
                                        src="/3d-dollhouse.png"
                                        alt="3D Virtual Tour Dollhouse View"
                                        className="w-full h-full object-contain opacity-90 group-hover/image:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-md text-xs text-brand-green font-mono border border-brand-green/20 z-20">
                                        LIVE PREVIEW
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center pt-16">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                        The easiest way to get <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-teal-500">RENT INCOME</span>
                    </h2>
                    <Button asChild size="lg" className="bg-brand-green text-black hover:bg-brand-green/90 text-xl px-16 h-16 rounded-full font-bold shadow-[0_0_30px_-5px_rgba(34,197,94,0.4)]">
                        <Link href="/property/create">Start Now</Link>
                    </Button>
                </div>

            </div>
        </section>
    )
}
