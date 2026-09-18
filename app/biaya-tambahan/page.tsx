"use client"

import { BiayaTambahanClientWrapper } from "./components/biaya-tambahan-client-wrapper"
import { AppLayout } from "@/components/app-layout"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/lib/db"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function BiayaTambahanPage() {
  const biayaTambahan = useLiveQuery(() => db.biayaTambahan.toArray())

  if (biayaTambahan === undefined) {
    return (
      <AppLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </AppLayout>
    )
  }

  const existingKategori = Array.from(new Set(biayaTambahan.map(b => b.kategori)))

  return (
    <AppLayout>
      <div className="px-2 md:px-4 pt-4 pb-8 space-y-4">
        <BiayaTambahanClientWrapper
          initialData={biayaTambahan}
          existingKategori={existingKategori}
        />
      </div>
    </AppLayout>
  )
}
