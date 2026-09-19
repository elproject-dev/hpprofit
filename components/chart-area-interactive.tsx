"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { id } from "date-fns/locale"

import { useIsMobile } from "@/hooks/use-mobile"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "Grafik Batang Performa Keuangan"

const chartConfig = {
  pendapatan: {
    label: "Potensi Pendapatan",
    color: "#10b981", // Emerald 500
  },
  biaya: {
    label: "Biaya Produksi",
    color: "#ef4444", // Red 500
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {

  const transaksis = useLiveQuery(() => db.transaksiProduksi.toArray()) || []
  const produks = useLiveQuery(() => db.produk.toArray()) || []

  const chartData = React.useMemo(() => {
    const dailyData: Record<string, { date: string, pendapatan: number, biaya: number, isReal?: boolean }> = {}
    const today = new Date()

    // Inisialisasi 7 hari terakhir dengan nilai 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = format(d, "yyyy-MM-dd")
      
      dailyData[dateStr] = { 
        date: dateStr, 
        pendapatan: 0, 
        biaya: 0,
      }
    }

    // ISI DENGAN DATA TRANSAKSI ASLI
    transaksis.forEach(tx => {
      const txDateStr = format(new Date(tx.tanggal), "yyyy-MM-dd")
      
      // Jika transaksi masuk dalam 7 hari terakhir
      if (dailyData[txDateStr]) {
        const produk = produks.find(p => p.id === tx.produkId)
        const hargaJual = produk?.hargaJual || 0
        
        const pendapatan = hargaJual * tx.jumlah
        const biaya = (tx.hppPerSatuan * tx.jumlah)

        dailyData[txDateStr].pendapatan += pendapatan
        dailyData[txDateStr].biaya += biaya
      }
    })

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
  }, [transaksis, produks])

  return (
    <Card className="@container/card shadow-sm rounded-none border-none">
      <CardHeader>
        <CardTitle>Performa Keuangan Produksi</CardTitle>
        <CardDescription>Perbandingan Biaya vs Pendapatan 7 Hari Terakhir</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <BarChart data={chartData} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/20" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              padding={{ left: 10, right: 10 }}
              tickFormatter={(value) => format(new Date(value), "d MMM", { locale: id })}
            />
            <YAxis hide width={0} />
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => format(new Date(value), "dd MMMM yyyy", { locale: id })}
                  formatter={(value: any, name: any) => (
                    <div className="flex items-center justify-between w-full min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: name === "pendapatan" ? "#10b981" : "#ef4444" }}
                        />
                        <span className="text-muted-foreground capitalize">{name === "pendapatan" ? "Pendapatan" : "Biaya Produksi"}</span>
                      </div>
                      <span className="font-bold ml-4">Rp {new Intl.NumberFormat("id-ID").format(value)}</span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="biaya" fill="var(--color-biaya)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pendapatan" fill="var(--color-pendapatan)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
