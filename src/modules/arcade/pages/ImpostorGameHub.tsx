import { useState } from 'react'
import { Smartphone, Wifi, Info, X } from 'lucide-react'
import { useGame } from '../context/GameContext'
import GameHeader from '../../../components/GameHeader'
import ImpostorSetupPage from './ImpostorSetupPage'
import ImpostorOnlinePage from './ImpostorOnlinePage'
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
    if (mode === 'online') return <ImpostorOnlinePage onExit={() => setMode(null)} />
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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-950 text-black dark:text-white flex flex-col animate-fade-in-up">
      <div className="w-full max-w-md mx-auto p-4">
        <GameHeader title="El Impostor" backTo="/arcade" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-md mx-auto w-full p-4">
        <div className="w-full text-center space-y-2">
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
          </button>

          <button
            onClick={() => setIsInfoModalOpen(true)}
            aria-label="Ver instrucciones"
            className="w-full flex items-center justify-center py-4 border-4 border-black bg-yellow-400 text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <Info size={32} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-white text-black border-4 border-black p-6 w-11/12 max-w-lg shadow-[8px_8px_0px_rgba(255,255,255,1)] flex flex-col gap-4 max-h-[90dvh] overflow-y-auto">
            <button
              onClick={() => setIsInfoModalOpen(false)}
              aria-label="Cerrar instrucciones"
              className="absolute top-3 right-3 w-10 h-10 bg-red-500 text-white border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center"
            >
              <X size={20} strokeWidth={3} />
            </button>
            <h2 className="text-3xl sm:text-4xl font-black uppercase border-b-4 border-black pb-2 pr-12">
              Como jugar
            </h2>

            <div className="space-y-2">
              <p className="font-black uppercase tracking-wider text-sm border-b-2 border-black pb-1">
                El objetivo
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                Descubrir quien es el impostor antes de que termine la ronda, o sobrevivir sin ser
                descubierto si tu eres el impostor.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-black uppercase tracking-wider text-sm border-b-2 border-black pb-1">
                Los civiles
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                Reciben una palabra secreta. Por turnos, todos deben decir en voz alta una palabra
                relacionada para demostrar que saben de lo que hablan, pero sin ser muy obvios para
                no regalarle la palabra al impostor.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-black uppercase tracking-wider text-sm border-b-2 border-black pb-1">
                El impostor
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                No conoce la palabra secreta. Dependiendo de la configuracion, puede recibir una
                pista o jugar totalmente a ciegas. Su mision es escuchar a los demas, deducir el
                contexto y decir una palabra que encaje para pasar desapercibido.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-black uppercase tracking-wider text-sm border-b-2 border-black pb-1">
                La votacion
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">
                Al final de la ronda, los jugadores debaten y votan por quien creen que es el
                impostor. Si la mayoria acierta, ganan los civiles. Si se equivocan, gana el
                impostor.
              </p>
            </div>

            <button
              onClick={() => setIsInfoModalOpen(false)}
              className="bg-green-400 border-4 border-black font-black uppercase tracking-wider p-3 w-full shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}