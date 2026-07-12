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
  nickname: string
  avatar: string
  avatarType: 'letter' | 'shape'
  avatarIcon: string
  email: string
  deposiciones: number
  actosSexuales: number
  gym: number
  ultimaDeposicion: Timestamp | null
  ultimoActoSexual: Timestamp | null
  ultimoGym: Timestamp | null
}

export interface Evento {
  id?: string
  userId: string
  tipo: 'deposicion' | 'acto_sexual' | 'gym'
  timestamp: Timestamp
  rating?: number
  note?: string
  photoUrl?: string
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

  const profile = await getProfileOrFallback(user.uid)
  const miembroRef = doc(db, 'grupos', docRef.id, 'miembros', user.uid)
  await setDoc(miembroRef, {
    id: user.uid,
    displayName: user.displayName || 'Miembro',
    nickname: profile.nickname,
    avatar: profile.avatar,
    avatarType: profile.avatarType,
    avatarIcon: profile.avatarIcon,
    email: user.email || '',
    deposiciones: 0,
    actosSexuales: 0,
    gym: 0,
    ultimaDeposicion: null,
    ultimoActoSexual: null,
    ultimoGym: null,
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

  const profile = await getProfileOrFallback(user.uid)
  const miembroRef = doc(db, 'grupos', grupoId, 'miembros', user.uid)
  const miembroSnap = await getDoc(miembroRef)
  if (!miembroSnap.exists()) {
    await setDoc(miembroRef, {
      id: user.uid,
      displayName: user.displayName || 'Miembro',
      nickname: profile.nickname,
      avatar: profile.avatar,
      avatarType: profile.avatarType,
      avatarIcon: profile.avatarIcon,
      email: user.email || '',
      deposiciones: 0,
      actosSexuales: 0,
      gym: 0,
      ultimaDeposicion: null,
      ultimoActoSexual: null,
      ultimoGym: null,
    })
  }

  return grupoId
}

export async function asegurarMiembro(user: User, groupId: string): Promise<void> {
  const profile = await getProfileOrFallback(user.uid)
  const miembroRef = doc(db, 'grupos', groupId, 'miembros', user.uid)
  const snap = await getDoc(miembroRef)
  const data = {
    displayName: user.displayName || 'Miembro',
    nickname: profile.nickname,
    avatar: profile.avatar,
    avatarType: profile.avatarType,
    avatarIcon: profile.avatarIcon,
    email: user.email || '',
  }
  if (!snap.exists()) {
    await setDoc(miembroRef, {
      id: user.uid,
      ...data,
      deposiciones: 0,
      actosSexuales: 0,
      gym: 0,
      ultimaDeposicion: null,
      ultimoActoSexual: null,
      ultimoGym: null,
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
  tipo: 'deposicion' | 'acto_sexual' | 'gym',
  meta?: { rating?: number; note?: string; photoUrl?: string },
) {
  const eventoRef = collection(db, 'grupos', groupId, 'eventos')
  const docData: Record<string, unknown> = {
    userId,
    tipo,
    timestamp: serverTimestamp(),
  }
  if (meta?.rating) docData.rating = meta.rating
  if (meta?.note) docData.note = meta.note
  if (meta?.photoUrl) docData.photoUrl = meta.photoUrl
  await addDoc(eventoRef, docData)

  const miembroRef = doc(db, 'grupos', groupId, 'miembros', userId)
  const updates: Record<string, unknown> = {}

  if (tipo === 'deposicion') {
    updates.deposiciones = increment(1)
    updates.ultimaDeposicion = serverTimestamp()
  } else if (tipo === 'acto_sexual') {
    updates.actosSexuales = increment(1)
    updates.ultimoActoSexual = serverTimestamp()
  } else {
    updates.gym = increment(1)
    updates.ultimoGym = serverTimestamp()
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
  } else if (evento.tipo === 'acto_sexual') {
    await updateDoc(miembroRef, { actosSexuales: increment(-1) })
  } else {
    await updateDoc(miembroRef, { gym: increment(-1) })
  }
}

export async function updateActivityRecord(
  groupId: string,
  eventId: string,
  data: { rating?: number; note?: string; photoUrl?: string },
): Promise<void> {
  const eventoRef = doc(db, 'grupos', groupId, 'eventos', eventId)
  const snap = await getDoc(eventoRef)
  if (!snap.exists()) throw new Error('Evento no encontrado')
  await updateDoc(eventoRef, data)
}

export function uploadRecordPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      reject(new Error('La imagen no debe superar 5MB'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/* ───── Perfil de Usuario ───── */

export interface UserProfileData {
  nickname: string
  avatar: string
  avatarType: 'letter' | 'shape'
  avatarIcon: string
}

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    nickname: data.nickname || '',
    avatar: data.avatar || '#fbbf24',
    avatarType: data.avatarType || 'letter',
    avatarIcon: data.avatarIcon || 'Gamepad2',
  }
}

export async function updateUserProfile(uid: string, data: UserProfileData): Promise<void> {
  await setDoc(doc(db, 'users', uid), data, { merge: true })
}

export async function actualizarMiembroEnGrupos(uid: string, data: UserProfileData): Promise<void> {
  const gruposRef = collection(db, 'grupos')
  const q = query(gruposRef, where('miembrosIds', 'array-contains', uid))
  const snapshot = await getDocs(q)

  const updates = snapshot.docs.map((d) =>
    updateDoc(doc(db, 'grupos', d.id, 'miembros', uid), {
      nickname: data.nickname,
      avatar: data.avatar,
      avatarType: data.avatarType,
      avatarIcon: data.avatarIcon,
    })
  )

  await Promise.all(updates)
}

async function getProfileOrFallback(uid: string): Promise<UserProfileData> {
  const profile = await getUserProfile(uid)
  return profile ?? { nickname: '', avatar: '#fbbf24', avatarType: 'letter', avatarIcon: 'Gamepad2' }
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

/* ───── El Impostor (persistencia local) ───── */

export interface ImpostorSession {
  playerNames: string[]
  roles: Array<{ name: string; isImpostor: boolean }>
  createdAt: Timestamp
}

export async function guardarPartidaImpostor(data: Omit<ImpostorSession, 'createdAt'>): Promise<void> {
  await setDoc(doc(db, 'impostor_sessions', 'latest'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function cargarPartidaImpostor(): Promise<ImpostorSession | null> {
  const snap = await getDoc(doc(db, 'impostor_sessions', 'latest'))
  if (!snap.exists()) return null
  return snap.data() as ImpostorSession
}

/* ───── Dedo en la Llaga Online ───── */

export interface DedoPlayer {
  id: string
  name: string
}

export interface DedoRoom {
  code: string
  game: string
  hostId: string
  players: DedoPlayer[]
  phase: 'lobby' | 'voting' | 'results'
  currentCard: string
  votes: Record<string, string>
}

let dedoCodes = new Set<string>()

function generarCodigoDedo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 50; attempt++) {
    let codigo = ''
    for (let i = 0; i < 4; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (!dedoCodes.has(codigo)) {
      dedoCodes.add(codigo)
      return codigo
    }
  }
  return `${Date.now().toString(36).slice(-4).toUpperCase()}`
}

export async function crearSalaDedo(
  userId: string,
  displayName: string,
): Promise<string> {
  const code = generarCodigoDedo()
  const salaRef = doc(db, 'arcade_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'dedo_llaga',
    hostId: userId,
    players: [{ id: userId, name: displayName }],
    phase: 'lobby',
    currentCard: '',
    votes: {},
  })
  return code
}

export async function unirseSalaDedo(
  codigo: string,
  userId: string,
  displayName: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as DedoRoom
  if (data.phase !== 'lobby') throw new Error('La partida ya empezo')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName }),
    })
  }
}

export function observarSalaDedo(
  codigo: string,
  callback: (sala: DedoRoom) => void,
): () => void {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as DedoRoom)
    }
  })
}

