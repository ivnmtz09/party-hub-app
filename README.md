# Party Hub

App de fiestas con diseno **Neobrutalism** — juegos de deduccion social y tablero colaborativo multigrupo.

## Stack

- **React 19** + **TypeScript**
- **Vite** con PWA support
- **Tailwind CSS 3** — Neobrutalism UI (bordes gruesos, sombras solidas, dark mode)
- **Firebase** — Auth (Google) + Firestore (datos en tiempo real)
- **lucide-react** — iconos sin emojis
- **recharts** — graficos estadisticos responsivos
- **react-router-dom** — routing con nested layouts

## Modulos

| Modulo | Descripcion |
|---|---|
| **Arcade / El Impostor** | Juego de rol social con asignacion secreta de palabras, rondas de debate, votacion y revelacion. Soporta grupos de 4-10 jugadores. |
| **Tablero Social** | Registro de eventos grupales con soporte de **multiples grupos por codigos de invitacion**. Cada grupo tiene un admin que puede expulsar miembros, editar el nombre y eliminar el grupo. Incluye graficos de barras con estadisticas por miembro. |

## Funcionalidades Clave

### Tablero Social
- Creacion y union a grupos mediante **codigos de invitacion de 6 caracteres**
- Dropdown selector de grupos activos
- Roles: **Admin** (corona + etiqueta roja) e **Invitado** (etiqueta gris)
- Sincronizacion en tiempo real con Firestore
- Modal de ajustes: editar nombre, expulsar miembros, eliminar/abandonar grupo
- Grafico de barras comparativo (Deposiciones vs Actos Sexuales por miembro)

### Tablero Social — Features Avanzadas
- **Reacciones por usuario**: toggle unico con iconos semanticos (corazon, fuego, sonrisa, calavera, triste). Colores activos individualizados
- **Comentarios por registro**: agregar texto con avatar, timestamp relativo, lista expandible con toggle
- **Avatares con figuras/letras**: cada miembro tiene avatar con color de fondo, icono de forma o inicial del nombre
- **Paginacion con limite dinamico**: carga inicial de 5 registros, boton "Ver mas..." con limite de 20 registros. Query de Firestore con `limit()` en tiempo real
- **Tarjetas apiladas**: efecto visual de pila con sombra decreciente e interactividad hover (`translate-y-2`)
- **Detalles de registro**: expandir inline para ver rating (1-5 estrellas), notas y foto con Lightbox fullscreen

### El Impostor
- Asignacion aleatoria de roles (Impostor / Investigador) y palabras
- 120 palabras en 6 categorias
- Fases: Asignacion -> Debate -> Votacion -> Resultados
- Diseno FlipCard para revelacion de roles

### Sistema de Sonidos Interactivos
- **13 sonidos custom**: click, toggle on/off, reaccion, comentario, copiar, eliminar, abrir/cerrar modal, estrella, shuffle, spin, voto, switch
- Hook `useAudio()` para pre-carga de sonidos en memoria
- Cada sonido se ejecuta inmediatamente al interactuar (botones, modales, reacciones, forms)

## Scripts

```bash
npm run dev      # Desarrollo con Vite (--host)
npm run build    # Typecheck + build produccion
npm run preview  # Preview del build
```

## Configuracion

Copiar `.env` con las variables de Firebase:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Estructura

```
src/
├── components/          # Componentes globales (Login, Splash, SideDrawer, UserAvatar, Skeleton)
├── context/             # AuthContext, ThemeContext
├── firebase/
│   ├── config.ts        # Init Firebase
│   └── services.ts      # Firestore: grupos, miembros, eventos, graficos, reacciones, comentarios
├── layouts/
│   └── MainLayout.tsx   # Header sticky + bottom nav brutalista
├── modules/
│   ├── arcade/
│   │   ├── components/  # FlipCard
│   │   ├── context/     # GameContext
│   │   ├── data/        # 120 palabras en 6 categorias
│   │   ├── hooks/       # useImpostorGame (maquina de estados)
│   │   ├── pages/       # ArcadePage, ImpostorGameHub, Setup, Reveal, Debate, Voting, Results
│   │   └── types/       # Word, PlayerRole, GameState
│   └── tablero/
│       ├── components/
│       │   ├── ActivityDetailOrEdit.tsx  # Detalle con reacciones, comentarios y Lightbox
│       │   ├── MemberList.tsx            # Lista con avatar, rol (ADMIN/INVITADO) y stats
│       │   ├── RecordInlineForm.tsx      # Formulario inline de creacion de registros
│       │   ├── RecentActivity.tsx        # Timeline paginada con avatares y tarjetas apiladas
│       │   ├── StatsChart.tsx            # Grafico de barras (recharts)
│       │   ├── StatsSection.tsx          # Timeline de ultimos eventos
│       │   ├── CreateGroupModal.tsx      # Modal creacion de grupo
│       │   ├── JoinGroupModal.tsx        # Modal union por codigo
│       │   └── GroupSettingsModal.tsx    # Ajustes: nombre, expulsar, eliminar/abandonar
│       └── pages/
│           └── TableroPage.tsx           # Pagina principal del tablero multigrupo
├── routes/
│   └── index.tsx        # Router con nested layouts y proteccion de rutas
├── utils/
│   └── audio.ts         # Sistema de sonidos (playClickSound, playReactionSound, etc.)
├── App.tsx
├── index.css            # Tailwind directives + animaciones custom
└── main.tsx             # Entry point
```

## Iconos de reacciones

Cada reaccion tiene un color activo semantico unico:
- **Corazon** (me encanta) -> rojo `red-500`
- **Fuego** (caliente) -> naranja `orange-500`
- **Sonrisa** (bien) -> amarillo `yellow-200`
- **Calavera** (malo) -> gris `gray-400`
- **Triste** (triste) -> azul `blue-400`
