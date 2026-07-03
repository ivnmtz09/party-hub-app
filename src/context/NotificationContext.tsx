import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Evento } from '../firebase/services'

interface Toast {
  id: string
  message: string
  type: 'deposicion' | 'acto_sexual' | 'gym'
  leaving: boolean
}

interface NotificationContextValue {
  setActiveGroupId: (id: string | null) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

const TOAST_COLORS = {
  deposicion: 'bg-yellow-300 dark:bg-yellow-400',
  acto_sexual: 'bg-green-400 dark:bg-green-500',
  gym: 'bg-blue-400 dark:bg-blue-500',
} as const

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const memberCache = useRef<Record<string, string>>({})
  const lastEventId = useRef<string | null>(null)

  useEffect(() => {
    if (!activeGroupId) return

    const eventosRef = collection(db, 'grupos', activeGroupId, 'eventos')
    const q = query(eventosRef, orderBy('timestamp', 'desc'), limit(1))

    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type !== 'added') return
        if (change.doc.id === lastEventId.current) return
        lastEventId.current = change.doc.id

        const data = change.doc.data() as Evento
        const now = Timestamp.now()
        const diff = now.seconds - data.timestamp.seconds
        if (diff > 5) return

        let displayName = memberCache.current[data.userId]
        if (!displayName) {
          const miembroSnap = await getDoc(
            doc(db, 'grupos', activeGroupId, 'miembros', data.userId),
          )
          if (miembroSnap.exists()) {
            const m = miembroSnap.data() as { displayName: string; nickname?: string }
            displayName = (m.nickname || m.displayName.split(' ')[0]) ?? 'Alguien'
            memberCache.current[data.userId] = displayName
          } else {
            displayName = 'Alguien'
          }
        }

        const label = data.tipo === 'deposicion' ? 'UNA CAGADA' : data.tipo === 'acto_sexual' ? 'UNA CULEADA' : 'UN GYM'
        const toastId = change.doc.id
        const newToast: Toast = {
          id: toastId,
          message: displayName.toUpperCase() + ' REGISTRO ' + label + '!',
          type: data.tipo,
          leaving: false,
        }

        setToasts((prev) => [...prev, newToast])

        setTimeout(() => {
          setToasts((prev) =>
            prev.map((t) =>
              t.id === toastId ? { ...t, leaving: true } : t,
            ),
          )
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toastId))
          }, 300)
        }, 3000)
      })
    })

    return unsub
  }, [activeGroupId])

  const handleSetActiveGroupId = useCallback((id: string | null) => {
    setActiveGroupId(id)
    memberCache.current = {}
    lastEventId.current = null
  }, [])

  return (
    <NotificationContext.Provider
      value={{ setActiveGroupId: handleSetActiveGroupId }}
    >
      {children}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${TOAST_COLORS[toast.type]} text-black border-[3px] border-black px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-xs tracking-wider whitespace-nowrap transition-all duration-300 ${
              toast.leaving
                ? 'opacity-0 translate-y-[-16px] scale-95'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error(
      'useNotification debe usarse dentro de un NotificationProvider',
    )
  }
  return ctx
}
