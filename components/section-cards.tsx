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
      <Card className="@container/card bg-linear-to-br from-primary/10 to-background dark:from-primary/10 border-primary/20 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-primary/70 font-medium">Bahan Baku</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
              {bahanBakuCount}
            </CardTitle>
          </div>
          <BoxIcon className="w-8 h-8 text-primary/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-primary/70">
            Total master data bahan baku
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 2: PACKAGING */}
      <Card className="@container/card bg-linear-to-br from-primary/10 to-background dark:from-primary/10 border-primary/20 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-primary/70 font-medium">Packaging</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
              {packagingCount}
            </CardTitle>
          </div>
          <PackageIcon className="w-8 h-8 text-primary/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-primary/70">
            Total master data kemasan
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 3: MASTER PRODUK */}
      <Card className="@container/card bg-linear-to-br from-primary/10 to-background dark:from-primary/10 border-primary/20 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-primary/70 font-medium">Master Produk</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
              {produkCount}
            </CardTitle>
          </div>
          <UtensilsIcon className="w-8 h-8 text-primary/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-primary/70">
            Total menu/resep produk
          </div>
        </CardFooter>
      </Card>

      {/* KARTU 4: TRANSAKSI PRODUKSI */}
      <Card className="@container/card bg-linear-to-br from-primary/10 to-background dark:from-primary/10 border-primary/20 shadow-sm transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardDescription className="text-primary/70 font-medium">Transaksi Produksi</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
              {transaksiCount}
            </CardTitle>
          </div>
          <CalculatorIcon className="w-8 h-8 text-primary/80" />
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-primary/70">
            Total riwayat produksi massal
          </div>
        </CardFooter>
      </Card>
      
    </div>
  )
}
