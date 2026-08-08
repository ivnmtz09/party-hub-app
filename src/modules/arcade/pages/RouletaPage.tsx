import { useState, useRef, useCallback } from 'react'
import { RotateCw, ListPlus, RefreshCw } from 'lucide-react'
import GameHeader from '../../../components/GameHeader'
import { playTapSound } from '../../../utils/audio'

const COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9',
  '#10B981', '#F59E0B', '#84CC16', '#6366F1',
]

export default function RouletaPage() {
  const [inputText, setInputText] = useState('')
  const [items, setItems] = useState<string[]>([])
  const [parsedPreview, setParsedPreview] = useState<string[]>([])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  const handleLoad = () => {
    const parsed = inputText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parsed.length < 2) return
    setParsedPreview([])
    setItems(parsed)
    setRotation(0)
    setResult(null)
  }

  const previewParsed = () => {
    const parsed = inputText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    setParsedPreview(parsed.slice(0, 12))
  }

  const handleReset = () => {
    playTapSound()
    setItems([])
    setParsedPreview([])
    setRotation(0)
    setResult(null)
    setInputText('')
  }

  const handleSpin = useCallback(() => {
    if (items.length < 2 || spinning) return
    setSpinning(true)
    setResult(null)

    const extraSpins = 5 + Math.floor(Math.random() * 8)
    const extraAngle = Math.floor(Math.random() * 360)
    const totalAngle = extraSpins * 360 + extraAngle
    const newRotation = rotation + totalAngle

    setRotation(newRotation)
  }, [items, spinning, rotation])

  const handleTransitionEnd = () => {
    if (!spinning) return
    setSpinning(false)

    const sectorAngle = 360 / items.length
    const normalizedAngle = ((rotation % 360) + 360) % 360
    const selectedIndex =
      (items.length - Math.floor((normalizedAngle + sectorAngle / 2) / sectorAngle)) %
      items.length

    const selected = items[selectedIndex]!
    setResult(selected)
  }

  const sectorAngle = items.length > 0 ? 360 / items.length : 0
  const gradientStops = items
    .map((_, i) => {
      const start = i * sectorAngle
      const end = (i + 1) * sectorAngle
      const color = COLORS[i % COLORS.length]
      return `${color} ${start}deg ${end}deg`
    })
    .join(', ')

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
      <div className="flex-1 w-full max-w-lg mx-auto p-4 space-y-5">
        <GameHeader title="Ruleta" backTo="/arcade" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
          Personaliza tu ruleta y girala
        </p>

          <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase tracking-wider text-xs text-black dark:text-white">
                Elementos (uno por linea o separados por comas)
              </p>
              {items.length === 0 && inputText.trim() && (
                <button
                  onClick={previewParsed}
                  className="px-2 py-1 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-wider text-[10px] shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  PREVISUALIZAR
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ej: Opcion 1, Opcion 2, Opcion 3"
              rows={4}
              className="w-full border-4 border-black dark:border-white bg-gray-50 dark:bg-gray-700 text-black dark:text-white font-bold text-sm p-3 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none"
            />
            {parsedPreview.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {parsedPreview.map((it, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-black uppercase tracking-wider bg-white dark:bg-gray-700 text-black dark:text-white border border-black dark:border-white px-2 py-1"
                  >
                    {it.slice(0, 14)}{it.length > 14 ? '…' : ''}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleLoad}
                disabled={!inputText.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ListPlus size={18} strokeWidth={2.5} />
                CARGAR
              </button>
              <button
                onClick={handleReset}
                disabled={items.length === 0 && !inputText.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-gray-300 dark:bg-gray-600 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} strokeWidth={2.5} />
                REINICIAR
              </button>
            </div>
            {items.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 text-center">
                {items.length} elementos cargados
              </p>
            )}
          </div>

        {items.length > 0 && (
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <div className="relative w-full h-full">
                <div
                  ref={wheelRef}
                  onTransitionEnd={handleTransitionEnd}
                  className="w-full h-full rounded-full border-[6px] border-black shadow-[0_0_0_4px_rgba(0,0,0,0.15),8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0_0_0_4px_rgba(255,255,255,0.15),8px_8px_0px_0px_rgba(255,255,255,1)] relative"
                  style={{
                    background: `conic-gradient(${gradientStops})`,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning
                      ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                      : 'none',
                  }}
                >
                  <div className="absolute inset-2 rounded-full border-[3px] border-black/30 pointer-events-none" />
                  <div className="absolute inset-0 rounded-full border-2 border-black/20 pointer-events-none" />
                </div>
                <div className="absolute inset-0 pointer-events-none">
                  {items.map((item, i) => {
                    const midAngle = i * sectorAngle + sectorAngle / 2
                    const normalizedAngle = ((midAngle % 360) + 360) % 360
                    const flip = normalizedAngle > 90 && normalizedAngle < 270
                    const rotateFix = flip ? 180 : 0
                    const fontSize = items.length > 12 ? 8 : items.length > 7 ? 10 : 13
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2 font-black uppercase text-white leading-none whitespace-nowrap"
                        style={{
                          fontSize,
                          transform: `rotate(${midAngle}deg) translateX(50%) rotate(${rotateFix}deg)`,
                          transformOrigin: '0 0',
                          textShadow:
                            '0 1px 0 #000, 1px 0 0 #000, 0 -1px 0 #000, -1px 0 0 #000, 1px 1px 2px rgba(0,0,0,0.7)',
                        }}
                      >
                        {item}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className={`w-0 h-0 border-l-[15px] border-r-[15px] border-t-[26px] border-l-transparent border-r-transparent border-t-yellow-300 drop-shadow-[2px_3px_0px_rgba(0,0,0,1)] ${spinning ? 'animate-bounce' : ''}`} />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full border-4 border-black bg-yellow-300 dark:bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <RotateCw size={18} strokeWidth={3} className={`text-black dark:text-gray-900 ${spinning ? 'animate-spin' : ''}`} />
                </div>
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className={`w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white text-black font-black uppercase tracking-wider text-xl shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                spinning
                  ? 'bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 animate-pulse'
                  : 'bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 hover:bg-yellow-400 dark:hover:bg-yellow-500'
              }`}
            >
              <RotateCw size={28} strokeWidth={2.5} className={spinning ? 'animate-spin' : ''} />
              {spinning ? 'GIRANDO...' : 'GIRAR RULETA'}
            </button>
          </div>
        )}

        {result && items.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none animate-fade-in">
            <div className="relative w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-lg dark:shadow-brutal-lg-dark p-8 text-center space-y-6 overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-3"
                style={{ backgroundColor: COLORS[items.indexOf(result) % COLORS.length] }}
              />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Resultado
              </p>
              <p className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black dark:text-white animate-blink break-words">
                {result}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {items.length} opciones en la ruleta
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="w-full py-4 border-4 border-black dark:border-white bg-emerald-400 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  MANTENER
                </button>
                <button
                  onClick={() => {
                    setItems((prev) => prev.filter((i) => i !== result))
                    setResult(null)
                  }}
                  className="w-full py-4 border-4 border-black dark:border-white bg-red-400 dark:bg-red-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-lg shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  ELIMINAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
