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
  runTransaction,
  type QuerySnapshot,
  type Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './config'
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
  meadas: number
  ultimaDeposicion: Timestamp | null
  ultimoActoSexual: Timestamp | null
  ultimoGym: Timestamp | null
  ultimaMeada: Timestamp | null
}

export interface Evento {
  id?: string
  userId: string
  tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada'
  timestamp: Timestamp
  groupIds?: string[]
  rating?: number
  note?: string
  photoUrl?: string
  reactions?: Record<string, ReactionType>
}

export type ReactionType = 'heart' | 'flame' | 'smile' | 'skull' | 'frown'

export interface CommentData {
  id: string
  userId: string
  nickname: string
  text: string
  createdAt: Timestamp | null
  avatarColor: string
  avatarType: 'letter' | 'shape'
  avatarIcon: string
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
    meadas: 0,
    ultimaMeada: null,
  })

  return docRef.id
}

export async function unirseGrupo(codigo: string, user: User): Promise<string> {
  const gruposRef = collection(db, 'grupos')
  const q = query(gruposRef, where('codigoInvitacion', '==', codigo))
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    throw new Error('Código no encontrado')
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
      meadas: 0,
      ultimaMeada: null,
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
      meadas: 0,
      ultimaDeposicion: null,
      ultimoActoSexual: null,
      ultimoGym: null,
      ultimaMeada: null,
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

async function obtenerGruposIds(userId: string): Promise<string[]> {
  const gruposRef = collection(db, 'grupos')
  const q = query(gruposRef, where('miembrosIds', 'array-contains', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => d.id)
}

function timestampToNumber(ts: unknown): number {
  if (!ts) return 0
  if (typeof (ts as Timestamp).toMillis === 'function') return (ts as Timestamp).toMillis()
  if (typeof (ts as { seconds?: number }).seconds === 'number') return (ts as { seconds: number }).seconds * 1000
  const n = new Date(ts as unknown as string).getTime()
  return Number.isFinite(n) ? n : 0
}

type MergedDoc = { id: string; data: Record<string, unknown>; ts: number }

function applyChanges(
  docs: Record<string, MergedDoc>,
  snap: QuerySnapshot,
  tsField: 'timestamp' | 'createdAt',
) {
  snap.docChanges().forEach((change) => {
    if (change.type === 'removed') {
      delete docs[change.doc.id]
    } else {
      const data = change.doc.data() as Record<string, unknown>
      docs[change.doc.id] = { id: change.doc.id, data, ts: timestampToNumber(data[tsField]) }
    }
  })
}

function buildMerged(docs: Record<string, MergedDoc>, maxResults?: number): Array<Record<string, unknown>> {
  const arr = Object.values(docs).sort((a, b) => b.ts - a.ts)
  const final = maxResults !== undefined ? arr.slice(0, maxResults) : arr
  return final.map((x) => ({ id: x.id, ...x.data }))
}

export function observarEventos(
  activeGroupId: string,
  callback: EventoCallback,
): () => void {
  const eventosRef = collection(db, 'eventos')
  const gruposEventosRef = collection(db, 'grupos', activeGroupId, 'eventos')
  const qNew = query(eventosRef, where('groupIds', 'array-contains', activeGroupId))
  const docs: Record<string, MergedDoc> = {}

  const flush = () => {
    callback(buildMerged(docs) as unknown as Evento[])
  }

  const unsubNew = onSnapshot(
    qNew,
    (snap) => {
      applyChanges(docs, snap, 'timestamp')
      flush()
    },
    (error) => { console.error('Error al cargar eventos (nuevos):', error) },
  )
  const unsubOld = onSnapshot(
    gruposEventosRef,
    (snap) => {
      applyChanges(docs, snap, 'timestamp')
      flush()
    },
    (error) => { console.error('Error al cargar eventos (viejos):', error) },
  )

  return () => {
    unsubNew()
    unsubOld()
  }
}

export function observarEventosConLimite(
  activeGroupId: string,
  maxResults: number,
  callback: EventoCallback,
): () => void {
  const eventosRef = collection(db, 'eventos')
  const gruposEventosRef = collection(db, 'grupos', activeGroupId, 'eventos')
  const qNew = query(eventosRef, where('groupIds', 'array-contains', activeGroupId))
  const docs: Record<string, MergedDoc> = {}

  const flush = () => {
    callback(buildMerged(docs, maxResults) as unknown as Evento[])
  }

  const unsubNew = onSnapshot(
    qNew,
    (snap) => {
      applyChanges(docs, snap, 'timestamp')
      flush()
    },
    (error) => { console.error('Error al cargar eventos (nuevos):', error) },
  )
  const unsubOld = onSnapshot(
    gruposEventosRef,
    (snap) => {
      applyChanges(docs, snap, 'timestamp')
      flush()
    },
    (error) => { console.error('Error al cargar eventos (viejos):', error) },
  )

  return () => {
    unsubNew()
    unsubOld()
  }
}

export async function registrarEvento(
  userId: string,
  tipo: 'deposicion' | 'acto_sexual' | 'gym' | 'meada',
  meta?: { rating?: number; note?: string; photoUrl?: string },
) {
  const groupIds = await obtenerGruposIds(userId)
  const eventoRef = collection(db, 'eventos')
  const docData: Record<string, unknown> = {
    userId,
    tipo,
    groupIds,
    timestamp: serverTimestamp(),
  }
  if (meta?.rating) docData.rating = meta.rating
  if (meta?.note) docData.note = meta.note
  if (meta?.photoUrl) docData.photoUrl = meta.photoUrl
  await addDoc(eventoRef, docData)

  const updates: Record<string, unknown> = {}

  if (tipo === 'deposicion') {
    updates.deposiciones = increment(1)
    updates.ultimaDeposicion = serverTimestamp()
  } else if (tipo === 'acto_sexual') {
    updates.actosSexuales = increment(1)
    updates.ultimoActoSexual = serverTimestamp()
  } else if (tipo === 'meada') {
    updates.meadas = increment(1)
    updates.ultimaMeada = serverTimestamp()
  } else {
    updates.gym = increment(1)
    updates.ultimoGym = serverTimestamp()
  }

  await Promise.all(
    groupIds.map((gid) =>
      updateDoc(doc(db, 'grupos', gid, 'miembros', userId), updates),
    ),
  )
}

export async function actualizarNombreGrupo(groupId: string, nuevoNombre: string): Promise<void> {
  await updateDoc(doc(db, 'grupos', groupId), {
    nombre: nuevoNombre,
  })
}

export async function eliminarGrupo(groupId: string): Promise<void> {
  const miembrosSnap = await getDocs(collection(db, 'grupos', groupId, 'miembros'))
  const eventosSnap = await getDocs(collection(db, 'grupos', groupId, 'eventos'))
  await Promise.all([
    ...miembrosSnap.docs.map((d) => deleteDoc(doc(db, 'grupos', groupId, 'miembros', d.id))),
    ...eventosSnap.docs.map((d) => deleteDoc(doc(db, 'grupos', groupId, 'eventos', d.id))),
  ])
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

export async function eliminarEvento(eventId: string): Promise<void> {
  const eventoRef = doc(db, 'eventos', eventId)
  const snap = await getDoc(eventoRef)
  if (!snap.exists()) throw new Error('Evento no encontrado')

  const evento = snap.data() as Evento
  await deleteDoc(eventoRef)

  const updates: Record<string, unknown> = {}
  if (evento.tipo === 'deposicion') {
    updates.deposiciones = increment(-1)
  } else if (evento.tipo === 'acto_sexual') {
    updates.actosSexuales = increment(-1)
  } else if (evento.tipo === 'meada') {
    updates.meadas = increment(-1)
  } else {
    updates.gym = increment(-1)
  }

  await Promise.all(
    (evento.groupIds ?? []).map((gid) =>
      updateDoc(doc(db, 'grupos', gid, 'miembros', evento.userId), updates),
    ),
  )
}

export async function updateActivityRecord(
  eventId: string,
  data: { rating?: number; note?: string; photoUrl?: string },
): Promise<void> {
  const eventoRef = doc(db, 'eventos', eventId)
  const snap = await getDoc(eventoRef)
  if (!snap.exists()) throw new Error('Evento no encontrado')
  await updateDoc(eventoRef, data)
}

export async function uploadRecordPhoto(file: File): Promise<string> {
  const fileRef = ref(storage, `records/${Date.now()}_${file.name}`)
  const snapshot = await uploadBytes(fileRef, file)
  const url = await getDownloadURL(snapshot.ref)
  return url
}

/* ───── Reacciones ───── */

export async function toggleReaction(
  recordId: string,
  userId: string,
  reactionType: ReactionType,
): Promise<void> {
  const eventoRef = doc(db, 'eventos', recordId)
  const snap = await getDoc(eventoRef)
  if (!snap.exists()) throw new Error('Registro no encontrado')

  const data = snap.data()
  const reactions = (data.reactions ?? {}) as Record<string, string>

  if (reactions[userId] === reactionType) {
    const updated = { ...reactions }
    delete updated[userId]
    await updateDoc(eventoRef, { reactions: updated })
  } else {
    await updateDoc(eventoRef, { reactions: { ...reactions, [userId]: reactionType } })

    const receptorId = data.userId as string | undefined
    if (receptorId && receptorId !== userId) {
      const perfil = await getUserProfile(userId)
      await crearNotificacion({
        userId: receptorId,
        actorId: userId,
        actorName: perfil?.nickname || 'Alguien',
        type: 'reaction',
        activityId: recordId,
        activityType: data.tipo as string,
      })
    }
  }
}

/* ───── Comentarios ───── */

export async function addComment(
  recordId: string,
  commentData: Omit<CommentData, 'id' | 'createdAt'>,
): Promise<string> {
  const commentsRef = collection(db, 'eventos', recordId, 'comments')
  const docRef = await addDoc(commentsRef, {
    ...commentData,
    createdAt: serverTimestamp(),
  })

  const eventoSnap = await getDoc(doc(db, 'eventos', recordId))
  if (eventoSnap.exists()) {
    const evento = eventoSnap.data() as Evento
    if (evento.userId && evento.userId !== commentData.userId) {
      await crearNotificacion({
        userId: evento.userId,
        actorId: commentData.userId,
        actorName: commentData.nickname,
        type: 'comment',
        activityId: recordId,
        activityType: evento.tipo,
      })
    }
  }

  return docRef.id
}

export function subscribeToComments(
  recordId: string,
  callback: (comments: CommentData[]) => void,
): () => void {
  const commentsRef = collection(db, 'eventos', recordId, 'comments')
  const q = query(commentsRef, orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    const lista: CommentData[] = []
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() } as CommentData))
    callback(lista)
  })
}

