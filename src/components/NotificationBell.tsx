import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

/* ─── Icono de reaccion SVG ─── */
function ReaccionIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

/* ─── Icono de comentario SVG ─── */
function ComentarioIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

/* ─── Icono de flecha derecha para indicar navegacion ─── */
function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 opacity-40"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  )
}

function textoNotificacion(n: Notificacion) {
  const actividad = ACTIVITY_LABEL[n.activityType] ?? n.activityType
  return n.type === 'reaction' ? (
    <span className="text-xs font-bold text-black dark:text-white">
      <span className="font-black">{n.actorName}</span> reacciono a tu{' '}
      <span className="font-black">{actividad}</span>
    </span>
  ) : (
    <span className="text-xs font-bold text-black dark:text-white">
      <span className="font-black">{n.actorName}</span> comento en tu{' '}
      <span className="font-black">{actividad}</span>
    </span>
  )
}

export default function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
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

    /* Marcar como leida */
    if (!n.read && n.id) {
      marcarNotificacionLeida(n.id).catch(() => {})
    }

    setOpen(false)

    /* Navegar a la pagina de detalle */
    if (n.activityId) {
      /* source: 'tablero' para eventos, 'mural' para posts */
      const source = n.activityType ? 'tablero' : 'tablero'
      navigate(`/registro/${n.activityId}?source=${source}`)
    }
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
            {/* Encabezado */}
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

            {/* Lista */}
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
                    className={`
                      w-full flex items-center justify-between gap-3 p-4
                      border-b-4 border-black dark:border-white last:border-b-0
                      bg-white dark:bg-gray-800
                      hover:bg-yellow-100 dark:hover:bg-yellow-500/20
                      hover:translate-y-[1px]
                      transition-all
                      cursor-pointer
                      text-left
                      group
                      ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
                    `}
                  >
                    {/* Icono de tipo */}
                    <div className="shrink-0 w-7 h-7 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white">
                      {n.type === 'reaction' ? <ReaccionIcon /> : <ComentarioIcon />}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      {textoNotificacion(n)}
                    </div>

                    {/* Indicadores de estado */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!n.read && (
                        <span className="w-3 h-3 border-2 border-black bg-red-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" />
                      )}
                      <ArrowRightIcon />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Pie: hint de navegacion */}
            {notificaciones.length > 0 && (
              <div className="px-4 py-2 border-t-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center">
                  Haz clic para ver el registro
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
