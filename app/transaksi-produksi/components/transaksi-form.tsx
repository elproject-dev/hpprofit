"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { toast } from "@/components/ui/toast"
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, Trash2Icon, Edit2Icon, CheckIcon, XIcon, BoxIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TransaksiForm({
  produkList,
  biayaTambahanData = [],
  itemToEdit = null,
  onClearEdit = () => { }
}: {
  produkList: any[]
  biayaTambahanData?: any[]
  itemToEdit?: any
  onClearEdit?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const [produkId, setProdukId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [jumlah, setJumlah] = useState("")
  const [catatan, setCatatan] = useState("")

  const [biayaTambahan, setBiayaTambahan] = useState<{ id: string, namaBiaya: string, nominal: string, persenPenggunaan?: string }[]>([])

  // Populate form when itemToEdit changes
  useEffect(() => {
    if (itemToEdit) {
      setIsOpen(true)
      setProdukId(itemToEdit.produkId)
      setSearchQuery(itemToEdit.produk?.nama || "")
      setJumlah(new Intl.NumberFormat("id-ID").format(itemToEdit.jumlah))
      setCatatan(itemToEdit.catatan || "")
      setBiayaTambahan(
        itemToEdit.biayaTambahan?.map((bt: any) => ({
          id: Math.random().toString(),
          namaBiaya: bt.namaBiaya,
          nominal: bt.nominal.toString()
        })) || []
      )
    }
  }, [itemToEdit])

  const selectedProduk = produkList.find(p => p.id === produkId)
  const estimasiHpp = selectedProduk && jumlah ? Math.round(selectedProduk.hppSatuan * parseFloat(jumlah.replace(/\./g, ""))) : 0

  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [newTarget, setNewTarget] = useState("")

  useEffect(() => {
    if (selectedProduk && !isEditingTarget) {
      setNewTarget(Math.round(selectedProduk.hargaJual).toLocaleString('id-ID'))
    }
  }, [selectedProduk, isEditingTarget])

  async function handleUpdateTarget() {
    if (!selectedProduk) return
    const num = parseFloat(newTarget.replace(/\./g, ""))
    if (isNaN(num) || num < 0) {
      toast.add({ title: "Nominal tidak valid", type: "error" })
      return
    }

    setIsPending(true)
    try {
      await db.produk.update(selectedProduk.id, { hargaJual: num })
      toast.add({ title: "Target jual berhasil diperbarui secara permanen!", type: "success" })
      setIsEditingTarget(false)
    } catch (error) {
      toast.add({ title: "Gagal mengupdate target jual", type: "error" })
    }
    setIsPending(false)
  }

  useEffect(() => {
    if (biayaTambahan.length > 0) {
      setBiayaTambahan(prev => prev.map(item => {
        const master = biayaTambahanData?.find(b =>
          b.tipeNilai === "Persentase" && item.namaBiaya && item.namaBiaya.startsWith(b.nama)
        )
        if (master) {
          const calculated = Math.round((estimasiHpp * master.besaranNilai) / 100)
          return { ...item, nominal: calculated.toString() }
        }
        return item
      }))
    }
  }, [estimasiHpp, biayaTambahanData])
  const totalBiayaTambahan = biayaTambahan.reduce((acc, curr) => acc + (parseFloat(curr.nominal) || 0), 0)
  const totalBiayaProduksi = estimasiHpp + totalBiayaTambahan
  const parsedJumlah = jumlah ? parseFloat(jumlah.replace(/\./g, "")) : 0
  const hppPerSatuan = parsedJumlah > 0 ? totalBiayaProduksi / parsedJumlah : 0
  const marginRasio = selectedProduk && selectedProduk.hargaJual > 0
    ? ((selectedProduk.hargaJual - hppPerSatuan) / selectedProduk.hargaJual) * 100
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!produkId || parsedJumlah <= 0) {
      toast.add({ title: "Lengkapi data produk dan jumlah produksi", type: "error" })
      return
    }

    setIsPending(true)
    const formData = {
      produkId,
      jumlah: parsedJumlah,
      totalHpp: estimasiHpp,
      totalBiayaTambahan,
      hppPerSatuan,
      catatan,
      biayaTambahan: biayaTambahan
        .filter(b => b.namaBiaya && parseFloat(b.nominal) > 0)
        .map(b => ({ namaBiaya: b.namaBiaya, nominal: parseFloat(b.nominal) }))
    }

    try {
      if (itemToEdit) {
        await db.transaction('rw', db.transaksiProduksi, db.transaksiProduksiBiaya, async () => {
          await db.transaksiProduksi.update(itemToEdit.id, {
            produkId,
            jumlah: parsedJumlah,
            totalHpp: estimasiHpp,
            totalBiayaTambahan,
            hppPerSatuan,
            catatan,
            updatedAt: new Date()
          })

          const oldBiaya = await db.transaksiProduksiBiaya.where('transaksiId').equals(itemToEdit.id).toArray()
          await db.transaksiProduksiBiaya.bulkDelete(oldBiaya.map(b => b.id))

          const newBiayaList = formData.biayaTambahan.map((b: any) => ({
            id: Date.now().toString() + Math.random(),
            transaksiId: itemToEdit.id,
            namaBiaya: b.namaBiaya,
            nominal: b.nominal
          }))
          if (newBiayaList.length > 0) await db.transaksiProduksiBiaya.bulkAdd(newBiayaList)
        })
      } else {
        await db.transaction('rw', db.transaksiProduksi, db.transaksiProduksiBiaya, async () => {
          const tId = Date.now().toString()
          await db.transaksiProduksi.add({
            id: tId,
            tanggal: new Date(),
            produkId,
            jumlah: parsedJumlah,
            totalHpp: estimasiHpp,
            totalBiayaTambahan,
            hppPerSatuan,
            catatan: catatan || null,
            createdAt: new Date(),
            updatedAt: new Date()
          })

          const newBiayaList = formData.biayaTambahan.map((b: any) => ({
            id: Date.now().toString() + Math.random(),
            transaksiId: tId,
            namaBiaya: b.namaBiaya,
            nominal: b.nominal
          }))
          if (newBiayaList.length > 0) await db.transaksiProduksiBiaya.bulkAdd(newBiayaList)
        })
      }

      toast.add({ title: itemToEdit ? "Perubahan berhasil disimpan!" : "Data produksi berhasil dicatat!", type: "success" })
      setIsOpen(false)
      setProdukId("")
      setSearchQuery("")
      setJumlah("")
      setBiayaTambahan([])
      setCatatan("")
      onClearEdit()
    } catch (error) {
      toast.add({ title: "Gagal", type: "error" })
      setIsPending(false)
    }
  }

  return (
    <div className="w-full mb-4">
      {!isOpen && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsOpen(true)}>Tambah Produksi</Button>
        </div>
      )}

      {isOpen && (
        <div className="border p-6 bg-card text-card-foreground shadow-sm">
          <div className="mb-4">
            <h1 className="text-lg font-semibold">{itemToEdit ? "Edit Transaksi Produksi" : "Catat Produksi Baru"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-start space-y-4 mb-6">
              <div className="w-32 h-32 shrink-0 bg-muted rounded-none border-2 border-dashed flex items-center justify-center overflow-hidden">
                {selectedProduk?.foto ? (
                  <img src={selectedProduk.foto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-2">
                    <BoxIcon className="w-8 h-8 opacity-50 mb-1" />
                    <span>Pilih Produk</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Pilih Produk</Label>
                <Combobox value={produkId} onValueChange={(val) => {
                  if (!val) return
                  setProdukId(val as string)
                  const selected = produkList.find(p => p.id === val)
                  if (selected) setSearchQuery(selected.nama)
                }}>
                  <ComboboxInput
                    className="w-full rounded-none"
                    placeholder="Cari produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      {produkList
                        .filter(p => p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || p.id === produkId)
                        .map((p) => (
                          <ComboboxItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              {p.foto ? (
                                <img src={p.foto} alt="" className="w-5 h-5 object-cover rounded-none border" />
                              ) : (
                                <div className="w-5 h-5 bg-muted rounded-none flex items-center justify-center text-muted-foreground border"><BoxIcon className="w-3 h-3 opacity-50" /></div>
                              )}
                              <span>{p.nama}</span>
                            </div>
                          </ComboboxItem>
                        ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Jumlah Produksi</Label>
                <div className="flex rounded-none shadow-sm">
                  <Input
                    type="text"
                    inputMode="numeric"
                    className="rounded-r-none focus-visible:z-10"
                    value={jumlah}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "")
                      if (!val) {
                        setJumlah("")
                      } else {
                        setJumlah(new Intl.NumberFormat("id-ID").format(parseInt(val, 10)))
                      }
                    }}
                    placeholder="0"
                    required
                  />
                  <div className="inline-flex items-center justify-center px-3 rounded-none border border-l-0 border-input bg-muted/50 text-xs font-medium text-muted-foreground">
                    Unit
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">HPP Satuan Dasar</Label>
                <div className="flex items-center h-8 px-3 border rounded-none bg-muted/50 text-sm font-medium">
                  Rp {selectedProduk ? Math.round(selectedProduk.hppSatuan).toLocaleString('id-ID') : "0"}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Target Harga Jual</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                    {isEditingTarget ? (
                      <Input
                        type="text"
                        inputMode="numeric"
                        className="pl-8 h-8 text-sm"
                        value={newTarget}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "")
                          if (!val) {
                            setNewTarget("")
                          } else {
                            setNewTarget(new Intl.NumberFormat("id-ID").format(parseInt(val, 10)))
                          }
                        }}
                        placeholder="0"
                      />
                    ) : (
                      <div className="flex items-center h-8 pl-8 pr-3 border rounded-none bg-muted/50 text-sm font-medium">
                        {selectedProduk ? Math.round(selectedProduk.hargaJual).toLocaleString('id-ID') : "0"}
                      </div>
                    )}
                  </div>
                  {selectedProduk && (
                    isEditingTarget ? (
                      <Button type="button" variant="outline" size="icon" className="shrink-0 text-primary hover:text-primary/80 h-8 w-8" onClick={handleUpdateTarget} disabled={isPending}>
                        <CheckIcon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="icon" className="shrink-0 text-primary hover:text-primary/80 h-8 w-8" onClick={() => setIsEditingTarget(true)} title="Edit Target Jual Permanen" disabled={isPending}>
                        <Edit2Icon className="w-4 h-4" />
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Biaya Operasional (Overhead)</h3>

                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBiayaTambahan([...biayaTambahan, { id: Date.now().toString(), namaBiaya: "", nominal: "" }])}
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Tambah Biaya
                </Button>
              </div>

              {biayaTambahan.length === 0 ? (
                <div className="text-center py-4 text-[11px] text-muted-foreground border-2 border-dashed rounded-none">
                  Belum ada biaya operasional.<br></br>Klik tombol tambah untuk memasukkan biaya.
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {biayaTambahan.map((item, index) => {
                      const masterBiaya = biayaTambahanData?.find(b => item.namaBiaya && item.namaBiaya.startsWith(b.nama))
                      return (
                        <div key={item.id} className="border rounded-none p-2.5 bg-card flex flex-col gap-2.5 shadow-sm">
                          <div className="flex gap-3 items-center">
                            <div className="flex-1 min-w-0">
                              <Combobox
                                value={item.namaBiaya}
                                onValueChange={(val) => {
                                  if (!val) return
                                  const newArr = [...biayaTambahan]
                                  newArr[index].namaBiaya = val as string
                                  const master = biayaTambahanData?.find(b => b.nama === val)
                                  if (master) {
                                    if (master.tipeNilai === "Persentase") {
                                      const calculated = (estimasiHpp * master.besaranNilai) / 100
                                      newArr[index].nominal = calculated.toString()
                                      newArr[index].namaBiaya = `${master.nama} (${master.besaranNilai}%)`
                                    } else {
                                      const pct = parseFloat(newArr[index].persenPenggunaan || "100")
                                      newArr[index].nominal = ((master.besaranNilai * pct) / 100).toString()
                                    }
                                  }
                                  setBiayaTambahan(newArr)
                                }}
                              >
                                <ComboboxInput
                                  className="w-full rounded-none text-sm h-8"
                                  placeholder="Pilih atau ketik biaya..."
                                  value={item.namaBiaya}
                                  onChange={(e) => {
                                    const newArr = [...biayaTambahan]
                                    newArr[index].namaBiaya = e.target.value
                                    setBiayaTambahan(newArr)
                                  }}
                                />
                                <ComboboxContent>
                                  <ComboboxList>
                                    {biayaTambahanData
                                      ?.filter(b => b.status !== false && b.nama.toLowerCase().includes((item.namaBiaya || "").toLowerCase()))
                                      .map(master => (
                                        <ComboboxItem key={master.id} value={master.nama}>
                                          <div className="flex items-center gap-2">
                                            {master.foto ? (
                                              <img src={master.foto} alt="" className="w-6 h-6 object-cover rounded-none border shrink-0" />
                                            ) : (
                                              <div className="w-6 h-6 bg-muted rounded-none flex items-center justify-center text-muted-foreground border shrink-0"><BoxIcon className="w-3 h-3 opacity-50" /></div>
                                            )}
                                            <span>{master.nama} ({master.tipeNilai === "Persentase" ? `${master.besaranNilai}%` : `Rp${master.besaranNilai.toLocaleString('id-ID')}`})</span>
                                          </div>
                                        </ComboboxItem>
                                      ))}
                                    {item.namaBiaya && !biayaTambahanData?.some(b => b.nama.toLowerCase() === item.namaBiaya.toLowerCase()) && (
                                      <ComboboxItem value={item.namaBiaya}>
                                        + Tambah "{item.namaBiaya}"
                                      </ComboboxItem>
                                    )}
                                  </ComboboxList>
                                </ComboboxContent>
                              </Combobox>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0 text-primary h-8 w-8 border hover:bg-primary hover:text-primary-foreground rounded-none"
                              onClick={() => setBiayaTambahan(biayaTambahan.filter((_, i) => i !== index))}
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex rounded-none shadow-sm mt-1 gap-2">
                            <div className="w-24 shrink-0 relative">
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="100"
                                className="rounded-none h-8 text-sm w-full pr-6 text-center"
                                value={item.persenPenggunaan ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^0-9.]/g, "")
                                  const newArr = [...biayaTambahan]
                                  newArr[index].persenPenggunaan = val

                                  const master = biayaTambahanData?.find(b => b.nama === item.namaBiaya)
                                  if (master && master.tipeNilai === "Nominal") {
                                    const pct = parseFloat(val) || 100
                                    newArr[index].nominal = ((master.besaranNilai * pct) / 100).toString()
                                  }
                                  setBiayaTambahan(newArr)
                                }}
                              />
                              <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">%</span>
                            </div>

                            <div className="flex flex-1">
                              <div className="inline-flex items-center justify-center px-3 rounded-none border border-r-0 border-input bg-muted/50 text-xs font-medium text-muted-foreground">
                                Rp
                              </div>
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className="rounded-l-none h-8 text-sm w-full"
                                value={item.nominal ? new Intl.NumberFormat("id-ID").format(Number(item.nominal)) : ""}
                                onChange={(e) => {
                                  const newArr = [...biayaTambahan]
                                  const val = e.target.value.replace(/\D/g, "")
                                  newArr[index].nominal = val
                                  setBiayaTambahan(newArr)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="hidden md:block border rounded-none shadow-sm overflow-hidden">
                    <Table className="[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                      <TableHeader className="bg-muted text-foreground">
                        <TableRow>
                          <TableHead className="text-left">Nama Biaya</TableHead>
                          <TableHead className="w-[100px] text-center">Persen (%)</TableHead>
                          <TableHead className="w-[200px] text-left">Nominal (Rp)</TableHead>
                          <TableHead className="w-[60px] text-center">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {biayaTambahan.map((item, index) => {
                          const masterBiaya = biayaTambahanData?.find(b => item.namaBiaya && item.namaBiaya.startsWith(b.nama))
                          return (
                            <TableRow key={item.id}>
                              <TableCell className="p-2">
                                <Combobox
                                  value={item.namaBiaya}
                                  onValueChange={(val) => {
                                    if (!val) return
                                    const newArr = [...biayaTambahan]
                                    newArr[index].namaBiaya = val as string

                                    // Coba cari di master data
                                    const master = biayaTambahanData?.find(b => b.nama === val)
                                    if (master) {
                                      if (master.tipeNilai === "Persentase") {
                                        const calculated = (estimasiHpp * master.besaranNilai) / 100
                                        newArr[index].nominal = calculated.toString()
                                        newArr[index].namaBiaya = `${master.nama} (${master.besaranNilai}%)`
                                      } else {
                                        const pct = parseFloat(newArr[index].persenPenggunaan || "100")
                                        newArr[index].nominal = ((master.besaranNilai * pct) / 100).toString()
                                      }
                                    }

                                    setBiayaTambahan(newArr)
                                  }}
                                >
                                  <ComboboxInput
                                    className="w-full rounded-none"
                                    placeholder="Pilih atau ketik biaya..."
                                    value={item.namaBiaya}
                                    onChange={(e) => {
                                      const newArr = [...biayaTambahan]
                                      newArr[index].namaBiaya = e.target.value
                                      setBiayaTambahan(newArr)
                                    }}
                                  />
                                  <ComboboxContent>
                                    <ComboboxList>
                                      {biayaTambahanData
                                        ?.filter(b => b.status !== false && b.nama.toLowerCase().includes((item.namaBiaya || "").toLowerCase()))
                                        .map(master => (
                                          <ComboboxItem key={master.id} value={master.nama}>
                                            <div className="flex items-center gap-2">
                                              {master.foto ? (
                                                <img src={master.foto} alt="" className="w-6 h-6 object-cover rounded-none border shrink-0" />
                                              ) : (
                                                <div className="w-6 h-6 bg-muted rounded-none flex items-center justify-center text-muted-foreground border shrink-0"><BoxIcon className="w-3 h-3 opacity-50" /></div>
                                              )}
                                              <span>{master.nama} ({master.tipeNilai === "Persentase" ? `${master.besaranNilai}%` : `Rp${master.besaranNilai.toLocaleString('id-ID')}`})</span>
                                            </div>
                                          </ComboboxItem>
                                        ))}
                                      {item.namaBiaya && !biayaTambahanData?.some(b => b.nama.toLowerCase() === item.namaBiaya.toLowerCase()) && (
                                        <ComboboxItem value={item.namaBiaya}>
                                          + Tambah "{item.namaBiaya}"
                                        </ComboboxItem>
                                      )}
                                    </ComboboxList>
                                  </ComboboxContent>
                                </Combobox>
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  type="text"
                                  placeholder="100"
                                  className="rounded-none w-full text-center"
                                  value={item.persenPenggunaan ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9.]/g, "")
                                    const newArr = [...biayaTambahan]
                                    newArr[index].persenPenggunaan = val

                                    const master = biayaTambahanData?.find(b => b.nama === item.namaBiaya)
                                    if (master && master.tipeNilai === "Nominal") {
                                      const pct = parseFloat(val) || 100
                                      newArr[index].nominal = ((master.besaranNilai * pct) / 100).toString()
                                    }
                                    setBiayaTambahan(newArr)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="p-2">
                                <Input
                                  type="text"
                                  placeholder="0"
                                  className="rounded-none w-full"
                                  value={item.nominal ? new Intl.NumberFormat("id-ID").format(Number(item.nominal)) : ""}
                                  onChange={(e) => {
                                    const newArr = [...biayaTambahan]
                                    const val = e.target.value.replace(/\D/g, "")
                                    newArr[index].nominal = val
                                    setBiayaTambahan(newArr)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="p-2 text-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-none border text-primary hover:bg-primary hover:text-primary-foreground"
                                  onClick={() => setBiayaTambahan(biayaTambahan.filter((_, i) => i !== index))}
                                >
                                  <Trash2Icon className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>


            {selectedProduk && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 border rounded-none bg-card space-y-1 shadow-sm col-span-2 md:col-span-1">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Total Biaya Bahan</p>
                  <p className="text-sm md:text-base lg:text-lg font-bold">Rp {Math.round(estimasiHpp).toLocaleString('id-ID')}</p>
                </div>
                <div className="p-3 border rounded-none bg-card space-y-1 shadow-sm">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Biaya Operasional</p>
                  <p className="text-sm md:text-base lg:text-lg font-bold">Rp {Math.round(totalBiayaTambahan).toLocaleString('id-ID')}</p>
                </div>
                <div className="p-3 border rounded-none bg-card space-y-1 shadow-sm">
                  <p className="text-[10px] md:text-xs text-primary uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis">HPP Satuan</p>
                  <p className="text-base md:text-lg lg:text-xl font-black text-primary">
                    Rp {Math.round(hppPerSatuan).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 border rounded-none bg-card space-y-1 shadow-sm">
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Target Jual</p>
                  <p className="text-sm md:text-lg lg:text-xl font-black text-primary">
                    Rp {Math.round(selectedProduk.hargaJual).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 border rounded-none bg-card flex flex-col justify-between gap-1 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] md:text-xs text-primary uppercase font-semibold whitespace-nowrap overflow-hidden text-ellipsis">Total Margin</p>
                    <span className={`text-[9px] md:text-[10px] font-bold px-1.5 py-0.5 rounded-none bg-primary/10 text-primary`}>
                      {marginRasio.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`text-sm md:text-lg lg:text-xl font-black text-primary`}>
                    Rp {Math.round((selectedProduk.hargaJual - hppPerSatuan) * parsedJumlah).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : (itemToEdit ? "Simpan Perubahan" : "Simpan Produksi")}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                setIsOpen(false)
                onClearEdit()
              }}>
                Batal
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

