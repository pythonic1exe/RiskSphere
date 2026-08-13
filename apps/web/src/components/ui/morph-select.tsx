"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const MorphSelect = SelectPrimitive.Root

function MorphSelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="morph-select-value" className={cn("flex min-w-0 flex-1 truncate text-left", className)} {...props} />
}

function MorphSelectTrigger({ className, size = "default", children, ...props }: SelectPrimitive.Trigger.Props & { size?: "sm" | "default" }) {
  return <SelectPrimitive.Trigger data-slot="morph-select-trigger" data-size={size} className={cn("group/morph-select relative flex h-9 w-fit items-center justify-between gap-2 rounded-lg border border-input bg-bg-card px-3 text-sm whitespace-nowrap text-text-secondary shadow-none outline-none transition-[border-radius,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:border-border-strong hover:bg-bg-elevated focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 data-popup-open:rounded-b-md data-popup-open:border-border-strong data-popup-open:bg-bg-elevated data-popup-open:shadow-[0_8px_24px_rgba(0,0,0,0.18)] data-[size=sm]:h-8 data-[size=sm]:text-xs disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:group-data-popup-open/morph-select:rotate-180", className)} {...props}>{children}<SelectPrimitive.Icon render={<ChevronDownIcon className="size-4 text-text-muted" />} /></SelectPrimitive.Trigger>
}

function MorphSelectContent({ className, children, side = "bottom", sideOffset = 8, align = "center", alignOffset = 0, alignItemWithTrigger = false, ...props }: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger">) {
  return <SelectPrimitive.Portal><SelectPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} alignItemWithTrigger={alignItemWithTrigger} className="isolate z-[70]"><SelectPrimitive.Popup data-slot="morph-select-content" className={cn("relative max-h-(--available-height) min-w-[var(--anchor-width)] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border-default bg-bg-elevated p-1.5 text-popover-foreground shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-[opacity,transform,filter,border-radius] duration-200 ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-starting-style:blur-sm data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:blur-sm data-[side=bottom]:origin-top data-[side=top]:origin-bottom", className)} {...props}><SelectScrollUpButton />{children}<SelectScrollDownButton /></SelectPrimitive.Popup></SelectPrimitive.Positioner></SelectPrimitive.Portal>
}

function MorphSelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  const reducedMotion = useReducedMotion()
  return <SelectPrimitive.Item data-slot="morph-select-item" className={cn("group/morph-item relative flex w-full cursor-default items-center overflow-hidden rounded-lg px-2.5 py-2 text-sm text-text-secondary outline-none transition-colors duration-150 select-none before:absolute before:inset-0 before:-z-0 before:origin-left before:scale-x-0 before:rounded-lg before:bg-primary-muted before:transition-transform before:duration-200 hover:text-text-primary focus:bg-bg-hover focus:text-text-primary data-highlighted:bg-bg-hover data-highlighted:text-text-primary data-selected:text-text-primary data-selected:before:scale-x-100 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}><motion.div className="relative z-10 flex min-w-0 flex-1 items-center gap-2" {...(reducedMotion ? {} : { whileHover: { x: 2, scale: 1.01 }, whileTap: { scale: 0.99 } })} transition={{ duration: reducedMotion ? 0 : 0.16, ease: "easeOut" }}><SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="flex size-4 items-center justify-center text-primary"><CheckIcon className="size-3.5" /></SelectPrimitive.ItemIndicator></motion.div></SelectPrimitive.Item>
}

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) { return <SelectPrimitive.ScrollUpArrow className={cn("flex items-center justify-center py-1 text-text-muted", className)} {...props}><ChevronUpIcon className="size-3" /></SelectPrimitive.ScrollUpArrow> }
function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) { return <SelectPrimitive.ScrollDownArrow className={cn("flex items-center justify-center py-1 text-text-muted", className)} {...props}><ChevronDownIcon className="size-3" /></SelectPrimitive.ScrollDownArrow> }

function MorphNativeSelect({ value, onChange, children, className, "aria-label": ariaLabel, disabled }: { value: string; onChange: (value: string) => void; children: React.ReactNode; className?: string; "aria-label"?: string; disabled?: boolean }) {
  const items = React.Children.toArray(children).filter(React.isValidElement).map((child) => { const props = child.props as { value?: string; children?: React.ReactNode }; return { value: String(props.value ?? ""), label: props.children } })
  return <MorphSelect value={value} onValueChange={(next) => next && onChange(next)} disabled={disabled}><MorphSelectTrigger aria-label={ariaLabel} className={className}><MorphSelectValue /></MorphSelectTrigger><MorphSelectContent>{items.map((item) => <MorphSelectItem key={item.value} value={item.value}>{item.label}</MorphSelectItem>)}</MorphSelectContent></MorphSelect>
}

export { MorphNativeSelect, MorphSelect, MorphSelectContent, MorphSelectItem, MorphSelectTrigger, MorphSelectValue }
