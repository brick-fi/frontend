"use client"

import { motion } from "framer-motion"
import { Wallet, TrendingUp, Building2, ArrowRight } from "lucide-react"

export function ConceptSection() {
    return (
        <section className="py-32 bg-black relative overflow-hidden">
            {/* Liquid Flow Background */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute inset-0 bg-[url('/about-flow-bg.png')] bg-cover bg-center animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                        Liquid <span className="text-brand-green">Income</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Direct access to rental income streams, flowing like data to your wallet.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-center relative">

                    {/* Step 1: Property */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-black/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-4xl shadow-xl ring-1 ring-white/20">
                                <Building2 size={40} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Assets</h3>
                            <p className="text-gray-400">Premium global properties</p>
                        </div>
                    </motion.div>

                    {/* Stream Connector */}
                    <div className="h-32 md:h-2 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-brand-green/30 blur-xl md:w-full md:h-1 w-1 h-full rounded-full" />
                        <div className="w-1 h-full md:w-full md:h-1 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-brand-green to-transparent relative overflow-hidden">
                            <div className="absolute inset-0 bg-white w-full h-full md:w-1/2 md:translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>
                    </div>

                    {/* Step 3: Wallet */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-brand-green/10 backdrop-blur-xl border border-brand-green/30 p-10 rounded-3xl text-center relative shadow-[0_0_100px_-20px_rgba(34,197,94,0.2)]"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-b from-brand-green/30 to-transparent rounded-3xl blur opacity-50" />
                        <div className="relative">
                            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-brand-green text-4xl shadow-2xl ring-1 ring-brand-green/50">
                                <Wallet size={40} />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Wallet</h3>
                            <p className="text-brand-green/80">Instant payouts</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
