# Party Hub

App de juegos de fiesta con tematica Neobrutalism. Incluye **El Impostor** (juego de deduccion social) y un **Tablero** para registro de eventos grupales.

## Stack

- **React 19** + **TypeScript 6**
- **Vite 8** con PWA support
- **Tailwind CSS 3** — Neobrutalism UI (bordes gruesos, sombras solidas, dark mode)
- **Firebase** — Auth (Google) + Firestore
- **lucide-react** — iconos
- **react-router-dom v7** — routing

## Modulos

| Modulo | Descripcion |
|---|---|
| `/arcade/impostor` | El Impostor — juego de rol con asignacion de palabras, votacion y revelacion |
| `/tablero` | Tablero de eventos — registro de actividades grupales con Firestore |

## Scripts

```bash
npm run dev      # desarrollo con Vite (--host)
npm run build    # typecheck + build produccion
npm run preview  # preview del build
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
├── components/       # Componentes globales (Login, Splash, SideDrawer)
├── context/          # AuthContext, ThemeContext
├── firebase/         # Firebase init + services
├── hooks/            # Custom hooks globales
├── layouts/          # MainLayout (top bar + bottom nav)
├── modules/
│   ├── arcade/       # Juego El Impostor
│   │   ├── components/  # FlipCard
│   │   ├── context/     # GameContext
│   │   ├── data/        # 120 palabras en 6 categorias
│   │   ├── hooks/       # useImpostorGame (maquina de estados)
│   │   ├── pages/       # ArcadePage, ImpostorGameHub, Setup, Reveal, Debate, Voting, Results
│   │   └── types/       # Word, PlayerRole, GameState
│   └── tablero/      # Tablero de eventos
│       ├── components/  # MemberList, StatsSection
│       └── pages/       # TableroPage
├── routes/           # Router con nested layouts
├── App.tsx
├── index.css         # Tailwind directives + animaciones
└── main.tsx          # Entry point
```
