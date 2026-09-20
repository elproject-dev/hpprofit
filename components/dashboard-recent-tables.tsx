"use client"

import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DashboardRecentTables() {
  const produks = useLiveQuery(() => db.produk.toArray()) || []

  // Ambil 5 transaksi produksi terakhir
  const recentTransaksi = useLiveQuery(
    () => db.transaksiProduksi.orderBy('createdAt').reverse().limit(5).toArray()
  ) || []

  // Ambil 5 bahan baku yang baru ditambahkan
  const recentBahanBaku = useLiveQuery(
    () => db.bahanBaku.orderBy('createdAt').reverse().limit(5).toArray()
  ) || []

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2">

      {/* TABEL KIRI: RIWAYAT PRODUKSI TERAKHIR */}
      <Card className="shadow-sm rounded-none border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-medium">Riwayat Produksi Terakhir</CardTitle>
          <CardDescription className="text-xs">5 aktivitas produksi massal terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransaksi.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Belum ada data transaksi produksi.
            </div>
          ) : (
            <div className="rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransaksi.map((tx) => {
                    const produk = produks.find(p => p.id === tx.produkId)
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(new Date(tx.tanggal), "dd MMM yyyy", { locale: id })}
                        </TableCell>
                        <TableCell>{produk?.nama || "Produk Dihapus"}</TableCell>
                        <TableCell className="text-right">{tx.jumlah} batch</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABEL KANAN: BAHAN BAKU TERBARU */}
      <Card className="shadow-sm rounded-none border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-medium">Bahan Baku Terbaru</CardTitle>
          <CardDescription className="text-xs">5 master data bahan baku yang baru ditambahkan</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBahanBaku.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Belum ada data bahan baku.
            </div>
          ) : (
            <div className="rounded-sm border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBahanBaku.map((bahan) => (
                    <TableRow key={bahan.id}>
                      <TableCell className="font-medium">{bahan.nama}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold bg-secondary/50">
                          {bahan.kategori || "Umum"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        Rp {bahan.harga.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
