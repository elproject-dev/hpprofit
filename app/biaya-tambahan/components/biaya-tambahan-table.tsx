"use client"

import { useState, useTransition } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { MoreVertical, TrendingUp, TrendingDown, BoxIcon } from "lucide-react"
import { type BiayaTambahan } from "@/lib/db"
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
import { toast } from "@/components/ui/toast"
import { db } from "@/lib/db"

export function BiayaTambahanTable({
  data,
  onEdit
}: {
  data: BiayaTambahan[],
  onEdit: (item: BiayaTambahan) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [itemToDelete, setItemToDelete] = useState<BiayaTambahan | null>(null)

  const formatNilai = (item: BiayaTambahan) => {
    if (item.tipeNilai === "Persentase") {
      return `${item.besaranNilai}%`
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(item.besaranNilai)
  }

  const parseTipePesanan = (json: string): string[] => {
    try { return JSON.parse(json) } catch { return [] }
  }

  const handleToggleStatus = (item: BiayaTambahan) => {
    startTransition(async () => {
      try {
        await db.biayaTambahan.update(item.id, { status: !item.status })
      } catch {
        toast.add({
          title: "Gagal mengubah status",
          type: "error"
        })
      }
    })
  }

  const executeDelete = () => {
    if (itemToDelete) {
      startTransition(async () => {
        try {
          await db.biayaTambahan.delete(itemToDelete.id)
          setItemToDelete(null)
          toast.add({
            title: "Biaya tambahan berhasil dihapus!",
            type: "success"
          })
        } catch (error) {
          toast.add({
            title: "Gagal menghapus biaya tambahan",
            type: "error"
          })
        }
      })
    }
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden mt-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-[11px] text-muted-foreground border rounded-none bg-card">
            Belum ada data biaya tambahan.
          </div>
        ) : (
          data.map((item) => {
            return (
              <div key={item.id} className={`flex flex-col bg-card border rounded-none p-3 gap-3 shadow-sm ${!item.status ? "opacity-50" : ""}`}>
                <div className="flex items-start gap-3 relative">
                  <div className="flex flex-col flex-1 min-w-0 pr-8 justify-between py-0.5">
                    <h3 className="font-medium text-sm truncate mb-2">{item.nama}</h3>
                    <div className="flex items-center mt-auto">
                      <p className="text-[12px] font-bold text-foreground">{formatNilai(item)}</p>
                    </div>
                  </div>

                  <div className="absolute top-0 right-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setItemToDelete(item)}>Hapus</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1 border-t pt-2">
                  <span className="inline-flex items-center justify-center px-1.5 py-[2px] rounded text-[9px] font-medium bg-secondary text-secondary-foreground leading-none">
                    {item.kategori}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{item.status ? "Aktif" : "Non-Aktif"}</span>
                    <Switch checked={item.status} onCheckedChange={() => handleToggleStatus(item)} size="sm" />
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
              <TableHead className="text-left">Nama Biaya</TableHead>
              <TableHead className="text-center">Kategori</TableHead>
              <TableHead className="text-center">Tipe & Nilai</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-0 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada data biaya tambahan.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const pesananList = parseTipePesanan(item.tipePesanan)
                return (
                  <TableRow key={item.id} className={!item.status ? "opacity-50" : ""}>
                    <TableCell className="text-left font-medium">{item.nama}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-none text-xs font-medium bg-secondary text-secondary-foreground">
                        {item.kategori}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formatNilai(item)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={item.status}
                          onCheckedChange={() => handleToggleStatus(item)}
                          size="sm"
                        />
                      </div>
                    </TableCell>
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
              Tindakan ini tidak dapat dibatalkan. Data biaya tambahan ini akan dihapus secara permanen dari server.
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
