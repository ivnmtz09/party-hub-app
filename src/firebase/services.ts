import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { User } from 'firebase/auth'

export interface Grupo {
  id: string
  nombre: string
  codigoInvitacion: string
  creadoPor: string
  adminId: string
  miembrosIds: string[]
}

export interface Miembro {
  id: string
  displayName: string
  email: string
  deposiciones: number
  actosSexuales: number
  ultimaDeposicion: Timestamp | null
  ultimoActoSexual: Timestamp | null
}

export interface Evento {
  id?: string
  userId: string
  tipo: 'deposicion' | 'acto_sexual'
  timestamp: Timestamp
}

type EventoCallback = (eventos: Evento[]) => void

function generarCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = ''
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

export async function crearGrupo(nombreGrupo: string, user: User): Promise<string> {
  const gruposRef = collection(db, 'grupos')
  const docRef = await addDoc(gruposRef, {
    nombre: nombreGrupo,
    codigoInvitacion: generarCodigo(),
    creadoPor: user.uid,
    adminId: user.uid,
    miembrosIds: [user.uid],
  })

  const miembroRef = doc(db, 'grupos', docRef.id, 'miembros', user.uid)
  await setDoc(miembroRef, {
    id: user.uid,
    displayName: user.displayName || 'Miembro',
    email: user.email || '',
    deposiciones: 0,
    actosSexuales: 0,
    ultimaDeposicion: null,
    ultimoActoSexual: null,
  })

  return docRef.id
}

export async function unirseGrupo(codigo: string, user: User): Promise<string> {
  const gruposRef = collection(db, 'grupos')
  const q = query(gruposRef, where('codigoInvitacion', '==', codigo))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error('Codigo no encontrado')
  }

  const grupoDoc = snapshot.docs[0]!
  const grupoId = grupoDoc.id

  await updateDoc(doc(db, 'grupos', grupoId), {
    miembrosIds: arrayUnion(user.uid),
  })

  const miembroRef = doc(db, 'grupos', grupoId, 'miembros', user.uid)
  const miembroSnap = await getDoc(miembroRef)
  if (!miembroSnap.exists()) {
    await setDoc(miembroRef, {
      id: user.uid,
      displayName: user.displayName || 'Miembro',
      email: user.email || '',
      deposiciones: 0,
      actosSexuales: 0,
      ultimaDeposicion: null,
      ultimoActoSexual: null,
    })
  }

  return grupoId
}

export async function asegurarMiembro(user: User, groupId: string): Promise<void> {
  const miembroRef = doc(db, 'grupos', groupId, 'miembros', user.uid)
  const snap = await getDoc(miembroRef)
  const data = {
    displayName: user.displayName || 'Miembro',
    email: user.email || '',
  }
  if (!snap.exists()) {
    await setDoc(miembroRef, {
      id: user.uid,
      ...data,
      deposiciones: 0,
      actosSexuales: 0,
      ultimaDeposicion: null,
      ultimoActoSexual: null,
    })
  } else {
    await updateDoc(miembroRef, data)
  }
}

export function observarGruposDelUsuario(
  userId: string,
  callback: (grupos: Grupo[]) => void,
): () => void {
  const gruposRef = collection(db, 'grupos')
  const q = query(gruposRef, where('miembrosIds', 'array-contains', userId))
  return onSnapshot(q, (snap) => {
    const lista: Grupo[] = []
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() } as Grupo))
    callback(lista)
  })
}

export function observarMiembros(
  groupId: string,
  callback: (miembros: Miembro[]) => void,
): () => void {
  const ref = collection(db, 'grupos', groupId, 'miembros')
  const q = query(ref, orderBy('displayName'))
  return onSnapshot(q, (snap) => {
    const lista: Miembro[] = []
    snap.forEach((d) => lista.push(d.data() as Miembro))
    callback(lista)
  })
}

export function observarEventos(
  groupId: string,
  callback: EventoCallback,
): () => void {
  const ref = collection(db, 'grupos', groupId, 'eventos')
  const q = query(ref, orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => {
    const lista: Evento[] = []
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() } as Evento))
    callback(lista)
  })
}

export async function registrarEvento(
  groupId: string,
  userId: string,
  tipo: 'deposicion' | 'acto_sexual',
) {
  const eventoRef = collection(db, 'grupos', groupId, 'eventos')
  await addDoc(eventoRef, {
    userId,
    tipo,
    timestamp: serverTimestamp(),
  })

  const miembroRef = doc(db, 'grupos', groupId, 'miembros', userId)
  const updates: Record<string, unknown> = {}

  if (tipo === 'deposicion') {
    updates.deposiciones = increment(1)
    updates.ultimaDeposicion = serverTimestamp()
  } else {
    updates.actosSexuales = increment(1)
    updates.ultimoActoSexual = serverTimestamp()
  }

  await updateDoc(miembroRef, updates)
}

