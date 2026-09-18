"use client"

import { PackagingClientWrapper } from "./components/packaging-client-wrapper"
import { AppLayout } from "@/components/app-layout"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function PackagingPage() {
  const data = useLiveQuery(() => db.packaging.toArray())

  if (data === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    )
  }

  const existingKategori = Array.from(new Set(data.map(d => d.kategori))).filter(Boolean)
  const existingSatuan = Array.from(new Set(data.map(d => d.satuan))).filter(Boolean)

  return (
    <AppLayout>
      <div className="px-2 md:px-4 pt-4 pb-8 space-y-4">
        <PackagingClientWrapper 
          data={data} 
          existingKategori={existingKategori} 
          existingSatuan={existingSatuan} 
        />
      </div>
    </AppLayout>
  )
}
