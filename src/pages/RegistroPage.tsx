import React, { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { Trash2, Flame, Dumbbell, Droplet, Star, Heart, MessageSquare } from 'lucide-react'
import { db } from '../firebase/config'
import type { Evento, CommentData } from '../firebase/services'
import {
  subscribeToComments,
  toggleReaction,
  addComment,
  type ReactionType,
} from '../firebase/services'
import { useAuth } from '../context/AuthContext'
import { playReactionSound, playCommentSendSound, playClickSound } from '../utils/audio'

/* ─── Tipos de actividad ─── */

const TIPO_CONFIG: Record<
  string,
  { label: string; badgeColor: string; iconColor: string }
> = {
  deposicion: { label: 'CAGADA', badgeColor: 'bg-orange-400', iconColor: 'text-orange-500' },
  acto_sexual: { label: 'CULEADA', badgeColor: 'bg-pink-400', iconColor: 'text-pink-500' },
  meada: { label: 'MEADA', badgeColor: 'bg-yellow-400', iconColor: 'text-yellow-500' },
  gym: { label: 'GYM', badgeColor: 'bg-cyan-400', iconColor: 'text-cyan-500' },
}

const REACTION_CONFIG: Record<ReactionType, { label: string; activeBg: string }> = {
  heart: { label: 'Corazon', activeBg: 'bg-red-500' },
  flame: { label: 'Fuego', activeBg: 'bg-orange-500' },
  smile: { label: 'Sonrisa', activeBg: 'bg-yellow-200' },
  skull: { label: 'Calavera', activeBg: 'bg-gray-400' },
  frown: { label: 'Triste', activeBg: 'bg-blue-400' },
}

const REACTION_TYPES: ReactionType[] = ['heart', 'flame', 'smile', 'skull', 'frown']

/* ─── Iconos SVG locales ─── */

function ArrowLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function SendIcon() {
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
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22 11 13 2 9l20-7z" />
    </svg>
  )
}

/* ─── Helper: tiempo relativo ─── */

