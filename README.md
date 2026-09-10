# Cheese Cash — Frontend

Billetera digital multimoneda. Permite gestionar saldos en ARS, USD, EUR y BTC con operaciones de compra, venta, intercambio y transferencia entre usuarios.

🌐 **App en producción:** [cheesecash-frontend.vercel.app](https://cheesecash-frontend.vercel.app)

---

## Índice

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Setup local](#setup-local)
- [Variables de entorno](#variables-de-entorno)
- [Backend](#backend)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Decisiones técnicas](#decisiones-técnicas)
- [Equipo](#equipo)

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **React Router v7** — navegación SPA con rutas protegidas
- **CSS propio** — sin frameworks, sistema de tokens de diseño dark/gold
- **JWT** — autenticación stateless con el backend
- **Socket.io** — notificaciones en tiempo real
- **Vercel** + **GitHub Actions** — deploy continuo con CI automático en cada PR

---

## Requisitos

- Node.js 18+
- npm 9+
- Backend corriendo (local o Railway)

---

## Setup local

```bash
# 1. Clonar el repo
git clone https://github.com/Leonelbruno/cheesecash-frontend.git
cd cheesecash-frontend

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
npm run test     # Tests con Vitest
```

---

## Estructura del proyecto

```
src/
├── components/
│   ├── ChatBot/        # Chatbot flotante y arrastrable
│   ├── Layout/         # Sidebar (desktop) + bottom nav (mobile)
│   ├── RateChart/      # Gráfico de cotizaciones en tiempo real
│   ├── ProtectedRoute/ # Guards de rutas autenticadas/públicas
│   └── Toast/          # Notificaciones
├── context/
│   ├── AuthContext.tsx  # Estado global de autenticación
│   └── auth-context.ts  # Tipos e interfaz del contexto
├── pages/
│   ├── Auth/           # Login + Registro (tabs)
│   ├── Dashboard/      # Panel principal con saldos y movimientos
│   ├── Operar/         # Compra, venta e intercambio
│   ├── Historial/      # Historial filtrable de transacciones
│   ├── Conversor/      # Conversor de monedas informativo
│   ├── Transferir/     # Transferencias por PIN con confirmación
│   ├── Recargar/       # Recarga de saldo (Sprint 2)
│   ├── Configuracion/  # Ajustes de cuenta
│   ├── ForgotPassword/ # Recuperar contraseña
│   └── Landing/        # Landing page pública con gráfico en vivo
└── services/
    ├── api.ts          # Cliente fetch con Authorization header
    └── rates.ts        # Fetching de cotizaciones y historial
```

---

## Funcionalidades

### Sprint 1
- Registro y login con JWT
- Dashboard con saldos en 4 monedas (ARS, USD, EUR, BTC)
- Operar: comprar, vender e intercambiar monedas
- Transferir saldo a otro usuario por PIN
- Historial de transacciones filtrable por tipo
- Conversor de monedas con tasas reales
- Chatbot flotante y arrastrable (Pointer Events API)
- Landing page con cotizaciones en vivo y conversor

### Sprint 2
- **Recargar saldo** — nueva pantalla con montos rápidos predefinidos
- **Gráfico de cotizaciones en tiempo real** — evolución de precios con selector de par y período (7D / 30D / 90D), actualización automática cada 30 segundos
- **Animación en mobile** — panel animado visible en el login mobile via `backdrop-filter`
- **Notificaciones en tiempo real** — toasts via Socket.io al recibir transferencias
- **Recuperar contraseña** — flujo completo de reset por email
- **Confirmación en transferencias** — pantalla de resumen antes de ejecutar
- **CI con GitHub Actions** — análisis automático en cada PR antes de mergear a main
- **Historial de recargas** — los depósitos aparecen en el dashboard y el historial

---

## Decisiones técnicas

**Rutas protegidas:** `ProtectedRoute` redirige al login si no hay token. `PublicRoute` redirige al dashboard si ya está autenticado.

**Autenticación:** el token JWT se guarda en `localStorage` bajo la clave `cc_token`. Se envía en el header `Authorization: Bearer <token>` en cada request al backend.

**6 pares directos:** las cotizaciones se fetchean con `Promise.all` para los 6 pares directos entre monedas (sin cross-rates calculados), garantizando valores idénticos en toda la app. Antes había hasta 36 ARS de diferencia entre la sección de cotizaciones y el conversor.

**DOM directo para drag:** el chatbot usa la Pointer Events API manipulando el DOM directamente durante el arrastre, sin pasar por el estado de React. Esto evita re-renders en cada pixel movido, que frenaba el botón en mobile.

**Diseño responsive:** en desktop se muestra la sidebar lateral. En mobile (≤768px) se oculta la sidebar y aparece una barra de navegación inferior con los 5 flujos más usados.

**Sin Tailwind:** CSS propio con variables de diseño reutilizadas en toda la app:
```css
--gold: #f2d488;
--bg:   #0a0908;
--text: #f6efdf;
```

---

## Equipo

- Jeremias Bustos
- Valentino Berdini
- Gonzalo Bastias
- Leonel Bruno Vera

Proyecto Final Full Stack — 2026
