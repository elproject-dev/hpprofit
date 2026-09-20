"use client"

import { useState, useTransition } from "react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Trash2Icon, MoreVertical, BoxIcon, Star, Calculator, Tag, Banknote, Percent, Printer, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function TransaksiTable({
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
      const safeName = (item.produk?.nama || 'Produksi').replace(/[^a-zA-Z0-9]/g, '_')
      document.title = `Produksi_${safeName}_${dateStr}`
      window.print()
      document.title = originalTitle
    }, 500)
  }

  const executeDelete = () => {
    if (itemToDelete) {
      startTransition(async () => {
        try {
          await db.transaction('rw', db.transaksiProduksi, db.transaksiProduksiBiaya, async () => {
            await db.transaksiProduksi.delete(itemToDelete.id)
            const oldBiaya = await db.transaksiProduksiBiaya.where('transaksiId').equals(itemToDelete.id).toArray()
            await db.transaksiProduksiBiaya.bulkDelete(oldBiaya.map(b => b.id))
          })
          toast.add({ title: "Data produksi berhasil dihapus!", type: "success" })
        } catch (error) {
          toast.add({ title: "Gagal menghapus data produksi", type: "error" })
        }
        setItemToDelete(null)
      })
    }
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden mt-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-[11px] text-muted-foreground border rounded-none bg-card">
            Belum ada data produksi.
          </div>
        ) : (
          data.map((item) => {
            const produkNama = item.produk?.nama || "Produk Dihapus"
            const hargaJual = item.produk?.hargaJual || 0
            const marginRp = hargaJual - item.hppPerSatuan
            const totalMargin = marginRp * item.jumlah
            const marginPersen = hargaJual > 0 ? (marginRp / hargaJual) * 100 : 0

            return (
              <div key={item.id} className="flex flex-col bg-card border rounded-none p-3 gap-3 shadow-sm relative">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 shrink-0 rounded-none bg-muted border flex items-center justify-center overflow-hidden">
                    {item.produk?.foto ? (
                      <img src={item.produk.foto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BoxIcon className="w-6 h-6 opacity-50" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate pr-8">{produkNama}</h3>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Produksi {Number(item.jumlah).toLocaleString('id-ID')} unit
                    </div>
                    <div className="flex items-center mt-2">
                      <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-none bg-primary text-white">
                        Margin {marginPersen.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setItemToView(item)}>Detail</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(item)}>Print Detail</DropdownMenuItem>
                        <DropdownMenuItem className="text-primary focus:bg-primary focus:text-primary-foreground" onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-primary focus:bg-primary focus:text-primary-foreground" onClick={() => setItemToDelete(item)}>Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1 border-t pt-2 text-[11px]">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Total Biaya</span>
                    <span className="font-bold">Rp {Math.round(item.totalHpp + item.totalBiayaTambahan).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-muted-foreground">Target Jual</span>
                    <span className="font-bold text-primary">Rp {Math.round(hargaJual).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">HPP / Unit</span>
                    <span className="font-bold text-primary">Rp {Math.round(item.hppPerSatuan).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-muted-foreground">Total Margin</span>
                    <span className="font-bold text-primary">Rp {Math.round(totalMargin).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="hidden md:block border mt-4 rounded-none overflow-hidden bg-card shadow-sm">
        <Table className="[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
          <TableHeader className="bg-muted text-foreground">
            <TableRow>
              <TableHead className="w-0 text-center">Foto</TableHead>
              <TableHead className="text-left">Produk</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
              <TableHead className="text-right">HPP / Unit</TableHead>
              <TableHead className="text-right">Target Jual</TableHead>
              <TableHead className="text-right">Total Bahan</TableHead>
              <TableHead className="text-right">Biaya Tambahan</TableHead>
              <TableHead className="text-right">Total Biaya</TableHead>
              <TableHead className="text-right">Total Margin</TableHead>
              <TableHead className="w-0 whitespace-nowrap text-center px-4">Margin (%)</TableHead>
              <TableHead className="w-0 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  Belum ada data produksi.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const produkNama = item.produk?.nama || "Produk Dihapus"
                const hargaJual = item.produk?.hargaJual || 0
                const marginRp = hargaJual - item.hppPerSatuan
                const totalMargin = marginRp * item.jumlah
                const marginPersen = hargaJual > 0 ? (marginRp / hargaJual) * 100 : 0
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.produk?.foto ? (
                        <img src={item.produk.foto} alt="" className="w-12 h-12 min-w-12 shrink-0 aspect-square object-cover" />
                      ) : (
                        <div className="w-12 h-12 min-w-12 shrink-0 aspect-square bg-muted flex items-center justify-center text-muted-foreground"><BoxIcon className="w-6 h-6 opacity-50" /></div>
                      )}
                    </TableCell>
                    <TableCell className="text-left font-medium">
                      {produkNama}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {Number(item.jumlah).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      Rp {Math.round(item.hppPerSatuan).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      Rp {Math.round(hargaJual).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {Math.round(item.totalHpp).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rp {Math.round(item.totalBiayaTambahan).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-bold bg-muted/30">
                      Rp {Math.round(item.totalHpp + item.totalBiayaTambahan).toLocaleString('id-ID')}
                    </TableCell>

                    <TableCell className="text-right font-bold text-primary">
                      Rp {Math.round(totalMargin).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-none bg-primary text-white">
                        {marginPersen.toFixed(1)}%
                      </span>
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
                            Print Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-primary focus:bg-primary focus:text-primary-foreground" onClick={() => onEdit(item)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-primary focus:bg-primary focus:text-primary-foreground"
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
            <AlertDialogTitle>Hapus Transaksi {itemToDelete?.produk?.nama}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data transaksi ini akan dihapus secara permanen dari server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!itemToView} onOpenChange={(open) => !open && setItemToView(null)}>
        <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-primary">Detail Transaksi Produksi</DialogTitle>
          </DialogHeader>

          {itemToView && (
            <div className="space-y-6 mt-4">
              {(() => {
                const totalTargetJual = (itemToView.produk?.hargaJual || 0) * itemToView.jumlah
                const totalBiaya = itemToView.totalHpp + (itemToView.totalBiayaTambahan || 0)
                const totalLaba = totalTargetJual - totalBiaya
                const margin = totalTargetJual > 0 ? (totalLaba / totalTargetJual) * 100 : 0

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
                  <>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted border flex items-center justify-center shrink-0">
                          {itemToView.produk?.foto ? (
                            <img src={itemToView.produk?.foto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BoxIcon className="w-6 h-6 opacity-50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg leading-tight text-primary">{itemToView.produk?.nama}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {format(new Date(itemToView.tanggal), "d MMMM yyyy, HH:mm", { locale: id })}
                            </p>
                          </div>
                          {/* Tampilan Desktop & Print: Jumlah & Bintang di kanan */}
                          <div className="hidden sm:block print:block text-right shrink-0">
                            <p className="text-muted-foreground text-[10px] uppercase font-semibold">Jumlah Produksi</p>
                            <p className="font-bold text-lg">{Number(itemToView.jumlah).toLocaleString('id-ID')} Unit</p>
                            <div className="flex gap-0.5 justify-end mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-[#AC7F5E] text-[#AC7F5E]' : 'text-muted-foreground/30'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tampilan Mobile: Jumlah & Bintang di bawah layout utama (full width) */}
                      <div className="sm:hidden flex items-center justify-between print:hidden text-[11px] whitespace-nowrap bg-muted/20 px-2 py-1.5 border rounded-md">
                        <div className="flex items-center gap-1.5">
                          <span className="text-muted-foreground uppercase font-medium">Jumlah Produksi :</span>
                          <span className="font-bold">{Number(itemToView.jumlah).toLocaleString('id-ID')} Unit</span>
                        </div>
                        <div className="flex gap-0.5 ml-auto">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'fill-[#AC7F5E] text-[#AC7F5E]' : 'text-muted-foreground/30'}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-2 sm:gap-4 border-t pt-4 mt-2 text-sm items-stretch">
                      <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                        <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                          <Calculator className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Total Biaya</p>
                          <p className="text-xs sm:text-sm lg:text-lg font-bold text-primary">Rp {Math.round(totalBiaya).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                        <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                          <Tag className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Total Jual</p>
                          <p className="text-xs sm:text-sm lg:text-lg font-bold text-primary">Rp {Math.round(totalTargetJual).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                        <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                          <Banknote className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Total Laba</p>
                          <p className="text-xs sm:text-sm lg:text-lg font-bold text-primary">
                            Rp {Math.round(totalLaba).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 bg-card border shadow-sm flex items-center gap-2 sm:gap-3">
                        <div className="shrink-0 text-muted-foreground hidden sm:block print:block">
                          <Percent className="w-5 h-5 lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-muted-foreground text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase">Margin (%)</p>
                          <p className="text-xs sm:text-sm lg:text-lg font-bold text-primary">
                            {margin.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })()}

              <div className="border-t pt-4 space-y-3">
                <div className="bg-card border shadow-sm p-3 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-primary text-sm font-semibold">Total Biaya Bahan</span>
                    <span className="font-bold text-base">Rp {Math.round(itemToView.totalHpp).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="space-y-3 pt-3 border-t">
                    {itemToView.produk?.komposisiBahan && itemToView.produk.komposisiBahan.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs uppercase text-primary">Bahan Baku Digunakan</h4>
                        {/* Desktop & Print: Format Tabel */}
                        <div className="hidden sm:block print:block bg-muted/30 border text-xs rounded-none overflow-hidden">
                          <table className="w-full table-fixed [&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                            <thead className="bg-muted text-left text-primary">
                              <tr>
                                <th className="p-2 border-b">Bahan</th>
                                <th className="p-2 border-b text-center w-24">Jumlah</th>
                                <th className="p-2 border-b text-center w-24">Satuan</th>
                                <th className="p-2 border-b text-right">Biaya</th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemToView.produk.komposisiBahan.map((k: any, idx: number) => {
                                const div = parseFloat(k.pembagi) || 1
                                const jumlah = (k.takaran / div) * itemToView.jumlah
                                const biaya = ((k.bahan?.harga || 0) * k.takaran / div) * itemToView.jumlah
                                return (
                                  <tr key={idx} className="border-b last:border-b-0">
                                    <td className="p-2 truncate" title={k.bahan?.nama}>{k.bahan?.nama || 'Terhapus'}</td>
                                    <td className="p-2 text-center">{jumlah.toLocaleString('id-ID', { maximumFractionDigits: 2 })}</td>
                                    <td className="p-2 text-center text-muted-foreground">{k.bahan?.satuan || '-'}</td>
                                    <td className="p-2 text-right font-medium">Rp {Math.round(biaya).toLocaleString('id-ID')}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile: Format List Card */}
                        <div className="sm:hidden print:hidden border rounded-md divide-y overflow-hidden text-sm">
                          {itemToView.produk.komposisiBahan.map((k: any, idx: number) => {
                            const div = parseFloat(k.pembagi) || 1
                            const jumlah = (k.takaran / div) * itemToView.jumlah
                            const biaya = ((k.bahan?.harga || 0) * k.takaran / div) * itemToView.jumlah
                            return (
                              <div key={idx} className="p-3 bg-card flex flex-col gap-1.5">
                                <div className="flex justify-between items-start font-bold">
                                  <span className="truncate pr-2 text-primary">{k.bahan?.nama || 'Terhapus'}</span>
                                  <span className="shrink-0">Rp {Math.round(biaya).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {jumlah.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {k.bahan?.satuan || '-'}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {itemToView.produk?.komposisiPackage && itemToView.produk.komposisiPackage.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs uppercase text-primary">Packaging Digunakan</h4>
                        {/* Desktop & Print: Format Tabel */}
                        <div className="hidden sm:block print:block bg-muted/30 border text-xs rounded-none overflow-hidden">
                          <table className="w-full table-fixed [&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                            <thead className="bg-muted text-left text-primary">
                              <tr>
                                <th className="p-2 border-b">Packaging</th>
                                <th className="p-2 border-b text-center w-24">Jumlah</th>
                                <th className="p-2 border-b text-center w-24">Satuan</th>
                                <th className="p-2 border-b text-right">Biaya</th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemToView.produk.komposisiPackage.map((k: any, idx: number) => {
                                const div = parseFloat(k.pembagi) || 1
                                const jumlah = (k.jumlah / div) * itemToView.jumlah
                                const biaya = ((k.packaging?.harga || 0) * k.jumlah / div) * itemToView.jumlah
                                return (
                                  <tr key={idx} className="border-b last:border-b-0">
                                    <td className="p-2 truncate" title={k.packaging?.nama}>{k.packaging?.nama || 'Terhapus'}</td>
                                    <td className="p-2 text-center">{Math.ceil(jumlah).toLocaleString('id-ID')}</td>
                                    <td className="p-2 text-center text-muted-foreground">{k.packaging?.satuan || '-'}</td>
                                    <td className="p-2 text-right font-medium">Rp {Math.round(biaya).toLocaleString('id-ID')}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile: Format List Card */}
                        <div className="sm:hidden print:hidden border rounded-md divide-y overflow-hidden text-sm">
                          {itemToView.produk.komposisiPackage.map((k: any, idx: number) => {
                            const div = parseFloat(k.pembagi) || 1
                            const jumlah = (k.jumlah / div) * itemToView.jumlah
                            const biaya = ((k.packaging?.harga || 0) * k.jumlah / div) * itemToView.jumlah
                            return (
                              <div key={idx} className="p-3 bg-card flex flex-col gap-1.5">
                                <div className="flex justify-between items-start font-bold">
                                  <span className="truncate pr-2 text-primary">{k.packaging?.nama || 'Terhapus'}</span>
                                  <span className="shrink-0">Rp {Math.round(biaya).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>
                                    {Math.ceil(jumlah).toLocaleString('id-ID')} {k.packaging?.satuan || '-'}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-card border shadow-sm p-3 space-y-3">
                  <span className="text-primary text-sm font-semibold block border-b pb-2">Total Biaya Operasional</span>
                  {itemToView.biayaTambahan && itemToView.biayaTambahan.length > 0 ? (
                    <div className="text-sm space-y-2">
                      {itemToView.biayaTambahan.map((bt: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-foreground">{bt.namaBiaya}</span>
                          <span className="font-medium">Rp {Math.round(bt.nominal || 0).toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">Tidak ada biaya operasional.</p>
                  )}
                </div>
              </div>

              <div className="bg-primary/5 dark:bg-primary/10 p-4 border border-primary/20 space-y-3">
                <div className="flex justify-between text-sm font-bold text-md text-primary">
                  <span>Total Biaya Produksi</span>
                  <span>Rp {Math.round(itemToView.totalHpp + itemToView.totalBiayaTambahan).toLocaleString('id-ID')}</span>
                </div>
              </div>

              {itemToView.catatan && (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-semibold">Catatan</p>
                  <p className="text-sm bg-muted/50 p-3 border whitespace-pre-wrap">{itemToView.catatan}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