function tiempoRelativo(ts: unknown): string {
  if (!ts) return ''
  let ms = 0
  const t = ts as { toMillis?: () => number; seconds?: number }
  if (typeof t.toMillis === 'function') {
    ms = t.toMillis()
  } else if (typeof t.seconds === 'number') {
    ms = t.seconds * 1000
  } else {
    const d = new Date(ts as string)
    ms = isNaN(d.getTime()) ? 0 : d.getTime()
  }
  if (!ms) return ''
  const segundos = Math.floor((Date.now() - ms) / 1000)
  if (segundos < 60) return 'ahora'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos}min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias}d`
  return `hace ${Math.floor(dias / 30)}mes`
}

/* ─── Render de estrellas ─── */

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={20}
          strokeWidth={2.5}
          className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
        />
      ))}
    </div>
  )
}

/* ─── Icono de tipo de actividad ─── */

function TipoIcon({ tipo }: { tipo: string }) {
  if (tipo === 'deposicion')
    return <Trash2 size={22} strokeWidth={2.5} className="text-orange-500" />
  if (tipo === 'acto_sexual')
    return <Flame size={22} strokeWidth={2.5} className="text-pink-500" />
  if (tipo === 'meada')
    return <Droplet size={22} strokeWidth={2.5} className="text-yellow-400" />
  return <Dumbbell size={22} strokeWidth={2.5} className="text-cyan-500" />
}

/* ─── Iconos de reaccion SVG ─── */

function ReactionIconSVG({ type }: { type: ReactionType }) {
  const icons: Record<ReactionType, React.ReactElement> = {
    heart: (
      <Heart size={14} strokeWidth={2.5} />
    ),
    flame: (
      <Flame size={14} strokeWidth={2.5} />
    ),
    smile: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 13s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    skull: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.12 7.59L16 21H8l-.88-2.41C4.65 16.97 3 14.18 3 11a9 9 0 0 1 9-9z" />
        <line x1="9" y1="12" x2="9.01" y2="12" />
        <line x1="15" y1="12" x2="15.01" y2="12" />
        <path d="M10 17v2" />
        <path d="M14 17v2" />
      </svg>
    ),
    frown: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  }
  return icons[type]
}

/* ─── Página principal ─── */

export default function RegistroPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()

  /* source: de query params */
  const source = new URLSearchParams(location.search).get('source') ?? 'tablero'

  const [estado, setEstado] = useState<'cargando' | 'ok' | 'no-existe'>('cargando')
  const [evento, setEvento] = useState<Evento | null>(null)

  /* Comentarios y reacciones */
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentText, setCommentText] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(5)

  /* ─── Fetch del documento ─── */
  useEffect(() => {
    if (!id) {
      setEstado('no-existe')
      return
    }

    /* Determinar la coleccion segun el source */
    const coleccion = source === 'mural' ? 'posts' : 'eventos'

    const run = async () => {
      try {
        const snap = await getDoc(doc(db, coleccion, id))

        if (!snap.exists()) {
          setEstado('no-existe')
          return
        }

        const data = { id: snap.id, ...snap.data() } as Evento
        setEvento(data)
        setEstado('ok')
      } catch {
        setEstado('no-existe')
      }
    }

    run()
  }, [id, source])

  /* ─── Suscripcion a comentarios ─── */
  useEffect(() => {
    if (!id || estado !== 'ok') return
    return subscribeToComments(id, setComments)
  }, [id, estado])

  /* ─── Handlers ─── */
  const handleReaction = async (type: ReactionType) => {
    if (!user?.uid || !id) return
    playReactionSound()
    await toggleReaction(id, user.uid, type).catch(() => {})
  }

  const handleSendComment = async () => {
    if (!user?.uid || !id || !commentText.trim()) return
    const text = commentText.trim()
    setCommentText('')
    playCommentSendSound()
    try {
      await addComment(id, {
        userId: user.uid,
        nickname: userProfile?.nickname || user.displayName || 'Anonimo',
        text,
        avatarColor: userProfile?.avatar || '#fbbf24',
        avatarType: userProfile?.avatarType || 'letter',
        avatarIcon: userProfile?.avatarIcon || 'Gamepad2',
      })
    } catch {
      setCommentText(text)
    }
  }

  /* ─── Estado: cargando ─── */
  if (estado === 'cargando') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-6">
        <p className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-black dark:text-white animate-pulse text-center">
          CARGANDO
          <br />
          REGISTRO...
        </p>
      </div>
    )
  }

  /* ─── Estado: no disponible / formato antiguo ─── */
  if (estado === 'no-existe' || !evento) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-6 gap-8">
        {/* Boton ATRAS en la esquina superior para no quedar atrapado */}
        <div className="w-full max-w-xl mb-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none font-black uppercase flex items-center gap-2 transition-all text-black dark:text-white w-fit"
          >
            <ArrowLeftIcon />
            ATRAS
          </button>
        </div>

        <div className="border-4 border-black dark:border-white bg-gray-900 dark:bg-gray-800 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center max-w-xl w-full">
          <p className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-white mb-4">
            VISTA NO DISPONIBLE
          </p>
          <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-300 leading-relaxed">
            LA INFORMACION DE ESTE REGISTRO ES MUY ANTIGUA
            O EL FORMATO NO ESTA HABILITADO PARA ESTA VISTA.
          </p>
        </div>
      </div>
    )
  }

  /* ─── Estado: registro cargado ─── */
  const tipoInfo = TIPO_CONFIG[evento.tipo] ?? {
    label: evento.tipo?.toUpperCase() ?? 'REGISTRO',
    badgeColor: 'bg-gray-400',
    iconColor: 'text-gray-500',
  }
  const reactions = evento.reactions ?? {}
  const currentUserId = user?.uid

   return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ─── Boton ATRAS ─── */}
        <button
          onClick={() => navigate(-1)}
          className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none font-black uppercase flex items-center gap-2 mb-6 w-fit transition-all text-black dark:text-white"
        >
          <ArrowLeftIcon />
          ATRAS
        </button>

        {/* ─── Cabecera con titulo ─── */}
        <div className="border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <p className="text-xs font-black uppercase tracking-widest text-black mb-1">
            DETALLE DE REGISTRO
          </p>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-black">
            {tipoInfo.label}
          </h1>
        </div>

        {/* ─── Tarjeta principal (estilo Neobrutalista) ─── */}
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">

           {/* Header de la tarjeta */}
           <div className="flex justify-between items-start w-full border-b-4 border-black dark:border-white px-4 pb-4 mb-4">
             <p className="font-black text-gray-500 uppercase text-lg">
               {tiempoRelativo(evento.timestamp)}
             </p>

             {/* Icono + badge alineados a la derecha en columna */}
             <div className="flex flex-col items-end gap-2 shrink-0">
               <div className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                 <TipoIcon tipo={evento.tipo} />
               </div>
               <span
                 className={`px-2 py-1 border-2 border-black dark:border-white ${tipoInfo.badgeColor} text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]`}
               >
                 {tipoInfo.label}
               </span>
             </div>
           </div>

          {/* Cuerpo: rating, nota, foto */}
          <div className="p-5 space-y-5">

            {/* Rating */}
            <div className="pb-4 border-b-2 border-gray-100 dark:border-gray-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                CALIFICACION
              </p>
              <Stars value={evento.rating ?? 0} />
            </div>

            {/* Nota */}
            {evento.note && (
              <div className="border-l-4 border-black dark:border-white pl-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                  NOTA
                </p>
                <p className="text-sm font-bold text-black dark:text-white leading-relaxed">
                  {evento.note}
                </p>
              </div>
            )}

            {/* Foto */}
            {evento.photoUrl && (
              <div className="border-2 border-black dark:border-white p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <img
                  src={evento.photoUrl}
                  alt="Foto del registro"
                  className="w-full h-auto object-cover border border-black dark:border-white max-h-64"
                />
              </div>
            )}

            {!evento.note && !evento.photoUrl && (evento.rating ?? 0) === 0 && (
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-2">
                SIN DETALLES ADICIONALES
              </p>
            )}
          </div>

          {/* ─── Reacciones ─── */}
          <div className="px-5 pb-5 border-t-2 border-gray-200 dark:border-gray-700 pt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
              REACCIONES
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {REACTION_TYPES.map((type) => {
                const { activeBg } = REACTION_CONFIG[type]
                const count = Object.values(reactions).filter((r) => r === type).length
                const isActive = currentUserId && reactions[currentUserId] === type

                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className={`flex items-center gap-1 px-3 py-2 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:translate-y-[2px] hover:shadow-[1px_0px_0px_rgba(0,0,0,1)] ${
                      isActive
                        ? `${activeBg} text-black`
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                    }`}
                  >
                    <ReactionIconSVG type={type} />
                    {count > 0 && <span>{count}</span>}
                  </button>
                )
              })}

              {comments.length > 0 && (
                <span className="flex items-center gap-1 px-3 py-2 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white dark:bg-gray-800 text-black dark:text-white">
                  <MessageSquare size={14} strokeWidth={2.5} />
                  {comments.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Seccion de comentarios ─── */}
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="px-4 py-3 border-b-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700">
            <p className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
              COMENTARIOS
              {comments.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 border-2 border-black bg-yellow-300 text-black font-black text-[10px]">
                  {comments.length}
                </span>
              )}
            </p>
          </div>

          <div className="p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-4">
                SIN COMENTARIOS AUN
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {comments.slice(0, visibleLimit).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 border-2 border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-900"
                  >
                    <div
                      className="w-8 h-8 shrink-0 border-2 border-black dark:border-white flex items-center justify-center text-[10px] font-black text-black"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {c.nickname.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {c.nickname}
                      </p>
                      <p className="text-sm font-bold text-black dark:text-white break-words">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {comments.length > visibleLimit && (
              <button
                onClick={() => { playClickSound(); setVisibleLimit((prev) => prev + 5) }}
                className="w-full text-[10px] font-black border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 uppercase tracking-wider transition-colors text-black dark:text-white"
              >
                VER MAS COMENTARIOS...
              </button>
            )}

            {/* Input de comentario */}
            <div className="flex gap-2 pt-2 border-t-2 border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendComment()
                  }
                }}
                placeholder="Escribe un comentario..."
                className="flex-1 py-2 px-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-xs placeholder:text-gray-400 focus:outline-none focus:ring-0"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-emerald-400 dark:hover:bg-green-500 hover:translate-y-[2px] hover:shadow-[1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
