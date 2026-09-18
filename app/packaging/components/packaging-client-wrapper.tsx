"use client"

import { useState } from "react"
import { PackagingTable } from "./packaging-table"
import { PackagingForm } from "./packaging-form"

export function PackagingClientWrapper({ 
  data, 
  existingKategori, 
  existingSatuan 
}: { 
  data: any[],
  existingKategori: string[],
  existingSatuan: string[]
}) {
  const [itemToEdit, setItemToEdit] = useState<any>(null)

  const handleEdit = (item: any) => {
    setItemToEdit(item)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearEdit = () => {
    setItemToEdit(null)
  }

  return (
    <div className="space-y-4">
      <PackagingForm 
        existingKategori={existingKategori}
        existingSatuan={existingSatuan}
        itemToEdit={itemToEdit}
        onClearEdit={handleClearEdit}
      />
      <PackagingTable 
        data={data}
        onEdit={handleEdit}
      />
    </div>
  )
}
