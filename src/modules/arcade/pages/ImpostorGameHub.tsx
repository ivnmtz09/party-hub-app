import { useState } from 'react'
import { Smartphone, Wifi, ArrowLeft } from 'lucide-react'
import { useGame } from '../context/GameContext'
import GameHeader from '../../../components/GameHeader'
import ImpostorSetupPage from './ImpostorSetupPage'
import RoleRevealPage from './RoleRevealPage'
import DebatePage from './DebatePage'
import VotingPage from './VotingPage'
import ResultsPage from './ResultsPage'

type GameMode = 'local' | 'online'

export default function ImpostorGameHub() {
  const { state } = useGame()
  const [mode, setMode] = useState<GameMode | null>(null)

  if (!state) {
    if (mode === null) return <ModeSelection onSelect={setMode} />
    if (mode === 'online') return <OnlineComingSoon onBack={() => setMode(null)} />
    return <ImpostorSetupPage />
  }

  switch (state.phase) {
    case 'Setup':
      return <ImpostorSetupPage />
    case 'Reveal':
      return <RoleRevealPage />
    case 'Debate':
      return <DebatePage />
    case 'Voting':
      return <VotingPage />
    case 'Result':
      return <ResultsPage />
    default:
      return <ImpostorSetupPage />
  }
}

function ModeSelection({ onSelect }: { onSelect: (mode: GameMode) => void }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <div className="w-full max-w-md mx-auto p-4">
        <GameHeader title="El Impostor" backTo="/arcade" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full p-4">
        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-widest text-fuchsia-500 dark:text-fuchsia-400">
            Modo de juego
          </p>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider">
            Elige como jugar
          </h1>
        </div>

        <div className="w-full space-y-5">
          <button
            onClick={() => onSelect('local')}
            className="w-full flex items-center gap-4 p-5 border-4 border-black bg-cyan-300 text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="w-14 h-14 border-2 border-black bg-white flex items-center justify-center shrink-0">
              <Smartphone size={28} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <p className="font-black uppercase tracking-wider text-lg">Un solo celular</p>
              <p className="text-xs font-bold text-black/70">
                Pasa el telefono y revela roles uno por uno
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelect('online')}
            className="w-full flex items-center gap-4 p-5 border-4 border-black bg-fuchsia-300 text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <div className="w-14 h-14 border-2 border-black bg-white flex items-center justify-center shrink-0">
              <Wifi size={28} strokeWidth={2.5} />
            </div>
            <div className="text-left flex-1">
              <p className="font-black uppercase tracking-wider text-lg">Sala en linea</p>
              <p className="text-xs font-bold text-black/70">
                Crea una sala y juega con otros dispositivos
              </p>
            </div>
            <span className="border-2 border-black bg-black text-white text-[10px] font-black uppercase tracking-widest px-2 py-1">
              Proximamente
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function OnlineComingSoon({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <div className="w-full max-w-md mx-auto p-4">
        <GameHeader title="El Impostor" backTo="/arcade" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full p-4">
        <div className="w-full border-4 border-black bg-white dark:bg-gray-800 p-8 shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-2 border-black bg-fuchsia-300 flex items-center justify-center">
            <Wifi size={32} strokeWidth={2.5} className="text-black" />
          </div>
          <p className="font-black uppercase tracking-wider text-lg text-center">
            Sala en linea
          </p>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 text-center">
            El modo en linea llegara pronto. Mientras tanto juega en un solo celular.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 py-4 border-4 border-black bg-yellow-300 text-black font-black uppercase tracking-wider text-base shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
          Volver al menu
        </button>
      </div>
    </div>
  )
}