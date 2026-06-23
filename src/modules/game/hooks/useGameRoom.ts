import { useEffect, useState, useCallback } from 'react'
import {
  crearSala,
  unirseSala,
  observarSala,
  iniciarPartida,
  avanzarFase,
  emitirVoto,
  sumarPuntaje,
  siguienteRonda,
  abandonarSala,
  type Sala,
} from '../../../firebase/services'

interface UseGameRoomOptions {
  userId: string
  displayName: string
  onError?: (msg: string) => void
}

export function useGameRoom({ userId, displayName, onError }: UseGameRoomOptions) {
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [sala, setSala] = useState<Sala | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!roomCode) return
    const unsub = observarSala(roomCode, (data) => {
      setSala(data)
    })
    return unsub
  }, [roomCode])

  const createRoom = useCallback(async (deckId: string) => {
    setLoading(true)
    try {
      const code = await crearSala(userId, displayName, deckId)
      setRoomCode(code)
    } catch (e) {
      onError?.('Error al crear la sala')
    } finally {
      setLoading(false)
    }
  }, [userId, displayName, onError])

  const joinRoom = useCallback(async (codigo: string) => {
    setLoading(true)
    try {
      await unirseSala(codigo.toUpperCase(), userId, displayName)
      setRoomCode(codigo.toUpperCase())
    } catch (e) {
      onError?.(e instanceof Error ? e.message : 'Error al unirse')
      setLoading(false)
    }
  }, [userId, displayName, onError])

  const leaveRoom = useCallback(async () => {
    if (!roomCode) return
    try {
      await abandonarSala(roomCode, userId)
    } catch {
      /* ignore */
    }
    setRoomCode(null)
    setSala(null)
  }, [roomCode, userId])

  const startGame = useCallback(async () => {
    if (!roomCode || !sala) return
    setLoading(true)
    try {
      await iniciarPartida(roomCode)
    } catch {
      onError?.('Error al iniciar la partida')
    } finally {
      setLoading(false)
    }
  }, [roomCode, sala, onError])

  const nextCard = useCallback(async (card: string) => {
    if (!roomCode) return
    await avanzarFase(roomCode, 'CARD', card)
  }, [roomCode])

  const startVoting = useCallback(async () => {
    if (!roomCode) return
    await avanzarFase(roomCode, 'VOTING')
  }, [roomCode])

  const vote = useCallback(async (toPlayerId: string) => {
    if (!roomCode) return
    await emitirVoto(roomCode, userId, toPlayerId)
  }, [roomCode, userId])

  const revealResults = useCallback(async () => {
    if (!roomCode || !sala) return
    const votes = sala.votes
    const voteCounts: Record<string, number> = {}
    for (const toId of Object.values(votes)) {
      voteCounts[toId] = (voteCounts[toId] || 0) + 1
    }
    let maxVotes = 0
    let winnerId = ''
    for (const [pid, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count
        winnerId = pid
      }
    }
    if (winnerId) {
      await sumarPuntaje(roomCode, winnerId)
    }
    await avanzarFase(roomCode, 'RESULTS')
  }, [roomCode, sala])

  const nextRound = useCallback(async () => {
    if (!roomCode) return
    await siguienteRonda(roomCode)
  }, [roomCode])

  const activePlayers = sala
    ? sala.players.filter((p) => p.active)
    : []

  const isHost = sala?.hostId === userId
  const myVote = sala?.votes[userId] ?? null
  const allVoted = sala && Object.keys(sala.votes).length >= activePlayers.length

  return {
    roomCode,
    sala,
    loading,
    activePlayers,
    isHost,
    myVote,
    allVoted,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    nextCard,
    startVoting,
    vote,
    revealResults,
    nextRound,
  } as const
}