export async function actualizarNombreGrupo(groupId: string, nuevoNombre: string): Promise<void> {
  await updateDoc(doc(db, 'grupos', groupId), {
    nombre: nuevoNombre,
  })
}

export async function eliminarGrupo(groupId: string): Promise<void> {
  await deleteDoc(doc(db, 'grupos', groupId))
}

export async function expulsarMiembro(groupId: string, miembroId: string): Promise<void> {
  await updateDoc(doc(db, 'grupos', groupId), {
    miembrosIds: arrayRemove(miembroId),
  })
  await deleteDoc(doc(db, 'grupos', groupId, 'miembros', miembroId))
}

export async function abandonarGrupo(groupId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'grupos', groupId), {
    miembrosIds: arrayRemove(userId),
  })
  await deleteDoc(doc(db, 'grupos', groupId, 'miembros', userId))
}

export async function eliminarEvento(groupId: string, eventId: string): Promise<void> {
  const eventoRef = doc(db, 'grupos', groupId, 'eventos', eventId)
  const snap = await getDoc(eventoRef)
  if (!snap.exists()) throw new Error('Evento no encontrado')

  const evento = snap.data() as Evento
  await deleteDoc(eventoRef)

  const miembroRef = doc(db, 'grupos', groupId, 'miembros', evento.userId)
  if (evento.tipo === 'deposicion') {
    await updateDoc(miembroRef, { deposiciones: increment(-1) })
  } else {
    await updateDoc(miembroRef, { actosSexuales: increment(-1) })
  }
}

/* ───── Juego Multijugador ───── */

let generatedCodes = new Set<string>()

function generarCodigoSala(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 50; attempt++) {
    let codigo = ''
    for (let i = 0; i < 4; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (!generatedCodes.has(codigo)) {
      generatedCodes.add(codigo)
      return codigo
    }
  }
  return `${Date.now().toString(36).slice(-4).toUpperCase()}`
}

export interface Player {
  id: string
  displayName: string
  active: boolean
  score: number
}

export interface Sala {
  code: string
  status: 'LOBBY' | 'CARD' | 'VOTING' | 'RESULTS'
  players: Player[]
  currentRound: number
  currentCard: string
  deckId: string
  votes: Record<string, string>
  hostId: string
}

export async function crearSala(
  userId: string,
  displayName: string,
  deckId: string,
): Promise<string> {
  const code = generarCodigoSala()
  const salaRef = doc(db, 'rooms', code)
  await setDoc(salaRef, {
    code,
    status: 'LOBBY',
    players: [{ id: userId, displayName, active: true, score: 0 }],
    currentRound: 0,
    currentCard: '',
    deckId,
    votes: {},
    hostId: userId,
  })
  return code
}

export async function unirseSala(
  codigo: string,
  userId: string,
  displayName: string,
): Promise<void> {
  const salaRef = doc(db, 'rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as Sala
  if (data.status !== 'LOBBY') throw new Error('La partida ya empezo')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, displayName, active: true, score: 0 }),
    })
  }
}

export function observarSala(
  codigo: string,
  callback: (sala: Sala) => void,
): () => void {
  const salaRef = doc(db, 'rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as Sala)
    }
  })
}

export async function iniciarPartida(codigo: string): Promise<void> {
  await updateDoc(doc(db, 'rooms', codigo), {
    status: 'CARD',
    currentRound: 1,
    votes: {},
  })
}

export async function avanzarFase(
  codigo: string,
  status: Sala['status'],
  card?: string,
): Promise<void> {
  const update: Record<string, unknown> = { status }
  if (card !== undefined) update.currentCard = card
  if (status === 'CARD') update.votes = {}
  await updateDoc(doc(db, 'rooms', codigo), update)
}

export async function emitirVoto(
  codigo: string,
  fromPlayerId: string,
  toPlayerId: string,
): Promise<void> {
  await updateDoc(doc(db, 'rooms', codigo), {
    [`votes.${fromPlayerId}`]: toPlayerId,
  })
}

export async function sumarPuntaje(
  codigo: string,
  playerId: string,
): Promise<void> {
  const salaRef = doc(db, 'rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as Sala
  const players = data.players.map((p) =>
    p.id === playerId ? { ...p, score: p.score + 1 } : p,
  )
  await updateDoc(salaRef, { players })
}

export async function siguienteRonda(codigo: string): Promise<void> {
  const salaRef = doc(db, 'rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as Sala
  await updateDoc(salaRef, {
    currentRound: (data.currentRound || 0) + 1,
    status: 'CARD',
    votes: {},
  })
}

export async function abandonarSala(
  codigo: string,
  userId: string,
): Promise<void> {
  const salaRef = doc(db, 'rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as Sala
  const players = data.players.map((p) =>
    p.id === userId ? { ...p, active: false } : p,
  )
  await updateDoc(salaRef, { players })
}
