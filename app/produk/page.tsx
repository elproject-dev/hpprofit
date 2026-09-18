"use client"

import { ProdukClientWrapper } from "./components/produk-client-wrapper"
import { AppLayout } from "@/components/app-layout"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ProdukPage() {
  const produkData = useLiveQuery(async () => {
    const produks = await db.produk.toArray()
    const result = []
    
    for (const produk of produks) {
      const komposisiBahan = await db.produkKomposisiBahan
        .where('produkId').equals(produk.id).toArray()
      
      const bahanWithDetails = await Promise.all(
        komposisiBahan.map(async (kb) => {
          const bahan = await db.bahanBaku.get(kb.bahanId)
          return { ...kb, bahan }
        })
      )
      
      const komposisiPackage = await db.produkKomposisiPackaging
        .where('produkId').equals(produk.id).toArray()
        
      const packageWithDetails = await Promise.all(
        komposisiPackage.map(async (kp) => {
          const packaging = await db.packaging.get(kp.packagingId)
          return { ...kp, packaging }
        })
      )
      
      result.push({
        ...produk,
        komposisiBahan: bahanWithDetails,
        komposisiPackage: packageWithDetails
      })
    }
    
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  })

  const bahanBakuData = useLiveQuery(() => db.bahanBaku.toArray())
  const packagingData = useLiveQuery(() => db.packaging.toArray())

  if (produkData === undefined || bahanBakuData === undefined || packagingData === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    )
  }

  const existingKategori = Array.from(new Set(produkData.map((p) => p.kategori).filter(Boolean)))

  const bahanBakuList = bahanBakuData.map(b => ({
    id: b.id,
    nama: b.nama,
    satuan: b.satuan,
    harga: b.harga
  }))

  const packagingList = packagingData.map(p => ({
    id: p.id,
    nama: p.nama,
    satuan: p.satuan,
    harga: p.harga
  }))

  return (
    <AppLayout>
      <div className="px-2 md:px-4 pt-4 pb-8 space-y-4">
        <ProdukClientWrapper 
          produkData={produkData} 
          existingKategori={existingKategori} 
          bahanBakuList={bahanBakuList}
          packagingList={packagingList}
        />
      </div>
    </AppLayout>
  )
}
