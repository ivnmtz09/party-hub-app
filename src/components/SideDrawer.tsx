import { useEffect, useRef, useState } from "react";
import {
  X,
  LogOut,
  Sun,
  Moon,
  Code,
  ExternalLink,
  HelpCircle,
  Activity,
  UserX,
  Bomb,
  RotateCw,
  Target,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useLockBodyScroll from "../hooks/useLockBodyScroll";

interface Props {
  open: boolean;
  onClose: () => void;
}

function ManualItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-2 p-2 border-b-2 border-black dark:border-white last:border-b-0">
      <div className="w-6 h-6 border-2 border-black dark:border-white flex items-center justify-center shrink-0 mt-0.5 bg-white dark:bg-gray-700">
        <span className="text-[10px]">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-black dark:text-white">
          {title}
        </p>
        <p className="text-[9px] font-bold leading-relaxed text-gray-600 dark:text-gray-400">
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function SideDrawer({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showManual, setShowManual] = useState(false);

  useLockBodyScroll(open);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/70 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-white dark:bg-gray-900 border-r-4 border-black dark:border-white transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-400 shrink-0">
            <h2 className="text-lg font-black uppercase tracking-wider text-black dark:text-gray-900">
              Menu
            </h2>
            <button
              onClick={onClose}
              className="p-1 border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800">
              <div className="w-10 h-10 bg-yellow-300 dark:bg-yellow-400 border-2 border-black dark:border-white flex items-center justify-center text-sm font-black text-black dark:text-gray-900">
                {(user?.displayName ?? user?.email ?? "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white truncate">
                  {user?.displayName ?? "Invitado"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowManual(!showManual)}
              className="w-full flex items-center gap-3 px-3 py-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 font-black uppercase tracking-wider text-sm text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <HelpCircle size={20} strokeWidth={2.5} />
              <span className="flex-1 text-left">Como jugar</span>
              <ChevronDown
                size={16}
                strokeWidth={2.5}
                className={`transition-transform ${showManual ? "rotate-180" : ""}`}
              />
            </button>

            {showManual && (
              <div className="space-y-2 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-1">
                  <ManualItem
                    icon={<Activity size={16} strokeWidth={2.5} />}
                    title="El Tablero"
                    desc="Registra tus Cagadas, Culeadas y tus idas al GYM. Las graficas se reinician cada mes para coronar a un nuevo lider."
                  />
                  <ManualItem
                    icon={<UserX size={16} strokeWidth={2.5} />}
                    title="El Impostor"
                    desc="Un jugador oculto no conoce la palabra secreta. Los civiles deben dar pistas de UNA sola palabra. Vota antes de que el impostor gane!"
                  />
                  <ManualItem
                    icon={<Bomb size={16} strokeWidth={2.5} />}
                    title="Bomba de Tiempo"
                    desc="Responde la pregunta de presion y pasa el turno rapido. El tiempo disminuye cada ronda. Si te explota, preparate para una penitencia turbia."
                  />
                  <ManualItem
                    icon={<RotateCw size={16} strokeWidth={2.5} />}
                    title="Ruleta"
                    desc="Personaliza la rueda con nombres, opciones o letras (ideal para jugar Stop). Gira y que la suerte decida."
                  />
                  <ManualItem
                    icon={<Target size={16} strokeWidth={2.5} />}
                    title="Dedo en la Llaga"
                    desc="Votacion grupal y democratica. Quien del grupo es el mas probable en hacer lo que dice la tarjeta?"
                  />
                </div>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 font-black uppercase tracking-wider text-sm text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              {theme === "dark" ? (
                <Sun size={20} strokeWidth={2.5} />
              ) : (
                <Moon size={20} strokeWidth={2.5} />
              )}
              <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
            </button>
          </div>

          <div className="p-4 border-t-4 border-black dark:border-white space-y-3 shrink-0">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-3 py-3 border-2 border-black dark:border-white bg-red-500 text-white font-black uppercase tracking-wider text-sm shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <LogOut size={20} strokeWidth={2.5} />
              <span>Cerrar sesion</span>
            </button>

            <div className="border-t-4 border-black dark:border-white p-4 -mx-4 -mb-4 bg-gray-200 dark:bg-gray-800">
              <span className="block font-black uppercase text-sm text-black dark:text-white mb-1">
                Creado por:{" "}
                <a
                  href="https://www.instagram.com/ivjmm.0109/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-black dark:text-white hover:underline underline-offset-2"
                >
                  <ExternalLink size={14} strokeWidth={2.5} />
                  Ivn Mtz
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                <Code size={12} strokeWidth={2.5} />
                Version 1.4.2
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
