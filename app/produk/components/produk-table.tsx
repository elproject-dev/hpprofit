"use client"

import { useState, useTransition } from "react"
import { MoreVertical, BoxIcon, PrinterIcon, Calculator, Tag, Banknote, Percent, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { db } from "@/lib/db"

export function ProdukTable({
  data,
  onEdit
}: {
  data: any[],
  onEdit: (item: any) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [itemToDelete, setItemToDelete] = useState<any>(null)
  const [itemToView, setItemToView] = useState<any>(null)

  const handlePrint = (item: any) => {
    setItemToView(item)
    setTimeout(() => {
      const originalTitle = document.title
      const dateStr = new Date().toISOString().replace(/[:T-]/g, '').substring(0, 14)
      const safeName = (item.nama || 'Produk').replace(/[^a-zA-Z0-9]/g, '_')
      document.title = `Resep_${safeName}_${dateStr}`
      window.print()
      document.title = originalTitle
    }, 500)
  }

  const executeDelete = () => {
    if (itemToDelete) {
      startTransition(async () => {
        try {
          await db.transaction('rw', db.produk, db.produkKomposisiBahan, db.produkKomposisiPackaging, async () => {
            await db.produk.delete(itemToDelete.id)
            const oldBahan = await db.produkKomposisiBahan.where('produkId').equals(itemToDelete.id).toArray()
            await db.produkKomposisiBahan.bulkDelete(oldBahan.map(b => b.id))
            const oldPack = await db.produkKomposisiPackaging.where('produkId').equals(itemToDelete.id).toArray()
            await db.produkKomposisiPackaging.bulkDelete(oldPack.map(p => p.id))
          })
          setItemToDelete(null)
          toast.add({
            title: "Produk berhasil dihapus!",
            type: "success"
          })
        } catch (error) {
          toast.add({
            title: "Gagal menghapus produk",
            type: "error"
          })
        }
      })
    }
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 mt-4 md:hidden">
        {data.length === 0 ? (
          <div className="text-center py-8 text-[11px] text-muted-foreground border rounded-none bg-card">
            Belum ada master produk. Silakan tambahkan produk baru.
          </div>
        ) : (
          data.map((item) => {
            let hpp = 0
            item.komposisiBahan?.forEach((k: any) => {
              const div = parseFloat(k.pembagi) || 1
              hpp += ((k.bahan?.harga || 0) * k.takaran) / div
            })
            item.komposisiPackage?.forEach((k: any) => {
              const div = parseFloat(k.pembagi) || 1
              hpp += ((k.packaging?.harga || 0) * k.jumlah) / div
            })
            hpp = Math.round(hpp)
            const laba = item.hargaJual - hpp
            const margin = item.hargaJual > 0 ? (laba / item.hargaJual) * 100 : 0

            return (
              <div key={item.id} className="border rounded-none p-3 bg-card relative shadow-sm flex flex-col gap-3">
                <div className="absolute top-2 right-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Buka menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setItemToView(item)}>Detail</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint(item)}>Print Resep</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setItemToDelete(item)}>Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-3 items-stretch">
                  <div className="shrink-0">
                    {item.foto ? (
                      <img src={item.foto} alt={item.nama} className="w-11 h-11 shrink-0 aspect-square object-cover rounded-none border" />
                    ) : (
                      <div className="w-11 h-11 shrink-0 aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded-none border"><BoxIcon className="w-5 h-5 opacity-50" /></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-8 flex flex-col justify-between">
                    <h3 className="font-semibold text-xs truncate leading-tight">{item.nama}</h3>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      <span className="inline-flex items-center justify-center px-1 py-[2px] rounded text-[8.5px] font-medium bg-secondary text-secondary-foreground leading-none">
                        {item.kategori}
                      </span>
                      <span className="inline-flex items-center justify-center px-1 py-[2px] rounded text-[8.5px] font-medium border text-muted-foreground leading-none">
                        {item.komposisiBahan?.length || 0} Bahan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-1 text-[11px] border-t pt-2 mt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total HPP</span>
                    <span className="font-medium">Rp {hpp.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Jual</span>
                    <span className="font-medium text-orange-600 dark:text-orange-500">Rp {item.hargaJual.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Laba Kotor</span>
                    <span className={`font-medium ${laba < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>Rp {laba.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-muted-foreground">Margin</span>
                    <span className={`font-medium ${margin < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border mt-4 rounded-none overflow-hidden bg-card shadow-sm">
        <Table className="[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
          <TableHeader className="bg-muted text-foreground">
            <TableRow>
              <TableHead className="w-0 text-center">Foto</TableHead>
              <TableHead className="text-left">Nama Produk</TableHead>
              <TableHead className="text-center">Kategori</TableHead>
              <TableHead className="text-right">Total HPP</TableHead>
              <TableHead className="text-right">Harga Jual</TableHead>
              <TableHead className="text-right">Laba Kotor</TableHead>
              <TableHead className="text-center">Margin</TableHead>
              <TableHead className="w-0 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Belum ada master produk. Silakan tambahkan produk baru.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                // Kalkulasi HPP
                let hpp = 0
                item.komposisiBahan?.forEach((k: any) => {
                  const div = parseFloat(k.pembagi) || 1
                  hpp += ((k.bahan?.harga || 0) * k.takaran) / div
                })
                item.komposisiPackage?.forEach((k: any) => {
                  const div = parseFloat(k.pembagi) || 1
                  hpp += ((k.packaging?.harga || 0) * k.jumlah) / div
                })

                hpp = Math.round(hpp)
                const laba = item.hargaJual - hpp
                const margin = item.hargaJual > 0 ? (laba / item.hargaJual) * 100 : 0

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.foto ? (
                        <img src={item.foto} alt={item.nama} className="w-12 h-12 min-w-12 shrink-0 aspect-square object-cover" />
                      ) : (
                        <div className="w-12 h-12 min-w-12 shrink-0 aspect-square bg-muted flex items-center justify-center text-muted-foreground"><BoxIcon className="w-6 h-6 opacity-50" /></div>
                      )}
                    </TableCell>
                    <TableCell className="text-left font-medium">
                      <div>{item.nama}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {item.komposisiBahan?.length || 0} Bahan, {item.komposisiPackage?.length || 0} Pack
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-none text-xs font-medium bg-secondary text-secondary-foreground">
                        {item.kategori}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">Rp {hpp.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-right font-bold text-orange-600 dark:text-orange-500">Rp {item.hargaJual.toLocaleString("id-ID")}</TableCell>
                    <TableCell className={`text-right font-bold ${laba < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      Rp {laba.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className={`text-center font-bold ${margin < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {margin.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" />}>
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Buka menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setItemToView(item)}>
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrint(item)}>
                            Print Resep
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setItemToDelete(item)}
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {itemToDelete?.nama}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data produk akan dihapus secara permanen beserta komposisi resepnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!itemToView} onOpenChange={(open) => !open && setItemToView(null)}>
        <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader className="print:hidden">
            <DialogTitle>Detail Resep Produk</DialogTitle>
          </DialogHeader>

          {itemToView && (() => {
            let totalHppBahan = 0
            let totalHppPack = 0

            itemToView.komposisiBahan?.forEach((k: any) => {
              const div = parseFloat(k.pembagi) || 1
              totalHppBahan += ((k.bahan?.harga || 0) * k.takaran) / div
            })
            itemToView.komposisiPackage?.forEach((k: any) => {
              const div = parseFloat(k.pembagi) || 1
              totalHppPack += ((k.packaging?.harga || 0) * k.jumlah) / div
            })

            const totalHpp = Math.round(totalHppBahan + totalHppPack)
            const laba = itemToView.hargaJual - totalHpp
            const margin = itemToView.hargaJual > 0 ? (laba / itemToView.hargaJual) * 100 : 0

            const getStarRating = (m: number) => {
              if (m >= 50) return 5
              if (m >= 40) return 4
              if (m >= 30) return 3
              if (m >= 20) return 2
              if (m > 0) return 1
              return 0
            }
            const stars = getStarRating(margin)

            return (
              <div className="space-y-6 mt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-muted border flex items-center justify-center shrink-0">
                      {itemToView.foto ? (
                        <img src={itemToView.foto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <BoxIcon className="w-8 h-8 opacity-50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-xl leading-tight">{itemToView.nama}</h3>
                        <span className="hidden sm:inline-flex items-center justify-center px-2 py-1 mt-2 rounded-none text-xs font-medium bg-secondary text-secondary-foreground print:inline-flex">
                          {itemToView.kategori}
                        </span>
                      </div>
                      <div className="hidden sm:flex print:flex gap-0.5 shrink-0 pt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tampilan Mobile: Kategori & Bintang di bawah layout utama */}
                  <div className="sm:hidden flex items-center justify-between print:hidden text-[11px] whitespace-nowrap bg-muted/20 px-2 py-1.5 border rounded-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground uppercase font-medium">Kategori:</span>
                      <span className="font-bold">{itemToView.kategori}</span>
                    </div>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold text-sm">Komposisi Bahan Baku</h4>
                  {itemToView.komposisiBahan && itemToView.komposisiBahan.length > 0 ? (
                    <div className="space-y-4">
                      {/* Desktop & Print: Format Tabel */}
                      <div className="hidden sm:block print:block bg-muted/30 border text-sm rounded-none overflow-hidden">
                        <table className="w-full [&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                          <thead className="bg-muted text-left">
                            <tr>
                              <th className="p-2 border-b min-w-[120px]">Bahan</th>
                              <th className="p-2 border-b text-center whitespace-nowrap w-[140px]">Jumlah Dipakai</th>
                              <th className="p-2 border-b text-center whitespace-nowrap w-[140px]">Bisa Untuk (Porsi)</th>
                              <th className="p-2 border-b text-right whitespace-nowrap w-[140px]">Pemakaian / Porsi</th>
                              <th className="p-2 border-b text-right whitespace-nowrap w-[140px]">Biaya</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemToView.komposisiBahan.map((k: any, idx: number) => {
                              const div = parseFloat(k.pembagi) || 1
                              const biaya = ((k.bahan?.harga || 0) * k.takaran) / div
                              return (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="p-2">{k.bahan?.nama || "Unknown"}</td>
                                  <td className="p-2 text-center text-muted-foreground">{k.takaran} {k.bahan?.satuan}</td>
                                  <td className="p-2 text-center text-muted-foreground">{div} Porsi</td>
                                  <td className="p-2 text-right text-muted-foreground font-medium">
                                    {parseFloat((parseFloat(k.takaran) / div).toFixed(4))} {k.bahan?.satuan}
                                  </td>
                                  <td className="p-2 text-right">Rp {Math.round(biaya).toLocaleString('id-ID')}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="bg-muted/50 font-semibold border-t">
                            <tr>
                              <td colSpan={4} className="p-2 text-right text-orange-600">Subtotal Bahan</td>
                              <td className="p-2 text-right text-orange-600">Rp {Math.round(totalHppBahan).toLocaleString('id-ID')}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Mobile: Format List Card */}
                      <div className="sm:hidden print:hidden border rounded-sm divide-y overflow-hidden text-sm">
                        {itemToView.komposisiBahan.map((k: any, idx: number) => {
                          const div = parseFloat(k.pembagi) || 1
                          const biaya = ((k.bahan?.harga || 0) * k.takaran) / div
                          const pemakaianPerPorsi = parseFloat((parseFloat(k.takaran) / div).toFixed(4))
                          return (
                            <div key={idx} className="p-3 bg-card flex flex-col gap-1.5">
                              <div className="flex justify-between items-start font-bold">
                                <span className="truncate pr-2 text-primary">{k.bahan?.nama || 'Unknown'}</span>
                                <span className="shrink-0">Rp {Math.round(biaya).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                                <div className="flex flex-col text-left">
                                  <span className="uppercase text-[9px] font-medium tracking-wider mb-0.5">Total</span>
                                  <span className="font-bold text-foreground">{k.takaran} {k.bahan?.satuan}</span>
                                </div>
                                <div className="flex flex-col border-x text-center">
                                  <span className="uppercase text-[9px] font-medium tracking-wider mb-0.5">Bisa Untuk</span>
                                  <span className="font-bold text-foreground">{div} Porsi</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="uppercase text-[9px] font-medium tracking-wider mb-0.5">Per Porsi</span>
                                  <span className="font-bold text-foreground">{pemakaianPerPorsi} {k.bahan?.satuan}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div className="p-3 bg-muted/30 font-bold flex justify-between items-center text-orange-600 border-t">
                          <span>Subtotal Bahan</span>
                          <span>Rp {Math.round(totalHppBahan).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Tidak ada komposisi bahan baku.</p>
                  )}
                </div>

                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold text-sm">Komposisi Packaging</h4>
                  {itemToView.komposisiPackage && itemToView.komposisiPackage.length > 0 ? (
                    <div className="space-y-4">
                      {/* Desktop & Print: Format Tabel */}
                      <div className="hidden sm:block print:block bg-muted/30 border text-sm rounded-none overflow-hidden">
                        <table className="w-full [&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                          <thead className="bg-muted text-left">
                            <tr>
                              <th className="p-2 border-b min-w-[120px]">Packaging</th>
                              <th className="p-2 border-b text-center whitespace-nowrap w-[140px]">Jumlah Dipakai</th>
                              <th className="p-2 border-b text-center whitespace-nowrap w-[140px]">Bisa Untuk (Porsi)</th>
                              <th className="p-2 border-b text-right whitespace-nowrap w-[140px]">Pemakaian / Porsi</th>
                              <th className="p-2 border-b text-right whitespace-nowrap w-[140px]">Biaya</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itemToView.komposisiPackage.map((k: any, idx: number) => {
                              const div = parseFloat(k.pembagi) || 1
                              const biaya = ((k.packaging?.harga || 0) * k.jumlah) / div
                              return (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="p-2">{k.packaging?.nama || "Unknown"}</td>
                                  <td className="p-2 text-center text-muted-foreground">{k.jumlah} {k.packaging?.satuan}</td>
                                  <td className="p-2 text-center text-muted-foreground">{div} Porsi</td>
                                  <td className="p-2 text-right text-muted-foreground font-medium">
                                    {parseFloat((parseFloat(k.jumlah) / div).toFixed(4))} {k.packaging?.satuan}
                                  </td>
                                  <td className="p-2 text-right">Rp {Math.round(biaya).toLocaleString('id-ID')}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="bg-muted/50 font-semibold border-t">
                            <tr>
                              <td colSpan={4} className="p-2 text-right text-orange-600">Subtotal Packaging</td>
                              <td className="p-2 text-right text-orange-600">Rp {Math.round(totalHppPack).toLocaleString('id-ID')}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Mobile: Format List Card */}
                      <div className="sm:hidden print:hidden border rounded-sm divide-y overflow-hidden text-sm">
                        {itemToView.komposisiPackage.map((k: any, idx: number) => {
                          const div = parseFloat(k.pembagi) || 1
                          const biaya = ((k.packaging?.harga || 0) * k.jumlah) / div
                          const pemakaianPerPorsi = parseFloat((parseFloat(k.jumlah) / div).toFixed(4))
                          return (
                            <div key={idx} className="p-3 bg-card flex flex-col gap-1.5">
                              <div className="flex justify-between items-start font-bold">
                                <span className="truncate pr-2 text-primary">{k.packaging?.nama || 'Unknown'}</span>
                                <span className="shrink-0">Rp {Math.round(biaya).toLocaleString('id-ID')}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t text-[10px] text-muted-foreground">
                                <div className="flex flex-col text-left">
                                  <span className="uppercase text-[9px] font-medium tracking-wider mb-0.5">Total</span>
                                  <span className="font-bold text-foreground">{k.jumlah} {k.packaging?.satuan}</span>
                                </div>
                                <div className="flex flex-col border-x text-center">
                                  <span className="uppercase text-[9px] font-medium tracking-wider mb-0.5">Bisa Untuk</span>
                                  <span className="font-bold text-foreground">{div} Porsi</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="uppercase text-[9px] font-medium tracking-wider mb-0.5">Per Porsi</span>
                                  <span className="font-bold text-foreground">{pemakaianPerPorsi} {k.packaging?.satuan}</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div className="p-3 bg-muted/30 font-bold flex justify-between items-center text-orange-600 border-t">
                          <span>Subtotal Packaging</span>
                          <span>Rp {Math.round(totalHppPack).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Tidak ada komposisi packaging.</p>
                  )}
                </div>

                <div className="flex justify-end border-t pt-4">
                  <div className="flex items-center gap-6 px-2 py-2 bg-muted/50 border font-bold text-base">
                    <span>GRAND TOTAL HPP</span>
                    <span className="text-emerald-600">Rp {totalHpp.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 sm:gap-4 border-t pt-6 mt-2 text-sm items-stretch">
                  <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                      <Calculator className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Total HPP</p>
                      <p className="text-xs sm:text-sm lg:text-lg font-bold text-emerald-600">Rp {totalHpp.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                      <Tag className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Target Jual</p>
                      <p className="text-xs sm:text-sm lg:text-lg font-bold text-orange-600 dark:text-orange-500">Rp {itemToView.hargaJual.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                      <Banknote className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Laba Kotor</p>
                      <p className={`text-xs sm:text-sm lg:text-lg font-bold ${laba < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                        Rp {laba.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                      <Percent className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Margin (%)</p>
                      <p className={`text-xs sm:text-sm lg:text-lg font-bold ${margin < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                        {margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </>
  )
}
