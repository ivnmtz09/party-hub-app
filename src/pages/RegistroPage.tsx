import { useEffect, useMemo, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import {
  Dumbbell,
  Star,
  Heart,
  Flame,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Clock,
} from 'lucide-react'
import { db } from '../firebase/config'
import type { Evento, CommentData } from '../firebase/services'
import {
  subscribeToComments,
  toggleReaction,
  addComment,
  type ReactionType,
} from '../firebase/services'
import { useAuth } from '../context/AuthContext'
import { useAppContent } from '../context/ContentContext'
import { Icono } from '../config/iconos'
import { playReactionSound, playCommentSendSound, playClickSound } from '../utils/audio'
import UserAvatar from '../components/UserAvatar'
import BrandLogo from '../components/BrandLogo'

/* ─── Tipos de actividad ─── */

const REACTION_CONFIG: Record<ReactionType, { label: string; activeBg: string }> = {
  heart: { label: 'Corazón', activeBg: 'bg-red-500' },
  flame: { label: 'Fuego', activeBg: 'bg-orange-500' },
  smile: { label: 'Sonrisa', activeBg: 'bg-yellow-200' },
  skull: { label: 'Calavera', activeBg: 'bg-gray-400' },
  frown: { label: 'Triste', activeBg: 'bg-blue-400' },
}

const REACTION_TYPES: ReactionType[] = ['heart', 'flame', 'smile', 'skull', 'frown']

/* ─── Iconos de reaccion SVG ─── */

function ReactionIconSVG({ type }: { type: ReactionType }) {
  const icons: Record<ReactionType, React.ReactElement> = {
    heart: <Heart size={16} strokeWidth={2.5} />,
    flame: <Flame size={16} strokeWidth={2.5} />,
    smile: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 13s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
    skull: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.18-1.65 5.97-4.12 7.59L16 21H8l-.88-2.41C4.65 16.97 3 14.18 3 11a9 9 0 0 1 9-9z" />
        <line x1="9" y1="12" x2="9.01" y2="12" />
        <line x1="15" y1="12" x2="15.01" y2="12" />
        <path d="M10 17v2" />
        <path d="M14 17v2" />
      </svg>
    ),
    frown: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    ),
  }
  return icons[type]
}

/* ─── Helpers de tiempo ─── */

