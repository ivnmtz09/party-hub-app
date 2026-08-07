import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { Word } from '../modules/arcade/types'
import {
  leerJuegos,
  leerSucesos,
  leerPalabras,
  leerFamosos,
  leerDecks,
  leerBomba,
  leerActividades,
  leerLogin,
  leerManual,
  JUEGOS_DEFAULT,
  SUCESOS_DEFAULT,
  CATEGORIAS_DEFAULT,
  PALABRAS_DEFAULT,
  FAMOSOS_DEFAULT,
  DECKS_DEFAULT,
  BOMBA_DEFAULT,
  ACTIVIDADES_CONTENIDO_DEFAULT,
  LOGIN_DEFAULT,
  MANUAL_DEFAULT,
  type JuegoContenido,
  type SucesoContenido,
  type CategoriaContenido,
  type DeckContenido,
  type ActividadContenido,
  type FeatureContenido,
  type ManualContenido,
} from '../firebase/content'

export interface ContenidoApp {
  juegos: JuegoContenido[]
  sucesos: SucesoContenido[]
  sucesoLabel: Record<string, string>
  categorias: CategoriaContenido[]
  palabras: Word[]
  famosos: string[]
  decks: DeckContenido[]
  preguntas: string[]
  penitencias: string[]
  actividades: ActividadContenido[]
  terminos: string[]
  features: FeatureContenido[]
  manual: ManualContenido[]
}

const CONTENIDO_INICIAL: ContenidoApp = {
  juegos: JUEGOS_DEFAULT,
  sucesos: SUCESOS_DEFAULT,
  sucesoLabel: Object.fromEntries(SUCESOS_DEFAULT.map((s) => [s.type, s.label])),
  categorias: CATEGORIAS_DEFAULT,
  palabras: PALABRAS_DEFAULT,
  famosos: FAMOSOS_DEFAULT,
  decks: DECKS_DEFAULT,
  preguntas: BOMBA_DEFAULT.preguntas,
  penitencias: BOMBA_DEFAULT.penitencias,
  actividades: ACTIVIDADES_CONTENIDO_DEFAULT,
  features: LOGIN_DEFAULT.features,
  terminos: LOGIN_DEFAULT.terminos,
  manual: MANUAL_DEFAULT,
}

interface ContentContextValue {
  content: ContenidoApp
  status: 'cargando' | 'listo'
  recargar: () => void
  getActividad: (tipo: string) => ActividadContenido | undefined
  getDeck: (id: string) => DeckContenido | undefined
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContenidoApp>(CONTENIDO_INICIAL)
  const [status, setStatus] = useState<'cargando' | 'listo'>('cargando')

  const cargar = useCallback(async () => {
    setStatus('cargando')
    const [juegos, sucesos, palabras, famosos, decks, bomba, actividades, login, manual] =
      await Promise.all([
        leerJuegos(),
        leerSucesos(),
        leerPalabras(),
        leerFamosos(),
        leerDecks(),
        leerBomba(),
        leerActividades(),
        leerLogin(),
        leerManual(),
      ])

    setContent({
      juegos,
      sucesos,
      sucesoLabel: Object.fromEntries(sucesos.map((s) => [s.type, s.label])),
      categorias: palabras.categorias,
      palabras: palabras.palabras,
      famosos,
      decks,
      preguntas: bomba.preguntas,
      penitencias: bomba.penitencias,
      actividades: actividades,
      features: login.features,
      terminos: login.terminos,
      manual,
    })
    setStatus('listo')
  }, [])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const value = useMemo<ContentContextValue>(
    () => ({
      content,
      status,
      recargar: () => {
        void cargar()
      },
      getActividad: (tipo: string) =>
        content.actividades.find((a) => a.tipo === tipo) ??
        content.actividades[0],
      getDeck: (id: string) => content.decks.find((d) => d.id === id),
    }),
    [content, status, cargar],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useAppContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useAppContent must be used within a ContentProvider')
  return ctx
}