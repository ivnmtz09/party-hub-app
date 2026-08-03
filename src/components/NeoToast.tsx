import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastItem {
  id: number
  message: string
  leaving: boolean
}

interface NeoToastContextValue {
  showToast: (message: string) => void
}

const NeoToastContext = createContext<NeoToastContextValue | null>(null)

export function NeoToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const showToast = useCallback((message: string) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, leaving: false }])
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      )
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, 3000)
  }, [])

  return (
    <NeoToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-red-500 border-4 border-black text-black font-black uppercase text-xs tracking-wider text-center px-5 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] max-w-[90vw] transition-all duration-300 ${
              toast.leaving
                ? 'opacity-0 translate-y-[-16px] scale-95'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </NeoToastContext.Provider>
  )
}

export function useNeoToast(): NeoToastContextValue {
  const ctx = useContext(NeoToastContext)
  if (!ctx) {
    throw new Error('useNeoToast debe usarse dentro de un NeoToastProvider')
  }
  return ctx
}