import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function DashboardCard({ title, description, children, className, tone = "surface" }: { title: string; description?: string; children: ReactNode; className?: string; tone?: "surface" | "quiet" | "inset" }) {
  const tones = { surface: "bg-bg-card/90", quiet: "bg-transparent", inset: "bg-bg-elevated/55" }
  return (
    <section className={cn("rounded-[17px] border border-border-subtle/70 p-6 sm:p-7", tones[tone], className)}>
      <div><h2 className="font-heading text-xl font-medium tracking-[-0.04em] text-text-primary">{title}</h2>{description ? <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">{description}</p> : null}</div>
      <div className={cn(description ? "mt-7" : "mt-6")}>{children}</div>
    </section>
  )
}
