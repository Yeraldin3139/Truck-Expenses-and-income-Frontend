import React, { useEffect, useState } from 'react'
import { subscribeToLoading } from './api'

export default function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToLoading(setIsLoading)
    return unsubscribe
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="rounded-lg bg-white p-4 sm:p-6 shadow-2xl dark:bg-slate-800 w-full max-w-xs sm:max-w-sm">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <div className="h-10 w-10 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-200 text-center">
            Cargando...
          </p>
        </div>
      </div>
    </div>
  )
}
