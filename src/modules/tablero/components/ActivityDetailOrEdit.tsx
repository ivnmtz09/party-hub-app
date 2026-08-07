import { useState, useEffect } from 'react'
import { Star, Pencil, Save, X, Camera, Edit, Trash2, Heart, Flame, Smile, Skull, Frown, MessageSquare, Send } from 'lucide-react'
import type { Evento, ReactionType, CommentData, Miembro } from '../../../firebase/services'
import { updateActivityRecord, toggleReaction, addComment, subscribeToComments, observarMiembros } from '../../../firebase/services'
import { useAuth } from '../../../context/AuthContext'
import { useNeoToast } from '../../../components/NeoToast'
import { useAppContent } from '../../../context/ContentContext'
import { playReactionSound, playCommentSendSound, playCloseSound, playStarSound, playDeleteSound, playSuccessSound, playClickSound } from '../../../utils/audio'

interface Props {
  evento: Evento
  groupId: string
  isOwner: boolean
  onClose: () => void
  startEditing?: boolean
}

const REACTION_CONFIG: Record<ReactionType, { icon: typeof Heart; activeBg: string }> = {
  heart: { icon: Heart, activeBg: 'bg-red-500' },
  flame: { icon: Flame, activeBg: 'bg-orange-500' },
  smile: { icon: Smile, activeBg: 'bg-yellow-200' },
  skull: { icon: Skull, activeBg: 'bg-gray-400' },
  frown: { icon: Frown, activeBg: 'bg-blue-400' },
}

const REACTION_TYPES: ReactionType[] = ['heart', 'flame', 'smile', 'skull', 'frown']

