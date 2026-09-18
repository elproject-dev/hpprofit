"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon, CommandIcon, PackageIcon,
  ReceiptIcon,
  BoxIcon,
  ShoppingBagIcon,
  ChefHatIcon,
  SettingsIcon,
  LifeBuoyIcon,
  Aperture,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Bahan Baku",
      url: "/bahan-baku",
      icon: (
        <PackageIcon
        />
      ),
    },
    {
      title: "Packaging",
      url: "/packaging",
      icon: (
        <BoxIcon
        />
      ),
    },
    {
      title: "Master Produk",
      url: "/produk",
      icon: (
        <ShoppingBagIcon />
      ),
    },
    {
      title: "Biaya Tambahan",
      url: "/biaya-tambahan",
      icon: (
        <ReceiptIcon
        />
      ),
    },
    {
      title: "Produksi",
      url: "/transaksi-produksi",
      icon: (
        <ChefHatIcon
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Pengaturan",
      url: "/pengaturan",
      icon: <SettingsIcon />,
    },
    {
      title: "Bantuan",
      url: "/bantuan",
      icon: <LifeBuoyIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/" />}
            >
              <Aperture className="size-5!" />
              <span className="text-base font-semibold">HPProfit</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  )
}
