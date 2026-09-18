"use client"

import { TransaksiClientWrapper } from "./components/transaksi-client-wrapper"
import { AppLayout } from "@/components/app-layout"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function TransaksiProduksiPage() {
  const transaksiData = useLiveQuery(async () => {
    const trx = await db.transaksiProduksi.toArray()
    const result = []
    
    for (const t of trx) {
      let produk = undefined
      if (t.produkId) {
        produk = await db.produk.get(t.produkId)
        if (produk) {
          const kbListRaw = await db.produkKomposisiBahan.where('produkId').equals(produk.id!).toArray()
          const kbList = []
          for (const kb of kbListRaw) {
            const bahan = await db.bahanBaku.get(kb.bahanId)
            kbList.push({ ...kb, bahan })
          }
          (produk as any).komposisiBahan = kbList

          const kpListRaw = await db.produkKomposisiPackaging.where('produkId').equals(produk.id!).toArray()
          const kpList = []
          for (const kp of kpListRaw) {
            const packaging = await db.packaging.get(kp.packagingId)
            kpList.push({ ...kp, packaging })
          }
          (produk as any).komposisiPackage = kpList
        }
      }
      
      const trxBiaya = await db.transaksiProduksiBiaya.where('transaksiId').equals(t.id).toArray()
      const biayaTambahan = trxBiaya
      
      result.push({
        ...t,
        produk,
        biayaTambahan
      })
    }
    
    return result.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime())
  })

  const produkList = useLiveQuery(async () => {
    const produks = await db.produk.toArray()
    const result = []
    
    for (const p of produks) {
      const kbList = await db.produkKomposisiBahan.where('produkId').equals(p.id).toArray()
      let totalHpp = 0
      
      for (const kb of kbList) {
        const bahan = await db.bahanBaku.get(kb.bahanId)
        if (bahan) {
          const div = kb.pembagi || 1
          totalHpp += (kb.takaran * bahan.harga) / div
        }
      }
      
      const kpList = await db.produkKomposisiPackaging.where('produkId').equals(p.id).toArray()
      for (const kp of kpList) {
        const pack = await db.packaging.get(kp.packagingId)
        if (pack) {
          const div = kp.pembagi || 1
          totalHpp += (kp.jumlah * pack.harga) / div
        }
      }
      
      result.push({
        id: p.id,
        nama: p.nama,
        hppSatuan: totalHpp,
        hargaJual: p.hargaJual,
        foto: p.foto
      })
    }
    
    return result.sort((a, b) => a.nama.localeCompare(b.nama))
  })

  const biayaTambahanData = useLiveQuery(async () => {
    const bt = await db.biayaTambahan.toArray()
    return bt.filter(b => b.status).sort((a, b) => a.nama.localeCompare(b.nama))
  })

  if (transaksiData === undefined || produkList === undefined || biayaTambahanData === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="px-2 md:px-4 pt-4 pb-8 space-y-4">
        <TransaksiClientWrapper 
          transaksiData={transaksiData} 
          produkList={produkList}
          biayaTambahanData={biayaTambahanData}
        />
      </div>
    </AppLayout>
  )
}