export default function ActivityDetailOrEdit({ evento, groupId, isOwner, onClose, startEditing }: Props) {
  const { user, userProfile } = useAuth()
  const { showToast } = useNeoToast()
  const { content } = useAppContent()
  const badge = content.actividades.find((a) => a.tipo === evento.tipo)
  const [isEditing, setIsEditing] = useState(startEditing ?? false)
  const [rating, setRating] = useState(evento.rating ?? 0)
  const [note, setNote] = useState(evento.note ?? '')
  const [photoUrl, setPhotoUrl] = useState(evento.photoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [comments, setComments] = useState<CommentData[]>([])
  const [visibleCommentsLimit, setVisibleCommentsLimit] = useState(5)
  const [commentText, setCommentText] = useState('')
  const [showReactionsList, setShowReactionsList] = useState(false)
  const [miembros, setMiembros] = useState<Miembro[]>([])

  const reactions = evento.reactions ?? {}
  const currentUserId = user?.uid

  useEffect(() => {
        if (!evento.id) return
    const unsub = subscribeToComments(evento.id, setComments)
    return unsub
  }, [groupId, evento.id])

  useEffect(() => {
    const unsub = observarMiembros(groupId, setMiembros)
    return unsub
  }, [groupId])

  const reactionUsers = Object.entries(reactions).map(([userId, tipo]) => {
    const miembro = miembros.find((m) => m.id === userId)
    const nombre = miembro
      ? miembro.nickname || miembro.displayName.split(' ')[0]
      : userId
    return { userId, tipo: tipo as ReactionType, nombre }
  })

  const handleToggleReaction = async (reactionType: ReactionType) => {
    if (!currentUserId || !evento.id) return
    playReactionSound()
    try {
            await toggleReaction(evento.id, currentUserId, reactionType)
    } catch {
      /* error silencioso */
    }
  }

  const handleSendComment = async () => {
    if (!currentUserId || !evento.id || !commentText.trim()) return
    const text = commentText.trim()
    setCommentText('')
    playCommentSendSound()
    try {
      await addComment(evento.id, {
        userId: currentUserId,
        nickname: userProfile?.nickname || user?.displayName || 'Anonimo',
        text,
        avatarColor: userProfile?.avatar || '#fbbf24',
        avatarType: userProfile?.avatarType || 'letter',
        avatarIcon: userProfile?.avatarIcon || 'Gamepad2',
      })
    } catch {
      setCommentText(text)
    }
  }

  const renderStars = (value: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => { if (interactive) { playStarSound(); setRating(n) } }}
          className={`${interactive ? 'cursor-pointer active:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star
            size={22}
            strokeWidth={2.5}
            className={
              n <= value
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  )

  const handlePhotoDisabledClick = () => {
    showToast('SUBIDA DE IMÁGENES TEMPORALMENTE DESHABILITADA')
  }

  const handleSave = async () => {
    if (!isOwner) {
      setError('No tienes permiso para modificar este registro.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateActivityRecord(evento.id!, { rating, note, photoUrl })
      playSuccessSound()
      setIsEditing(false)
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    playCloseSound()
    setRating(evento.rating ?? 0)
    setNote(evento.note ?? '')
    setPhotoUrl(evento.photoUrl ?? '')
    setIsEditing(false)
    setError('')
  }

  if (!isEditing) {
    return (
      <div className="border-2 border-black dark:border-white p-4 mt-2 bg-gray-50 dark:bg-gray-900 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 border-2 border-black dark:border-white ${badge?.badgeColor ?? 'bg-gray-200 dark:bg-gray-700'} text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            {badge?.label ?? 'REGISTRO'}
          </span>
          {isOwner && (
            <button
              onClick={() => { playClickSound(); setIsEditing(true) }}
              className="flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 text-black dark:text-gray-900 font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Pencil size={10} strokeWidth={2.5} />
              Editar
            </button>
          )}
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
            Calificacion
          </p>
          {renderStars(rating)}
        </div>

        {note && (
          <div className="border-l-4 border-black dark:border-white pl-3 py-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
              Nota
            </p>
            <p className="text-sm font-bold text-black dark:text-white">
              {note}
            </p>
          </div>
        )}

        {photoUrl && (
          <div className="border-2 border-black dark:border-white p-1">
            <img
              src={photoUrl}
              alt="Foto del registro"
              className="w-full h-auto max-h-40 object-cover border border-black dark:border-white"
            />
          </div>
        )}

        {!note && !photoUrl && rating === 0 && (
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center py-1 uppercase tracking-wider">
            Sin detalles adicionales
          </p>
        )}

        <div className="flex items-center gap-1 flex-wrap pt-1 border-t-2 border-gray-200 dark:border-gray-700">
          {REACTION_TYPES.map((type) => {
            const { icon: Icon, activeBg } = REACTION_CONFIG[type]
            const count = Object.values(reactions).filter((r) => r === type).length
            const isActive = currentUserId && reactions[currentUserId] === type
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1"
              >
                <button
                  onClick={() => handleToggleReaction(type)}
                  className={`flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                    isActive
                      ? `${activeBg} text-black`
                      : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                  }`}
                >
                  <Icon size={12} strokeWidth={2.5} />
                </button>
                {count > 0 && (
                  <button
                    onClick={() => { playClickSound(); setShowReactionsList((prev) => !prev) }}
                    className={`px-2 py-1 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                      showReactionsList
                        ? 'bg-blue-400 dark:bg-blue-500 text-black'
                        : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                    }`}
                  >
                    {count}
                  </button>
                )}
              </span>
            )
          })}

          {comments.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white dark:bg-gray-800 text-black dark:text-white">
              <MessageSquare size={12} strokeWidth={2.5} />
              {comments.length}
            </span>
          )}
        </div>

        {showReactionsList && (
          <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-white">
            <h4 className="font-black text-sm uppercase mb-2 border-b-2 border-black dark:border-white pb-1 text-black dark:text-white">
              Han reaccionado:
            </h4>
            {reactionUsers.length === 0 ? (
              <p className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Aun no hay reacciones
              </p>
            ) : (
              <div>
                {reactionUsers.map(({ userId, nombre }) => (
                  <span
                    key={userId}
                    className="inline-block bg-yellow-300 dark:bg-yellow-500 border border-black dark:border-white font-bold text-xs px-2 py-1 mr-2 mb-2 text-black"
                  >
                    {nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-3 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {comments.length === 0 ? (
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-2">
              Sin comentarios
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.slice(0, visibleCommentsLimit).map((c) => {
                const initials = c.nickname.slice(0, 2).toUpperCase()
                return (
                  <div key={c.id} className="flex items-start gap-2 border-2 border-black dark:border-white p-2 bg-gray-50 dark:bg-gray-900">
                    <div
                      className="w-7 h-7 shrink-0 border-2 border-black dark:border-white flex items-center justify-center text-[10px] font-black text-black"
                      style={{ backgroundColor: c.avatarColor }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {c.nickname}
                      </p>
                      <p className="text-xs font-bold text-black dark:text-white break-words">
                        {c.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {comments.length > visibleCommentsLimit && (
            <button
              onClick={() => setVisibleCommentsLimit((prev) => prev + 5)}
              className="w-full mt-2 text-sm font-black border-2 border-black bg-gray-200 py-1 hover:bg-gray-300 uppercase tracking-wider text-[10px]"
            >
              VER MAS COMENTARIOS...
            </button>
          )}

          <div className="flex gap-2">
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
              className="px-3 py-2 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <button
          onClick={() => { playCloseSound(); onClose() }}
          className="w-full flex items-center justify-center gap-1 py-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <X size={12} strokeWidth={2.5} />
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <div className="border-2 border-black dark:border-white p-4 mt-2 bg-gray-50 dark:bg-gray-900 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Editar Registro
      </p>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
          Calificacion
        </p>
        {renderStars(rating, true)}
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
          Nota
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe una nota..."
          rows={2}
          className="w-full py-2 px-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-xs placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none"
        />
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
          Foto (subida deshabilitada)
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePhotoDisabledClick}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border-2 border-black dark:border-white bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-not-allowed opacity-70 transition-colors"
          >
            <Camera size={12} strokeWidth={2.5} />
            Camara
          </button>
          <button
            type="button"
            onClick={handlePhotoDisabledClick}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border-2 border-black dark:border-white bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-not-allowed opacity-70 transition-colors"
          >
            <Edit size={12} strokeWidth={2.5} />
            Galeria
          </button>
        </div>
        {photoUrl && (
          <div className="mt-2 border-2 border-black dark:border-white p-1">
            <img
              src={photoUrl}
              alt="Preview"
              className="w-full h-24 object-cover border border-black dark:border-white"
            />
            <button
              onClick={() => { playDeleteSound(); setPhotoUrl('') }}
              className="mt-1 flex items-center gap-1 text-red-600 font-black text-[10px] uppercase tracking-wider"
            >
              <Trash2 size={10} strokeWidth={2.5} />
              Quitar foto
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-600 font-black text-[10px] uppercase tracking-wider">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1 py-2 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
        >
          <Save size={12} strokeWidth={2.5} />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={handleCancel}
          className="flex-1 flex items-center justify-center gap-1 py-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <X size={12} strokeWidth={2.5} />
          Cancelar
        </button>
      </div>
    </div>
  )
}
