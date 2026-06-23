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

### El Impostor
- Asignacion aleatoria de roles (Impostor / Investigador) y palabras
- 120 palabras en 6 categorias
- Fases: Asignacion -> Debate -> Votacion -> Resultados
- Diseno FlipCard para revelacion de roles

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
├── components/          # Componentes globales (Login, Splash, SideDrawer)
├── context/             # AuthContext, ThemeContext
├── firebase/
│   ├── config.ts        # Init Firebase
│   └── services.ts      # Firestore: grupos, miembros, eventos, graficos
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
│       │   ├── MemberList.tsx       # Lista con avatar, rol (ADMIN/INVITADO) y stats
│       │   ├── StatsSection.tsx     # Timeline de ultimos eventos
│       │   ├── StatsChart.tsx       # Grafico de barras (recharts)
│       │   ├── CreateGroupModal.tsx # Modal creacion de grupo
│       │   ├── JoinGroupModal.tsx   # Modal union por codigo
│       │   └── GroupSettingsModal.tsx # Ajustes: nombre, expulsar, eliminar/abandonar
│       └── pages/
│           └── TableroPage.tsx      # Pagina principal del tablero multigrupo
├── routes/
│   └── index.tsx        # Router con nested layouts y proteccion de rutas
├── App.tsx
├── index.css            # Tailwind directives + animaciones custom
└── main.tsx             # Entry point
```
