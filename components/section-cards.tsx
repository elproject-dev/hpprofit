"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BoxIcon, PackageIcon, CalculatorIcon, UtensilsIcon } from "lucide-react"

export function SectionCards() {
  const bahanBakuCount = useLiveQuery(() => db.bahanBaku.count()) || 0
  const produkCount = useLiveQuery(() => db.produk.count()) || 0
  const transaksiCount = useLiveQuery(() => db.transaksiProduksi.count()) || 0
  const packagingCount = useLiveQuery(() => db.packaging.count()) || 0

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* KARTU 1: BAHAN BAKU (TEMA BIRU/SKY) */}
      <Card className="@container/card bg-linear-to-br from-sky-50 to-white dark:from-sky-950/30 dark:to-background border-sky-100 dark:border-sky-900/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-sky-700/70 dark:text-sky-400/70 font-medium">Bahan Baku</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-sky-900 dark:text-sky-100">
              {bahanBakuCount}
            </CardTitle>
          </div>
          <BoxIcon className="w-8 h-8 text-sky-500/80 dark:text-sky-400/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-sky-600/70 dark:text-sky-400/60">
            Total master data bahan baku
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 2: PACKAGING (TEMA ORANYE/AMBER) */}
      <Card className="@container/card bg-linear-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background border-amber-100 dark:border-amber-900/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-amber-700/70 dark:text-amber-400/70 font-medium">Packaging</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-900 dark:text-amber-100">
              {packagingCount}
            </CardTitle>
          </div>
          <PackageIcon className="w-8 h-8 text-amber-500/80 dark:text-amber-400/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-amber-600/70 dark:text-amber-400/60">
            Total master data kemasan
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 3: MASTER PRODUK (TEMA MERAH MUDA/ROSE) */}
      <Card className="@container/card bg-linear-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-background border-rose-100 dark:border-rose-900/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-rose-700/70 dark:text-rose-400/70 font-medium">Master Produk</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-rose-900 dark:text-rose-100">
              {produkCount}
            </CardTitle>
          </div>
          <UtensilsIcon className="w-8 h-8 text-rose-500/80 dark:text-rose-400/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-rose-600/70 dark:text-rose-400/60">
            Total menu/resep produk
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 4: TRANSAKSI PRODUKSI (TEMA HIJAU/EMERALD) */}
      <Card className="@container/card bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background border-emerald-100 dark:border-emerald-900/50 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-emerald-700/70 dark:text-emerald-400/70 font-medium">Transaksi Produksi</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-900 dark:text-emerald-100">
              {transaksiCount}
            </CardTitle>
          </div>
          <CalculatorIcon className="w-8 h-8 text-emerald-500/80 dark:text-emerald-400/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-emerald-600/70 dark:text-emerald-400/60">
            Total riwayat produksi massal
          </div>
        </CardFooter>
      </Card>
      
    </div>
  )
}
