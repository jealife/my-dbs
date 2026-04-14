'use client'

import { Component } from 'react'

/**
 * Capture les erreurs React non gérées et affiche un écran de secours
 * au lieu de planter toute l'application.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // En développement, afficher les détails ; en production, logger discrètement
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorBoundary]', error, info.componentStack)
    } else {
      console.error('[ErrorBoundary]', error.message)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-2xl flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Une erreur inattendue s&apos;est produite
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                L&apos;application a rencontré un problème. Rechargez la page pour continuer.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="mt-4 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-left text-[10px] text-red-700 dark:text-red-400 overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
