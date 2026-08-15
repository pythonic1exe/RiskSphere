"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { LogOut } from "lucide-react"

import { RiskSphereLogoMark } from "@/components/brand/risksphere-brand"
import { dashboardNavigation } from "./dashboard-data"

const expandedWidth = 236
const collapsedItemWidth = 40
const expandedItemWidth = expandedWidth - 48

export function DashboardSidebar({ onLogout, onExpandedChange }: { onLogout: () => Promise<void>; onExpandedChange?: (expanded: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const reducedMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)
  const navigationTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (navigationTimer.current !== null) window.clearTimeout(navigationTimer.current)
  }, [])

  function setSidebarExpanded(nextExpanded: boolean) {
    setExpanded(nextExpanded)
    onExpandedChange?.(nextExpanded)
  }

  function handleNavigation(event: MouseEvent<HTMLElement>, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || href === pathname) return
    event.preventDefault()
    setSidebarExpanded(false)
    navigationTimer.current = window.setTimeout(() => router.push(href), reducedMotion ? 0 : 220)
  }

  return (
    <aside className={`relative z-30 h-screen w-full shrink-0 bg-bg-base transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] lg:fixed lg:left-0 lg:top-0 ${expanded ? "lg:w-[236px]" : "lg:w-[88px]"}`}>
      <motion.aside
        className="absolute inset-y-0 left-0 hidden w-full flex-col overflow-hidden bg-bg-base shadow-[18px_0_40px_rgba(7,11,20,0.16)] lg:flex"
        initial={false}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        onFocus={() => setSidebarExpanded(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as never)) setSidebarExpanded(false)
        }}
        aria-label="RiskSphere navigation"
      >
        <div className="flex h-[94px] shrink-0 items-center px-6">
          <Link href="/workspace" aria-label="RiskSphere dashboard" className="flex h-10 items-center gap-3 whitespace-nowrap font-brand text-[11px] tracking-[0.16em] text-text-primary">
            <RiskSphereLogoMark className="size-10" />
            <motion.span animate={{ width: expanded ? 110 : 0, opacity: expanded ? 1 : 0, x: expanded ? 0 : -6 }} transition={{ duration: reducedMotion ? 0 : 0.16, delay: expanded ? 0.07 : 0 }} className="block shrink-0 overflow-hidden whitespace-nowrap text-[11px]">RISK<span className="text-primary">SPHERE</span></motion.span>
          </Link>
        </div>

        <nav className="flex-1 space-y-3 overflow-hidden px-6 pb-6 pt-7" aria-label="Primary navigation">
          {dashboardNavigation.map((group) => (
            <div key={group.label} className="space-y-1.5 pb-3 last:pb-0">
              <motion.p aria-hidden={!expanded} animate={{ width: expanded ? expandedItemWidth : 0, opacity: expanded ? 1 : 0, x: expanded ? 0 : -8 }} transition={{ duration: reducedMotion ? 0 : 0.16, delay: expanded ? 0.04 : 0 }} className="overflow-hidden whitespace-nowrap px-1 pb-1 text-[10px] font-medium uppercase tracking-[0.13em] text-text-muted">{group.label}</motion.p>
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <motion.div key={item.href} className="overflow-hidden" animate={{ width: expanded ? expandedItemWidth : collapsedItemWidth }} {...(reducedMotion ? {} : { whileHover: { x: 3 }, whileTap: { scale: 0.985 } })} transition={{ duration: reducedMotion ? 0 : 0.21, ease: [0.22, 1, 0.36, 1] }}>
                    <Link href={item.href} onClick={(event) => handleNavigation(event, item.href)} aria-label={item.label} aria-current={active ? "page" : undefined} className={`flex h-10 w-full items-center gap-3 overflow-hidden rounded-xl px-0 transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${active ? "bg-primary-muted text-text-primary shadow-[0_0_18px_rgba(96,165,250,0.08)]" : "text-text-muted hover:bg-bg-hover/70 hover:text-text-primary"}`}>
                      <span className="flex size-10 shrink-0 items-center justify-center"><Icon className="size-[18px]" strokeWidth={1.8} /></span>
                      <motion.span aria-hidden={!expanded} animate={{ width: expanded ? 110 : 0, opacity: expanded ? 1 : 0, x: expanded ? 0 : -8 }} transition={{ duration: reducedMotion ? 0 : 0.16, delay: expanded ? 0.06 : 0 }} className="block shrink-0 overflow-hidden whitespace-nowrap text-xs font-medium">{item.label}</motion.span>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </nav>

        <button type="button" onClick={() => void onLogout()} aria-label="Log out" className="flex h-[72px] shrink-0 items-center gap-3 px-6 text-text-muted transition-colors hover:text-text-primary"><span className="flex size-10 shrink-0 items-center justify-center"><LogOut className="size-[17px]" strokeWidth={1.8} /></span><motion.span aria-hidden={!expanded} animate={{ width: expanded ? 110 : 0, opacity: expanded ? 1 : 0, x: expanded ? 0 : -8 }} transition={{ duration: reducedMotion ? 0 : 0.16, delay: expanded ? 0.06 : 0 }} className="block shrink-0 overflow-hidden whitespace-nowrap text-xs font-medium">Log out</motion.span></button>
      </motion.aside>

      <div className="flex h-full items-end gap-2 overflow-x-auto px-5 pb-4 lg:hidden" aria-label="Mobile navigation">
        {dashboardNavigation.flatMap((group) => group.items).map((item) => { const Icon = item.icon; const active = pathname === item.href; return <Link key={item.href} href={item.href} aria-label={item.label} className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary-muted text-text-primary" : "text-text-muted"}`}><Icon className="size-4" /></Link> })}
        <button type="button" onClick={() => void onLogout()} aria-label="Log out" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted"><LogOut className="size-4" /></button>
      </div>
    </aside>
  )
}
