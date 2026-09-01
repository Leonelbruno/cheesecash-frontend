# Cheese Cash — Frontend

Billetera digital multimoneda. Permite gestionar saldos en ARS, USD, EUR y BTC con operaciones de compra, venta, intercambio y transferencia entre usuarios.

---

## Índice

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Setup local](#setup-local)
- [Variables de entorno](#variables-de-entorno)
- [Backend](#backend)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Decisiones técnicas](#decisiones-técnicas)
- [Equipo](#equipo)

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **React Router v7** — navegación SPA con rutas protegidas
- **CSS propio** — sin frameworks, sistema de tokens de diseño dark/gold
- **JWT** — autenticación stateless con el backend

---

## Requisitos

- Node.js 18+
- npm 9+
- Backend corriendo (local o Railway)

---

## Setup local

```bash
# 1. Clonar el repo
git clone https://github.com/valenberdev/cheesecash-front.git
cd cheesecash-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si es necesario (por defecto apunta a localhost:3000)

# 4. Levantar el servidor de desarrollo
npm run dev
```

La app corre en `http://localhost:5173`

---

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_URL` | URL base de la API (sin slash final) | `http://localhost:3000/api` |

Para apuntar al backend en producción:

```env
VITE_API_URL=https://cheesecash-back-production.up.railway.app/api
```

---

## Backend

| Entorno | URL |
|---|---|
| Local | `http://localhost:3000/api` |
| Producción | `https://cheesecash-back-production.up.railway.app/api` |

---

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linter
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── ChatBot/        # Chatbot flotante y arrastrable
│   ├── Layout/         # Sidebar (desktop) + bottom nav (mobile)
│   ├── ProtectedRoute/ # Guards de rutas autenticadas/públicas
│   └── Toast/          # Notificaciones
├── context/
│   ├── AuthContext.tsx  # Estado global de autenticación
│   └── auth-context.ts  # Tipos e interfaz del contexto
├── pages/
│   ├── Auth/           # Login + Registro (tabs)
│   ├── Dashboard/      # Panel principal con saldos
│   ├── Operar/         # Compra, venta e intercambio
│   ├── Historial/      # Historial de transacciones
│   ├── Conversor/      # Conversor de monedas
│   ├── Transferir/     # Transferencias a contactos
│   └── Landing/        # Landing page pública
└── services/
    └── api.ts          # Cliente fetch con Authorization header
```

---

## Decisiones técnicas

**Rutas protegidas:** `ProtectedRoute` redirige al login si no hay token. `PublicRoute` redirige al dashboard si ya está autenticado.

**Autenticación:** el token JWT se guarda en `localStorage` bajo la clave `cc_token`. Se envía en el header `Authorization: Bearer <token>` en cada request al backend.

**Diseño responsive:** en desktop se muestra la sidebar lateral. En mobile (≤768px) se oculta la sidebar y aparece una barra de navegación en la parte inferior, similar a Mercado Pago o NaranjaX.

**Sin Tailwind:** se usa CSS propio con variables de diseño definidas una vez y reutilizadas en toda la app:
```css
--gold: #f2d488;
--bg:   #0a0908;
--text: #f6efdf;
```

---

## Equipo

**One Team:**

- Jeremias Bustos
- Valentino Berdini
- Gonzalo Bastias
- Leonel Bruno Vera

Proyecto Final Full Stack — 2026
