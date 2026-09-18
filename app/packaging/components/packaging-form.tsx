"use client"

import { useState, useRef } from "react"
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

const DEFAULT_KATEGORI_OPTIONS = ["Kardus", "Plastik", "Mangkuk", "Gelas", "Sendok", "Paper Bag", "Lainnya"]
const DEFAULT_SATUAN_OPTIONS = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "pack", label: "Pack" },
  { value: "lusin", label: "Lusin" },
  { value: "box", label: "Box" },
  { value: "roll", label: "Roll" }
]

const DEFAULT_SATUAN_DASAR_OPTIONS = [
  { value: "bungkus", label: "Bungkus" },
  { value: "box", label: "Box" },
  { value: "lusin", label: "Lusin" },
  { value: "ikat", label: "Ikat" },
  { value: "karung", label: "Karung" },
  { value: "botol", label: "Botol" },
  { value: "kaleng", label: "Kaleng" },
  { value: "pcs", label: "Pieces (pcs)" }
]

export function PackagingInnerForm({
  existingKategori = [],
  existingSatuan = [],
  initialData = null,
  onSuccess = () => { },
  onCancel = () => { }
}: {
  existingKategori?: string[],
  existingSatuan?: string[],
  initialData?: any,
  onSuccess?: () => void,
  onCancel?: () => void
}) {
  const KATEGORI_OPTIONS = Array.from(new Set([...existingKategori, ...DEFAULT_KATEGORI_OPTIONS]))

  const SATUAN_OPTIONS: { value: string, label: string }[] = []

  existingSatuan.forEach(satuan => {
    const defaultItem = DEFAULT_SATUAN_OPTIONS.find(s => s.value.toLowerCase() === satuan.toLowerCase())
    if (defaultItem) {
      SATUAN_OPTIONS.push(defaultItem)
    } else {
      SATUAN_OPTIONS.push({ value: satuan, label: satuan })
    }
  })

  DEFAULT_SATUAN_OPTIONS.forEach(s => {
    if (!SATUAN_OPTIONS.find(item => item.value === s.value)) {
      SATUAN_OPTIONS.push(s)
    }
  })


  const [isPending, setIsPending] = useState(false)
  const [harga, setHarga] = useState(initialData ? new Intl.NumberFormat("id-ID").format(Math.round(initialData.harga)) : "")
  const initialHargaTotal = initialData ? (() => {
    const total = Math.round(initialData.harga * (initialData.konversi || 1))
    return total > 0 ? new Intl.NumberFormat("id-ID").format(total) : ""
  })() : ""
  const [hargaTotal, setHargaTotal] = useState(initialHargaTotal)
  const [konversi, setKonversi] = useState(initialData ? new Intl.NumberFormat("id-ID").format(initialData.konversi) : "1")
  const [kategoriQuery, setKategoriQuery] = useState(initialData?.kategori || "")
  const [satuanQuery, setSatuanQuery] = useState(initialData?.satuan || "")
  const [satuanDasar, setSatuanDasar] = useState((initialData?.satuanDasar === "pcs" ? "" : initialData?.satuanDasar) || "")

  const exactHargaRef = useRef<number | null>(initialData?.harga || null)

  // Calculate harga satuan: Harga Total / Konversi
  const calcHargaSatuan = (total: number, jml: number): number | null => {
    if (total > 0 && jml > 0) {
      const exact = total / jml
      exactHargaRef.current = exact
      return Math.round(exact)
    }
    return null
  }

  // Auto-calculate Harga Satuan preview label
  const hargaSatuanKalkulasi = (() => {
    const total = parseInt(hargaTotal.replace(/\./g, ""), 10)
    const jml = parseInt(konversi.replace(/\./g, ""), 10)
    const result = calcHargaSatuan(total, jml)
    return result ? new Intl.NumberFormat("id-ID").format(result) : null
  })()

  const filteredKategori = kategoriQuery === ""
    ? KATEGORI_OPTIONS
    : KATEGORI_OPTIONS.filter((k) => k.toLowerCase().includes(kategoriQuery.toLowerCase()))

  const exactMatch = KATEGORI_OPTIONS.find((k) => k.toLowerCase() === kategoriQuery.trim().toLowerCase())
  const showAddKategori = kategoriQuery.trim() !== "" && !exactMatch

  const filteredSatuan = satuanQuery === ""
    ? SATUAN_OPTIONS
    : SATUAN_OPTIONS.filter((s) => s.label.toLowerCase().includes(satuanQuery.toLowerCase()) || s.value.toLowerCase().includes(satuanQuery.toLowerCase()))

  const exactMatchSatuan = SATUAN_OPTIONS.find((s) => s.value.toLowerCase() === satuanQuery.trim().toLowerCase() || s.label.toLowerCase() === satuanQuery.trim().toLowerCase())
  const showAddSatuan = satuanQuery.trim() !== "" && !exactMatchSatuan

  const filteredSatuanDasar = satuanDasar === ""
    ? DEFAULT_SATUAN_DASAR_OPTIONS
    : DEFAULT_SATUAN_DASAR_OPTIONS.filter((s) => s.label.toLowerCase().includes(satuanDasar.toLowerCase()) || s.value.toLowerCase().includes(satuanDasar.toLowerCase()))

  const exactMatchSatuanDasar = DEFAULT_SATUAN_DASAR_OPTIONS.find((s) => s.value.toLowerCase() === satuanDasar.trim().toLowerCase() || s.label.toLowerCase() === satuanDasar.trim().toLowerCase())
  const showAddSatuanDasar = satuanDasar.trim() !== "" && !exactMatchSatuanDasar



  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (!value) {
      setHarga("")
      exactHargaRef.current = null
      return
    }
    const intVal = parseInt(value, 10)
    exactHargaRef.current = intVal
    const formatted = new Intl.NumberFormat("id-ID").format(intVal)
    setHarga(formatted)
  }

  const handleKonversiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (!value) {
      setKonversi("")
      return
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value, 10))
    setKonversi(formatted)
    // Recalculate harga satuan from total if hargaTotal is set
    const total = parseInt(hargaTotal.replace(/\./g, ""), 10)
    const jml = parseInt(value, 10)
    const result = calcHargaSatuan(total, jml)
    if (result) setHarga(new Intl.NumberFormat("id-ID").format(result))
  }

  const handleHargaTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (!value) {
      setHargaTotal("")
      return
    }
    const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value, 10))
    setHargaTotal(formatted)
    // Auto-calculate harga satuan
    const jml = parseInt(konversi.replace(/\./g, ""), 10)
    const result = calcHargaSatuan(parseInt(value, 10), jml)
    if (result) setHarga(new Intl.NumberFormat("id-ID").format(result))
  }

  async function actionSubmit(formData: FormData) {
    setIsPending(true)

    const finalHarga = exactHargaRef.current ?? (parseFloat(harga.replace(/\./g, "")) || 0)
    formData.set("harga", finalHarga.toString())

    const cleanKonversi = konversi.replace(/\./g, "")
    formData.set("konversi", cleanKonversi)

    const finalKategori = formData.get("kategori") || kategoriQuery
    const finalSatuan = formData.get("satuan") || satuanQuery

    if (finalKategori) {
      formData.set("kategori", finalKategori.toString())
    } else {
      formData.set("kategori", "Lainnya")
    }

    if (finalSatuan) {
      formData.set("satuan", finalSatuan.toString())
    } else {
      formData.set("satuan", "pcs")
    }

    try {
      if (initialData) {
        await db.packaging.update(initialData.id, {
          nama: formData.get("nama") as string,
          kategori: finalKategori.toString(),

          harga: finalHarga,
          satuan: finalSatuan.toString(),
          konversi: parseInt(cleanKonversi, 10),
          satuanDasar: satuanDasar.trim() || null,
          updatedAt: new Date()
        })
        toast.add({
          title: "Packaging berhasil diubah!",
          type: "success"
        })
      } else {
        await db.packaging.add({
          id: Date.now().toString(),
          nama: formData.get("nama") as string,
          kategori: finalKategori.toString(),

          harga: finalHarga,
          satuan: finalSatuan.toString(),
          konversi: parseInt(cleanKonversi, 10),
          satuanDasar: satuanDasar.trim() || null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        // Reset only if adding new

        setHarga("")
        setHargaTotal("")
        setKonversi("1")
        setKategoriQuery("")
        setSatuanQuery("")
        setSatuanDasar("")
        toast.add({
          title: "Packaging berhasil ditambahkan!",
          type: "success"
        })
      }
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.add({
        title: "Gagal menyimpan packaging",
        description: "Pastikan semua data telah diisi dengan benar.",
        type: "error"
      })
      setIsPending(false)
    }
  }

  return (
    <form action={actionSubmit} className="space-y-4">


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center min-h-[20px]">
            <Label htmlFor="nama">Nama Packaging</Label>
          </div>
          <Input id="nama" name="nama" defaultValue={initialData?.nama} placeholder="Masukkan nama packaging" required />
        </div>

        <div className="space-y-2">
          <div className="flex items-center min-h-[20px]">
            <Label htmlFor="kategori">Kategori</Label>
          </div>
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
          <div className="flex items-center min-h-[20px]">
            <Label htmlFor="satuanDasar">Nama Satuan <span className="text-muted-foreground font-normal">(opsional)</span></Label>
          </div>
          <Combobox onValueChange={(val) => val && setSatuanDasar(val as string)}>
            <ComboboxInput
              name="satuanDasar"
              placeholder="Contoh: bungkus, box, lusin, ikat"
              value={satuanDasar}
              onChange={(e) => setSatuanDasar(e.target.value)}
            />
            <ComboboxContent>
              <ComboboxList>
                {filteredSatuanDasar.length === 0 && !showAddSatuanDasar ? (
                  <ComboboxEmpty>Satuan tidak ditemukan.</ComboboxEmpty>
                ) : (
                  <>
                    {showAddSatuanDasar && (
                      <ComboboxItem key={satuanDasar} value={satuanDasar}>
                        + Tambah "{satuanDasar}"
                      </ComboboxItem>
                    )}
                    {filteredSatuanDasar.map((s) => (
                      <ComboboxItem key={s.value} value={s.value}>{s.label}</ComboboxItem>
                    ))}
                  </>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-2">
          <div className="flex items-center min-h-[20px]">
            <Label htmlFor="konversi">Jumlah Satuan - isi</Label>
          </div>
          <Input
            type="text"
            inputMode="numeric"
            name="konversi"
            id="konversi"
            value={konversi}
            onChange={handleKonversiChange}
            required
            placeholder="Contoh: 1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center min-h-[20px]">
            <Label htmlFor="satuan">Jenis Satuan</Label>
          </div>
          <Combobox onValueChange={(val) => val && setSatuanQuery(val as string)}>
            <ComboboxInput
              name="satuan"
              placeholder="Pilih atau ketik satuan..."
              value={satuanQuery}
              onChange={(e) => setSatuanQuery(e.target.value)}
            />
            <ComboboxContent>
              <ComboboxList>
                {filteredSatuan.length === 0 && !showAddSatuan ? (
                  <ComboboxEmpty>Satuan tidak ditemukan.</ComboboxEmpty>
                ) : (
                  <>
                    {showAddSatuan && (
                      <ComboboxItem key={satuanQuery} value={satuanQuery}>
                        + Tambah "{satuanQuery}"
                      </ComboboxItem>
                    )}
                    {filteredSatuan.map((satuan) => (
                      <ComboboxItem key={satuan.value} value={satuan.value}>{satuan.label}</ComboboxItem>
                    ))}
                  </>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-2">
          <div className="flex items-center min-h-[20px]">
            <Label htmlFor="hargaTotal">Harga Total Pembelian</Label>
          </div>
          <Input
            id="hargaTotal"
            name="hargaTotal"
            type="text"
            inputMode="numeric"
            value={hargaTotal}
            onChange={handleHargaTotalChange}
            placeholder="Masukkan total harga pembelian"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between min-h-[20px]">
            <Label htmlFor="harga">Harga Satuan</Label>
            {hargaSatuanKalkulasi && (
              <span className="text-xs text-muted-foreground">
                = Rp {hargaSatuanKalkulasi} / {satuanQuery || "satuan"}
              </span>
            )}
          </div>
          <Input
            id="harga"
            name="harga"
            type="text"
            inputMode="numeric"
            required
            value={harga}
            readOnly
            disabled={!!hargaTotal}
            onChange={handleHargaChange}
            placeholder="0"
            className={hargaTotal ? "bg-muted cursor-not-allowed" : ""}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : (initialData ? "Simpan Perubahan" : "Simpan")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </form>
  )
}

export function PackagingForm({
  existingKategori = [],
  existingSatuan = [],
  itemToEdit = null,
  onClearEdit = () => { }
}: {
  existingKategori?: string[],
  existingSatuan?: string[],
  itemToEdit?: any,
  onClearEdit?: () => void
}) {
  const [open, setOpen] = useState(false)

  // Force open if there is an item to edit
  const isOpen = open || !!itemToEdit

  return (
    <div className="w-full">
      {!isOpen && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)}>Tambah Packaging</Button>
        </div>
      )}
      {isOpen && (
        <div className="border p-4 md:p-6 bg-card text-card-foreground">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{itemToEdit ? "Edit Packaging" : "Tambah Packaging"}</h2>
          </div>
          {/* Important: use key={itemToEdit?.id || 'new'} to force remount when switching items */}
          <PackagingInnerForm
            key={itemToEdit?.id || 'new'}
            existingKategori={existingKategori}
            existingSatuan={existingSatuan}
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
