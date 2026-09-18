'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center p-4">
      <h2 className="text-xl font-bold text-red-600">Terjadi Kesalahan (Client Error)</h2>
      <p className="text-sm text-gray-600 break-all">{error.message}</p>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={() => reset()}
      >
        Coba Lagi
      </button>
    </div>
  )
}
