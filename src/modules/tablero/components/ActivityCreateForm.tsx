import { useState } from 'react'
import { Star, Save, X, Camera, Edit, Trash2, Trash2Icon, Flame, Dumbbell } from 'lucide-react'
import { registrarEvento, uploadRecordPhoto } from '../../../firebase/services'
import { playStarSound, playDeleteSound, playSuccessSound, playCloseSound, playClickSound } from '../../../utils/audio'

interface Props {
  groupId: string
  userId: string
  onClose: () => void
}

export default function ActivityCreateForm({ groupId, userId, onClose }: Props) {
  const [tipo, setTipo] = useState<'deposicion' | 'acto_sexual' | 'gym'>('deposicion')
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
      await registrarEvento(groupId, userId, tipo, { rating, note, photoUrl })
      playSuccessSound()
      onClose()
    } catch {
      setError('Error al registrar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-2 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-900 space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Nuevo Registro
      </p>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
          Tipo
        </p>
        <div className="flex gap-2">
          {([
            { key: 'deposicion' as const, label: 'CAGADA', Icon: Trash2Icon, color: 'bg-orange-400 dark:bg-orange-500' },
            { key: 'acto_sexual' as const, label: 'CULEADA', Icon: Flame, color: 'bg-pink-400 dark:bg-pink-500' },
            { key: 'gym' as const, label: 'GYM', Icon: Dumbbell, color: 'bg-cyan-400 dark:bg-cyan-500' },
          ]).map(({ key, label, Icon, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => { playClickSound(); setTipo(key) }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 border-2 border-black dark:border-white font-black text-[9px] uppercase tracking-wider transition-all ${
                tipo === key
                  ? `${color} text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                  : 'bg-white dark:bg-gray-800 text-black dark:text-white'
              }`}
            >
              <Icon size={14} strokeWidth={2.5} />
              {label}
            </button>
          ))}
        </div>
      </div>

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
          {saving ? 'Guardando...' : 'Registrar'}
        </button>
        <button
          onClick={() => { playCloseSound(); onClose() }}
          className="flex-1 flex items-center justify-center gap-1 py-2 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <X size={12} strokeWidth={2.5} />
          Cancelar
        </button>
      </div>
    </div>
  )
}
