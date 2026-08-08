import { useState } from 'react'
import { Star, Save, X, Camera, Edit, Trash2, Trash2Icon, Flame, Dumbbell, Droplets } from 'lucide-react'
import { registrarEvento } from '../../../firebase/services'
import { useNeoToast } from '../../../components/NeoToast'
import { useAppContent } from '../../../context/ContentContext'
import { getActividadGradient } from '../../../config/actividades'
import { playStarSound, playDeleteSound, playSuccessSound, playCloseSound, playClickSound } from '../../../utils/audio'

interface Props {
  userId: string
  onClose: () => void
}

export default function ActivityCreateForm({ userId, onClose }: Props) {
  const { showToast } = useNeoToast()
  const { content } = useAppContent()
  const findAct = (t: string) => content.actividades.find((a) => a.tipo === t)

const OPCIONES = [
    { key: 'deposicion' as const, label: findAct('deposicion')?.label ?? 'CAGADA', Icon: Trash2Icon, color: findAct('deposicion')?.badgeColor ?? 'bg-orange-400 dark:bg-orange-500' },
    { key: 'acto_sexual' as const, label: findAct('acto_sexual')?.label ?? 'CULEADA', Icon: Flame, color: findAct('acto_sexual')?.badgeColor ?? 'bg-pink-400 dark:bg-pink-500' },
    { key: 'gym' as const, label: findAct('gym')?.label ?? 'GYM', Icon: Dumbbell, color: findAct('gym')?.badgeColor ?? 'bg-cyan-400 dark:bg-cyan-500' },
    { key: 'meada' as const, label: findAct('meada')?.label ?? 'MEADA', Icon: Droplets, color: findAct('meada')?.badgeColor ?? 'bg-yellow-400 dark:bg-yellow-500' },
  ]

  const [tipo, setTipo] = useState<'deposicion' | 'acto_sexual' | 'gym' | 'meada'>('deposicion')
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

  const handlePhotoDisabledClick = () => {
    showToast('SUBIDA DE IMÁGENES TEMPORALMENTE DESHABILITADA')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await registrarEvento(userId, tipo, { rating, note, photoUrl })
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
          {OPCIONES.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { playClickSound(); setTipo(key) }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 border-2 border-black dark:border-white font-black text-[9px] uppercase tracking-wider transition-all ${
                tipo === key
                  ? `bg-gradient-to-r ${getActividadGradient(key)} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
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
          Calificación
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
            Cámara
          </button>
          <button
            type="button"
            onClick={handlePhotoDisabledClick}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border-2 border-black dark:border-white bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-not-allowed opacity-70 transition-colors"
          >
            <Edit size={12} strokeWidth={2.5} />
            Galería
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
          className="flex-1 flex items-center justify-center gap-1 py-2 border-2 border-black dark:border-white bg-gradient-to-r from-emerald-400 to-teal-600 text-white font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
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
