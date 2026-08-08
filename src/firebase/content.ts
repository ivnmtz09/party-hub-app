import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { db } from './config'
import { allWords, categoryMap } from '../modules/arcade/data/words'
import { FAMOSOS } from '../modules/arcade/data/famosos'
import { decks as decksDefault } from '../modules/arcade/data/decks'
import {
  preguntas as preguntasDefault,
  penitencias as penitenciasDefault,
} from '../modules/arcade/data/bomba'
import { ACTIVIDADES_DEFAULT } from '../config/actividades'
import type { Word } from '../modules/arcade/types'

/* ─── Tipos de contenido ─── */

export interface JuegoContenido {
  id: string
  title: string
  description: string
  icon: string
  path: string
  active: boolean
  turbio?: boolean
  order: number
}

export interface SucesoContenido {
  type: string
  label: string
  icon: string
  bg: string
  order: number
}

export interface CategoriaContenido {
  name: string
  icon: string
  words: Word[]
}

export interface DeckContenido {
  id: string
  titulo: string
  descripcion: string
  esTurbio: boolean
  cartas: string[]
}

export interface ActividadContenido {
  tipo: string
  label: string
  labelPlural: string
  badgeColor: string
  tileColor: string
  iconColor: string
  icon: string
}

export interface FeatureContenido {
  text: string
  icon: string
}

export interface ManualContenido {
  title: string
  desc: string
  icon: string
}

/* ─── Contenido por defecto ─── */

export const JUEGOS_DEFAULT: JuegoContenido[] = [
  { id: 'impostor', title: 'El Impostor', description: 'Descubre al impostor antes de que sea demasiado tarde', icon: 'UserX', path: '/arcade/impostor', active: true, order: 0 },
  { id: 'dedo', title: 'Quién Es Más Probable...?', description: 'Multijugador: ¿quién es más probable que...?', icon: 'Hand', path: '/arcade/juego', active: true, turbio: true, order: 1 },
  { id: 'yo-nunca', title: 'Yo Nunca', description: 'Confiesa tus pecados más oscuros', icon: 'Skull', path: '/arcade/yo-nunca', active: true, turbio: true, order: 2 },
  { id: 'frente', title: 'Frente a Frente', description: 'Charadas en equipo. Adivina famosos con el celular en la frente', icon: 'Users', path: '/arcade/frente-a-frente', active: true, order: 3 },
  { id: 'bomba', title: 'Bomba de Tiempo', description: 'Responde rápido o la bomba explota', icon: 'Bomb', path: '/arcade/bomba', active: true, turbio: true, order: 4 },
  { id: 'codigo-secreto', title: 'Código Secreto', description: 'Adivina el código de 4 cifras de tu rival (1v1)', icon: 'Lock', path: '/arcade/codigo-secreto', active: true, order: 5 },
  { id: 'ruleta', title: 'Ruleta Personalizada', description: 'Agrega opciones, gírala y descubre el resultado', icon: 'RotateCw', path: '/arcade/rouleta', active: true, order: 6 },
  { id: 'mansion', title: 'Misterio en la Mansión', description: 'Deducción y thriller psicológico', icon: 'Search', path: '#', active: false, order: 7 },
]