/* ───── Notificaciones ───── */

export interface Notificacion {
  id?: string
  userId: string
  actorId: string
  actorName: string
  type: 'reaction' | 'comment'
  activityId: string
  activityType: string
  createdAt: Timestamp | null
  read: boolean
}

async function crearNotificacion(
  data: Omit<Notificacion, 'id' | 'createdAt' | 'read'>,
): Promise<void> {
  const notifRef = collection(db, 'notifications')
  await addDoc(notifRef, {
    ...data,
    createdAt: serverTimestamp(),
    read: false,
  })
}

export function observarNotificaciones(
  userId: string,
  callback: (notificaciones: Notificacion[]) => void,
): () => void {
  const notifRef = collection(db, 'notifications')
  const q = query(notifRef, where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    const lista: Notificacion[] = []
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() } as Notificacion))
    lista.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0
      const tb = b.createdAt?.toMillis?.() ?? 0
      return tb - ta
    })
    callback(lista)
  })
}

export async function marcarNotificacionLeida(notifId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notifId), { read: true })
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
  if (data.status !== 'LOBBY') throw new Error('La partida ya empezó')

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
  avatar: string
  avatarType?: string
  avatarIcon?: string
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

export async function crearSalaDedo(
  userId: string,
  displayName: string,
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<string> {
  const code = generarCodigoSala()
  const salaRef = doc(db, 'arcade_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'dedo_llaga',
    hostId: userId,
    players: [{ id: userId, name: displayName, avatar, avatarType, avatarIcon }],
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
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as DedoRoom
  if (data.phase !== 'lobby') throw new Error('La partida ya empezó')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, avatar, avatarType, avatarIcon }),
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

/* ───── Yo Nunca Online ───── */

export interface YoNuncaPlayer {
  id: string
  name: string
  avatar: string
  avatarType?: string
  avatarIcon?: string
}

export interface YoNuncaRoom {
  code: string
  game: string
  hostId: string
  players: YoNuncaPlayer[]
  phase: 'lobby' | 'playing'
  currentCard: string
}

export async function crearSalaYoNunca(
  userId: string,
  displayName: string,
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<string> {
  const code = generarCodigo()
  const salaRef = doc(db, 'arcade_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'yo_nunca',
    hostId: userId,
    players: [{ id: userId, name: displayName, avatar, avatarType, avatarIcon }],
    phase: 'lobby',
    currentCard: '',
  })
  return code
}

export async function unirseSalaYoNunca(
  codigo: string,
  userId: string,
  displayName: string,
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as YoNuncaRoom
  if (data.game !== 'yo_nunca') throw new Error('La sala no es de Yo Nunca')
  if (data.phase !== 'lobby') throw new Error('La partida ya empezó')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, avatar, avatarType, avatarIcon }),
    })
  }
}