export async function iniciarJuegoDedo(
  codigo: string,
  card: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    phase: 'voting',
    currentCard: card,
    votes: {},
  })
}

export async function emitirVotoDedo(
  codigo: string,
  voterId: string,
  targetId: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    [`votes.${voterId}`]: targetId,
  })
}

export async function avanzarFaseDedo(
  codigo: string,
  phase: DedoRoom['phase'],
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), { phase })
}

export async function siguienteCartaDedo(
  codigo: string,
  card: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    phase: 'voting',
    currentCard: card,
    votes: {},
  })
}

export async function abandonarSalaDedo(
  codigo: string,
  userId: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as DedoRoom
  const players = data.players.filter((p) => p.id !== userId)
  const update: Record<string, unknown> = { players }
  if (data.hostId === userId && players.length > 0) {
    update.hostId = players[0]!.id
  }
  await updateDoc(salaRef, update)
}

/* ───── Codigo Secreto ───── */

export interface CodigoPlayer {
  id: string
  name: string
}

export interface Guess {
  guess: string
  fijas: number
  picas: number
}

export interface CodigoRoom {
  code: string
  game: 'codigo_secreto'
  hostId: string
  players: CodigoPlayer[]
  phase: 'lobby' | 'setup' | 'playing' | 'finished'
  secretCode: { p1: string; p2: string }
  guesses: { p1: Guess[]; p2: Guess[] }
  winner: string | null
}

