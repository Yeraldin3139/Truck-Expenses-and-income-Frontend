import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Accept': 'application/json' }
})

// Interceptor de petición: marca inicio para medir duración
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() }
  return config
})

// Interceptor de respuesta: maneja errores y registra latencia
api.interceptors.response.use(
  (response) => {
    if (response.config?.metadata?.startTime) {
      const duration = Date.now() - response.config.metadata.startTime
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`) 
    }
    return response
  },
  (error) => {
    const mapped = mapAxiosError(error)
    console.error('[API Error]', mapped)
    return Promise.reject(mapped)
  }
)

function mapAxiosError(error) {
  if (error.code === 'ECONNABORTED') {
    return { type: 'timeout', message: 'La solicitud tardó demasiado tiempo.', status: null }
  }
  if (error.response) {
    const { status, data } = error.response
    return { type: 'http', status, message: data?.message || `Error HTTP ${status}`, data }
  }
  if (error.request) {
    return { type: 'network', status: null, message: 'Fallo de red o backend no disponible.' }
  }
  return { type: 'unknown', status: null, message: error.message || 'Error desconocido' }
}