export function observarSalaYoNunca(
  codigo: string,
  callback: (sala: YoNuncaRoom) => void,
): () => void {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as YoNuncaRoom)
    }
  })
}

export async function iniciarJuegoYoNunca(
  codigo: string,
  card: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    phase: 'playing',
    currentCard: card,
  })
}

export async function siguienteCartaYoNunca(
  codigo: string,
  card: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    currentCard: card,
  })
}

export async function abandonarSalaYoNunca(
  codigo: string,
  userId: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as YoNuncaRoom
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
  avatar: string
  avatarType?: string
  avatarIcon?: string
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
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<string> {
  const code = generarCodigoCodigo()
  const salaRef = doc(db, 'codigo_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'codigo_secreto',
    hostId: userId,
    players: [{ id: userId, name: displayName, avatar, avatarType, avatarIcon }],
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
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<void> {
  const salaRef = doc(db, 'codigo_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as CodigoRoom
  if (data.phase !== 'lobby') throw new Error('La partida ya empezó')
  if (data.players.length >= 2) throw new Error('Sala llena')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, avatar, avatarType, avatarIcon }),
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
  avatar: string
  avatarType?: string
  avatarIcon?: string
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
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<string> {
  const code = generarCodigoFrente()
  const salaRef = doc(db, 'frente_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'frente_a_frente',
    hostId: userId,
    players: [{ id: userId, name: displayName, avatar, avatarType, avatarIcon, teamIndex: 0 }],
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
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<void> {
  const salaRef = doc(db, 'frente_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as FrenteRoom
  if (data.phase !== 'lobby') throw new Error('La partida ya empezó')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, avatar, avatarType, avatarIcon, teamIndex }),
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

/* ───── Mural ───── */

export interface MuralEvent {
  id?: string
  userId: string
  userName: string
  groupIds?: string[]
  groupId?: string
  type: string
  value?: number
  xpValue?: number
  createdAt: Timestamp | null
}

export const XP_POR_TIPO: Record<string, number> = {
  baje_peso: 0,
  subi_peso: 0,
  comi_saludable: 1,
  dormi_bien: 1,
  gane_plata: 1,
  hice_deberes: 1,
  comi_chatarra: -1,
  dormi_mal: -1,
  gaste_plata: -1,
  procrastine: -1,
  agua: 0.2,
}

export function calcularXP(tipo: string): number {
  return XP_POR_TIPO[tipo] ?? 0
}

export async function registrarEventoMural(
  userId: string,
  userName: string,
  type: string,
  value?: number,
): Promise<void> {
  const groupIds = await obtenerGruposIds(userId)
  const muralRef = collection(db, 'mural_events')
  const docData: Record<string, unknown> = {
    userId,
    userName,
    groupIds,
    type,
    xpValue: calcularXP(type),
    createdAt: serverTimestamp(),
  }
  if (value !== undefined) docData.value = value
  await addDoc(muralRef, docData)
}

export async function actualizarEventoMural(
  eventId: string,
  tipo: string,
): Promise<void> {
  const docRef = doc(db, 'mural_events', eventId)
  await updateDoc(docRef, { type: tipo, xpValue: calcularXP(tipo) })
}

export async function eliminarEventoMural(eventId: string): Promise<void> {
  const docRef = doc(db, 'mural_events', eventId)
  await deleteDoc(docRef)
}

export function observarEventosMural(
  activeGroupId: string,
  callback: (eventos: MuralEvent[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const muralRef = collection(db, 'mural_events')
  const qNew = query(muralRef, where('groupIds', 'array-contains', activeGroupId))
  const qOld = query(muralRef, where('groupId', '==', activeGroupId))
  const docs: Record<string, MergedDoc> = {}

  const flush = () => {
    callback(buildMerged(docs) as unknown as MuralEvent[])
  }

  const handler = (snap: QuerySnapshot) => {
    applyChanges(docs, snap, 'createdAt')
    flush()
  }
  const errorHandler = (error: Error) => {
    console.error('Error al cargar mural_events:', error)
    if (onError) onError(error)
  }

  const unsubNew = onSnapshot(qNew, handler, errorHandler)
  const unsubOld = onSnapshot(qOld, handler, errorHandler)

  return () => {
    unsubNew()
    unsubOld()
  }
}

/* ───── El Impostor Online ───── */

export type ImpostorStatus = 'LOBBY' | 'PLAYING' | 'VOTING' | 'RESULTS'

export interface ImpostorPlayer {
  id: string
  name: string
  avatar: string
}

export interface ImpostorSecret {
  isImpostor: boolean
  word: string
  description: string
  clue: string
  categoria: string
}

export interface ImpostorRoom {
  code: string
  game: 'impostor'
  status: ImpostorStatus
  hostId: string
  players: ImpostorPlayer[]
  categories: string[]
  cluesEnabled: boolean
  votes: Record<string, string>
  secrets: Record<string, ImpostorSecret>
  impostorIds: string[]
  rounds: number
  winnerId: string | null
}

export interface ImpostorRoundPayload {
  secrets: Record<string, ImpostorSecret>
  impostorIds: string[]
  rounds: number
}

const IMPOSTOR_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
let impostorCodes = new Set<string>()

function generarCodigoImpostor(): string {
  const length = Math.random() < 0.5 ? 5 : 6
  for (let attempt = 0; attempt < 50; attempt++) {
    let codigo = ''
    for (let i = 0; i < length; i++) {
      codigo += IMPOSTOR_CODE_CHARS.charAt(Math.floor(Math.random() * IMPOSTOR_CODE_CHARS.length))
    }
    if (!impostorCodes.has(codigo)) {
      impostorCodes.add(codigo)
      return codigo
    }
  }
  let codigo = ''
  for (let i = 0; i < length; i++) {
    codigo += IMPOSTOR_CODE_CHARS.charAt(Math.floor(Math.random() * IMPOSTOR_CODE_CHARS.length))
  }
  return codigo
}

export async function crearSalaImpostor(
  userId: string,
  displayName: string,
  avatar: string,
  categories: string[],
  cluesEnabled: boolean,
): Promise<string> {
  const code = generarCodigoImpostor()
  const salaRef = doc(db, 'arcade_impostor_rooms', code)
  await setDoc(salaRef, {
    code,
    game: 'impostor',
    status: 'LOBBY',
    hostId: userId,
    players: [{ id: userId, name: displayName, avatar }],
    categories: categories.length > 0 ? categories : ['Animales'],
    cluesEnabled,
    votes: {},
    secrets: {},
    impostorIds: [],
    rounds: 0,
    winnerId: null,
  })
  return code
}

export async function unirseSalaImpostor(
  codigo: string,
  userId: string,
  displayName: string,
  avatar: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_impostor_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as ImpostorRoom
  if (data.status !== 'LOBBY') throw new Error('La partida ya empezó')

  const existing = data.players.find((p) => p.id === userId)
  if (existing) {
    await updateDoc(salaRef, {
      players: data.players.map((p) =>
        p.id === userId ? { id: userId, name: displayName, avatar } : p
      ),
    })
  } else {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, avatar }),
    })
  }
}

export function observarSalaImpostor(
  codigo: string,
  callback: (sala: ImpostorRoom) => void,
): () => void {
  const salaRef = doc(db, 'arcade_impostor_rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as ImpostorRoom)
    }
  })
}

export async function actualizarConfigImpostor(
  codigo: string,
  config: { categories?: string[]; cluesEnabled?: boolean },
): Promise<void> {
  const update: Record<string, unknown> = {}
  if (config.categories) update.categories = config.categories
  if (config.cluesEnabled !== undefined) update.cluesEnabled = config.cluesEnabled
  await updateDoc(doc(db, 'arcade_impostor_rooms', codigo), update)
}

export async function iniciarRondaImpostor(
  codigo: string,
  payload: ImpostorRoundPayload,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_impostor_rooms', codigo), {
    status: 'PLAYING',
    votes: {},
    secrets: payload.secrets,
    impostorIds: payload.impostorIds,
    rounds: payload.rounds,
    winnerId: null,
  })
}

