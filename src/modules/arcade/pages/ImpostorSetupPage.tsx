import { useState, useEffect } from 'react'
import { cargarPartidaImpostor } from '../../../firebase/services'
import {
  Users,
  UserPlus,
  X,
  Tags,
  Play,
  Plus,
  Minus,
  HelpCircle,
} from 'lucide-react'
import GameHeader from '../../../components/GameHeader'
import GameInfoModal from '../../../components/GameInfoModal'
import { useGame } from '../context/GameContext'
import { useAppContent } from '../../../context/ContentContext'
import { Icono } from '../../../config/iconos'
import { IMPOSTOR_RULES } from '../data/impostorRules'

const MAX_IMPOSTORS = 3

export default function ImpostorSetupPage() {
  const { startGame } = useGame()
  const { content } = useAppContent()

  const [names, setNames] = useState<string[]>([])
  const [inputName, setInputName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('impostor_categories')
    if (saved) {
      try {
        return new Set(JSON.parse(saved) as string[])
      } catch { /* ignore */ }
    }
    const first = content.categorias[0]?.name
    return new Set(first ? [first] : [])
  })
  const [impostorCount, setImpostorCount] = useState(1)
  const [cluesEnabled, setCluesEnabled] = useState(true)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    cargarPartidaImpostor().then((saved) => {
      if (saved && saved.playerNames.length > 0) {
        setNames(saved.playerNames)
      }
    })
  }, [])

  const addName = () => {
    const trimmed = inputName.trim()
    if (trimmed && !names.includes(trimmed)) {
      setNames([...names, trimmed])
      setInputName('')
    }
  }

  const removeName = (name: string) => {
    setNames(names.filter((n) => n !== name))
  }

  useEffect(() => {
    localStorage.setItem('impostor_categories', JSON.stringify(Array.from(selectedCategories)))
  }, [selectedCategories])

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  const handleStart = () => {
    if (names.length < 3 || selectedCategories.size === 0) return
    startGame({
      playerNames: names,
      impostorCount,
      categories: Array.from(selectedCategories),
      cluesEnabled,
    })
  }

  const canStart = names.length >= 3 && selectedCategories.size > 0

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white">
      <div className="w-full max-w-md mx-auto p-4 space-y-5">
        <GameHeader title="El Impostor" backTo="/arcade" onInfo={() => setShowInfo(true)} />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
          Configura la partida en un solo celular
        </p>

        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark animate-fade-in-up space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center">
              <Users size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
            </div>
            <div>
              <p className="font-black uppercase tracking-wider text-sm">
                Jugadores ({names.length})
              </p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                Mínimo 3 para jugar
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addName()}
              placeholder="Ej: Juank, Sauditha, Oscar..."
              className="flex-1 border-2 border-black dark:border-white bg-white dark:bg-gray-700 px-3 py-2 text-sm font-bold text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
            />
            <button
              onClick={addName}
              disabled={!inputName.trim()}
              className="px-4 border-2 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
            >
              <UserPlus size={18} strokeWidth={2.5} />
            </button>
          </div>

          {names.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {names.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-700 px-3 py-2"
                >
                  <span className="font-bold text-sm text-black dark:text-white truncate">
                    {name}
                  </span>
                  <button
                    onClick={() => removeName(name)}
                    className="p-1 border border-black dark:border-white bg-red-300 dark:bg-red-500 text-black dark:text-gray-900 hover:bg-red-400 dark:hover:bg-red-400 transition-colors"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t-2 border-black dark:border-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-black dark:border-white bg-red-300 dark:bg-red-500 flex items-center justify-center">
                <Minus size={14} strokeWidth={3} className="text-black dark:text-gray-900" />
              </div>
              <div>
                <p className="font-black uppercase tracking-wider text-xs">
                  Impostores
                </p>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Máx {MAX_IMPOSTORS}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setImpostorCount(Math.max(1, impostorCount - 1))}
                className="w-10 h-10 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-black dark:text-white"
              >
                <Minus size={18} strokeWidth={3} />
              </button>
              <span className="text-xl font-black w-8 text-center">{impostorCount}</span>
              <button
                onClick={() => setImpostorCount(Math.min(MAX_IMPOSTORS, impostorCount + 1))}
                className="w-10 h-10 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-700 flex items-center justify-center shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-black dark:text-white"
              >
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark animate-fade-in-up space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black dark:border-white bg-fuchsia-300 dark:bg-fuchsia-500 flex items-center justify-center">
              <Tags size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
            </div>
            <div>
              <p className="font-black uppercase tracking-wider text-sm">
                Categorías
              </p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                Selecciona al menos una
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {content.categorias.map((cat) => {
              const Icon = Icono(cat.icon)
              const active = selectedCategories.has(cat.name)
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleCategory(cat.name)}
                  className={`flex items-center gap-2 px-3 py-3 border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon size={18} strokeWidth={2.5} />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark animate-fade-in-up flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black dark:border-white bg-cyan-300 dark:bg-cyan-500 flex items-center justify-center">
              <HelpCircle size={20} strokeWidth={2.5} className="text-black dark:text-gray-900" />
            </div>
            <div>
              <p className="font-black uppercase tracking-wider text-sm">
                Habilitar pistas para el impostor
              </p>
              <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                El impostor verá una pista de la palabra
              </p>
            </div>
          </div>
          <button
            onClick={() => setCluesEnabled(!cluesEnabled)}
            aria-pressed={cluesEnabled}
            className={`w-14 h-8 border-2 border-black dark:border-white transition-colors duration-200 ${
              cluesEnabled ? 'bg-emerald-400 dark:bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 border-2 border-black dark:border-white bg-white transition-transform duration-200 ${
                cluesEnabled ? 'translate-x-7' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play size={22} strokeWidth={2.5} />
          Iniciar Partida
        </button>
      </div>

      {showInfo && (
        <GameInfoModal
          title="El Impostor"
          rules={IMPOSTOR_RULES}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  )
}