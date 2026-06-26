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
    <>
      <GameHeader title={deck.titulo} backTo="/arcade" />
      <CardGameEngine deck={deck} />
    </>
  )
}
