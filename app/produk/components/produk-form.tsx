"use client"

import { useState, useRef, useMemo } from "react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { toast } from "@/components/ui/toast"
import { Trash2Icon, PlusIcon, BoxIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const DEFAULT_KATEGORI_OPTIONS = ["Minuman", "Makanan", "Snack", "Dessert"]

type BahanBakuRef = { id: string, nama: string, satuan: string, harga: number, foto?: string | null }
type PackagingRef = { id: string, nama: string, satuan: string, harga: number, foto?: string | null }

type KomposisiBahanState = {
  id: string // temporary id for UI
  bahanId: string
  takaran: string
  pembagi: string
  searchQuery: string
}

type KomposisiPackagingState = {
  id: string
  packagingId: string
  jumlah: string
  pembagi: string
  searchQuery: string
}

function formatTakaranPerPorsi(takaranStr: string, pembagiStr: string, satuan: string) {
  const t = parseFloat(takaranStr) || 0
  const p = parseFloat(pembagiStr) || 1
  if (t === 0) return "-"

  const result = t / p
  const s = satuan?.toLowerCase() || ""

  if (s === "kg" && result < 1) {
    return `${(result * 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} Gram`
  }
  if ((s === "l" || s === "liter") && result < 1) {
    return `${(result * 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} ml`
  }

  return `${result.toLocaleString('id-ID', { maximumFractionDigits: 3 })} ${satuan || ""}`
}

export function ProdukInnerForm({
  existingKategori = [],
  bahanBakuList = [],
  packagingList = [],
  initialData = null,
  onSuccess = () => { },
  onCancel = () => { }
}: {
  existingKategori?: string[],
  bahanBakuList: BahanBakuRef[],
  packagingList: PackagingRef[],
  initialData?: any,
  onSuccess?: () => void,
  onCancel?: () => void
}) {
  const KATEGORI_OPTIONS = Array.from(new Set([...existingKategori, ...DEFAULT_KATEGORI_OPTIONS]))

  const [preview, setPreview] = useState<string | null>(initialData?.foto || null)
  const [isPending, setIsPending] = useState(false)
  const [hargaJual, setHargaJual] = useState(initialData ? new Intl.NumberFormat("id-ID").format(initialData.hargaJual) : "")
  const [kategoriQuery, setKategoriQuery] = useState(initialData?.kategori || "")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initial compositions
  const [komposisiBahan, setKomposisiBahan] = useState<KomposisiBahanState[]>(
    initialData?.komposisiBahan?.map((item: any) => ({
      id: Math.random().toString(),
      bahanId: item.bahanId,
      takaran: item.takaran.toString(),
      pembagi: (item.pembagi || 1).toString(),
      searchQuery: item.bahan?.nama || ""
    })) || []
  )

  const [komposisiPackage, setKomposisiPackage] = useState<KomposisiPackagingState[]>(
    initialData?.komposisiPackage?.map((item: any) => ({
      id: Math.random().toString(),
      packagingId: item.packagingId,
      jumlah: item.jumlah.toString(),
      pembagi: (item.pembagi || 1).toString(),
      searchQuery: item.packaging?.nama || ""
    })) || []
  )

  const filteredKategori = kategoriQuery === ""
    ? KATEGORI_OPTIONS
    : KATEGORI_OPTIONS.filter((k) => k.toLowerCase().includes(kategoriQuery.toLowerCase()))

  const exactMatch = KATEGORI_OPTIONS.find((k) => k.toLowerCase() === kategoriQuery.trim().toLowerCase())
  const showAddKategori = kategoriQuery.trim() !== "" && !exactMatch

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const minSize = Math.min(img.width, img.height)
        const startX = (img.width - minSize) / 2
        const startY = (img.height - minSize) / 2
        const MAX_SIZE = 500
        const finalSize = Math.min(minSize, MAX_SIZE)
        canvas.width = finalSize
        canvas.height = finalSize
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, startX, startY, minSize, minSize, 0, 0, finalSize, finalSize)
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
          setPreview(dataUrl)
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleHargaJualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (!value) {
      setHargaJual("")
      return
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value, 10))
    setHargaJual(formatted)
  }

  // Calculate totals
  const { totalHpp, labaKotor, marginKotor } = useMemo(() => {
    let hpp = 0

    komposisiBahan.forEach(item => {
      if (item.bahanId && item.takaran) {
        const bahan = bahanBakuList.find(b => b.id === item.bahanId)
        if (bahan) {
          const div = parseFloat(item.pembagi) || 1
          hpp += (bahan.harga * parseFloat(item.takaran)) / div
        }
      }
    })

    komposisiPackage.forEach(item => {
      if (item.packagingId && item.jumlah) {
        const pack = packagingList.find(p => p.id === item.packagingId)
        if (pack) {
          const div = parseFloat(item.pembagi) || 1
          hpp += (pack.harga * parseFloat(item.jumlah)) / div
        }
      }
    })

    const jual = parseInt(hargaJual.replace(/\./g, ""), 10) || 0
    const laba = jual - hpp
    const margin = jual > 0 ? (laba / jual) * 100 : 0

    return { totalHpp: Math.round(hpp), labaKotor: Math.round(laba), marginKotor: margin }
  }, [komposisiBahan, komposisiPackage, hargaJual, bahanBakuList, packagingList])

  async function actionSubmit(formData: FormData) {
    setIsPending(true)
    if (preview) {
      formData.set("foto", preview)
    }

    const cleanHarga = hargaJual.replace(/\./g, "")
    formData.set("hargaJual", cleanHarga)
    formData.set("kategori", kategoriQuery || "Minuman")

    // Filter out invalid items
    const validBahan = komposisiBahan.filter(b => b.bahanId && b.takaran)
    const validPackage = komposisiPackage.filter(p => p.packagingId && p.jumlah)

    formData.set("komposisiBahan", JSON.stringify(validBahan))
    formData.set("komposisiPackage", JSON.stringify(validPackage))

    try {
      if (initialData) {
        await db.transaction('rw', db.produk, db.produkKomposisiBahan, db.produkKomposisiPackaging, async () => {
          await db.produk.update(initialData.id, {
            nama: formData.get("nama") as string,
            kategori: formData.get("kategori") as string,
            hargaJual: parseInt(formData.get("hargaJual") as string, 10),
            foto: formData.get("foto") as string | null,
            updatedAt: new Date()
          })

          const oldBahan = await db.produkKomposisiBahan.where('produkId').equals(initialData.id).toArray()
          await db.produkKomposisiBahan.bulkDelete(oldBahan.map(b => b.id))

          const oldPack = await db.produkKomposisiPackaging.where('produkId').equals(initialData.id).toArray()
          await db.produkKomposisiPackaging.bulkDelete(oldPack.map(p => p.id))

          const newBahan = validBahan.map(b => ({
            id: Date.now().toString() + Math.random(),
            produkId: initialData.id,
            bahanId: b.bahanId,
            takaran: parseFloat(b.takaran),
            pembagi: parseFloat(b.pembagi) || 1
          }))
          if (newBahan.length > 0) await db.produkKomposisiBahan.bulkAdd(newBahan)

          const newPack = validPackage.map(p => ({
            id: Date.now().toString() + Math.random(),
            produkId: initialData.id,
            packagingId: p.packagingId,
            jumlah: parseFloat(p.jumlah),
            pembagi: parseFloat(p.pembagi) || 1
          }))
          if (newPack.length > 0) await db.produkKomposisiPackaging.bulkAdd(newPack)
        })
        toast.add({ title: "Produk berhasil diubah!", type: "success" })
      } else {
        await db.transaction('rw', db.produk, db.produkKomposisiBahan, db.produkKomposisiPackaging, async () => {
          const produkId = Date.now().toString()
          await db.produk.add({
            id: produkId,
            nama: formData.get("nama") as string,
            kategori: formData.get("kategori") as string,
            hargaJual: parseInt(formData.get("hargaJual") as string, 10),
            foto: formData.get("foto") as string | null,
            createdAt: new Date(),
            updatedAt: new Date()
          })

          const newBahan = validBahan.map(b => ({
            id: Date.now().toString() + Math.random(),
            produkId: produkId,
            bahanId: b.bahanId,
            takaran: parseFloat(b.takaran),
            pembagi: parseFloat(b.pembagi) || 1
          }))
          if (newBahan.length > 0) await db.produkKomposisiBahan.bulkAdd(newBahan)

          const newPack = validPackage.map(p => ({
            id: Date.now().toString() + Math.random(),
            produkId: produkId,
            packagingId: p.packagingId,
            jumlah: parseFloat(p.jumlah),
            pembagi: parseFloat(p.pembagi) || 1
          }))
          if (newPack.length > 0) await db.produkKomposisiPackaging.bulkAdd(newPack)
        })
        setPreview(null)
        setHargaJual("")
        setKategoriQuery("Minuman")
        setKomposisiBahan([])
        setKomposisiPackage([])
        toast.add({ title: "Produk berhasil ditambahkan!", type: "success" })
      }
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.add({ title: "Gagal menyimpan produk", type: "error" })
      setIsPending(false)
    }
  }

  return (
    <form action={actionSubmit} className="space-y-6">
      {/* 1. INFORMASI PRODUK */}
      <div className="space-y-4">

        <div className="flex flex-col items-start space-y-4">
          <Label htmlFor="foto" className="cursor-pointer">
            <div className="w-32 h-32 border-2 border-dashed flex items-center justify-center overflow-hidden hover:bg-muted/50 transition-colors">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground text-xs text-center p-2">
                  <span className="text-2xl mb-1">+</span>
                  <span>Upload Foto</span>
                </div>
              )}
            </div>
          </Label>
          <Input id="foto" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Produk</Label>
            <Input id="nama" name="nama" defaultValue={initialData?.nama} required placeholder="Contoh: Es Kopi Susu Aren" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Combobox onValueChange={(val) => val && setKategoriQuery(val as string)}>
              <ComboboxInput
                name="kategori"
                placeholder="Pilih atau ketik kategori..."
                value={kategoriQuery}
                onChange={(e) => setKategoriQuery(e.target.value)}
              />
              <ComboboxContent>
                <ComboboxList>
                  {filteredKategori.length === 0 && !showAddKategori ? (
                    <ComboboxEmpty>Kategori tidak ditemukan.</ComboboxEmpty>
                  ) : (
                    <>
                      {showAddKategori && (
                        <ComboboxItem key={kategoriQuery} value={kategoriQuery}>
                          + Tambah "{kategoriQuery}"
                        </ComboboxItem>
                      )}
                      {filteredKategori.map((kategori) => (
                        <ComboboxItem key={kategori} value={kategori}>{kategori}</ComboboxItem>
                      ))}
                    </>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hargaJual">Target Harga Jual</Label>
            <Input
              id="hargaJual"
              name="hargaJual"
              type="text"
              inputMode="numeric"
              required
              value={hargaJual}
              onChange={handleHargaJualChange}
              placeholder="Contoh: 25.000"
            />
          </div>
        </div>
      </div>

      {/* 2. KOMPOSISI BAHAN BAKU */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Komposisi Bahan Baku</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 px-2 sm:px-3"
            onClick={() => setKomposisiBahan([...komposisiBahan, { id: Math.random().toString(), bahanId: "", takaran: "", pembagi: "1", searchQuery: "" }])}
          >
            <PlusIcon className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Tambah Bahan Baku</span>
          </Button>
        </div>

        {komposisiBahan.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-muted-foreground border-2 border-dashed rounded-md">
            Belum ada bahan baku.<br></br>Klik tombol tambah untuk memasukkan resep.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:hidden pt-3">
              {komposisiBahan.map((item, index) => {
                const selectedBahan = bahanBakuList.find(b => b.id === item.bahanId)
                const div = parseFloat(item.pembagi) || 1
                const hppSubtotal = selectedBahan && item.takaran ? (selectedBahan.harga * parseFloat(item.takaran)) / div : 0

                return (
                  <div key={item.id} className="border rounded-md p-2.5 relative bg-background flex flex-col gap-2.5 shadow-sm">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 min-w-0">
                        <Combobox value={item.bahanId} onValueChange={(val) => {
                          if (!val) return
                          const newArr = [...komposisiBahan]
                          newArr[index].bahanId = val as string
                          const selected = bahanBakuList.find(b => b.id === val)
                          if (selected) newArr[index].searchQuery = selected.nama
                          setKomposisiBahan(newArr)
                        }}>
                          <ComboboxInput
                            className="w-full h-8 text-xs"
                            placeholder="Cari bahan..."
                            value={item.searchQuery}
                            onChange={(e) => {
                              const newArr = [...komposisiBahan]
                              newArr[index].searchQuery = e.target.value
                              setKomposisiBahan(newArr)
                            }}
                          />
                          <ComboboxContent>
                            <ComboboxList>
                              {bahanBakuList
                                .filter(b => b.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || b.id === item.bahanId)
                                .map((b) => (
                                  <ComboboxItem key={b.id} value={b.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">{b.nama}</span>
                                    </div>
                                  </ComboboxItem>
                                ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedBahan ? `Rp ${selectedBahan.harga.toLocaleString('id-ID')} / ${selectedBahan.satuan}` : "-"}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-primary hover:bg-primary hover:text-white h-8 w-8"
                        onClick={() => setKomposisiBahan(komposisiBahan.filter((_, i) => i !== index))}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground">Jumlah Dipakai</Label>
                        <div className="flex rounded-md shadow-sm">
                          <Input type="number" step="any" min="0" value={item.takaran} onChange={(e) => {
                            const newArr = [...komposisiBahan]; newArr[index].takaran = e.target.value; setKomposisiBahan(newArr);
                          }} className="h-8 text-xs rounded-r-none focus-visible:z-10" placeholder="0" />
                          <div className="inline-flex items-center justify-center px-2 min-w-8 rounded-r-md border border-l-0 border-input bg-muted/50 text-[10px] font-medium text-muted-foreground truncate">
                            {selectedBahan?.satuan || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground">Bisa Utk (Porsi)</Label>
                        <div className="flex rounded-md shadow-sm">
                          <Input type="number" step="any" min="1" value={item.pembagi} onChange={(e) => {
                            const newArr = [...komposisiBahan]; newArr[index].pembagi = e.target.value; setKomposisiBahan(newArr);
                          }} className="h-8 text-xs rounded-r-none focus-visible:z-10" placeholder="1" />
                          <div className="inline-flex items-center justify-center px-2 rounded-r-md border border-l-0 border-input bg-muted/50 text-[10px] font-medium text-muted-foreground">
                            Porsi
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2 mt-1">
                      <div className="text-[11px] text-muted-foreground">
                        HPP: <strong className="text-foreground">Rp {Math.round(hppSubtotal).toLocaleString('id-ID')}</strong>
                      </div>
                      <div className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground border">
                        {formatTakaranPerPorsi(item.takaran, item.pembagi, selectedBahan?.satuan || "")} / porsi
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden md:block border rounded-none bg-card overflow-x-auto">
              <Table className="[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                <TableHeader className="bg-muted text-foreground">
                  <TableRow>
                    <TableHead>Bahan Baku</TableHead>
                    <TableHead className="w-[150px]">Harga Satuan</TableHead>
                    <TableHead className="w-[130px] text-center">Jumlah Dipakai</TableHead>
                    <TableHead className="w-[150px] text-center">Bisa Untuk (Porsi/Pcs)</TableHead>
                    <TableHead className="w-[130px] text-center">Pemakaian / Porsi</TableHead>
                    <TableHead className="w-[150px]">HPP Subtotal</TableHead>
                    <TableHead className="w-[60px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {komposisiBahan.map((item, index) => {
                    const selectedBahan = bahanBakuList.find(b => b.id === item.bahanId)
                    const div = parseFloat(item.pembagi) || 1
                    const hppSubtotal = selectedBahan && item.takaran ? (selectedBahan.harga * parseFloat(item.takaran)) / div : 0

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Combobox value={item.bahanId} onValueChange={(val) => {
                            if (!val) return
                            const newArr = [...komposisiBahan]
                            newArr[index].bahanId = val as string
                            const selected = bahanBakuList.find(b => b.id === val)
                            if (selected) newArr[index].searchQuery = selected.nama
                            setKomposisiBahan(newArr)
                          }}>
                            <ComboboxInput
                              className="w-full rounded-none"
                              placeholder="Cari bahan..."
                              value={item.searchQuery}
                              onChange={(e) => {
                                const newArr = [...komposisiBahan]
                                newArr[index].searchQuery = e.target.value
                                setKomposisiBahan(newArr)
                              }}
                            />
                            <ComboboxContent>
                              <ComboboxList>
                                {bahanBakuList
                                  .filter(b => b.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || b.id === item.bahanId)
                                  .map((b) => (
                                    <ComboboxItem key={b.id} value={b.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{b.nama}</span>
                                      </div>
                                    </ComboboxItem>
                                  ))}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">Rp {selectedBahan ? selectedBahan.harga.toLocaleString('id-ID') : "0"}</span>
                            <span className="text-xs text-muted-foreground">/ {selectedBahan?.satuan || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-[4rem_1fr] items-center gap-2 w-[110px] mx-auto text-left">
                            <Input
                              className="rounded-none w-full px-2 text-center"
                              type="number"
                              step="any"
                              min="0"
                              value={item.takaran}
                              onChange={(e) => {
                                const newArr = [...komposisiBahan]
                                newArr[index].takaran = e.target.value
                                setKomposisiBahan(newArr)
                              }}
                              placeholder="0"
                            />
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis" title={selectedBahan?.satuan || "-"}>{selectedBahan?.satuan || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-[4rem_1fr] items-center gap-2 w-[110px] mx-auto text-left">
                            <Input
                              className="rounded-none w-full px-2 text-center"
                              type="number"
                              step="any"
                              min="1"
                              value={item.pembagi}
                              onChange={(e) => {
                                const newArr = [...komposisiBahan]
                                newArr[index].pembagi = e.target.value
                                setKomposisiBahan(newArr)
                              }}
                              placeholder="1"
                            />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap bg-muted px-2 py-1">Porsi</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            readOnly
                            className="rounded-none w-[110px] mx-auto px-2 text-center bg-muted/30 text-xs font-medium border-dashed focus-visible:ring-0"
                            value={formatTakaranPerPorsi(item.takaran, item.pembagi, selectedBahan?.satuan || "")}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-[1.5rem_1fr] items-center gap-1 w-full text-left">
                            <span className="text-muted-foreground text-xs font-medium text-right">Rp</span>
                            <Input
                              readOnly
                              className="rounded-none w-full px-2 text-left bg-muted/50 text-sm font-medium focus-visible:ring-0"
                              value={Math.round(hppSubtotal).toLocaleString('id-ID')}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="default"
                            size="icon"
                            className="h-9 w-9 rounded-none bg-primary hover:bg-primary/90 text-white"
                            onClick={() => {
                              setKomposisiBahan(komposisiBahan.filter((_, i) => i !== index))
                            }}
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
          </>
        )}
      </div>

      {/* 3. KOMPOSISI PACKAGING */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Komposisi Packaging</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 px-2 sm:px-3"
            onClick={() => setKomposisiPackage([...komposisiPackage, { id: Math.random().toString(), packagingId: "", jumlah: "", pembagi: "1", searchQuery: "" }])}
          >
            <PlusIcon className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Tambah Packaging</span>
          </Button>
        </div>

        {komposisiPackage.length === 0 ? (
          <div className="text-center py-4 text-[11px] text-muted-foreground border-2 border-dashed rounded-md">
            Belum ada packaging.<br></br>Klik tombol tambah jika produk membutuhkan kemasan.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 md:hidden pt-3">
              {komposisiPackage.map((item, index) => {
                const selectedPack = packagingList.find(p => p.id === item.packagingId)
                const div = parseFloat(item.pembagi) || 1
                const hppSubtotal = selectedPack && item.jumlah ? (selectedPack.harga * parseFloat(item.jumlah)) / div : 0

                return (
                  <div key={item.id} className="border rounded-md p-2.5 relative bg-background flex flex-col gap-2.5 shadow-sm">
                    <div className="flex gap-3 items-start">
                      <div className="flex-1 min-w-0">
                        <Combobox value={item.packagingId} onValueChange={(val) => {
                          if (!val) return
                          const newArr = [...komposisiPackage]
                          newArr[index].packagingId = val as string
                          const selected = packagingList.find(p => p.id === val)
                          if (selected) newArr[index].searchQuery = selected.nama
                          setKomposisiPackage(newArr)
                        }}>
                          <ComboboxInput
                            className="w-full h-8 text-xs"
                            placeholder="Cari kemasan..."
                            value={item.searchQuery}
                            onChange={(e) => {
                              const newArr = [...komposisiPackage]
                              newArr[index].searchQuery = e.target.value
                              setKomposisiPackage(newArr)
                            }}
                          />
                          <ComboboxContent>
                            <ComboboxList>
                              {packagingList
                                .filter(p => p.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || p.id === item.packagingId)
                                .map((p) => (
                                  <ComboboxItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">{p.nama}</span>
                                    </div>
                                  </ComboboxItem>
                                ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {selectedPack ? `Rp ${selectedPack.harga.toLocaleString('id-ID')} / ${selectedPack.satuan}` : "-"}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-primary hover:bg-primary hover:text-white h-8 w-8"
                        onClick={() => setKomposisiPackage(komposisiPackage.filter((_, i) => i !== index))}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground">Jumlah Dipakai</Label>
                        <div className="flex rounded-md shadow-sm">
                          <Input type="number" step="any" min="0" value={item.jumlah} onChange={(e) => {
                            const newArr = [...komposisiPackage]; newArr[index].jumlah = e.target.value; setKomposisiPackage(newArr);
                          }} className="h-8 text-xs rounded-r-none focus-visible:z-10" placeholder="0" />
                          <div className="inline-flex items-center justify-center px-2 min-w-8 rounded-r-md border border-l-0 border-input bg-muted/50 text-[10px] font-medium text-muted-foreground truncate">
                            {selectedPack?.satuan || "-"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground">Bisa Utk (Porsi)</Label>
                        <div className="flex rounded-md shadow-sm">
                          <Input type="number" step="any" min="1" value={item.pembagi} onChange={(e) => {
                            const newArr = [...komposisiPackage]; newArr[index].pembagi = e.target.value; setKomposisiPackage(newArr);
                          }} className="h-8 text-xs rounded-r-none focus-visible:z-10" placeholder="1" />
                          <div className="inline-flex items-center justify-center px-2 rounded-r-md border border-l-0 border-input bg-muted/50 text-[10px] font-medium text-muted-foreground">
                            Porsi
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t pt-2 mt-1">
                      <div className="text-[11px] text-muted-foreground">
                        HPP: <strong className="text-foreground">Rp {Math.round(hppSubtotal).toLocaleString('id-ID')}</strong>
                      </div>
                      <div className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground border">
                        {formatTakaranPerPorsi(item.jumlah, item.pembagi, selectedPack?.satuan || "")} / porsi
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden md:block border rounded-none bg-card overflow-x-auto">
              <Table className="[&_th]:border-r [&_td]:border-r [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0">
                <TableHeader className="bg-muted text-foreground">
                  <TableRow>
                    <TableHead>Packaging</TableHead>
                    <TableHead className="w-[150px]">Harga Satuan</TableHead>
                    <TableHead className="w-[130px] text-center">Jumlah Dipakai</TableHead>
                    <TableHead className="w-[150px] text-center">Bisa Untuk (Porsi/Pcs)</TableHead>
                    <TableHead className="w-[130px] text-center">Pemakaian / Porsi</TableHead>
                    <TableHead className="w-[150px]">HPP Subtotal</TableHead>
                    <TableHead className="w-[60px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {komposisiPackage.map((item, index) => {
                    const selectedPack = packagingList.find(p => p.id === item.packagingId)
                    const div = parseFloat(item.pembagi) || 1
                    const hppSubtotal = selectedPack && item.jumlah ? (selectedPack.harga * parseFloat(item.jumlah)) / div : 0

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Combobox value={item.packagingId} onValueChange={(val) => {
                            if (!val) return
                            const newArr = [...komposisiPackage]
                            newArr[index].packagingId = val as string
                            const selected = packagingList.find(p => p.id === val)
                            if (selected) newArr[index].searchQuery = selected.nama
                            setKomposisiPackage(newArr)
                          }}>
                            <ComboboxInput
                              className="w-full rounded-none"
                              placeholder="Cari kemasan..."
                              value={item.searchQuery}
                              onChange={(e) => {
                                const newArr = [...komposisiPackage]
                                newArr[index].searchQuery = e.target.value
                                setKomposisiPackage(newArr)
                              }}
                            />
                            <ComboboxContent>
                              <ComboboxList>
                                {packagingList
                                  .filter(p => p.nama.toLowerCase().includes(item.searchQuery.toLowerCase()) || p.id === item.packagingId)
                                  .map((p) => (
                                    <ComboboxItem key={p.id} value={p.id}>
                                      <div className="flex items-center gap-2">
                                        <span>{p.nama}</span>
                                      </div>
                                    </ComboboxItem>
                                  ))}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">Rp {selectedPack ? selectedPack.harga.toLocaleString('id-ID') : "0"}</span>
                            <span className="text-xs text-muted-foreground">/ {selectedPack?.satuan || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-[4rem_1fr] items-center gap-2 w-[110px] mx-auto text-left">
                            <Input
                              className="rounded-none w-full px-2 text-center"
                              type="number"
                              step="any"
                              min="0"
                              value={item.jumlah}
                              onChange={(e) => {
                                const newArr = [...komposisiPackage]
                                newArr[index].jumlah = e.target.value
                                setKomposisiPackage(newArr)
                              }}
                              placeholder="0"
                            />
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis" title={selectedPack?.satuan || "-"}>{selectedPack?.satuan || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-[4rem_1fr] items-center gap-2 w-[110px] mx-auto text-left">
                            <Input
                              className="rounded-none w-full px-2 text-center"
                              type="number"
                              step="any"
                              min="1"
                              value={item.pembagi}
                              onChange={(e) => {
                                const newArr = [...komposisiPackage]
                                newArr[index].pembagi = e.target.value
                                setKomposisiPackage(newArr)
                              }}
                              placeholder="1"
                            />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap bg-muted px-2 py-1">Porsi</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            readOnly
                            className="rounded-none w-[110px] mx-auto px-2 text-center bg-muted/30 text-xs font-medium border-dashed focus-visible:ring-0"
                            value={formatTakaranPerPorsi(item.jumlah, item.pembagi, selectedPack?.satuan || "")}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-[1.5rem_1fr] items-center gap-1 w-full text-left">
                            <span className="text-muted-foreground text-xs font-medium text-right">Rp</span>
                            <Input
                              readOnly
                              className="rounded-none w-full px-2 text-left bg-muted/50 text-sm font-medium focus-visible:ring-0"
                              value={Math.round(hppSubtotal).toLocaleString('id-ID')}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="default"
                            size="icon"
                            className="h-9 w-9 rounded-none bg-primary hover:bg-primary/90 text-white"
                            onClick={() => {
                              setKomposisiPackage(komposisiPackage.filter((_, i) => i !== index))
                            }}
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
          </>
        )}
      </div>

      {/* 4. FINANCIAL SUMMARY */}
      <div className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 border rounded-md bg-card space-y-1 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Total HPP</p>
            <p className="text-base md:text-lg font-bold">Rp {totalHpp.toLocaleString('id-ID')}</p>
          </div>
          <div className="p-3 border rounded-md bg-card space-y-1 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Target Jual</p>
            <p className="text-base md:text-lg font-bold text-primary">Rp {parseInt(hargaJual.replace(/\./g, "") || "0", 10).toLocaleString('id-ID')}</p>
          </div>
          <div className="p-3 border rounded-md bg-card space-y-1 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">Laba Kotor</p>
            <p className="text-base md:text-lg font-bold text-primary">
              Rp {labaKotor.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-3 border rounded-md bg-card space-y-1 shadow-sm relative">
            <p className="text-xs text-muted-foreground font-medium pr-10">Margin Kotor</p>
            {marginKotor > 0 && marginKotor < 40 && (
              <span className="absolute top-2.5 right-2.5 text-[8px] uppercase font-bold px-1.5 py-0.5 bg-primary text-white rounded">Low</span>
            )}
            {marginKotor >= 40 && (
              <span className="absolute top-2.5 right-2.5 text-[8px] uppercase font-bold px-1.5 py-0.5 bg-primary text-white rounded">Good</span>
            )}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <p className="text-base md:text-lg font-bold text-primary">
                {marginKotor.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : (initialData ? "Simpan Perubahan" : "Simpan Produk")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}

export function ProdukForm({
  existingKategori = [],
  bahanBakuList = [],
  packagingList = [],
  itemToEdit = null,
  onClearEdit = () => { }
}: {
  existingKategori?: string[],
  bahanBakuList: BahanBakuRef[],
  packagingList: PackagingRef[],
  itemToEdit?: any | null,
  onClearEdit?: () => void
}) {
  const [open, setOpen] = useState(false)

  const isOpen = open || !!itemToEdit

  return (
    <div className="w-full">
      {!isOpen && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)}>Tambah Produk</Button>
        </div>
      )}
      {isOpen && (
        <div className="border p-4 md:p-6 bg-card text-card-foreground">
          <div className="mb-4">
            <h2 className="text-base font-semibold">{itemToEdit ? "Edit Master Produk" : "Tambah Master Produk"}</h2>

          </div>
          <ProdukInnerForm
            key={itemToEdit?.id || 'new'}
            existingKategori={existingKategori}
            bahanBakuList={bahanBakuList}
            packagingList={packagingList}
            initialData={itemToEdit}
            onSuccess={() => {
              setOpen(false)
              onClearEdit()
            }}
            onCancel={() => {
              setOpen(false)
              onClearEdit()
            }}
          />
        </div>
      )}
    </div>
  )
}
