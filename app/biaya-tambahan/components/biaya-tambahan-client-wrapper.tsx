"use client"

import { useState } from "react"
import { BiayaTambahanTable } from "./biaya-tambahan-table"
import { BiayaTambahanForm } from "./biaya-tambahan-form"
import { type BiayaTambahan } from "@/lib/db"

export function BiayaTambahanClientWrapper({ 
  initialData, 
  existingKategori,
}: { 
  initialData: BiayaTambahan[],
  existingKategori: string[],
}) {
  const [itemToEdit, setItemToEdit] = useState<BiayaTambahan | null>(null)

  return (
    <div className="space-y-4">
      <BiayaTambahanForm 
        existingKategori={existingKategori}
        itemToEdit={itemToEdit}
        onClearEdit={() => setItemToEdit(null)}
      />
      
      <BiayaTambahanTable 
        data={initialData} 
        onEdit={(item) => {
          setItemToEdit(item)
          window.scrollTo({ top: 0, behavior: "smooth" })
        }} 
      />
    </div>
  )
}
