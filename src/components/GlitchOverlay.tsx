import { useEffect } from 'react'
import { playGlitchSound } from '../utils/audio'

interface Props {
  title: string
  onComplete: () => void
}

const BARS = [
  { top: '12%', height: 12, width: '100%', color: '#22d3ee', delay: -0.15 },
  { top: '26%', height: 6, width: '70%', color: '#f0abfc', delay: -0.45 },
  { top: '43%', height: 15, width: '100%', color: '#fde047', delay: -0.05 },
  { top: '59%', height: 7, width: '55%', color: '#ffffff', delay: -0.6 },
  { top: '76%', height: 12, width: '100%', color: '#f0abfc', delay: -0.3 },
  { top: '90%', height: 6, width: '80%', color: '#22d3ee', delay: -0.75 },
]

export default function GlitchOverlay({ title, onComplete }: Props) {
  useEffect(() => {
    playGlitchSound()
    const timer = setTimeout(onComplete, 950)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[999] bg-black overflow-hidden glitch-overlay">
      <div className="absolute inset-0 glitch-noise" />
      <div className="absolute inset-0 glitch-scanlines" />
      <div className="absolute inset-0 glitch-flash" />

      {BARS.map((b, i) => (
        <div
          key={i}
          className="absolute left-0 glitch-bar"
          style={{
            top: b.top,
            height: b.height,
            width: b.width,
            backgroundColor: b.color,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <p className="font-black uppercase tracking-widest text-[10px] text-cyan-300 mb-6 animate-pulse">
          CORRUPCIÓN DE DATOS
        </p>
        <h1
          className="glitch-text text-4xl sm:text-5xl font-black uppercase tracking-tighter text-white"
          data-text={title}
        >
          {title}
        </h1>
        <div className="w-56 sm:w-72 mt-10 h-3 border-2 border-white">
          <div className="h-full bg-fuchsia-400 glitch-progress" />
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
          ABRIENDO ARCADE...
        </p>
      </div>
    </div>
  )
}
