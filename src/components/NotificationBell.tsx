import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import type { Notificacion } from '../firebase/services'
import { observarNotificaciones, marcarNotificacionLeida } from '../firebase/services'
import { useAuth } from '../context/AuthContext'
import { playOpenSound, playCloseSound, playClickSound } from '../utils/audio'

const ACTIVITY_LABEL: Record<string, string> = {
  deposicion: 'cagada',
  acto_sexual: 'culeada',
  meada: 'meada',
  gym: 'gym',
}

function textoNotificacion(n: Notificacion) {
  const actividad = ACTIVITY_LABEL[n.activityType] ?? n.activityType
  return n.type === 'reaction' ? (
    <p className="text-xs font-bold text-black dark:text-white">
      <span className="font-black">{n.actorName}</span> reacciono a tu{' '}
      <span className="font-black">{actividad}</span>
    </p>
  ) : (
    <p className="text-xs font-bold text-black dark:text-white">
      <span className="font-black">{n.actorName}</span> comento en tu{' '}
      <span className="font-black">{actividad}</span>
    </p>
  )
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    return observarNotificaciones(user.uid, setNotificaciones)
  }, [user])

  const noLeidas = notificaciones.filter((n) => !n.read).length

  const handleOpen = () => {
    playOpenSound()
    setOpen(true)
  }

  const handleClose = () => {
    playCloseSound()
    setOpen(false)
  }

  const handleClickNotificacion = async (n: Notificacion) => {
    playClickSound()
    if (!n.read && n.id) {
      marcarNotificacionLeida(n.id).catch(() => {})
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => (open ? handleClose() : handleOpen())}
        className="relative p-2 border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <Bell size={22} strokeWidth={2.5} />
        {noLeidas > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 border-2 border-black dark:border-white bg-red-500 text-white font-black text-[10px] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {noLeidas}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,1)]">
            <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black">
              <p className="text-xs font-black uppercase tracking-widest">
                Notificaciones
              </p>
              {noLeidas > 0 && (
                <span className="px-1.5 py-0.5 border-2 border-black bg-red-500 text-white font-black text-[10px]">
                  {noLeidas}
                </span>
              )}
            </div>

            {notificaciones.length === 0 ? (
              <p className="text-sm font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center py-8 px-4">
                No tienes notificaciones nuevas
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {notificaciones.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClickNotificacion(n)}
                    className="w-full flex items-start justify-between gap-2 p-4 border-b-4 border-black dark:border-white last:border-b-0 bg-white dark:bg-gray-800 hover:bg-yellow-400 dark:hover:bg-yellow-500 hover:text-black transition-colors text-left"
                  >
                    {textoNotificacion(n)}
                    {!n.read && (
                      <span className="mt-1 w-3 h-3 shrink-0 border-2 border-black bg-red-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
