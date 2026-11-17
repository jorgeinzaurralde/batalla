// Roles de la API y qué puede hacer cada uno.
// Cada rol suma permisos sobre el anterior: admin > organizador > jugador.

export const ROLES = {
  player: 'player',
  organizer: 'organiser', // así lo escribe la API
  admin: 'admin',
};

export const ROLE_LABELS = {
  [ROLES.player]: 'Jugador',
  [ROLES.organizer]: 'Organizador',
  [ROLES.admin]: 'Administrador',
};

// Roles que pueden organizar torneos.
export const ORGANIZER_ROLES = [ROLES.organizer, ROLES.admin];

// Roles que pueden administrar usuarios.
export const ADMIN_ROLES = [ROLES.admin];

export function hasRole(user, roles) {
  return !roles || roles.includes(user.role);
}
