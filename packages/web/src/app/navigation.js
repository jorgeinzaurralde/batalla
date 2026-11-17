import { ADMIN_ROLES, ORGANIZER_ROLES } from './roles';

// Base de todas las rutas de la aplicación una vez iniciada la sesión.
export const APP_BASE = '/jugador';

// Entradas del menú lateral. Sin `roles`, las ve cualquier usuario.
// Para sumar una pantalla al menú: agregar su ruta en AppRoutes.jsx y una
// entrada acá, con los mismos roles.
export const NAV_ITEMS = [
  { to: APP_BASE, label: 'Inicio', end: true },
  { to: `${APP_BASE}/partidas`, label: 'Partidas' },
  { to: `${APP_BASE}/torneos`, label: 'Torneos' },
  { to: `${APP_BASE}/estadisticas`, label: 'Estadísticas' },
  {
    to: `${APP_BASE}/organizar`,
    label: 'Organizar torneos',
    roles: ORGANIZER_ROLES,
  },
  {
    to: `${APP_BASE}/usuarios`,
    label: 'Administrar usuarios',
    roles: ADMIN_ROLES,
  },
];
