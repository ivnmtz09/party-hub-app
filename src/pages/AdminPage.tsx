import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Database } from 'lucide-react'
import { useAppContent } from '../context/ContentContext'
import { sincronizarContenido } from '../firebase/content'
import BrandLogo from '../components/BrandLogo'

export default function AdminPage() {
  const navigate = useNavigate()
  const { content, status, recargar } = useAppContent()
  const [syncing, setSyncing] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResultado(null)
    try {
      await sincronizarContenido()
      setResultado({ ok: true, msg: 'CONTENIDO SINCRONIZADO CON FIRESTORE' })
    } catch {
      setResultado({ ok: false, msg: 'ERROR AL SINCRONIZAR EL CONTENIDO' })
    } finally {
      setSyncing(false)
    }
  }

  const secciones = [
    { nombre: 'JUEGOS', cantidad: content.juegos.length },
    { nombre: 'SUCESOS (MURAL)', cantidad: content.sucesos.length },
    { nombre: 'CATEGORÍAS (IMPOSTOR)', cantidad: content.categorias.length },
    { nombre: 'DECKS (CARTAS)', cantidad: content.decks.length },
    { nombre: 'PREGUNTAS (BOMBA)', cantidad: content.preguntas.length },
    { nombre: 'PENITENCIAS (BOMBA)', cantidad: content.penitencias.length },
    { nombre: 'ACTIVIDADES (TABLERO)', cantidad: content.actividades.length },
    { nombre: 'MANUAL', cantidad: content.manual.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none font-black uppercase flex items-center gap-2 w-fit transition-all text-black dark:text-white"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          ATRAS
        </button>

        <div className="border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 8px, transparent 8px, transparent 20px)',
            }}
          />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">
                GESTIÓN DE CONTENIDO
              </p>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-black">
                ADMIN SYNC
              </h1>
            </div>
            <BrandLogo size="md" />
          </div>
        </div>

        <div className="border-4 border-black dark:border-white bg-white dark:bg-gray-800 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          <div className="px-5 py-3.5 border-b-4 border-black dark:border-white bg-gray-100 dark:bg-gray-700 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-black dark:text-white">
              ESTADO
            </p>
            <span
              className={`px-2 py-0.5 border-2 border-black font-black text-[10px] ${
                status === 'listo'
                  ? 'bg-emerald-300 dark:bg-emerald-500 text-black'
                  : 'bg-yellow-300 dark:bg-yellow-400 text-black animate-pulse'
              }`}
            >
              {status === 'listo' ? 'CARGA DE FIRESTORE' : 'CARGANDO...'}
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {secciones.map((s) => (
                <div
                  key={s.nombre}
                  className="border-2 border-black dark:border-white p-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900"
                >
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 truncate pr-2">
                    {s.nombre}
                  </p>
                  <span className="text-lg font-black text-black dark:text-white">
                    {s.cantidad}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center justify-center gap-2 py-3 border-4 border-black dark:border-white bg-emerald-300 dark:bg-emerald-500 text-black dark:text-gray-900 font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database size={16} strokeWidth={2.5} />
                {syncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR CONTENIDO A FIRESTORE'}
              </button>
              <button
                onClick={() => { recargar(); setResultado({ ok: true, msg: 'CONTENIDO RECARGADO DESDE FIRESTORE' }) }}
                className="flex items-center justify-center gap-2 py-3 border-2 border-black dark:border-white bg-blue-400 dark:bg-blue-500 text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <RefreshCw size={16} strokeWidth={2.5} />
                RECARGAR CONTENIDO
              </button>
            </div>

            {resultado && (
              <p
                className={`text-[11px] font-black uppercase tracking-wider text-center py-2 border-2 border-black dark:border-white ${
                  resultado.ok
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                }`}
              >
                {resultado.msg}
              </p>
            )}

            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-relaxed">
              LA SINCRONIZACIÓN ESCRIBE LOS CONTENIDOS POR DEFECTO EN FIRESTORE. LA APP
              SIEMPRE USA FIRESTORE SI LOS DOCUMENTOS EXISTEN, CON LOS DEFAULTS COMO
              RESPALDO EN CÓDIGO.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}