export const SUCESOS_DEFAULT: SucesoContenido[] = [
  { type: 'subi_peso', label: 'SUBÍ DE PESO', icon: 'ArrowUp', bg: 'bg-red-500 dark:bg-red-600 text-white', order: 0 },
  { type: 'baje_peso', label: 'BAJÉ DE PESO', icon: 'ArrowDown', bg: 'bg-green-400 dark:bg-green-500 text-black dark:text-gray-900', order: 1 },
  { type: 'comi_saludable', label: 'COMÍ SALUDABLE', icon: 'Leaf', bg: 'bg-lime-400 dark:bg-lime-500 text-black', order: 2 },
  { type: 'comi_chatarra', label: 'COMÍ CHATARRA', icon: 'Hamburger', bg: 'bg-orange-400 dark:bg-orange-500 text-black dark:text-gray-900', order: 3 },
  { type: 'dormi_bien', label: 'DORMÍ BIEN', icon: 'Moon', bg: 'bg-cyan-300 dark:bg-cyan-500 text-black dark:text-gray-900', order: 4 },
  { type: 'dormi_mal', label: 'DORMÍ MAL', icon: 'CloudRain', bg: 'bg-slate-400 dark:bg-slate-500 text-black dark:text-gray-900', order: 5 },
  { type: 'gane_plata', label: 'GANÉ PLATA', icon: 'Coins', bg: 'bg-green-400 dark:bg-green-500 text-black dark:text-gray-900', order: 6 },
  { type: 'gaste_plata', label: 'GASTÉ PLATA', icon: 'Banknote', bg: 'bg-yellow-300 dark:bg-yellow-500 text-black', order: 7 },
  { type: 'hice_deberes', label: 'HICE DEBERES', icon: 'BookOpen', bg: 'bg-blue-300 dark:bg-blue-400 text-black', order: 8 },
  { type: 'procrastine', label: 'PROCRASTINÉ', icon: 'Clock', bg: 'bg-pink-400 dark:bg-pink-500 text-black dark:text-gray-900', order: 9 },
]

export const AGUA_LABEL = '+1 VASO DE AGUA'

export const CATEGORIAS_DEFAULT: CategoriaContenido[] = categoryMap.map((cat) => ({
  name: cat.name,
  icon: cat.name === 'Animales' ? 'Dog' : dogFor(cat.name),
  words: allWords.filter((w) => w.categoria === cat.name),
}))

function dogFor(name: string): string {
  const icons: Record<string, string> = {
    Animales: 'Dog',
    'Películas': 'Film',
    Comida: 'Pizza',
    'Geografía': 'Globe',
    'Música': 'Music',
    'Tecnología': 'Cog',
    'Series y TV': 'Tv',
    Hogar: 'Home',
  }
  return icons[name] ?? 'Dog'
}

export const PALABRAS_DEFAULT: Word[] = allWords

export const FAMOSOS_DEFAULT: string[] = FAMOSOS

export const DECKS_DEFAULT: DeckContenido[] = decksDefault.map((d) => ({
  id: d.id,
  titulo: d.titulo,
  descripcion: d.descripcion,
  esTurbio: d.esTurbio,
  cartas: d.cartas,
}))

export const BOMBA_DEFAULT = {
  preguntas: preguntasDefault,
  penitencias: penitenciasDefault,
}

export const ACTIVIDADES_CONTENIDO_DEFAULT: ActividadContenido[] = ACTIVIDADES_DEFAULT.map(
  (a) => ({
    tipo: a.tipo,
    label: a.label,
    labelPlural: a.labelPlural,
    badgeColor: a.badgeColor,
    tileColor: a.tileColor,
    iconColor: a.iconColor,
    icon: mapIconActividad(a.tipo),
  }),
)

function mapIconActividad(tipo: string): string {
  const mapa: Record<string, string> = {
    deposicion: 'Trash2',
    acto_sexual: 'Flame',
    meada: 'Droplet',
    gym: 'Dumbbell',
  }
  return mapa[tipo] ?? 'Gamepad2'
}

export const LOGIN_DEFAULT = {
  terminos: [
    '1. PRIVACIDAD: Tu cuenta de Google solo se usa para autenticación y gestión de perfil. No vendemos tus datos.',
    '2. RESPONSABILIDAD: Esta es una aplicación de entretenimiento. El contenido generado (juegos, votaciones, registros) es responsabilidad absoluta de los usuarios.',
    '3. COMPORTAMIENTO: Se prohíbe el uso de la plataforma para acoso, bullying o difusión de contenido ilegal. El incumplimiento causará la expulsión inmediata del grupo.',
    '4. NATURALEZA DEL JUEGO: Al aceptar, reconoces que los juegos son de carácter recreativo y pueden incluir temas personales o sensibles. Juega con criterio.',
  ],
  features: [
    { text: 'Destruye amistades en el Arcade con Yo Nunca y el Dedo en la Llaga.', icon: 'Swords' },
    { text: 'Registra las peores cagadas y el progreso en el gimnasio.', icon: 'BarChart2' },
    { text: 'Crea grupos cerrados y mantén los secretos a salvo.', icon: 'Users' },
  ],
}

