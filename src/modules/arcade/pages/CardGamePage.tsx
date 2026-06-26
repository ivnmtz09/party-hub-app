import { useParams, Navigate } from 'react-router-dom'
import { getDeckById } from '../data/decks'
import CardGameEngine from '../components/CardGameEngine'
import GameHeader from '../../../components/GameHeader'

export default function CardGamePage() {
  const { deckId } = useParams<{ deckId: string }>()
  const deck = deckId ? getDeckById(deckId) : undefined

  if (!deck) {
    return <Navigate to="/arcade" replace />
  }

  const pageBg = deck.esTurbio ? 'bg-red-900' : 'bg-white dark:bg-gray-950'

  return (
    <div className={`min-h-[100dvh] ${pageBg} text-black dark:text-white flex flex-col animate-fade-in-up`}>
      <GameHeader title="YO NUNCA" backTo="/arcade" />
      <div className="flex-1 flex items-center justify-center">
        <CardGameEngine deck={deck} />
      </div>
    </div>
  )
}
