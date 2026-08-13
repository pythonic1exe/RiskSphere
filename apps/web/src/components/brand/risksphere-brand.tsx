import Image from "next/image"
import type { HTMLAttributes } from "react"

export function RiskSphereLogoMark({ className }: { className?: string }) {
  return <span className={`relative inline-flex size-8 shrink-0 overflow-hidden rounded-full bg-bg-card ${className ?? ""}`}><Image src="/risksphere-logo.svg" alt="" fill sizes="40px" aria-hidden="true" className="object-cover object-center" priority /></span>
}

export function RiskSphereBrand({ className, logoClassName, nameClassName, ...props }: HTMLAttributes<HTMLDivElement> & { logoClassName?: string; nameClassName?: string }) {
  return <div className={`flex items-center gap-2.5 ${className ?? ""}`} {...props}>
    <RiskSphereLogoMark {...(logoClassName ? { className: logoClassName } : {})} />
    <span className={`font-brand text-sm font-semibold tracking-[0.22em] text-text-primary ${nameClassName ?? ""}`}>RISK<span className="text-primary">SPHERE</span></span>
  </div>
}
