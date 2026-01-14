"use client"

import { useEffect, useState } from "react"

export function Confetti() {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; rotation: number }[]>([])

    useEffect(() => {
        const colors = ["#22c55e", "#3b82f6", "#eab308", "#ffffff"]
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // %
            y: -10, // Start above
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
        }))
        setParticles(newParticles)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
                    style={{
                        left: `${p.x}%`,
                        top: `-20px`,
                        backgroundColor: p.color,
                        transform: `rotate(${p.rotation}deg)`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                    }}
                />
            ))}
            <style jsx>{`
        @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
            animation: confetti-fall forwards ease-in;
        }
      `}</style>
        </div>
    )
}
