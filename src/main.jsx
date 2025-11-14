import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import ErrorBoundary from './ErrorBoundary.jsx'
import { reportWebVitals } from './vitals'

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

// Iniciar recolección de métricas de rendimiento
reportWebVitals()