export const MANUAL_DEFAULT: ManualContenido[] = [
  {
    title: 'Inicio',
    desc: 'Administras tus grupos. Ves los códigos de invitación y las tarjetas de estadísticas de cada miembro (conteo y última vez de Cagadas, Culeadas, Meadas y días de Gym).',
    icon: 'Home',
  },
  {
    title: 'Tablero',
    desc: 'Es el registro de eventos principales. Publicas tus Cagadas, Culeadas, Meadas y Gym. Puedes reaccionar y comentar las publicaciones de tus amigos y ver gráficos estadísticos mensuales.',
    icon: 'ClipboardList',
  },
  {
    title: 'Mural (Gamificación)',
    desc: 'Panel de hábitos diarios. Registra acciones rápidas para ganar Puntos de Experiencia (XP). Hábitos buenos suman +1 XP, hábitos malos restan -1 XP. El peso (subir/bajar) es neutro (0 XP). Cada vaso de agua de 200ml suma +0.2 XP. El feed se limpia cada medianoche, pero el XP se acumula todo el mes para el ranking del grupo.',
    icon: 'Star',
  },
  {
    title: 'Arcade',
    desc: 'Catálogo de minijuegos multijugador para pasar el rato con tu grupo: Impostor, Bomba de Tiempo, Ruleta, Dedo en la Llaga, Código Secreto y Frente a Frente.',
    icon: 'Gamepad2',
  },
]

/* ─── Lectura desde Firestore (con fallback) ─── */

export async function leerJuegos(): Promise<JuegoContenido[]> {
  try {
    const q = query(collection(db, 'juegos'), orderBy('order'))
    const snap = await getDocs(q)
    if (snap.empty) return JUEGOS_DEFAULT
    return snap.docs
      .map((d) => {
        const data = d.data() as JuegoContenido
        return { ...data, id: d.id }
      })
      .sort((a, b) => a.order - b.order)
  } catch {
    return JUEGOS_DEFAULT
  }
}

export async function leerSucesos(): Promise<SucesoContenido[]> {
  try {
    const q = query(collection(db, 'sucesos'), orderBy('order'))
    const snap = await getDocs(q)
    if (snap.empty) return SUCESOS_DEFAULT
    const lista = snap.docs.map((d) => {
      const data = d.data() as Omit<SucesoContenido, 'type'>
      return { type: d.id, ...data }
    })
    return lista.sort((a, b) => a.order - b.order)
  } catch {
    return SUCESOS_DEFAULT
  }
}

export async function leerPalabras(): Promise<{
  categorias: CategoriaContenido[]
  palabras: Word[]
}> {
  try {
    const q = query(collection(db, 'palabras'), orderBy('order'))
    const snap = await getDocs(q)
    if (snap.empty) {
      return { categorias: CATEGORIAS_DEFAULT, palabras: PALABRAS_DEFAULT }
    }
    const categorias = snap.docs.map((d) => {
      const data = d.data() as { name?: string; icon?: string; words?: Word[]; order?: number }
      return {
        name: data.name ?? d.id,
        icon: data.icon ?? 'Dog',
        words: data.words ?? [],
      }
    })
    const palabras = categorias.flatMap((c) => c.words)
    const usable = categorias.filter((c) => c.words.length > 0)
    return { categorias: usable.length > 0 ? usable : CATEGORIAS_DEFAULT, palabras: palabras.length > 0 ? palabras : PALABRAS_DEFAULT }
  } catch {
    return { categorias: CATEGORIAS_DEFAULT, palabras: PALABRAS_DEFAULT }
  }
}

export async function leerFamosos(): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, 'famosos', 'lista'))
    if (!snap.exists()) return FAMOSOS_DEFAULT
    const nombres = (snap.data().nombres as string[] | undefined) ?? []
    return nombres.length > 0 ? nombres : FAMOSOS_DEFAULT
  } catch {
    return FAMOSOS_DEFAULT
  }
}