export async function pasarAVotacionImpostor(codigo: string): Promise<void> {
  await updateDoc(doc(db, 'arcade_impostor_rooms', codigo), {
    status: 'VOTING',
  })
}

export async function emitirVotoImpostor(
  codigo: string,
  voterId: string,
  targetId: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_impostor_rooms', codigo), {
    [`votes.${voterId}`]: targetId,
  })
}

export async function finalizarVotacionImpostor(codigo: string): Promise<void> {
  const salaRef = doc(db, 'arcade_impostor_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as ImpostorRoom

  const counts: Record<string, number> = {}
  for (const targetId of Object.values(data.votes)) {
    counts[targetId] = (counts[targetId] ?? 0) + 1
  }

  let maxCount = 0
  let winnerId: string | null = null
  for (const pid of data.players.map((p) => p.id)) {
    const count = counts[pid] ?? 0
    if (count > maxCount) {
      maxCount = count
      winnerId = pid
    }
  }

  await updateDoc(salaRef, { status: 'RESULTS', winnerId })
}

export async function abandonarSalaImpostor(
  codigo: string,
  userId: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_impostor_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as ImpostorRoom
  const players = data.players.filter((p) => p.id !== userId)
  if (players.length === 0) {
    await deleteDoc(salaRef)
    return
  }
  const update: Record<string, unknown> = { players }
  if (data.hostId === userId) {
    update.hostId = players[0]!.id
  }
  await updateDoc(salaRef, update)
}

/* ───── Bomba de Tiempo Online ───── */

export type BombaPenitenceMode = 'aleatoria' | 'personalizada'
export type BombaPhase = 'lobby' | 'playing' | 'exploded' | 'resolution'

export interface BombaPlayer {
  id: string
  name: string
  avatar: string
  avatarType?: string
  avatarIcon?: string
}

export interface BombaRoom {
  code: string
  game: string
  hostId: string
  players: BombaPlayer[]
  phase: BombaPhase
  order: string[]
  currentPlayerId: string
  currentQuestion: string
  turnCount: number
  deadline: number
  totalTime: number
  penitenceMode: BombaPenitenceMode
  penitencia: string
  customPenitencia: string
  usedQuestions: string[]
  usedPenitencias: string[]
}

export async function crearSalaBomba(
  userId: string,
  displayName: string,
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<string> {
  const code = generarCodigoSala()
  await setDoc(doc(db, 'arcade_rooms', code), {
    code,
    game: 'bomba',
    hostId: userId,
    players: [{ id: userId, name: displayName, avatar, avatarType, avatarIcon }],
    phase: 'lobby',
    order: [],
    currentPlayerId: '',
    currentQuestion: '',
    turnCount: 1,
    deadline: 0,
    totalTime: 0,
    penitenceMode: 'aleatoria',
    penitencia: '',
    customPenitencia: '',
    usedQuestions: [],
    usedPenitencias: [],
  })
  return code
}

export async function unirseSalaBomba(
  codigo: string,
  userId: string,
  displayName: string,
  avatar: string,
  avatarType?: string,
  avatarIcon?: string,
): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) throw new Error('Sala no encontrada')

  const data = snap.data() as BombaRoom
  if (data.game !== 'bomba') throw new Error('El código no corresponde a una sala de Bomba')
  if (data.phase !== 'lobby') throw new Error('La partida ya empezó')

  const exists = data.players.some((p) => p.id === userId)
  if (!exists) {
    await updateDoc(salaRef, {
      players: arrayUnion({ id: userId, name: displayName, avatar, avatarType, avatarIcon }),
    })
  }
}

