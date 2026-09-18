"use client"

import { useState, useTransition } from "react"
import { MoreVertical, BoxIcon } from "lucide-react"
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
import { toast } from "@/components/ui/toast"
import { db } from "@/lib/db"

export function PackagingTable({
  data,
  onEdit
}: {
  data: any[],
  onEdit: (item: any) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const executeDelete = () => {
    if (itemToDelete) {
      startTransition(async () => {
        try {
          await db.packaging.delete(itemToDelete.id)
          setItemToDelete(null)
          toast.add({
            title: "Packaging berhasil dihapus!",
            type: "success"
          })
        } catch (error) {
          toast.add({
            title: "Gagal menghapus packaging",
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
            Belum ada data packaging.
          </div>
        ) : (
          data.map((item) => {
            const hargaPembelian = Math.round(item.harga * (item.konversi || 1))
            return (
              <div key={item.id} className="border rounded-none p-3 bg-card relative shadow-sm flex flex-col gap-3">
                <div className="absolute top-2 right-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Buka menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 min-w-0 pr-8 flex flex-col justify-between">
                    <h3 className="font-semibold text-xs truncate leading-tight">{item.nama}</h3>
                    <div className="flex flex-wrap gap-1 mt-auto">
                      <span className="inline-flex items-center justify-center px-1 py-[2px] rounded text-[8.5px] font-medium bg-secondary text-secondary-foreground leading-none">
                        {item.kategori}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-y-1 text-[11px] border-t pt-2 mt-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Satuan</span>
                    <span className="font-medium">{item.satuanDasar || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Qty</span>
                    <span className="font-medium">{(item.konversi || 1).toLocaleString("id-ID")} {item.satuan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Pembelian</span>
                    <span className="font-medium">Rp {hargaPembelian.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harga Satuan</span>
                    <span className="font-medium text-primary">Rp {Math.round(item.harga).toLocaleString("id-ID")}</span>
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
              <TableHead className="text-left w-[250px]">Nama Packaging</TableHead>
              <TableHead className="text-center w-[140px]">Kategori</TableHead>
              <TableHead className="text-left w-[140px]">Nama Satuan</TableHead>
              <TableHead className="text-right w-[140px]">Harga Pembelian</TableHead>
              <TableHead className="text-center w-[140px]">Jumlah</TableHead>
              <TableHead className="text-center w-[140px]">Satuan</TableHead>
              <TableHead className="text-right w-[140px]">Harga Satuan</TableHead>
              <TableHead className="w-0 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Belum ada data packaging.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const hargaPembelian = Math.round(item.harga * (item.konversi || 1))
                return (
                  <TableRow key={item.id}>
                    <TableCell className="text-left font-medium">{item.nama}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-none text-xs font-medium bg-secondary text-secondary-foreground">
                        {item.kategori}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">{item.satuanDasar || "-"}</TableCell>
                    <TableCell className="text-right">Rp {hargaPembelian.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-center">{(item.konversi || 1).toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-center">{item.satuan}</TableCell>
                    <TableCell className="text-right">Rp {Math.round(item.harga).toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" />}>
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Buka menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
              Tindakan ini tidak dapat dibatalkan. Data packaging ini akan dihapus secara permanen dari server.
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
    </>
  )
}