export async function leerDecks(): Promise<DeckContenido[]> {
  try {
    const snap = await getDocs(collection(db, 'decks'))
    if (snap.empty) return DECKS_DEFAULT
    const lista = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<DeckContenido, 'id'>),
    }))
    return lista.filter((d) => d.cartas?.length).length > 0 ? lista : DECKS_DEFAULT
  } catch {
    return DECKS_DEFAULT
  }
}

export async function leerBomba(): Promise<{ preguntas: string[]; penitencias: string[] }> {
  try {
    const snap = await getDoc(doc(db, 'bomba', 'datos'))
    if (!snap.exists()) return BOMBA_DEFAULT
    const data = snap.data() as { preguntas?: string[]; penitencias?: string[] }
    return {
      preguntas: data.preguntas?.length ? data.preguntas : BOMBA_DEFAULT.preguntas,
      penitencias: data.penitencias?.length ? data.penitencias : BOMBA_DEFAULT.penitencias,
    }
  } catch {
    return BOMBA_DEFAULT
  }
}

export async function leerActividades(): Promise<ActividadContenido[]> {
  try {
    const snap = await getDoc(doc(db, 'config', 'actividades'))
    if (!snap.exists()) return ACTIVIDADES_CONTENIDO_DEFAULT
    const tipos = (snap.data().tipos as ActividadContenido[] | undefined) ?? []
    return tipos.length > 0 ? tipos : ACTIVIDADES_CONTENIDO_DEFAULT
  } catch {
    return ACTIVIDADES_CONTENIDO_DEFAULT
  }
}

export async function leerLogin(): Promise<{ terminos: string[]; features: FeatureContenido[] }> {
  try {
    const snap = await getDoc(doc(db, 'config', 'login'))
    if (!snap.exists()) return LOGIN_DEFAULT
    const data = snap.data() as { terminos?: string[]; features?: FeatureContenido[] }
    return {
      terminos: data.terminos?.length ? data.terminos : LOGIN_DEFAULT.terminos,
      features: data.features?.length ? data.features : LOGIN_DEFAULT.features,
    }
  } catch {
    return LOGIN_DEFAULT
  }
}

export async function leerManual(): Promise<ManualContenido[]> {
  try {
    const snap = await getDoc(doc(db, 'config', 'manual'))
    if (!snap.exists()) return MANUAL_DEFAULT
    const items = (snap.data().items as ManualContenido[] | undefined) ?? []
    return items.length > 0 ? items : MANUAL_DEFAULT
  } catch {
    return MANUAL_DEFAULT
  }
}

/* ─── Sincronizar contenido por defecto a Firestore ─── */

export async function sincronizarContenido(): Promise<void> {
  const batch = [] as Promise<void>[]

  JUEGOS_DEFAULT.forEach((j) => {
    const { id, ...rest } = j
    batch.push(setDoc(doc(db, 'juegos', id), rest))
  })

  SUCESOS_DEFAULT.forEach((s) => {
    const { type, ...rest } = s
    batch.push(setDoc(doc(db, 'sucesos', type), rest))
  })

  CATEGORIAS_DEFAULT.forEach((c, i) => {
    batch.push(setDoc(doc(db, 'palabras', c.name), { name: c.name, icon: c.icon, words: c.words, order: i }))
  })

  batch.push(setDoc(doc(db, 'famosos', 'lista'), { nombres: FAMOSOS_DEFAULT }))

  DECKS_DEFAULT.forEach((d) => {
    const { id, ...rest } = d
    batch.push(setDoc(doc(db, 'decks', id), rest))
  })

  batch.push(
    setDoc(doc(db, 'bomba', 'datos'), {
      preguntas: BOMBA_DEFAULT.preguntas,
      penitencias: BOMBA_DEFAULT.penitencias,
    }),
  )

  batch.push(
    setDoc(doc(db, 'config', 'actividades'), { tipos: ACTIVIDADES_CONTENIDO_DEFAULT }),
  )
  batch.push(
    setDoc(doc(db, 'config', 'login'), {
      terminos: LOGIN_DEFAULT.terminos,
      features: LOGIN_DEFAULT.features,
    }),
  )
  batch.push(
    setDoc(doc(db, 'config', 'manual'), { items: MANUAL_DEFAULT }),
  )

  await Promise.all(batch)
}