export function observarSalaBomba(
  codigo: string,
  callback: (sala: BombaRoom) => void,
): () => void {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  return onSnapshot(salaRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as BombaRoom)
    }
  })
}

export async function iniciarJuegoBomba(
  codigo: string,
  opts: {
    question: string
    totalTime: number
    order: string[]
    penitenceMode: BombaPenitenceMode
  },
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    phase: 'playing',
    order: opts.order,
    currentPlayerId: opts.order[0] ?? '',
    currentQuestion: opts.question,
    turnCount: 1,
    totalTime: opts.totalTime,
    deadline: Date.now() + opts.totalTime * 1000,
    penitenceMode: opts.penitenceMode,
    penitencia: '',
    customPenitencia: '',
    usedQuestions: [opts.question],
  })
}

export async function pasarTurnoBomba(
  codigo: string,
  userId: string,
  opts: {
    question: string
    totalTime: number
    nextPlayerId: string
    turnCount: number
  },
): Promise<boolean> {
  let ok = false
  await runTransaction(db, async (tx) => {
    const salaRef = doc(db, 'arcade_rooms', codigo)
    const snap = await tx.get(salaRef)
    if (!snap.exists()) return
    const data = snap.data() as BombaRoom
    if (data.phase !== 'playing') return
    if (data.currentPlayerId !== userId && data.hostId !== userId) return
    tx.update(salaRef, {
      currentPlayerId: opts.nextPlayerId,
      currentQuestion: opts.question,
      turnCount: opts.turnCount,
      totalTime: opts.totalTime,
      deadline: Date.now() + opts.totalTime * 1000,
      usedQuestions: [...data.usedQuestions, opts.question],
    })
    ok = true
  })
  return ok
}

