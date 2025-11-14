// Sincroniza localStorage con backend mediante fetch a /api/kv
export function installServerStorageSync(baseUrl = '/api') {
  const kvBase = `${baseUrl}/kv`
  const original = {
    getItem: window.localStorage.getItem.bind(window.localStorage),
    setItem: window.localStorage.setItem.bind(window.localStorage),
    removeItem: window.localStorage.removeItem.bind(window.localStorage),
  }

  const syncKeys = [
    'driverAuth', 'driverProfile', 'driverCars', 'driversList',
    'driverScheduleByPlaca', 'trips', 'activeTripId', 'clientAuth',
  ]
  const syncPrefixes = [
    'route:', 'live:', 'stops:', 'serviceRoute:', 'driverLedger:', 'tripTx:'
  ]

  const shouldSync = (key) => syncKeys.includes(key) || syncPrefixes.some(p => key.startsWith(p))

  // Cargar valores iniciales desde backend para claves conocidas
  const preload = async () => {
    try {
      // Cargar lista completa y filtrar por patrones
      const resp = await fetch(kvBase)
      if (!resp.ok) return
      const items = await resp.json()
      items.forEach(({ key, value }) => {
        if (shouldSync(key)) {
          try {
            original.setItem(key, value)
          } catch (_) {}
        }
      })
    } catch (_) {}
  }

  // Interceptar setItem/removeItem para sincronizar en backend
  window.localStorage.setItem = (key, value) => {
    const r = original.setItem(key, value)
    if (shouldSync(key)) {
      // Enviar tal cual como JSON (si no es JSON, envolver en JSON string)
      let body = value
      try { JSON.parse(value) } catch { body = JSON.stringify(value) }
      fetch(`${kvBase}/${encodeURIComponent(key)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body }).catch(() => {})
    }
    return r
  }
  window.localStorage.removeItem = (key) => {
    const r = original.removeItem(key)
    if (shouldSync(key)) {
      fetch(`${kvBase}/${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => {})
    }
    return r
  }

  // Exponer función para forzar recarga desde backend
  window.__serverStorageReload = preload
  preload()
}