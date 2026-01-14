"use client"

import { Search, FileSearch, Coins, BarChart3 } from "lucide-react"

export function HowItWorksSection() {
    const steps = [
        { icon: Search, title: "Browse", desc: "Explore global premium properties" },
        { icon: FileSearch, title: "Analyze", desc: "Check rental yield & asset details" },
        { icon: Coins, title: "Invest", desc: "Buy fractions starting at $50" },
        { icon: BarChart3, title: "Earn", desc: "Receive weekly rental income" },
    ]

    return (
        <section className="py-24 bg-black border-y border-white/10">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-white text-center mb-16">How It Works</h2>

                <div className="flex flex-col md:flex-row justify-between items-center relative max-w-5xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-800 -translate-y-1/2 hidden md:block -z-0" />

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 bg-black p-4 flex flex-col items-center text-center w-full md:w-48 group">
                            <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center text-gray-400 mb-4 transition-colors group-hover:border-brand-green group-hover:text-brand-green group-hover:bg-brand-green/5">
                                <step.icon size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{step.title}</h3>
                            <p className="text-sm text-gray-500">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
