import { useEffect, useRef, useState, type ReactNode } from 'react'
import { playShuffleSound } from '../../../utils/audio'

interface Props {
  children: ReactNode
}

const BARS = [
  { top: '22%', height: 10, color: '#22d3ee', delay: -0.05 },
  { top: '48%', height: 14, color: '#f0abfc', delay: -0.2 },
  { top: '73%', height: 8, color: '#fde047', delay: -0.35 },
]

export default function ArcadeGlitchAmbient({ children }: Props) {
  const [active, setActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const schedule = () => {
      timerRef.current = setTimeout(() => {
        if (document.visibilityState === 'hidden') {
          schedule()
          return
        }
        setActive(true)
        playShuffleSound()
        timerRef.current = setTimeout(() => {
          setActive(false)
          schedule()
        }, 450 + Math.random() * 300)
      }, 4000 + Math.random() * 6000)
    }
    schedule()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className={active ? 'glitch-page' : ''}>
      {children}

      {active && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 glitch-noise opacity-20" />
          <div className="absolute inset-0 glitch-scanlines" />
          <div className="absolute inset-0 glitch-flash" />
          {BARS.map((b, i) => (
            <div
              key={i}
              className="absolute left-0 glitch-bar"
              style={{
                top: b.top,
                height: b.height,
                width: '100%',
                backgroundColor: b.color,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