let codigoCodes = new Set<string>()

function generarCodigoCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 50; attempt++) {
    let codigo = ''
    for (let i = 0; i < 4; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (!codigoCodes.has(codigo)) {
      codigoCodes.add(codigo)
      return codigo
    }
  }
  return `${Date.now().toString(36).slice(-4).toUpperCase()}`
}

export async function crearSalaCodigo(
  userId: string,
  displayName: string,
): Promise<string> {
  const code = generarCodigoCodigo()
  const salaRef = doc(db, 'codigo_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'codigo_secreto',
    hostId: userId,
    players: [{ id: userId, name: displayName }],
    phase: 'lobby',
    secretCode: { p1: '', p2: '' },
    guesses: { p1: [], p2: [] },
    winner: null,
  })
  return code
}

export async function unirseSalaCodigo(
  codigo: string,
  userId: string,
  displayName: string,
): Promise<void> {
  const salaRef = doc(db, 'codigo_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as CodigoRoom
  if (data.phase !== 'lobby') throw new Error('La partida ya empezo')
  if (data.players.length >= 2) throw new Error('Sala llena')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName }),
      phase: 'setup',
    })
  }
}

export function observarSalaCodigo(
  codigo: string,
  callback: (sala: CodigoRoom) => void,
): () => void {
  const salaRef = doc(db, 'codigo_rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as CodigoRoom)
    }
  })
}

