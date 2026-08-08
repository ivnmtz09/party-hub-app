import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { playSuccessSound, playStarSound } from '../../../utils/audio'
import { UPDATE_CARDS, UPDATE_CARDS_STORAGE_KEY } from '../data/updateCards'

export default function UpdatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const card = UPDATE_CARDS[index]!
  const isLast = index === UPDATE_CARDS.length - 1

  const handleNext = () => {
    playStarSound()
    if (isLast) {
      playSuccessSound()
      localStorage.setItem(UPDATE_CARDS_STORAGE_KEY(user?.uid ?? ''), 'true')
      navigate('/home')
      return
    }
    setIndex((i) => Math.min(i + 1, UPDATE_CARDS.length - 1))
  }

  const Icon = card.icon

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border-2 border-black dark:border-white px-2 py-1">
          Novedades
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white">
          {index + 1} / {UPDATE_CARDS.length}
        </span>
      </div>

      <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,1)] overflow-hidden">
        <div className={`h-3 bg-gradient-to-r ${card.gradient}`} />
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div className={`w-16 h-16 border-2 border-black dark:border-white bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`}>
            <Icon size={30} strokeWidth={2.5} className="text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,0.6)]" />
          </div>

          <h2 className="text-xl font-black uppercase tracking-wider text-black dark:text-white leading-tight">
            {card.title}
          </h2>

          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {card.subtitle}
          </p>

          <ul className="flex flex-col gap-2.5">
            {card.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className={`mt-0.5 shrink-0 w-5 h-5 border-2 border-black dark:border-white bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Check size={12} strokeWidth={3.5} className="text-white" />
                </span>
                <span className="text-sm font-bold text-black dark:text-white leading-snug">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-center gap-1.5 mt-1">
            {UPDATE_CARDS.map((c, i) => (
              <span
                key={c.id}
                className={`h-2.5 border-2 border-black dark:border-white transition-all ${
                  i === index
                    ? 'w-8 bg-green-400'
                    : i < index
                      ? 'w-2.5 bg-gray-300 dark:bg-gray-600'
                      : 'w-2.5 bg-white dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className={`w-full flex items-center justify-center gap-2 py-4 border-4 border-black dark:border-white font-black uppercase tracking-wider text-black dark:text-gray-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${
              isLast
                ? 'bg-green-400 dark:bg-green-500'
                : `bg-gradient-to-r ${card.gradient} text-white`
            }`}
          >
            {isLast ? (
              <>
                <Check size={18} strokeWidth={2.5} />
                Lo Tengo
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}