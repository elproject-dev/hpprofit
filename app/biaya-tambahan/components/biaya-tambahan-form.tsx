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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/toast"
import { type BiayaTambahan } from "@/lib/db"

const DEFAULT_KATEGORI_OPTIONS = [
  "Pajak",
  "Layanan",
  "Komisi Platform",
  "Biaya Pembayaran",
]

const SIFAT_BIAYA_OPTIONS = [
  { value: "Charge", label: "Penambah Harga (Charge)" },
  { value: "Deduction", label: "Pemotong Margin (Deduction)" },
]

const TIPE_NILAI_OPTIONS = [
  { value: "Persentase", label: "Persentase (%)" },
  { value: "Nominal", label: "Nominal (Rp)" },
]

const TIPE_PESANAN_OPTIONS = [
  "Dine-in",
  "Takeaway",
  "GoFood",
  "GrabFood",
  "ShopeeFood",
]

const TIPE_PEMBAYARAN_OPTIONS = [
  "Semua",
  "Tunai",
  "EDC/Debit",
  "QRIS",
]

export function BiayaTambahanInnerForm({
  existingKategori = [],
  initialData = null,
  onSuccess = () => { },
  onCancel = () => { }
}: {
  existingKategori?: string[],
  initialData?: BiayaTambahan | null,
  onSuccess?: () => void,
  onCancel?: () => void
}) {
  const KATEGORI_OPTIONS = Array.from(new Set([...DEFAULT_KATEGORI_OPTIONS, ...existingKategori]))

  const [isPending, setIsPending] = useState(false)
  const [kategoriQuery, setKategoriQuery] = useState(initialData?.kategori || "")
  const [sifatBiaya, setSifatBiaya] = useState(initialData?.sifatBiaya || "Charge")
  const [tipeNilai, setTipeNilai] = useState(initialData?.tipeNilai || "Persentase")
  const [besaranNilai, setBesaranNilai] = useState(
    initialData ? (initialData.tipeNilai === "Nominal"
      ? new Intl.NumberFormat("id-ID").format(initialData.besaranNilai)
      : String(initialData.besaranNilai))
      : ""
  )
  const [tipePesanan, setTipePesanan] = useState<string[]>(
    initialData?.tipePesanan ? (() => {
      try { return JSON.parse(initialData.tipePesanan) } catch { return [] }
    })() : []
  )
  const [tipePembayaran, setTipePembayaran] = useState(initialData?.tipePembayaran || "Semua")
  const [status, setStatus] = useState(initialData?.status ?? true)


  const isKategoriExactMatch = KATEGORI_OPTIONS.some(k => k.toLowerCase() === kategoriQuery.toLowerCase())
  const filteredKategori = kategoriQuery === "" || isKategoriExactMatch
    ? KATEGORI_OPTIONS
    : KATEGORI_OPTIONS.filter((k) => k.toLowerCase().includes(kategoriQuery.toLowerCase()))

  const exactMatchKategori = KATEGORI_OPTIONS.find((k) => k.toLowerCase() === kategoriQuery.trim().toLowerCase())
  const showAddKategori = kategoriQuery.trim() !== "" && !exactMatchKategori

  const showTipePembayaran = kategoriQuery.toLowerCase() === "biaya pembayaran"



  const handleBesaranChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tipeNilai === "Nominal") {
      const value = e.target.value.replace(/\D/g, "")
      if (!value) {
        setBesaranNilai("")
        return
      }
      const formatted = new Intl.NumberFormat("id-ID").format(parseInt(value, 10))
      setBesaranNilai(formatted)
    } else {
      // Persentase: allow decimals
      const value = e.target.value.replace(/[^0-9.,]/g, "")
      setBesaranNilai(value)
    }
  }

  const handleTipeNilaiChange = (val: string) => {
    setTipeNilai(val)
    setBesaranNilai("") // Reset when type changes
  }

  const togglePesanan = (option: string) => {
    setTipePesanan(prev =>
      prev.includes(option)
        ? prev.filter(p => p !== option)
        : [...prev, option]
    )
  }

  async function actionSubmit(formData: FormData) {
    setIsPending(true)

    const cleanBesaran = tipeNilai === "Nominal"
      ? besaranNilai.replace(/\./g, "")
      : besaranNilai.replace(",", ".")

    formData.set("kategori", kategoriQuery || "Pajak")
    formData.set("sifatBiaya", sifatBiaya)
    formData.set("tipeNilai", tipeNilai)
    formData.set("besaranNilai", cleanBesaran)
    formData.set("tipePesanan", JSON.stringify(tipePesanan))
    formData.set("tipePembayaran", showTipePembayaran ? tipePembayaran : "Semua")
    formData.set("status", String(status))



    try {
      if (initialData) {
        await db.biayaTambahan.update(initialData.id, {
          nama: formData.get("nama") as string,
          kategori: (formData.get("kategori") as string) || "Pajak",

          sifatBiaya: formData.get("sifatBiaya") as string,
          tipeNilai: formData.get("tipeNilai") as string,
          besaranNilai: parseFloat(formData.get("besaranNilai") as string) || 0,
          tipePesanan: formData.get("tipePesanan") as string,
          tipePembayaran: formData.get("tipePembayaran") as string,
          status: formData.get("status") === "true",
          updatedAt: new Date()
        })
        toast.add({
          title: "Biaya tambahan berhasil diubah!",
          type: "success"
        })
      } else {
        await db.biayaTambahan.add({
          id: Date.now().toString(),
          nama: formData.get("nama") as string,
          kategori: (formData.get("kategori") as string) || "Pajak",

          sifatBiaya: formData.get("sifatBiaya") as string,
          tipeNilai: formData.get("tipeNilai") as string,
          besaranNilai: parseFloat(formData.get("besaranNilai") as string) || 0,
          tipePesanan: formData.get("tipePesanan") as string,
          tipePembayaran: formData.get("tipePembayaran") as string,
          status: formData.get("status") === "true",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        // Reset
        setKategoriQuery("")
        setSifatBiaya("Charge")
        setTipeNilai("Persentase")
        setBesaranNilai("")
        setTipePembayaran("Semua")
        setStatus(true)

        toast.add({
          title: "Biaya tambahan berhasil ditambahkan!",
          type: "success"
        })
      }
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.add({
        title: "Gagal menyimpan biaya tambahan",
        description: "Pastikan semua data telah diisi dengan benar.",
        type: "error"
      })
      setIsPending(false)
    }
  }

  return (
    <form action={actionSubmit} className="space-y-5">


      {/* Baris 1: Nama Biaya + Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Biaya</Label>
          <Input className="placeholder:text-primary/50" id="nama"
            name="nama"
            defaultValue={initialData?.nama}
            required
            placeholder="Contoh: Pajak PB1, Potongan GoFood"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kategori">Kategori Biaya</Label>
          <Combobox onValueChange={(val) => val && setKategoriQuery(val as string)}>
            <ComboboxInput className="[&_input::placeholder]:text-primary/50" name="kategori"
              placeholder="Pilih kategori..."
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
                        + Tambah &quot;{kategoriQuery}&quot;
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
      </div>

      {/* Baris 2: Tipe Nilai + Besaran Nilai */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div className="space-y-2">
          <Label>Tipe Nilai</Label>
          <Combobox onValueChange={(val) => val && handleTipeNilaiChange(val as string)}>
            <ComboboxInput className="[&_input::placeholder]:text-primary/50" placeholder="Pilih tipe nilai..."
              value={TIPE_NILAI_OPTIONS.find(o => o.value === tipeNilai)?.label || tipeNilai}
              readOnly
            />
            <ComboboxContent>
              <ComboboxList>
                {TIPE_NILAI_OPTIONS.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-2">
          <Label htmlFor="besaranNilai">
            Besaran Nilai {tipeNilai === "Persentase" ? "(%)" : "(Rp)"}
          </Label>
          <Input className="placeholder:text-primary/50" id="besaranNilai"
            type="text"
            inputMode="numeric"
            required
            value={besaranNilai}
            onChange={handleBesaranChange}
            placeholder={tipeNilai === "Persentase" ? "Contoh: 10" : "Contoh: 2.000"}
          />
        </div>
      </div>

      {/* Baris 3: Tipe Pembayaran (conditional) */}
      {showTipePembayaran && (
        <div className="grid gap-4 grid-cols-1">
          <div className="space-y-2">
            <Label>Terapkan pada Tipe Pembayaran</Label>
            <Combobox onValueChange={(val) => val && setTipePembayaran(val as string)}>
              <ComboboxInput className="[&_input::placeholder]:text-primary/50" placeholder="Pilih tipe pembayaran..."
                value={tipePembayaran}
                readOnly
              />
              <ComboboxContent>
                <ComboboxList>
                  {TIPE_PEMBAYARAN_OPTIONS.map((opt) => (
                    <ComboboxItem key={opt} value={opt}>
                      {opt}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      )}

      {/* Baris 4: Status + Buttons */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <Switch checked={status} onCheckedChange={setStatus} />
          <span className="text-sm font-medium">
            {status ? "Aktif" : "Non-Aktif"}
          </span>
        </label>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : (initialData ? "Simpan Perubahan" : "Simpan")}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </div>
    </form>
  )
}

export function BiayaTambahanForm({
  existingKategori = [],
  itemToEdit = null,
  onClearEdit = () => { }
}: {
  existingKategori?: string[],
  itemToEdit?: BiayaTambahan | null,
  onClearEdit?: () => void
}) {
  const [open, setOpen] = useState(false)

  // Force open if there is an item to edit
  const isOpen = open || !!itemToEdit

  return (
    <div className="w-full">
      {!isOpen && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setOpen(true)}>Tambah Biaya</Button>
        </div>
      )}
      {isOpen && (
        <div className="border p-6 bg-card text-card-foreground">
          <div className="mb-4">
            <h2 className="text-base font-semibold">{itemToEdit ? "Edit Biaya Tambahan" : "Tambah Biaya Tambahan"}</h2>

          </div>
          <BiayaTambahanInnerForm
            key={itemToEdit?.id || 'new'}
            existingKategori={existingKategori}
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
