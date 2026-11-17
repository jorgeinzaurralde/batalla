# Batalla Naval — Proyecto DWYM 2026 sem. 2

Aplicación web y mobile para jugar a la Batalla Naval y armar torneos entre varios jugadores. Proyecto de curso de **Desarrollo Web y Mobile**, Universidad Católica del Uruguay, segundo semestre de 2026.

**Equipo 3 Vespertino:** Trinidad Bunge, Jorge Inzaurralde, Maximiliano López e Ignacio Martínez.

## Qué incluye

| Paquete | Tecnología | Roles soportados |
| --- | --- | --- |
| `packages/web` | React + Vite + React Router | Jugador, Organizador y Admin |
| `packages/mobile` | React Native + Expo (Expo Router), Android | Jugador |

Ambos frontends consumen la API REST provista por la cátedra y se autentican con JWT. La web es responsiva para usarse también desde un celular.

## Requisitos

- Node.js y npm (la versión está en `.tool-versions`).
- Para mobile: la app **Expo Go** en un celular Android, o un emulador Android.
- La **API key** del equipo, provista por la cátedra.

## Cómo ejecutar

1. Instalar las dependencias desde la raíz del repositorio:

   ```bash
   npm i
   ```

2. Crear el archivo `.env` de cada paquete a partir de su `.env.example`:

   ```bash
   # packages/web/.env
   VITE_API_BASE_URL=https://dwym.hardc0de.com
   VITE_API_KEY=<api key del equipo>

   # packages/mobile/.env
   EXPO_PUBLIC_API_BASE_URL=https://dwym.hardc0de.com
   EXPO_PUBLIC_API_KEY=<api key del equipo>
   ```


3. Levantar la aplicación web:

   ```bash
   cd packages/web
   npm start
   ```

   Queda disponible en http://localhost:5173.

4. Levantar la aplicación mobile:

   ```bash
   cd packages/mobile
   npm start
   ```

   Escanear el código QR con Expo Go, o usar `npm run android` con un emulador.


## Usuarios de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Jugador | player1@example.com | player1 |
| Jugador | player2@example.com | player2 |
| Jugador | player3@example.com | player3 |
| Jugador | player4@example.com | player4 |
| Organizador | org1@example.com | org1 |
| Admin | admin@example.com | admin |

## Funcionalidades

**Todos los roles:** ingreso con correo y contraseña, y cierre de sesión.

**Jugador** (web y mobile)
- Ver las invitaciones a torneos y aceptarlas o rechazarlas.
- Ver sus torneos y sus partidas, terminadas o en curso.
- Ubicar la flota, disparar cuando es su turno y ver los disparos de ambos jugadores con sus resultados.
- En una partida terminada: resultado (victoria o derrota), ambas flotas e historial completo de jugadas.

**Organizador** (web): todo lo del jugador, más:
- Crear torneos con nombre.
- Invitar jugadores y revocar invitaciones.
- Armar las partidas con los jugadores que aceptaron.
- Marcar una partida como abandonada (el otro jugador gana) o eliminarla.
- Definir el ganador del torneo.

**Admin** (web): todo lo del organizador, más:
- Crear usuarios con correo, contraseña y rol.
- Modificar la contraseña o el rol de un usuario.
- Eliminar usuarios (no puede eliminarse a sí mismo).

## Decisiones técnicas

- **Un solo layout para todos los roles.** Cada rol suma capacidades sobre el anterior, así que el menú se arma desde una lista de entradas con los roles que pueden verlas (`app/navigation.js`), y las rutas de organizador y admin se protegen con `RequireRole`.
- **Organización por dominio.** En la web, `app/` tiene lo común (sesión, layout, rutas, roles), `features/` agrupa las pantallas por dominio y `services/api/` tiene un archivo por recurso sobre un cliente HTTP común que agrega la API key y el token y centraliza los errores. En mobile, `app/` contiene solo las pantallas (Expo Router) y `common/` el resto.
- **Adaptación de partidas.** La API describe la partida desde `north` y `south`. `adaptMatch` la traduce al punto de vista del usuario: su lado, si es su turno, el estado y sus disparos enviados y recibidos. El turno se deduce de la cantidad de disparos, porque `north` dispara primero.
- **Actualización por polling.** La API no avisa cuando el rival juega, así que mientras una partida está abierta se consulta `GET /api/matches/:id` cada 5 s en la web y cada 4 s en mobile. Se detiene al terminar la partida o al salir de la pantalla. En la web se descartan las respuestas viejas que llegan después de una jugada propia.
- **Preparación de la flota.** La distribución se arma localmente y se valida (dentro del tablero, sin superposición) antes de enviarse como una única jugada al confirmar.
- **Sesión.** En la web el token se guarda en `sessionStorage` (se borra al cerrar la pestaña). En mobile se usa `AsyncStorage`. Al iniciar se valida con `GET /api/me`, y si venció se pide ingresar de nuevo.
- **Listado de torneos del organizador.** Usa `GET /api/tournaments`, endpoint que se sumó a la API después del enunciado. Los organizadores ven los suyos y los admins ven todos.

## Estructura del repositorio

```
packages/
  web/       Frontend React (Vite)
  mobile/    Frontend React Native (Expo)
docs/
  Documentacion.pdf              Documentación del proyecto
  DWYM-Proyecto-2026sem2.pdf     Enunciado
  designs/                       Diseños de las pantallas (Excalidraw)
```

## Documentación adicional

- [Documentación del proyecto](./docs/Documentacion.pdf)
- [Enunciado](./docs/DWYM-Proyecto-2026sem2.pdf)
- Diseño de las vistas: https://excalidraw.com/#json=AsUUQwsoVhrSaTt4-gBod,XXmWkUYsk0YzjRPq9n7pMg
