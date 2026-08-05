import { useEffect, useRef, useState } from "react";
import {
  X,
  LogOut,
  Sun,
  Moon,
  Code,
  ExternalLink,
  HelpCircle,
  Home,
  ClipboardList,
  Star,
  Gamepad2,
  ChevronDown,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import useLockBodyScroll from "../hooks/useLockBodyScroll";
import UserAvatar from "./UserAvatar";
import {
  playCloseSound,
  playClickSound,
  playToggleOnSound,
  playSwitchSound,
  playDeleteSound,
} from "../utils/audio";

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
  const { user, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showManual, setShowManual] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

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
              onClick={() => {
                playCloseSound();
                onClose();
              }}
              className="p-1 border-2 border-black dark:border-white bg-white dark:bg-gray-900 shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-3 p-3 border-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800">
              <UserAvatar
                name={
                  userProfile?.nickname ||
                  user?.displayName ||
                  user?.email ||
                  "?"
                }
                color={userProfile?.avatar || "#fbbf24"}
                type={userProfile?.avatarType || "letter"}
                avatarIcon={userProfile?.avatarIcon || "Gamepad2"}
                size={40}
              />
              <div className="min-w-0">
                <p className="font-black uppercase tracking-wider text-sm text-black dark:text-white truncate">
                  {userProfile?.nickname || user?.displayName || "Invitado"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email ?? ""}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
                navigate("/perfil");
              }}
              className="w-full flex items-center gap-3 px-3 py-3 border-2 border-black dark:border-white bg-white dark:bg-gray-800 font-black uppercase tracking-wider text-sm text-black dark:text-white shadow-brutal-sm dark:shadow-brutal-sm-dark active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <User size={20} strokeWidth={2.5} />
              <span className="flex-1 text-left">MI PERFIL</span>
            </button>

            <button
              onClick={() => {
                playToggleOnSound();
                setShowManual(!showManual);
              }}
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
                    icon={<Home size={16} strokeWidth={2.5} />}
                    title="Inicio"
                    desc="Administras tus grupos. Ves los codigos de invitacion y las tarjetas de estadisticas de cada miembro (conteo y ultima vez de Cagadas, Culeadas, Meadas y dias de Gym)."
                  />
                  <ManualItem
                    icon={<ClipboardList size={16} strokeWidth={2.5} />}
                    title="Tablero"
                    desc="Es el registro de eventos principales. Publicas tus Cagadas, Culeadas, Meadas y Gym. Puedes reaccionar y comentar las publicaciones de tus amigos y ver graficos estadisticos mensuales."
                  />
                  <ManualItem
                    icon={<Star size={16} strokeWidth={2.5} />}
                    title="Mural (Gamificacion)"
                    desc="Panel de habitos diarios. Registra acciones rapidas para ganar Puntos de Experiencia (XP). Habitos buenos suman +1 XP, habitos malos restan -1 XP. El peso (subir/bajar) es neutro (0 XP). Cada vaso de agua de 200ml suma +0.2 XP. El feed se limpia cada medianoche, pero el XP se acumula todo el mes para el Ranking del grupo."
                  />
                  <ManualItem
                    icon={<Gamepad2 size={16} strokeWidth={2.5} />}
                    title="Arcade"
                    desc="Catalogo de minijuegos multijugador para pasar el rato con tu grupo: Impostor, Bomba de Tiempo, Ruleta, Dedo en la Llaga, Codigo Secreto y Frente a Frente."
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => {
                playSwitchSound();
                toggleTheme();
              }}
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
              onClick={() => {
                playDeleteSound();
                setShowConfirmLogout(true);
              }}
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
                Version 1.10.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {showConfirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm border-4 border-black bg-white dark:bg-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-red-500 text-white">
                <LogOut size={20} strokeWidth={2.5} />
              </div>
              <p className="text-lg font-black uppercase tracking-tighter text-black dark:text-white">
                Cerrar sesion
              </p>
            </div>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
              Estas seguro de que quieres cerrar sesion? Tendras que volver a
              iniciar con Google.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  playCloseSound();
                  setShowConfirmLogout(false);
                }}
                className="flex-1 py-3 border-4 border-black bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  playDeleteSound();
                  setShowConfirmLogout(false);
                  logout();
                }}
                className="flex-1 py-3 border-4 border-black bg-red-500 text-white font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
