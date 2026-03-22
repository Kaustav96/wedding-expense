import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ─── Capture the event IMMEDIATELY at module load ───────────────────────────
// beforeinstallprompt fires early — before React even mounts.
// We grab it here at the top level so we never miss it.
let _deferredPrompt: BeforeInstallPromptEvent | null = null
let _listeners: Array<() => void> = []

const notifyListeners = () => _listeners.forEach(fn => fn())

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _deferredPrompt = e as BeforeInstallPromptEvent
  notifyListeners()
})

window.addEventListener('appinstalled', () => {
  _deferredPrompt = null
  notifyListeners()
})
// ─────────────────────────────────────────────────────────────────────────────

export function PWAInstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(_deferredPrompt)
  const [isIOS, setIsIOS] = useState(false)
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem('pwa-banner-dismissed')
  )
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  )

  useEffect(() => {
    // Subscribe to future prompt events (e.g. re-triggered after dismiss)
    const sync = () => {
      setInstallEvent(_deferredPrompt)
      if (!_deferredPrompt) setIsInstalled(true)
    }
    _listeners.push(sync)

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = navigator.userAgent
    const isIOSDevice =
      /iphone|ipad|ipod/i.test(ua) &&
      !(window as unknown as Record<string, unknown>)['MSStream'] &&
      !window.matchMedia('(display-mode: standalone)').matches
    setIsIOS(isIOSDevice)

    return () => {
      _listeners = _listeners.filter(fn => fn !== sync)
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      _deferredPrompt = null
    }
    setInstallEvent(null)
  }

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-banner-dismissed', '1')
  }

  if (isInstalled || dismissed) return null
  if (!installEvent && !isIOS) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
      <div className="mx-auto max-w-md rounded-2xl border border-purple-500/30 bg-gradient-to-r from-[#1a0533] to-[#2a0a1a] shadow-2xl shadow-purple-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3 p-4">
          {/* App Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-red-900 shadow-lg">
            <span className="text-xl">⚡</span>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Install BandBajaBudget</p>
            {isIOS ? (
              <p className="mt-0.5 text-xs leading-tight text-purple-300">
                Tap <span className="font-semibold">Share</span> →{' '}
                <span className="font-semibold">Add to Home Screen</span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs leading-tight text-purple-300">
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

        {/* iOS step-by-step bar */}
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
