import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCw, ListPlus, ArrowLeft } from 'lucide-react'
import ArcadeHeader from '../components/ArcadeHeader'

const COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F43F5E', '#A855F7', '#0EA5E9',
  '#10B981', '#F59E0B', '#84CC16', '#6366F1',
]

export default function RouletaPage() {
  const navigate = useNavigate()
  const [inputText, setInputText] = useState('')
  const [items, setItems] = useState<string[]>([])
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
    setItems(parsed)
    setRotation(0)
    setResult(null)
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
    <div className="relative min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col">
      <button
        onClick={() => navigate('/arcade')}
        className="absolute top-4 left-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-white shadow-brutal-sm p-2 z-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        <ArrowLeft size={16} strokeWidth={2.5} className="text-black dark:text-white" />
      </button>
      <ArcadeHeader />
      <div className="flex-1 w-full max-w-lg mx-auto p-4 space-y-5">

        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-widest">Ruleta</h1>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">
            Personaliza tu ruleta y girala
          </p>
        </div>

        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 p-4 shadow-brutal dark:shadow-brutal-dark space-y-3">
          <p className="font-black uppercase tracking-wider text-xs text-black dark:text-white">
            Elementos (uno por linea o separados por comas)
          </p>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ej: Opcion 1, Opcion 2, Opcion 3"
            rows={4}
            className="w-full border-4 border-black dark:border-white bg-gray-50 dark:bg-gray-700 text-black dark:text-white font-bold text-sm p-3 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none"
          />
          <button
            onClick={handleLoad}
            disabled={!inputText.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-fuchsia-400 dark:bg-fuchsia-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ListPlus size={18} strokeWidth={2.5} />
            CARGAR EN RULETA
          </button>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col items-center gap-5">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72">
              <div className="relative w-full h-full">
                <div
                  ref={wheelRef}
                  onTransitionEnd={handleTransitionEnd}
                  className="w-full h-full rounded-full border-[6px] border-black"
                  style={{
                    background: `conic-gradient(${gradientStops})`,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning
                      ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                      : 'none',
                  }}
                />
                <div className="absolute inset-0 pointer-events-none">
                  {items.map((item, i) => {
                    const midAngle = i * sectorAngle + sectorAngle / 2
                    const normalizedAngle = ((midAngle % 360) + 360) % 360
                    const flip = normalizedAngle > 90 && normalizedAngle < 270
                    const rotateFix = flip ? 180 : 0
                    return (
                      <div
                        key={i}
                        className="absolute left-1/2 top-1/2 font-black uppercase text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-none whitespace-nowrap"
                        style={{
                          transform: `rotate(${midAngle}deg) translateX(50%) rotate(${rotateFix}deg)`,
                          transformOrigin: '0 0',
                        }}
                      >
                        {item}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full border-[4px] border-black bg-white dark:bg-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
              </div>
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full flex items-center justify-center gap-3 py-5 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 text-black dark:text-gray-900 font-black uppercase tracking-wider text-xl shadow-brutal dark:shadow-brutal-dark active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCw size={28} strokeWidth={2.5} />
              GIRAR RULETA
            </button>
          </div>
        )}

        {result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 select-none">
            <div className="w-full max-w-md border-4 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-lg dark:shadow-brutal-lg-dark p-8 text-center space-y-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Resultado
              </p>
              <p className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black dark:text-white animate-blink break-words">
                {result}
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
