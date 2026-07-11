import { useState } from 'react'
import {
  X,
  Star,
  Edit,
  Save,
  Image,
  Trash2,
  Flame,
  Dumbbell,
} from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Evento, Miembro } from '../../../firebase/services'
import { updateActivityRecord, uploadRecordPhoto } from '../../../firebase/services'

interface Props {
  open: boolean
  onClose: () => void
  evento: Evento
  miembros: Miembro[]
  groupId: string
}

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
  deposicion: 'CAGADA',
  acto_sexual: 'CULEADA',
  gym: 'GYM',
}

export default function RecordModal({ open, onClose, evento, miembros, groupId }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [rating, setRating] = useState(evento.rating ?? 0)
  const [note, setNote] = useState(evento.note ?? '')
  const [photoUrl, setPhotoUrl] = useState(evento.photoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const miembro = miembros.find((m) => m.id === evento.userId)
  const nombreUsuario = miembro
    ? miembro.nickname || miembro.displayName.split(' ')[0]
    : evento.userId

  const tipoLabel = TIPO_LABEL[evento.tipo] ?? evento.tipo.toUpperCase()

  const icono =
    evento.tipo === 'deposicion' ? (
      <Trash2 size={20} strokeWidth={2.5} className="text-orange-500" />
    ) : evento.tipo === 'acto_sexual' ? (
      <Flame size={20} strokeWidth={2.5} className="text-pink-500" />
    ) : (
      <Dumbbell size={20} strokeWidth={2.5} className="text-cyan-500" />
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
    setSaving(true)
    setError('')
    try {
      await updateActivityRecord(groupId, evento.id!, { rating, note, photoUrl })
      setIsEditing(false)
    } catch {
      setError('Error al guardar los cambios')
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
            size={24}
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-5 sm:p-6 shadow-brutal-lg dark:shadow-brutal-lg-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3 mb-5">
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

        {!isEditing ? (
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
        ) : (
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
              <label className="flex items-center justify-center gap-2 py-3 px-4 border-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700 text-black dark:text-white font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Image size={16} strokeWidth={2.5} />
                {photoUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {photoUrl && (
                <div className="mt-3 border-4 border-black dark:border-white p-2">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover border-2 border-black dark:border-white"
                  />
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
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <X size={16} strokeWidth={2.5} />
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
