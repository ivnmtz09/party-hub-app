import { useState, useEffect } from 'react'
import { Star, Pencil, Save, X, Camera, Edit, Trash2, Heart, Flame, Smile, Skull, Frown, MessageSquare, Send } from 'lucide-react'
import type { Evento, ReactionType, CommentData } from '../../../firebase/services'
import { updateActivityRecord, uploadRecordPhoto, toggleReaction, addComment, subscribeToComments } from '../../../firebase/services'
import { useAuth } from '../../../context/AuthContext'

interface Props {
  evento: Evento
  groupId: string
  isOwner: boolean
  onClose: () => void
}

const REACTION_OPTIONS: { type: ReactionType; icon: typeof Heart }[] = [
  { type: 'heart', icon: Heart },
  { type: 'flame', icon: Flame },
  { type: 'smile', icon: Smile },
  { type: 'skull', icon: Skull },
  { type: 'frown', icon: Frown },
]

export default function ActivityDetailOrEdit({ evento, groupId, isOwner, onClose }: Props) {
  const { user, userProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(evento.rating ?? 0)
  const [note, setNote] = useState(evento.note ?? '')
  const [photoUrl, setPhotoUrl] = useState(evento.photoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<CommentData[]>([])
  const [commentText, setCommentText] = useState('')

  const reactions = evento.reactions ?? {}
  const currentUserId = user?.uid

  useEffect(() => {
    if (!showComments || !evento.id) return
    const unsub = subscribeToComments(groupId, evento.id, setComments)
    return unsub
  }, [showComments, groupId, evento.id])

  const handleToggleReaction = async (reactionType: ReactionType) => {
    if (!currentUserId || !evento.id) return
    try {
      await toggleReaction(groupId, evento.id, currentUserId, reactionType)
    } catch {
      /* error silencioso */
    }
  }

  const handleSendComment = async () => {
    if (!currentUserId || !evento.id || !commentText.trim()) return
    const text = commentText.trim()
    setCommentText('')
    try {
      await addComment(groupId, evento.id, {
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
          onClick={() => interactive && setRating(n)}
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const url = await uploadRecordPhoto(file)
      setPhotoUrl(url)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleSave = async () => {
    if (!isOwner) {
      setError('No tienes permiso para modificar este registro.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await updateActivityRecord(groupId, evento.id!, { rating, note, photoUrl })
      setIsEditing(false)
    } catch {
      setError('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
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
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Calificacion
          </p>
          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 text-black dark:text-gray-900 font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Pencil size={10} strokeWidth={2.5} />
              Editar
            </button>
          )}
        </div>

        {renderStars(rating)}

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
          {REACTION_OPTIONS.map(({ type, icon: Icon }) => {
            const count = Object.values(reactions).filter((r) => r === type).length
            const isActive = currentUserId && reactions[currentUserId] === type
            return (
              <button
                key={type}
                onClick={() => handleToggleReaction(type)}
                className={`flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  isActive
                    ? 'bg-yellow-400 text-black'
                    : 'bg-white dark:bg-gray-800 text-black dark:text-white'
                }`}
              >
                <Icon size={12} strokeWidth={2.5} className={isActive ? 'text-red-500' : ''} />
                {count > 0 && <span>{count}</span>}
              </button>
            )
          })}

          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1 px-2 py-1 border-2 border-black dark:border-white font-black text-[10px] uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
              showComments
                ? 'bg-blue-400 dark:bg-blue-500 text-black'
                : 'bg-white dark:bg-gray-800 text-black dark:text-white'
            }`}
          >
            <MessageSquare size={12} strokeWidth={2.5} />
            {comments.length > 0 && <span>{comments.length}</span>}
          </button>
        </div>

        {showComments && (
          <div className="border-2 border-black dark:border-white bg-white dark:bg-gray-800 p-3 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {comments.length === 0 ? (
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 text-center uppercase tracking-wider py-2">
                Sin comentarios
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {comments.map((c) => {
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
        )}

        <button
          onClick={onClose}
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
          Foto
        </label>
        <div className="flex gap-2">
          <label className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Camera size={12} strokeWidth={2.5} />
            Camara
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <label className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Edit size={12} strokeWidth={2.5} />
            Galeria
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        {photoUrl && (
          <div className="mt-2 border-2 border-black dark:border-white p-1">
            <img
              src={photoUrl}
              alt="Preview"
              className="w-full h-24 object-cover border border-black dark:border-white"
            />
            <button
              onClick={() => setPhotoUrl('')}
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