export async function explotarBomba(
  codigo: string,
  callerId: string,
  opts: { penitencia?: string },
): Promise<boolean> {
  let ok = false
  await runTransaction(db, async (tx) => {
    const salaRef = doc(db, 'arcade_rooms', codigo)
    const snap = await tx.get(salaRef)
    if (!snap.exists()) return
    const data = snap.data() as BombaRoom
    if (data.phase !== 'playing') return
    if (data.currentPlayerId !== callerId && data.hostId !== callerId) return
    tx.update(salaRef, {
      phase: 'exploded',
      penitencia: opts.penitencia ?? '',
      updatedAt: Date.now(),
    })
    ok = true
  })
  return ok
}

export async function continuarBomba(codigo: string): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), { phase: 'resolution' })
}

export async function nuevaRondaBomba(
  codigo: string,
  opts: {
    question: string
    totalTime: number
    order: string[]
    turnCount: number
    usedQuestions: string[]
  },
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    phase: 'playing',
    currentPlayerId: opts.order[0] ?? '',
    currentQuestion: opts.question,
    turnCount: opts.turnCount,
    totalTime: opts.totalTime,
    deadline: Date.now() + opts.totalTime * 1000,
    usedQuestions: opts.usedQuestions,
    penitencia: '',
    customPenitencia: '',
  })
}

