"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()

  let title = "Dashboard"
  if (pathname) {
    const path = pathname.split('/')[1]
    if (path) {
      title = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Override specific titles to match sidebar
      if (title === "Produk") {
        title = "Master Produk"
      }
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto hidden md:block"
        />
        <h1 className="text-base font-semibold ml-auto text-primary">{title}</h1>
      </div>
    </header>
  )
}
