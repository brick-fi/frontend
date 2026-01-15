"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface ScrollRevealProps {
    children: ReactNode
    className?: string
    width?: "fit-content" | "100%"
    delay?: number
}

export function ScrollReveal({ children, width = "fit-content", className, delay = 0 }: ScrollRevealProps) {
    return (
        <div style={{ position: "relative", width, overflow: "hidden" }} className={className}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible"
                transition={{ duration: 0.8, delay, ease: [0.25, 0.25, 0.25, 0.75] }}
                viewport={{ once: true, margin: "-50px" }}
            >
                {children}
            </motion.div>
        </div>
    )
}
