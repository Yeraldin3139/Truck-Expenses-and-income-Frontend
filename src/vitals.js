import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals'

function saveMetric(metric) {
  try {
    const key = 'web-vitals'
    const current = JSON.parse(localStorage.getItem(key) || '[]')
    current.push({ name: metric.name, value: metric.value, id: metric.id, rating: metric.rating, ts: Date.now() })
    localStorage.setItem(key, JSON.stringify(current))
  } catch (e) {
    // Si localStorage falla, ignorar
  }
  console.log(`[Vitals] ${metric.name}:`, metric.value, metric)
}

export function reportWebVitals() {
  onCLS(saveMetric)
  onFCP(saveMetric)
  onFID(saveMetric)
  onLCP(saveMetric)
  onTTFB(saveMetric)
}