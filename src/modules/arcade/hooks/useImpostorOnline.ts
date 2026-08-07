import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  ImpostorPlayer,
  ImpostorRoom,
  ImpostorSecret,
  ImpostorRoundPayload,
} from '../../../firebase/services'
import {
  crearSalaImpostor,
  unirseSalaImpostor,
  observarSalaImpostor,
  actualizarConfigImpostor,
  iniciarRondaImpostor,
  pasarAVotacionImpostor,
  emitirVotoImpostor,
  finalizarVotacionImpostor,
  abandonarSalaImpostor,
} from '../../../firebase/services'
import { allWords } from '../data/words'

interface UseImpostorOnlineOptions {
  userId: string
  displayName: string
  avatar: string
  onError?: (msg: string) => void
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arr[i] as T
    arr[i] = arr[j] as T
    arr[j] = temp
  }
  return arr
}

function computeImpostorCount(playerCount: number): number {
  if (playerCount >= 8) return 3
  if (playerCount >= 5) return 2
  return 1
}

export function useImpostorOnline({
  userId,
  displayName,
  avatar,
  onError,
}: UseImpostorOnlineOptions) {
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [room, setRoom] = useState<ImpostorRoom | null>(null)
  const [loading, setLoading] = useState(false)
  const finishingRef = useRef(false)

  useEffect(() => {
    if (!roomCode) return
    const unsub = observarSalaImpostor(roomCode, (data) => {
      setRoom(data)
      finishingRef.current = false
    })
    return unsub
  }, [roomCode])

  const isHost = room?.hostId === userId
  const mySecret = room?.secrets[userId] ?? null

  const createRoom = useCallback(
    async (categories: string[], cluesEnabled: boolean): Promise<boolean> => {
      if (!userId) return false
      setLoading(true)
      try {
        const code = await crearSalaImpostor(userId, displayName, avatar, categories, cluesEnabled)
        setRoomCode(code)
        return true
      } catch {
        onError?.('Error al crear la sala')
        return false
      } finally {
        setLoading(false)
      }
    },
    [userId, displayName, avatar, onError],
  )

  const joinRoom = useCallback(
    async (codigo: string): Promise<boolean> => {
      if (!userId) return false
      setLoading(true)
      try {
        await unirseSalaImpostor(codigo.trim().toUpperCase(), userId, displayName, avatar)
        setRoomCode(codigo.trim().toUpperCase())
        return true
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Error al unirse')
        return false
      } finally {
        setLoading(false)
      }
    },
    [userId, displayName, avatar, onError],
  )

  const leaveRoom = useCallback(async () => {
    if (roomCode) {
      try {
        await abandonarSalaImpostor(roomCode, userId)
      } catch {
        /* ignore */
      }
    }
    setRoomCode(null)
    setRoom(null)
    finishingRef.current = false
  }, [roomCode, userId])

  const updateConfig = useCallback(
    async (config: { categories?: string[]; cluesEnabled?: boolean }) => {
      if (!roomCode) return
      try {
        await actualizarConfigImpostor(roomCode, config)
      } catch {
        onError?.('Error al actualizar la configuracion')
      }
    },
    [roomCode, onError],
  )

  const buildRoundPayload = useCallback((): ImpostorRoundPayload | null => {
    if (!room) return null
    const filtered = allWords.filter((w) => room.categories.includes(w.categoria))
    const pool = filtered.length > 0 ? filtered : allWords
    const availableCategories = Array.from(new Set(pool.map((w) => w.categoria)))
    const pickedCategory =
      availableCategories[Math.floor(Math.random() * availableCategories.length)]
    const categoryWords = pool.filter((w) => w.categoria === pickedCategory)
    const selected = categoryWords[Math.floor(Math.random() * categoryWords.length)]
    if (!selected) return null

    const impostorCount = computeImpostorCount(room.players.length)
    const shuffled = shuffle(room.players)
    const impostorIds = shuffled
      .slice(0, Math.min(impostorCount, room.players.length))
      .map((p: ImpostorPlayer) => p.id)

    const secrets: Record<string, ImpostorSecret> = {}
    for (const p of room.players) {
      const isImpostor = impostorIds.includes(p.id)
      secrets[p.id] = isImpostor
        ? {
            isImpostor: true,
            word: '',
            description: '',
            clue: selected.clue,
            categoria: selected.categoria,
          }
        : {
            isImpostor: false,
            word: selected.word,
            description: selected.description,
            clue: '',
            categoria: selected.categoria,
          }
    }

    return { secrets, impostorIds, rounds: room.rounds + 1 }
  }, [room])

  const startGame = useCallback(async () => {
    if (!roomCode || !room || room.status !== 'LOBBY') return
    const payload = buildRoundPayload()
    if (!payload) return
    setLoading(true)
    try {
      await iniciarRondaImpostor(roomCode, payload)
    } catch {
      onError?.('Error al iniciar la partida')
    } finally {
      setLoading(false)
    }
  }, [roomCode, room, buildRoundPayload, onError])

  const passToVoting = useCallback(async () => {
    if (!roomCode) return
    try {
      await pasarAVotacionImpostor(roomCode)
    } catch {
      onError?.('Error al pasar a votacion')
    }
  }, [roomCode, onError])

  const vote = useCallback(
    async (targetId: string) => {
      if (!roomCode) return
      try {
        await emitirVotoImpostor(roomCode, userId, targetId)
      } catch {
        onError?.('Error al emitir el voto')
      }
    },
    [roomCode, userId, onError],
  )

  const finishVoting = useCallback(async () => {
    if (!roomCode) return
    try {
      await finalizarVotacionImpostor(roomCode)
    } catch {
      onError?.('Error al cerrar la votacion')
    }
  }, [roomCode, onError])

  useEffect(() => {
    if (!room || room.status !== 'VOTING') return
    const allVoted =
      room.players.length > 0 && room.players.every((p) => room.votes[p.id] !== undefined)
    if (allVoted && !finishingRef.current) {
      finishingRef.current = true
      finalizarVotacionImpostor(room.code).catch(() => {
        finishingRef.current = false
      })
    }
  }, [room])

  const playAgain = useCallback(async () => {
    if (!roomCode || !room || room.status !== 'RESULTS') return
    const payload = buildRoundPayload()
    if (!payload) return
    try {
      await iniciarRondaImpostor(roomCode, payload)
    } catch {
      onError?.('Error al iniciar una nueva ronda')
    }
  }, [roomCode, room, buildRoundPayload, onError])

  const allVoted =
    room !== null &&
    room.players.length > 0 &&
    room.players.every((p) => room.votes[p.id] !== undefined)

  return {
    roomCode,
    room,
    loading,
    isHost,
    mySecret,
    allVoted,
    createRoom,
    joinRoom,
    leaveRoom,
    updateConfig,
    startGame,
    passToVoting,
    vote,
    finishVoting,
    playAgain,
  }
}