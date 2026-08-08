import { useState } from 'react'
import {
  X,
  Star,
  Camera,
  Edit,
  Trash2,
  Flame,
  Dumbbell,
  Droplets,
  Save,
} from 'lucide-react'
import { useNeoToast } from '../../../components/NeoToast'
import { useAppContent } from '../../../context/ContentContext'
import { getActividadGradient } from '../../../config/actividades'
import { playCagadaSound, playCuleadaSound, playGymSound, playMeadaSound, playSuccessSound, playCloseSound, playStarSound, playToggleOffSound } from '../../../utils/audio'

interface Props {
  groupId: string
  userId: string
  onClose: () => void
  onSave: (tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada', data: { rating: number; note: string; photoUrl: string }) => Promise<void>
}

const PHOTO_DISABLED_MESSAGE = 'SUBIDA DE IMAGENES TEMPORALMENTE DESHABILITADA'

export default function RecordInlineForm({ onClose, onSave }: Props) {
  const { showToast } = useNeoToast()
  const { content } = useAppContent()
  const findAct = (t: string) => content.actividades.find((a) => a.tipo === t)

  const TIPO_OPTIONS = [
    { tipo: 'deposicion' as const, label: findAct('deposicion')?.label ?? 'CAGADA', icon: Trash2, color: findAct('deposicion')?.badgeColor ?? 'bg-orange-400 dark:bg-orange-500' },
    { tipo: 'acto_sexual' as const, label: findAct('acto_sexual')?.label ?? 'CULEADA', icon: Flame, color: findAct('acto_sexual')?.badgeColor ?? 'bg-pink-400 dark:bg-pink-500' },
    { tipo: 'gym' as const, label: findAct('gym')?.label ?? 'GYM', icon: Dumbbell, color: findAct('gym')?.badgeColor ?? 'bg-cyan-400 dark:bg-cyan-500' },
    { tipo: 'meada' as const, label: findAct('meada')?.label ?? 'MEADA', icon: Droplets, color: findAct('meada')?.badgeColor ?? 'bg-yellow-400 dark:bg-yellow-500' },
  ]

  const [selectedTipo, setSelectedTipo] = useState<'deposicion' | 'acto_sexual' | 'gym' | 'meada' | null>(null)
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSelectTipo = (tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada') => {
    if (tipo === 'deposicion') playCagadaSound()
    else if (tipo === 'acto_sexual') playCuleadaSound()
    else if (tipo === 'meada') playMeadaSound()
    else playGymSound()
    setSelectedTipo(tipo)
  }

  const handlePhotoDisabledClick = () => {
    showToast(PHOTO_DISABLED_MESSAGE)
  }

  const handleSave = async () => {
    if (!selectedTipo) return
    setSaving(true)
    setError('')
    try {
      await onSave(selectedTipo, { rating, note, photoUrl: '' })
      playSuccessSound()
      onClose()
    } catch (err) {
      setError((err as Error).message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const selectedCfg = selectedTipo ? TIPO_OPTIONS.find((o) => o.tipo === selectedTipo) : null

  return (
    <div className="border-4 border-black dark:border-white border-t-0 bg-white dark:bg-gray-800 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] space-y-3">
      <div className="flex items-center justify-between">
        {selectedCfg ? (
          <div className={`flex items-center gap-2 py-1.5 px-3 border-2 border-black dark:border-white bg-gradient-to-r ${getActividadGradient(selectedCfg.tipo)} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
            <selectedCfg.icon size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-wider text-white">
              Nuevo Registro - {selectedCfg.label}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-1.5 px-3 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[11px] font-black uppercase tracking-wider text-black">
              Selecciona un tipo
            </span>
          </div>
        )}
        <button
          onClick={() => { playCloseSound(); onClose() }}
          className="p-1.5 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {!selectedTipo ? (
        <div className="flex flex-col gap-2">
          {TIPO_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.tipo}
                onClick={() => handleSelectTipo(opt.tipo)}
                className={`flex items-center gap-3 py-3 px-4 border-4 border-black dark:border-white bg-gradient-to-r ${getActividadGradient(opt.tipo)} text-white font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all`}
              >
                <Icon size={20} strokeWidth={2.5} />
                {opt.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => { playToggleOffSound(); setSelectedTipo(null); setRating(0); setNote(''); setError(''); }}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Cambiar tipo
          </button>

          <div className="border-4 border-black dark:border-white p-3 bg-gray-50 dark:bg-gray-700">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              Calificacion
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { playStarSound(); setRating(n) }}
                  className="cursor-pointer active:scale-110 transition-transform"
                >
                  <Star
                    size={24}
                    strokeWidth={2.5}
                    className={
                      n <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }
                  />
                </button>
              ))}
            </div>
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
              className="w-full py-2 px-3 border-4 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 resize-none"
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
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-not-allowed opacity-70 transition-colors"
              >
                <Camera size={14} strokeWidth={2.5} />
                Camara
              </button>
              <button
                type="button"
                onClick={handlePhotoDisabledClick}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-700 text-black dark:text-white font-bold text-[10px] uppercase tracking-wider cursor-not-allowed opacity-70 transition-colors"
              >
                <Edit size={14} strokeWidth={2.5} />
                Galeria
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 font-black text-xs uppercase tracking-wider">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-4 border-black dark:border-white bg-gradient-to-r from-emerald-400 to-teal-600 text-white font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              <Save size={14} strokeWidth={2.5} />
              {saving ? 'Procesando...' : 'Registrar'}
            </button>
            <button
              onClick={() => { playCloseSound(); onClose() }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-4 border-black dark:border-white bg-gray-200 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <X size={14} strokeWidth={2.5} />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}