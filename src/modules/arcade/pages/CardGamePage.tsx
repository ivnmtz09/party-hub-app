import { useParams, Navigate } from 'react-router-dom'
import { getDeckById } from '../data/decks'
import CardGameEngine from '../components/CardGameEngine'

export default function CardGamePage() {
  const { deckId } = useParams<{ deckId: string }>()
  const deck = deckId ? getDeckById(deckId) : undefined

  if (!deck) {
    return <Navigate to="/arcade" replace />
  }

  return <CardGameEngine deck={deck} />
}
