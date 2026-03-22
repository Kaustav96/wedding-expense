import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export function PWAInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if user already dismissed this session
    if (sessionStorage.getItem('pwa-banner-dismissed')) {
      setDismissed(true)
      return
    }

    // Detect iOS (Safari doesn't fire beforeinstallprompt)
    const isIOSDevice = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream
    setIsIOS(isIOSDevice)

    // Chrome / Android — capture the install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Hide banner if installed after prompt
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setInstallEvent(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-banner-dismissed', '1')
  }

  // Don't show if: installed, dismissed, or no trigger available
  if (isInstalled || dismissed) return null
  if (!installEvent && !isIOS) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 safe-area-inset-bottom">
      <div className="mx-auto max-w-md rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#1a0533] to-[#2a0a1a] shadow-2xl shadow-purple-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3 p-4">
          {/* App Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-red-900 shadow-lg">
            <span className="text-xl">⚡</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Install BandBajaBudget</p>
            {isIOS ? (
              <p className="text-xs text-purple-300 leading-tight mt-0.5">
                Tap <span className="font-semibold">Share</span> →{' '}
                <span className="font-semibold">Add to Home Screen</span>
              </p>
            ) : (
              <p className="text-xs text-purple-300 leading-tight mt-0.5">
                Add to your home screen — works offline too
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex shrink-0 items-center gap-2">
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:bg-purple-500 active:scale-95"
              >
                Install
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-full text-purple-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>

        {/* iOS instruction bar */}
        {isIOS && (
          <div className="border-t border-purple-500/20 px-4 pb-3 pt-2">
            <div className="flex items-center justify-center gap-4 text-xs text-purple-400">
              <span className="flex items-center gap-1">
                <span className="text-base">⬆️</span> Tap Share
              </span>
              <span className="text-purple-600">→</span>
              <span className="flex items-center gap-1">
                <span className="text-base">➕</span> Add to Home Screen
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

