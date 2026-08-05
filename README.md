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
| **Home** | Pantalla de inicio con gestion de grupos: crear grupo, unirse por codigo con desplegable inline, elegir grupo activo, copiar codigo de invitacion, ver miembros y abrir ajustes. |
| **Tablero Social** | Registro de eventos grupales con soporte de **multiples grupos por codigos de invitacion**. Cada grupo tiene un admin que puede expulsar miembros, editar el nombre y eliminar el grupo. Incluye graficos de barras con estadisticas por miembro. |
| **Mural** | Panel de habitos diarios con gamificacion por XP: habitos buenos suman +1 XP, malos restan -1 XP, peso neutro 0 XP y agua +0.2 XP. El feed se limpia cada medianoche y el XP se acumula para el ranking mensual del grupo. |
| **Arcade** | Catalogo de minijuegos multijugador: Impostor, Bomba de Tiempo, Ruleta, Dedo en la Llaga, Codigo Secreto y Frente a Frente. |

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

### Mural (Gamificacion)
- Registro de habitos diarios con Puntos de Experiencia (XP)
- Habitos buenos suman +1 XP, malos restan -1 XP, peso neutro 0 XP, cada vaso de agua de 200ml suma +0.2 XP
- Feed con reacciones y comentarios
- Limpieza automatica del feed cada medianoche; el XP se acumula todo el mes para el ranking del grupo

### Navegacion Inferior Condicional
- Barra de navegacion inferior (INICIO / TABLERO / MURAL / ARCADE) que solo muestra los botones de TABLERO y MURAL cuando el usuario tiene un grupo activo o pertenece a alguno
- Sin grupo activo, la barra muestra unicamente INICIO y ARCADE, expandidos al ancho completo de forma simetrica

### Union a Grupo Inline
- El boton "UNIRSE A UN GRUPO" abre un desplegable inline neobrutalista directamente debajo del boton (sin modal superpuesto)
- Input de codigo de 6 caracteres y boton "UNIRME" con feedback de error y estado de carga

### Splash Screen con Audio en Bucle
- Pantalla de carga con mensajes tematicos aleatorios (Tablero, Mural y Arcade)
- Audio en bucle `splash-loop.mp3` (generado, ~4s) con volumen 0.4 para dar presencia sin ser intrusivo
- Desbloqueo no intrusivo: intenta reproducir al montar y retoma con el primer toque o tecla si el navegador bloquea el autoplay
- Cleanup automatico: el audio se detiene al desmontarse el componente

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
├── components/          # Componentes globales (Login, Splash, SideDrawer, NeoToast, Skeleton)
├── context/             # AuthContext, ThemeContext, NotificationContext (grupo activo + toasts)
├── firebase/
│   ├── config.ts        # Init Firebase
│   └── services.ts      # Firestore: grupos, miembros, eventos, mural, graficos, reacciones, comentarios
├── layouts/
│   └── MainLayout.tsx   # Header sticky + bottom nav brutalista condicional
├── modules/
│   ├── arcade/
│   │   ├── components/  # FlipCard, GameHeader
│   │   ├── context/     # GameContext
│   │   ├── data/        # 120 palabras en 6 categorias
│   │   ├── hooks/       # useImpostorGame (maquina de estados)
│   │   └── pages/       # ArcadePage, Impostor, Bomba, Ruleta, Dedo en la Llaga, Codigo Secreto, Frente a Frente
│   ├── home/
│   │   └── pages/
│   │       └── Home.tsx # Gestion de grupos + desplegable inline de union
│   ├── mural/
│   │   └── pages/
│   │       └── MuralPage.tsx   # Habitos con XP y ranking
│   ├── profile/
│   │   └── pages/
│   │       └── ProfilePage.tsx # Perfil con avatar, nickname y datos de sesion
│   └── tablero/
│       ├── components/
│       │   ├── ActivityCreateForm.tsx     # Formulario de creacion de registros
│       │   ├── ActivityDetailOrEdit.tsx   # Detalle con reacciones, comentarios y Lightbox
│       │   ├── MembersList.tsx            # Lista con avatar, rol (ADMIN/INVITADO) y stats
│       │   ├── RecordModal.tsx            # Modal de registros
│       │   ├── RecentActivity.tsx         # Timeline paginada con avatares y tarjetas apiladas
│       │   ├── StatsChart.tsx             # Grafico de barras (recharts)
│       │   ├── CreateGroupModal.tsx       # Modal creacion de grupo
│       │   └── GroupSettingsModal.tsx     # Ajustes: nombre, expulsar, eliminar/abandonar
│       └── pages/
│           ├── TableroPage.tsx            # Pagina principal del tablero multigrupo
│           └── HistorialPage.tsx          # Historial de eventos del grupo activo
├── routes/
│   └── index.tsx        # Router con nested layouts y proteccion de rutas
├── utils/
│   └── audio.ts         # Sistema de sonidos (playClickSound, playReactionSound, etc.)
├── App.tsx
├── index.css            # Tailwind directives + animaciones custom
└── main.tsx             # Entry point
```

## Audio de carga (Splash)

El bucle de carga del splash vive en `public/splash-loop.mp3` (bucle de ~4 segundos sintetizado con tonos suaves). Si quieres reemplazarlo, solo cambia el archivo manteniendo el mismo nombre; el codigo en `SplashScreen.tsx` lo reproduce en bucle con `volume = 0.4`.

## Iconos de reacciones

Cada reaccion tiene un color activo semantico unico:
- **Corazon** (me encanta) -> rojo `red-500`
- **Fuego** (caliente) -> naranja `orange-500`
- **Sonrisa** (bien) -> amarillo `yellow-200`
- **Calavera** (malo) -> gris `gray-400`
- **Triste** (triste) -> azul `blue-400`
