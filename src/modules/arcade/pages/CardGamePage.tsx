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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col p-4 sm:p-6 transition-colors text-black dark:text-white">
      <div className="w-full max-w-md mx-auto pt-2 pb-8">
        <GameHeader title={deck.titulo} backTo="/arcade" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto pb-12">
        <CardGameEngine deck={deck} />
      </div>
    </div>
  )
}