function toMillis(ts: unknown): number {
  if (!ts) return 0
  const t = ts as { toMillis?: () => number; seconds?: number }
  if (typeof t.toMillis === 'function') return t.toMillis()
  if (typeof t.seconds === 'number') return t.seconds * 1000
  const d = new Date(ts as string)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

function tiempoRelativo(ts: unknown): string {
  const ms = toMillis(ts)
  if (!ms) return ''
  const segundos = Math.floor((Date.now() - ms) / 1000)
  if (segundos < 60) return 'ahora mismo'
  const minutos = Math.floor(segundos / 60)
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `hace ${horas}h`
  const dias = Math.floor(horas / 24)
  if (dias < 30) return `hace ${dias} d`
  const meses = Math.floor(dias / 30)
  if (meses < 12) return `hace ${meses} mes`
  return `hace ${Math.floor(meses / 12)} años`
}

function formatoCompleto(ts: unknown): string {
  const ms = toMillis(ts)
  if (!ms) return ''
  const d = new Date(ms)
  const meses = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
  ]
  const hora = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()} · ${hora}:${min}`
}

/* ─── Render de estrellas ─── */

function Stars({ value, size = 20 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={2.2}
          className={
            n <= value
              ? 'text-yellow-400 fill-yellow-400 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.4)]'
              : 'text-gray-300 dark:text-gray-600'
          }
        />
      ))}
    </div>
  )
}

/* ─── Página principal ─── */

export default function RegistroPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { content } = useAppContent()

  /* source: de query params */
  const source = useMemo(
    () => new URLSearchParams(location.search).get('source') ?? 'tablero',
    [location.search],
  )

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
        nickname: userProfile?.nickname || user.displayName || 'Anónimo',
        text,
        avatarColor: userProfile?.avatar || '#fbbf24',
        avatarType: userProfile?.avatarType || 'letter',
        avatarIcon: userProfile?.avatarIcon || 'Gamepad2',
      })
    } catch {
      setCommentText(text)
    }
  }

  const tipo = evento?.tipo ?? 'gym'
  const act = content.actividades.find((a) => a.tipo === tipo)
  const IconAct = Icono(act?.icon, Dumbbell)
  const tipoInfo = act
    ? {
        label: act.label,
        badgeColor: act.badgeColor,
        tileBg: act.tileColor,
        color: act.iconColor,
        Icon: IconAct,
      }
    : {
        label: tipo.toUpperCase(),
        badgeColor: 'bg-gray-400',
        tileBg: 'bg-gray-100 dark:bg-gray-700',
        color: 'text-gray-500',
        Icon: Dumbbell,
      }
  if (estado === 'cargando') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 gap-8">
        <BrandLogo size="md" />
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-6 h-6 border-4 border-black dark:border-white bg-yellow-400 dark:bg-yellow-500"
              style={{ animation: `splash-bounce 1s ease-in-out infinite ${i * 0.12}s` }}
            />
          ))}
        </div>
        <p className="text-xl font-black uppercase tracking-widest text-black dark:text-white animate-pulse">
          CARGANDO REGISTRO...
        </p>
      </div>
    )
  }

  /* ─── Estado: no disponible / formato antiguo ─── */
  if (estado === 'no-existe' || !evento) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 gap-8">
        <div className="w-full max-w-xl mb-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none font-black uppercase flex items-center gap-2 transition-all text-black dark:text-white w-fit"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            ATRÁS
          </button>
        </div>

        <div className="border-4 border-black dark:border-white bg-gray-900 dark:bg-gray-800 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] text-center max-w-xl w-full">
          <p className="text-3xl sm:text-4xl font-black uppercase tracking-widest text-yellow-400 mb-4">
            VISTA NO DISPONIBLE
          </p>
          <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-gray-300 leading-relaxed">
            LA INFORMACIÓN DE ESTE REGISTRO ES MUY ANTIGUA
            O EL FORMATO NO ESTA HABILITADO PARA ESTA VISTA.
          </p>
        </div>
      </div>
    )
  }

  /* ─── Datos derivados ─── */
  const reactions = evento.reactions ?? {}
  const currentUserId = user?.uid
  const totalReacciones = Object.keys(reactions).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ─── Boton ATRÁS ─── */}
        <button
          onClick={() => navigate(-1)}
          className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none font-black uppercase flex items-center gap-2 w-fit transition-all text-black dark:text-white"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          ATRÁS
        </button>

        {/* ─── Cabecera con titulo ─── */}
        <div className="border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 8px, transparent 8px, transparent 20px)',
            }}
          />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">
                DETALLE DE REGISTRO
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-black">
                {tipoInfo.label}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-black/70">
                <Calendar size={12} strokeWidth={2.5} />
                {formatoCompleto(evento.timestamp)}
              </p>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-black bg-white shrink-0 flex items-center justify-center rotate-6">
              <tipoInfo.Icon size={32} strokeWidth={2.5} className={tipoInfo.color} />
            </div>
          </div>
        </div>

        {/* ─── Tarjeta principal ─── */}
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">

          {/* Header de la tarjeta */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-black dark:border-white px-5 py-4 bg-gray-50 dark:bg-gray-950">
            <div>
              <span className={`inline-block px-2.5 py-1 border-2 border-black dark:border-white ${tipoInfo.badgeColor} text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]`}>
                {tipoInfo.label}
              </span>
              <p className="mt-2 flex items-center gap-1 font-black text-gray-500 dark:text-gray-400 uppercase text-[10px] tracking-wider">
                <Clock size={12} strokeWidth={2.5} />
                {tiempoRelativo(evento.timestamp)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className={`w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center ${tipoInfo.tileBg}`}>
                <tipoInfo.Icon size={22} strokeWidth={2.5} className={tipoInfo.color} />
              </div>
            </div>
          </div>

          {/* Cuerpo */}
          <div className="p-5 sm:p-6 space-y-5">

            {/* Rating */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  CALIFICACIÓN
                </p>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {evento.rating ?? 0} / 5
                </span>
              </div>
              <div className="border-4 border-black dark:border-white bg-yellow-50 dark:bg-gray-900 p-4 flex justify-center shadow-[4px_4px_0px_rgba(0,0,0,0.15)] dark:shadow-white/10 rounded-none">
                <Stars value={evento.rating ?? 0} size={28} />
              </div>
            </div>

            {/* Nota */}
            {evento.note && (
              <div className="border-l-4 border-black dark:border-white bg-gray-50 dark:bg-gray-950 pl-4 py-3 pr-3">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
                  NOTA
                </p>
                <p className="text-sm font-bold text-black dark:text-white leading-relaxed">
                  {evento.note}
                </p>
              </div>
            )}

            {/* Foto */}
            {evento.photoUrl && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  FOTO
                </p>
                <div className="border-4 border-black dark:border-white bg-gray-50 dark:bg-gray-900 p-2 shadow-[6px_6px_0px_rgba(0,0,0,1)] dark:shadow-white/10 rotate-1">
                  <img
                    src={evento.photoUrl}
                    alt="Foto del registro"
                    className="w-full h-auto object-cover border-2 border-black dark:border-white max-h-72"
                  />
                </div>
              </div>
            )}

            {!evento.note && !evento.photoUrl && (evento.rating ?? 0) === 0 && (
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-2">
                SIN DETALLES ADICIONALES
              </p>
            )}
          </div>

          {/* ─── Reacciones ─── */}
          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  REACCIONES
                </p>
                {totalReacciones > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {totalReacciones} {totalReacciones === 1 ? 'PERSONA' : 'PERSONAS'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {REACTION_TYPES.map((type) => {
                  const { activeBg } = REACTION_CONFIG[type]
                  const count = Object.values(reactions).filter((r) => r === type).length
                  const isActive = currentUserId && reactions[currentUserId] === type

                  return (
                    <button
                      key={type}
                      onClick={() => handleReaction(type)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                        isActive
                          ? `${activeBg} text-black`
                          : 'bg-white dark:bg-gray-800 text-black dark:text-white hover:translate-y-[2px]'
                      }`}
                    >
                      <ReactionIconSVG type={type} />
                      <span>{count > 0 ? count : ''}</span>
                    </button>
                  )
                })}
              </div>

              {comments.length > 0 && (
                <div className="mt-3 flex items-center gap-1 px-3 py-2 border-2 border-black dark:border-white w-fit font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white dark:bg-gray-800 text-black dark:text-white">
                  <MessageSquare size={14} strokeWidth={2.5} />
                  {comments.length} {comments.length === 1 ? 'Comentario' : 'Comentarios'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Seccion de comentarios ─── */}
        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="px-5 py-3.5 border-b-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
              COMENTARIOS
            </p>
            {comments.length > 0 && (
              <span className="px-2 py-0.5 border-2 border-black bg-yellow-300 dark:bg-yellow-400 text-black font-black text-[10px]">
                {comments.length}
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            {comments.length === 0 ? (
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-6">
                AÚN NO HAY COMENTARIOS, ANÍMATE
              </p>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {comments.slice(0, visibleLimit).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 border-2 border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-900"
                  >
                    <UserAvatar
                      name={c.nickname}
                      color={c.avatarColor}
                      type={c.avatarType === 'shape' ? 'shape' : 'letter'}
                      avatarIcon={c.avatarIcon}
                      size={32}
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                          {c.nickname}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0">
                          <Clock size={9} strokeWidth={2.5} className="inline mr-1" />
                          {tiempoRelativo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black dark:text-white break-words mt-0.5">
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
                className="w-full text-[10px] font-black border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 py-2.5 hover:bg-gray-300 dark:hover:bg-gray-600 uppercase tracking-wider transition-colors text-black dark:text-white"
              >
                VER MÁS COMENTARIOS...
              </button>
            )}

            {/* Input de comentario */}
            <div className="flex gap-2 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
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
                className="flex-1 py-2.5 px-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-xs placeholder:text-gray-400 focus:outline-none focus:ring-0"
              />
              <button
                onClick={handleSendComment}
                disabled={!commentText.trim()}
                className="px-4 py-2 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-emerald-400 dark:hover:bg-green-500 hover:translate-y-[2px] hover:shadow-[1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar comentario"
              >
                ENVIAR
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}