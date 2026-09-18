"use client"

import { useState } from "react"
import { TransaksiForm } from "./transaksi-form"
import { TransaksiTable } from "./transaksi-table"

export function TransaksiClientWrapper({ 
  transaksiData, 
  produkList,
  biayaTambahanData
}: { 
  transaksiData: any[],
  produkList: any[],
  biayaTambahanData: any[]
}) {
  const [itemToEdit, setItemToEdit] = useState<any | null>(null)

  return (
    <>
      <TransaksiForm 
        produkList={produkList} 
        biayaTambahanData={biayaTambahanData} 
        itemToEdit={itemToEdit}
        onClearEdit={() => setItemToEdit(null)}
      />
      <TransaksiTable 
        data={transaksiData} 
        onEdit={(item) => {
          setItemToEdit(item)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }} 
      />
    </>
  )
}
