/*
 * Party Hub App - Resumen de Arquitectura
 * =========================================
 *
 * [Auth] - Firebase Authentication (Google)
 *   src/context/AuthContext.tsx
 *   src/components/LoginPage.tsx
 *   - loginWithGoogle() via Firebase popup
 *   - Logout con window.location.reload() para limpiar listeners
 *   - Proteccion de rutas via ProtectedRoute
 *   - Terminos y condiciones obligatorios antes del login
 *
 * [Database] - Firebase Firestore
 *   src/firebase/services.ts
 *   src/firebase/config.ts
 *   - Grupos multiusuario con codigos de invitacion de 6 caracteres
 *   - Miembros con contadores (deposiciones, actosSexuales) y timestamps
 *   - Eventos en subcoleccion con tipo (deposicion/acto_sexual)
 *   - Rooms (salas de juego) con votos, jugadores y fases
 *   - Sincronizacion en tiempo real via onSnapshot
 *   - Eliminacion de eventos con descuento automatico de contadores
 *
 * [Tablero Social] - Modulo principal
 *   src/modules/tablero/
 *   - Crear/Unirse a grupos con codigo
 *   - Registrar Cagadas/Culeadas con efectos de sonido
 *   - Estadisticas por miembro con grafico de barras (Recharts)
 *   - Historial de actividad reciente con eliminacion inline
 *   - Roles ADMIN/INVITADO con expulsores y configuracion
 *   - Tema oscuro/claro persistente
 *
 * [Arcade] - Juegos para una sola pantalla
 *   src/modules/arcade/
 *   - Mazos de cartas: "El Dedo en la Llaga" y "Yo Nunca"
 *   - CardGameEngine con animaciones, swipe, y audio
 *   - Juego El Impostor: setup, roles, debate, votacion
 *
 * [Juego Multijugador] - Sala en tiempo real
 *   src/modules/game/
 *   - useGameRoom: hook con ciclo LOBBY -> CARD -> VOTING -> RESULTS
 *   - VotingEngine: cartas, votacion democratica, puntuacion y ganador
 *   - GameLobbyPage: crear/unirse a sala con codigo de 4 caracteres
 *   - Progresion host-driven para evitar race conditions
 *
 * [UI] - Sistema de diseno Neobrutalista
 *   - Bordes gruesos (border-4, border-2)
 *   - Sombras solidas (shadow-[4px_4px_0px_0px_rgba(0,0,0,1)])
 *   - Transiciones activas (active:translate-x-1)
 *   - Sin emojis, solo lucide-react icons
 *   - Dark mode con clases dark:
 *   - Mobile-first con max-w-md
 *   - SplashScreen con loader y progress bar
 *   - SideDrawer con manual de instrucciones
 *   - Scroll lock en drawer para evitar scroll chaining
 */
