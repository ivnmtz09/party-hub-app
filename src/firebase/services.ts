import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { User } from 'firebase/auth'

const GRUPO_ID = 'grupo-principal'

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

export async function asegurarGrupo() {
  const ref = doc(db, 'grupos', GRUPO_ID)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre: 'Grupo Principal',
      createdAt: serverTimestamp(),
      createdBy: 'system',
    })
  }
  return GRUPO_ID
}

export async function asegurarMiembro(user: User) {
  const ref = doc(db, 'grupos', GRUPO_ID, 'miembros', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      id: user.uid,
      displayName: user.displayName ?? 'Invitado',
      email: user.email ?? '',
      deposiciones: 0,
      actosSexuales: 0,
      ultimaDeposicion: null,
      ultimoActoSexual: null,
    })
  }
}

export function observarMiembros(
  callback: (miembros: Miembro[]) => void,
): () => void {
  const ref = collection(db, 'grupos', GRUPO_ID, 'miembros')
  const q = query(ref, orderBy('displayName'))
  return onSnapshot(q, (snap) => {
    const lista: Miembro[] = []
    snap.forEach((d) => lista.push(d.data() as Miembro))
    callback(lista)
  })
}

export function observarEventos(
  callback: EventoCallback,
): () => void {
  const ref = collection(db, 'eventos')
  const q = query(ref, orderBy('timestamp', 'desc'))
  return onSnapshot(q, (snap) => {
    const lista: Evento[] = []
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() } as Evento))
    callback(lista)
  })
}

export async function registrarEvento(
  userId: string,
  tipo: 'deposicion' | 'acto_sexual',
) {
  const eventoRef = collection(db, 'eventos')
  await addDoc(eventoRef, {
    userId,
    tipo,
    timestamp: serverTimestamp(),
    grupoId: GRUPO_ID,
  })

  const miembroRef = doc(db, 'grupos', GRUPO_ID, 'miembros', userId)
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
