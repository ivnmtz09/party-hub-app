import { useState, useRef, useEffect } from 'react'
import {
  X,
  Star,
  Edit,
  Save,
  Camera,
  Trash2,
  Flame,
  Dumbbell,
} from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Evento, Miembro } from '../../../firebase/services'
import { updateActivityRecord, uploadRecordPhoto } from '../../../firebase/services'

interface AnchorRect {
  x: number
  y: number
}

interface PropsCreate {
  mode: 'create'
  open: boolean
  onClose: () => void
  tipo: 'deposicion' | 'acto_sexual' | 'gym'
  groupId: string
  anchorRect?: AnchorRect
  onSave: (data: { rating: number; note: string; photoUrl: string }) => Promise<void>
}

interface PropsViewEdit {
  mode: 'view' | 'edit'
  open: boolean
  onClose: () => void
  evento: Evento
  miembros: Miembro[]
  groupId: string
  anchorRect?: AnchorRect
  onSave?: (data: { rating: number; note: string; photoUrl: string }) => Promise<void>
}

type Props = PropsCreate | PropsViewEdit

function formatoFecha(ts: Timestamp): string {
  const d = ts.toDate()
  const dia = d.getDate()
  const meses = [
    'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
    'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
  ]
  const mes = meses[d.getMonth()]
  const anio = d.getFullYear()
  const hora = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${dia} ${mes} ${anio} - ${hora}:${min}`
}

const TIPO_LABEL: Record<string, string> = {
  depocion: 'CAGADA',
  acto_sexual: 'CULEADA',
  gym: 'GYM',
}

function getModalPosition(anchor?: AnchorRect) {
  if (!anchor) return {}
  const vw = window.innerWidth
  const vh = window.innerHeight
  const modalW = Math.min(vw - 32, 448)
  const modalH = 420
  let left = anchor.x - modalW / 2
  let top = anchor.y - modalH - 16
  if (left < 16) left = 16
  if (left + modalW > vw - 16) left = vw - modalW - 16
  if (top < 16) top = anchor.y + 16
  if (top + modalH > vh - 16) top = vh - modalH - 16
  return { left: `${left}px`, top: `${top}px` }
}

export default function RecordModal(props: Props) {
  const { open, onClose, groupId, anchorRect } = props

  const isCreate = props.mode === 'create'
  const tipo = isCreate ? props.tipo : props.evento.tipo

  const [isEditing, setIsEditing] = useState(props.mode !== 'view')
  const [rating, setRating] = useState(
    isCreate ? 0 : (props.evento.rating ?? 0),
  )
  const [note, setNote] = useState(
    isCreate ? '' : (props.evento.note ?? ''),
  )
  const [photoUrl, setPhotoUrl] = useState(
    isCreate ? '' : (props.evento.photoUrl ?? ''),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (isCreate) {
      setIsEditing(true)
      setRating(0)
      setNote('')
      setPhotoUrl('')
    } else {
      setIsEditing(props.mode === 'edit')
      setRating(props.evento.rating ?? 0)
      setNote(props.evento.note ?? '')
      setPhotoUrl(props.evento.photoUrl ?? '')
    }
    setError('')
  }, [open])

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
    setSaving(true)
    setError('')
    try {
      if (isCreate) {
        await props.onSave({ rating, note, photoUrl })
      } else if (props.onSave) {
        await updateActivityRecord(groupId, props.evento.id!, { rating, note, photoUrl })
      }
      onClose()
    } catch {
      setError('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isCreate) {
      onClose()
      return
    }
    if (props.mode === 'view') {
      onClose()
      return
    }
    setRating(props.evento.rating ?? 0)
    setNote(props.evento.note ?? '')
    setPhotoUrl(props.evento.photoUrl ?? '')
    setIsEditing(false)
    setError('')
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
            size={28}
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

  if (!open) return null

  const icono =
    tipo === 'deposicion' ? (
      <Trash2 size={20} strokeWidth={2.5} className="text-orange-500" />
    ) : tipo === 'acto_sexual' ? (
      <Flame size={20} strokeWidth={2.5} className="text-pink-500" />
    ) : (
      <Dumbbell size={20} strokeWidth={2.5} className="text-cyan-500" />
    )

  const tipoLabel = TIPO_LABEL[tipo] ?? tipo.toUpperCase()

  let headerContent: React.ReactNode
  if (isCreate) {
    headerContent = (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          {icono}
        </div>
        <h3 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
          Nuevo Registro - {tipoLabel}
        </h3>
      </div>
    )
  } else {
    const evento = props.evento
    const miembro = props.miembros.find((m) => m.id === evento.userId)
    const nombreUsuario = miembro
      ? miembro.nickname || miembro.displayName.split(' ')[0]
      : evento.userId
    headerContent = (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          {icono}
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-black dark:text-white">
            {tipoLabel}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {nombreUsuario} &middot; {formatoFecha(evento.timestamp)}
          </p>
        </div>
      </div>
    )
  }

  const posStyle = getModalPosition(anchorRect)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 select-none"
      onClick={onClose}
    >
      <div
        className="absolute w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-brutal-lg dark:shadow-brutal-lg-dark"
        style={{
          ...posStyle,
          ...(Object.keys(posStyle).length === 0
            ? {
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }
            : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="mb-5">{headerContent}</div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="border-4 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Calificacion
              </p>
              {renderStars(rating, true)}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Nota
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe una nota..."
                rows={3}
                className="w-full py-3 px-4 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Foto
              </label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Camera size={16} strokeWidth={2.5} />
                  Tomar Foto
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Edit size={16} strokeWidth={2.5} />
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
                <div className="mt-3 border-4 border-black dark:border-white p-2">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover border-2 border-black dark:border-white"
                  />
                  <button
                    onClick={() => setPhotoUrl('')}
                    className="mt-2 flex items-center gap-1 text-red-600 font-black text-[10px] uppercase tracking-wider"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                    Eliminar foto
                  </button>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-600 font-black text-xs uppercase tracking-wider">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
              >
                <Save size={16} strokeWidth={2.5} />
                {saving
                  ? 'Guardando...'
                  : isCreate
                    ? 'Registrar'
                    : 'Guardar Cambios'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <X size={16} strokeWidth={2.5} />
                {isCreate ? 'Cancelar' : 'Cancelar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-4 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-700">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                Calificacion
              </p>
              {renderStars(rating)}
            </div>

            {note && (
              <div className="border-l-4 border-black dark:border-white bg-gray-50 dark:bg-gray-700 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                  Nota
                </p>
                <p className="text-sm font-bold text-black dark:text-white">
                  {note}
                </p>
              </div>
            )}

            {photoUrl && (
              <div className="border-4 border-black dark:border-white p-2 bg-gray-50 dark:bg-gray-700">
                <img
                  src={photoUrl}
                  alt="Foto del registro"
                  className="w-full h-auto max-h-48 object-cover border-2 border-black dark:border-white"
                />
              </div>
            )}

            {!note && !photoUrl && rating === 0 && (
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 text-center py-2 uppercase tracking-wider">
                Sin detalles adicionales
              </p>
            )}

            {error && (
              <p className="text-red-600 font-black text-xs uppercase tracking-wider">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xs shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Edit size={16} strokeWidth={2.5} />
                Editar
              </button>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <X size={16} strokeWidth={2.5} />
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
