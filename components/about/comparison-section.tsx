"use client"

import { motion } from "framer-motion"
import { Check, X, Shield, Clock, Coins, Layers, Building2 } from "lucide-react"

export function ComparisonSection() {
    return (
        <section className="py-32 bg-zinc-950">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Comparison 1: Traditional vs BrickFi */}
                <div className="mb-40">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Old School vs. New World</h2>
                        <p className="text-gray-400">Why waiting for "someday" is no longer necessary.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Traditional */}
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-10 opacity-70 grayscale transition-all hover:grayscale-0">
                            <h3 className="text-2xl font-bold text-gray-300 mb-8 border-b border-white/10 pb-4">Traditional Real Estate</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0" />
                                    <span className="text-gray-400">High entry cost ($50k+ down payments)</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0" />
                                    <span className="text-gray-400">Complex paperwork & legal fees</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0" />
                                    <span className="text-gray-400">Illiquid (Months to sell)</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <X className="w-6 h-6 text-red-500 shrink-0" />
                                    <span className="text-gray-400">Physical management headaches</span>
                                </li>
                            </ul>
                        </div>

                        {/* BrickFi */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-brand-green/10 border border-brand-green/30 rounded-3xl p-10 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 blur-[60px]" />
                            <h3 className="text-2xl font-bold text-white mb-8 border-b border-brand-green/30 pb-4">BrickFi Platform</h3>
                            <ul className="space-y-6 relative z-10">
                                <li className="flex items-start gap-4">
                                    <Check className="w-6 h-6 text-brand-green shrink-0" />
                                    <span className="text-white">Start with just <span className="text-brand-green font-bold">$50</span></span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <Check className="w-6 h-6 text-brand-green shrink-0" />
                                    <span className="text-white">Click-to-invest simplicity</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <Check className="w-6 h-6 text-brand-green shrink-0" />
                                    <span className="text-white">24/7 Liquidity via marketplace</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <Check className="w-6 h-6 text-brand-green shrink-0" />
                                    <span className="text-white">Fully managed & automated income</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>

                {/* Comparison 2: REITs vs BrickFi */}
                <div>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Beyond REITs</h2>
                        <p className="text-gray-400">True ownership control, not just a share of a blind fund.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-gray-900 rounded-2xl p-8 flex flex-col items-center text-center">
                            <Layers className="w-12 h-12 text-gray-600 mb-6" />
                            <h3 className="text-xl font-bold text-gray-300 mb-2">Public REITs</h3>
                            <p className="text-sm text-gray-500">Opaque portfolios. You don't choose the buildings. Fees eat into yields.</p>
                        </div>

                        <div className="md:col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
                            <div className="shrink-0 bg-brand-green/20 p-6 rounded-full">
                                <Building2 className="w-12 h-12 text-brand-green" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-3">The BrickFi Difference</h3>
                                <p className="text-gray-300 leading-relaxed mb-4">
                                    Pick exactly which property you want. Review its specific financials.
                                    See the rental contracts. Track every cent of income on-chain.
                                </p>
                                <div className="flex gap-4 text-xs font-mono text-brand-green uppercase tracking-wider">
                                    <span>• Single Asset Control</span>
                                    <span>• On-Chain Transparency</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