export async function guardarCodigoSecreto(
  codigo: string,
  userId: string,
  secret: string,
): Promise<void> {
  const salaRef = doc(db, 'codigo_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as CodigoRoom
  const playerIndex = data.players.findIndex((p) => p.id === userId)
  if (playerIndex === -1) return
  const key = playerIndex === 0 ? 'p1' : 'p2'
  const update: Record<string, unknown> = {
    [`secretCode.${key}`]: secret,
  }
  const otherKey = key === 'p1' ? 'p2' : 'p1'
  if (data.secretCode[otherKey as keyof typeof data.secretCode] !== '' && data.phase === 'setup') {
    update.phase = 'playing'
  }
  await updateDoc(salaRef, update)
}

export async function enviarIntentoCodigo(
  codigo: string,
  userId: string,
  guess: string,
  fijas: number,
  picas: number,
): Promise<void> {
  const salaRef = doc(db, 'codigo_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as CodigoRoom
  const playerIndex = data.players.findIndex((p) => p.id === userId)
  if (playerIndex === -1) return
  const key = playerIndex === 0 ? 'p1' : 'p2'
  const newGuess: Guess = { guess, fijas, picas }
  const updatedGuesses = [...data.guesses[key], newGuess]

  let winner: string | null = null
  let phase: CodigoRoom['phase'] = 'playing'

  if (fijas === 4) {
    winner = userId
    phase = 'finished'
  } else if (updatedGuesses.length >= 10) {
    const opponentKey = key === 'p1' ? 'p2' : 'p1'
    if (data.guesses[opponentKey].length >= 10) {
      phase = 'finished'
    }
  }

  const update: Record<string, unknown> = {
    [`guesses.${key}`]: updatedGuesses,
  }
  if (winner !== null) update.winner = winner
  if (phase !== data.phase) update.phase = phase

  await updateDoc(salaRef, update)
}

export async function reiniciarJuegoCodigo(codigo: string): Promise<void> {
  await updateDoc(doc(db, 'codigo_rooms', codigo), {
    phase: 'setup',
    secretCode: { p1: '', p2: '' },
    guesses: { p1: [], p2: [] },
    winner: null,
  })
}

export async function abandonarSalaCodigo(
  codigo: string,
  userId: string,
): Promise<void> {
  const salaRef = doc(db, 'codigo_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as CodigoRoom
  const players = data.players.filter((p) => p.id !== userId)
  if (players.length === 0) {
    await deleteDoc(salaRef)
  } else {
    const update: Record<string, unknown> = { players }
    if (data.hostId === userId && players.length > 0) {
      update.hostId = players[0]!.id
    }
    await updateDoc(salaRef, update)
  }
}

/* ───── Frente a Frente ───── */

export interface FrentePlayer {
  id: string
  name: string
  teamIndex: number
}

export interface FrenteTeam {
  name: string
  score: number
  finished: boolean
}

export interface FrenteRoom {
  code: string
  game: 'frente_a_frente'
  hostId: string
  players: FrentePlayer[]
  phase: 'lobby' | 'playing' | 'finished'
  currentTeam: number
  teams: FrenteTeam[]
}

let frenteCodes = new Set<string>()

function generarCodigoFrente(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  for (let attempt = 0; attempt < 50; attempt++) {
    let codigo = ''
    for (let i = 0; i < 4; i++) {
      codigo += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (!frenteCodes.has(codigo)) {
      frenteCodes.add(codigo)
      return codigo
    }
  }
  return `${Date.now().toString(36).slice(-4).toUpperCase()}`
}

export async function crearSalaFrente(
  userId: string,
  displayName: string,
): Promise<string> {
  const code = generarCodigoFrente()
  const salaRef = doc(db, 'frente_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'frente_a_frente',
    hostId: userId,
    players: [{ id: userId, name: displayName, teamIndex: 0 }],
    phase: 'lobby',
    currentTeam: 0,
    teams: [
      { name: 'Equipo 1', score: 0, finished: false },
      { name: 'Equipo 2', score: 0, finished: false },
    ],
  })
  return code
}

export async function unirseSalaFrente(
  codigo: string,
  userId: string,
  displayName: string,
  teamIndex: number,
): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as FrenteRoom
  if (data.phase !== 'lobby') throw new Error('La partida ya empezo')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, teamIndex }),
    })
  }
}

export function observarSalaFrente(
  codigo: string,
  callback: (sala: FrenteRoom) => void,
): () => void {
  const salaRef = doc(db, 'frente_rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as FrenteRoom)
    }
  })
}

export async function agregarEquipoFrente(codigo: string, name: string): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as FrenteRoom
  await updateDoc(salaRef, {
    teams: [...data.teams, { name, score: 0, finished: false }],
  })
}

export async function cambiarEquipoJugadorFrente(
  codigo: string,
  userId: string,
  teamIndex: number,
): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as FrenteRoom
  const players = data.players.map((p) =>
    p.id === userId ? { ...p, teamIndex } : p,
  )
  await updateDoc(salaRef, { players })
}

export async function iniciarJuegoFrente(codigo: string): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as FrenteRoom
  const teams = data.teams.map((t) => ({ ...t, finished: false, score: 0 }))
  await updateDoc(salaRef, {
    phase: 'playing',
    currentTeam: 0,
    teams,
  })
}

export async function finalizarTurnoFrente(
  codigo: string,
  teamIndex: number,
  score: number,
): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as FrenteRoom
  const teams = data.teams.map((t, i) =>
    i === teamIndex ? { ...t, score: t.score + score, finished: true } : t,
  )
  const nextTeam = teams.findIndex((t) => !t.finished)
  const update: Record<string, unknown> = { teams }
  if (nextTeam !== -1) {
    update.currentTeam = nextTeam
  } else {
    update.phase = 'finished'
  }
  await updateDoc(salaRef, update)
}

export async function abandonarSalaFrente(
  codigo: string,
  userId: string,
): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as FrenteRoom
  const players = data.players.filter((p) => p.id !== userId)
  if (players.length === 0) {
    await deleteDoc(salaRef)
  } else {
    const update: Record<string, unknown> = { players }
    if (data.hostId === userId) {
      update.hostId = players[0]!.id
    }
    await updateDoc(salaRef, update)
  }
}
