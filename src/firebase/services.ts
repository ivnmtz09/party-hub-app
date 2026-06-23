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
