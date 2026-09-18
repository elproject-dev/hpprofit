"use client"

import { useState } from "react"
import { BahanBakuForm } from "./bahan-baku-form"
import { BahanBakuTable } from "./bahan-baku-table"

export function BahanBakuClientWrapper({ 
  data, 
  existingKategori = [], 
  existingSatuan = [] 
}: { 
  data: any[],
  existingKategori?: string[],
  existingSatuan?: string[]
}) {
  const [itemToEdit, setItemToEdit] = useState<any>(null)

  return (
    <div className="space-y-4">
      <BahanBakuForm 
        existingKategori={existingKategori} 
        existingSatuan={existingSatuan}
        itemToEdit={itemToEdit}
        onClearEdit={() => setItemToEdit(null)}
      />
      <BahanBakuTable 
        data={data} 
        onEdit={(item) => {
          setItemToEdit(item)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }}
      />
    </div>
  )
}
