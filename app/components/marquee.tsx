"use client"

import { motion } from "framer-motion"

interface MarqueeProps {
  text?: string
  direction?: "left" | "right"
}

export function Marquee({ text = "VOSHY", direction = "left" }: MarqueeProps) {
  const repeatedText = Array(20).fill(text).join(" • ")

  return (
    <div className="overflow-hidden whitespace-nowrap bg-primary py-2">
      <motion.div
        className="inline-block text-primary-foreground font-bold text-lg tracking-widest"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {repeatedText} • {repeatedText}
      </motion.div>
    </div>
  )
}
