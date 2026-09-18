"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboardIcon, 
  PackageIcon,
  BoxIcon,
  ShoppingBagIcon,
  ReceiptIcon,
  ChefHatIcon,
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Bahan",
    url: "/bahan-baku",
    icon: PackageIcon,
  },
  {
    title: "Pack",
    url: "/packaging",
    icon: BoxIcon,
  },
  {
    title: "Produk",
    url: "/produk",
    icon: ShoppingBagIcon,
  },
  {
    title: "Biaya",
    url: "/biaya-tambahan",
    icon: ReceiptIcon,
  },
  {
    title: "Produksi",
    url: "/transaksi-produksi",
    icon: ChefHatIcon,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 bg-background border-t border-x rounded-t-2xl md:hidden shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
      <div className="flex w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.url
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground",
                isActive && "text-primary"
              )}
            >
              <item.icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-medium truncate w-full text-center px-0.5">
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
