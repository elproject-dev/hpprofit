"use client"

import { useState } from "react"
import { ProdukForm } from "./produk-form"
import { ProdukTable } from "./produk-table"

export function ProdukClientWrapper({ 
  produkData, 
  existingKategori, 
  bahanBakuList, 
  packagingList 
}: { 
  produkData: any[],
  existingKategori: string[],
  bahanBakuList: any[],
  packagingList: any[]
}) {
  const [itemToEdit, setItemToEdit] = useState<any>(null)

  return (
    <>
      <ProdukForm 
        existingKategori={existingKategori}
        bahanBakuList={bahanBakuList}
        packagingList={packagingList}
        itemToEdit={itemToEdit}
        onClearEdit={() => setItemToEdit(null)}
      />
      <ProdukTable 
        data={produkData} 
        onEdit={(item) => {
          setItemToEdit(item)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }} 
      />
    </>
  )
}