export async function actualizarPenitenciaPersonalizada(
  codigo: string,
  text: string,
): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    customPenitencia: text,
  })
}

export async function abandonarSalaBomba(codigo: string, userId: string): Promise<void> {
  const salaRef = doc(db, 'arcade_rooms', codigo)
  const snap = await getDoc(salaRef)
  if (!snap.exists()) return
  const data = snap.data() as BombaRoom
  const players = data.players.filter((p) => p.id !== userId)
  if (players.length === 0) {
    await deleteDoc(salaRef)
    return
  }
  const order = data.order.filter((id) => id !== userId)
  const update: Record<string, unknown> = { players, order }
  if (data.hostId === userId) {
    update.hostId = players[0]!.id
  }
  if (data.currentPlayerId === userId) {
    update.currentPlayerId = order[0] ?? ''
  }
  await updateDoc(salaRef, update)
}

export async function reiniciarSalaBomba(codigo: string): Promise<void> {
  await updateDoc(doc(db, 'arcade_rooms', codigo), {
    phase: 'lobby',
    order: [],
    currentPlayerId: '',
    currentQuestion: '',
    turnCount: 1,
    deadline: 0,
    totalTime: 0,
    penitencia: '',
    customPenitencia: '',
    usedQuestions: [],
    usedPenitencias: [],
  })
}
