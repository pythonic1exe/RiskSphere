"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

export function AuthVisualPanel() {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      className="relative isolate min-h-[100dvh] overflow-hidden bg-bg-base"
      initial={reducedMotion ? false : { opacity: 0, scale: 1.015 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
    >
      <Image
        src="/images/auth/login-building.jpg"
        alt="Illuminated office building windows at night"
        fill
        priority
        sizes="(min-width: 1024px) 46vw, 100vw"
        className="object-cover object-center motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:hover:scale-[1.01]"
      />
      <div className="absolute inset-0 bg-[rgba(7,11,20,0.38)]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg-base/80 to-transparent" aria-hidden="true" />

      <div className="relative flex min-h-[100dvh] flex-col justify-between p-7 sm:p-8 lg:p-9">
        <div className="flex items-start justify-between gap-4">
          <div className="font-brand text-sm font-semibold tracking-[0.22em] text-foreground">
            RISK<span className="text-primary">SPHERE</span>
          </div>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg border border-white/15 bg-bg-base/35 px-3 py-2 text-xs font-medium text-white/80 transition-colors duration-200 hover:bg-bg-base/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            Back to website
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="max-w-sm space-y-2">
          <p className="font-heading text-[clamp(1.75rem,3vw,2.2rem)] font-medium leading-[1.1] tracking-tight text-white">
            Govern risk.<br />
            Prove compliance.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
