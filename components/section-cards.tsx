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

      {/* KARTU 1: BAHAN BAKU */}
      <Card className="@container/card bg-gradient-to-br from-green-600 to-green-600 dark:from-blue-600 dark:to-cyan-500 border-none shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-white/90 font-medium">Bahan Baku</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
              {bahanBakuCount}
            </CardTitle>
          </div>
          <BoxIcon className="w-8 h-8 text-white/90 drop-shadow-sm" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-white/80 font-medium">
            Total master data bahan baku
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 2: PACKAGING */}
      <Card className="@container/card bg-gradient-to-br from-orange-600 to-orange-600 dark:from-amber-600 dark:to-orange-500 border-none shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-white/90 font-medium">Packaging</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
              {packagingCount}
            </CardTitle>
          </div>
          <PackageIcon className="w-8 h-8 text-white/90 drop-shadow-sm" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-white/80 font-medium">
            Total master data kemasan
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 3: MASTER PRODUK */}
      <Card className="@container/card bg-gradient-to-br from-purple-600 to-purple-600 dark:from-purple-600 dark:to-pink-500 border-none shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-white/90 font-medium">Master Produk</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
              {produkCount}
            </CardTitle>
          </div>
          <UtensilsIcon className="w-8 h-8 text-white/90 drop-shadow-sm" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-white/80 font-medium">
            Total menu/resep produk
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 4: TRANSAKSI PRODUKSI */}
      <Card className="@container/card bg-gradient-to-br from-blue-600 to-blue-600 dark:from-emerald-600 dark:to-teal-500 border-none shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-white/90 font-medium">Transaksi Produksi</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-white">
              {transaksiCount}
            </CardTitle>
          </div>
          <CalculatorIcon className="w-8 h-8 text-white/90 drop-shadow-sm" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-white/80 font-medium">
            Total riwayat produksi massal
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
