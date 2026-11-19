"use client"

import * as React from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

/**
 * Dialog on desktop, bottom drawer on phones. Same API for both, so a form
 * only has to be written once.
 */

const MOBILE_QUERY = "(max-width: 639px)"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}

const MobileContext = React.createContext(false)

function ResponsiveDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  const isMobile = useIsMobile()
  const Root = isMobile ? Drawer : Dialog
  return (
    <MobileContext.Provider value={isMobile}>
      <Root open={open} onOpenChange={(next) => onOpenChange(next)}>
        {children}
      </Root>
    </MobileContext.Provider>
  )
}

function ResponsiveDialogTrigger({ render }: { render: React.ReactElement }) {
  const isMobile = React.useContext(MobileContext)
  return isMobile ? <DrawerTrigger render={render} /> : <DialogTrigger render={render} />
}

function ResponsiveDialogContent({ children }: { children: React.ReactNode }) {
  const isMobile = React.useContext(MobileContext)
  return isMobile ? <DrawerContent>{children}</DrawerContent> : <DialogContent>{children}</DialogContent>
}

function ResponsiveDialogHeader(props: React.ComponentProps<"div">) {
  const isMobile = React.useContext(MobileContext)
  return isMobile ? <DrawerHeader {...props} /> : <DialogHeader {...props} />
}

function ResponsiveDialogFooter(props: React.ComponentProps<"div">) {
  const isMobile = React.useContext(MobileContext)
  return isMobile ? <DrawerFooter {...props} /> : <DialogFooter {...props} />
}

function ResponsiveDialogTitle({ children }: { children: React.ReactNode }) {
  const isMobile = React.useContext(MobileContext)
  return isMobile ? <DrawerTitle>{children}</DrawerTitle> : <DialogTitle>{children}</DialogTitle>
}

function ResponsiveDialogDescription({ children }: { children: React.ReactNode }) {
  const isMobile = React.useContext(MobileContext)
  return isMobile ? (
    <DrawerDescription>{children}</DrawerDescription>
  ) : (
    <DialogDescription>{children}</DialogDescription>
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
}
