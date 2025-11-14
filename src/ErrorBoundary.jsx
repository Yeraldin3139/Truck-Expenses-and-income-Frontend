import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Registro simple; se puede enviar a backend si es necesario
    console.error('UI ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 m-4 rounded-md border bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
          <p className="font-semibold">Ha ocurrido un error en la interfaz.</p>
          <p className="text-sm">Intenta recargar la página o volver atrás.</p>
        </div>
      )
    }
    return this.props.children
  }
}