import { describe, expect, it } from 'vitest';

import { NAV_ITEMS } from '../../src/app/navigation';
import {
  ADMIN_ROLES,
  ORGANIZER_ROLES,
  ROLES,
  hasRole,
} from '../../src/app/roles';

// Cada rol suma permisos sobre el anterior (sección 2 de la letra):
// el organizador puede hacer todo lo del jugador y el admin todo lo del
// organizador.

function menuFor(role) {
  return NAV_ITEMS.filter((item) => hasRole({ role }, item.roles)).map(
    (item) => item.label
  );
}

describe('menú por rol', () => {
  it('el jugador ve solo sus secciones', () => {
    expect(menuFor(ROLES.player)).toEqual(['Inicio', 'Partidas', 'Torneos']);
  });

  it('el organizador suma la organización de torneos', () => {
    expect(menuFor(ROLES.organizer)).toEqual([
      'Inicio',
      'Partidas',
      'Torneos',
      'Organizar torneos',
    ]);
  });

  it('el admin suma la administración de usuarios', () => {
    expect(menuFor(ROLES.admin)).toEqual([
      'Inicio',
      'Partidas',
      'Torneos',
      'Organizar torneos',
      'Administrar usuarios',
    ]);
  });
});

describe('hasRole', () => {
  it('sin restricción de roles, cualquiera tiene acceso', () => {
    expect(hasRole({ role: ROLES.player })).toBe(true);
  });

  it('organizar torneos es para organizadores y admins', () => {
    expect(hasRole({ role: ROLES.player }, ORGANIZER_ROLES)).toBe(false);
    expect(hasRole({ role: ROLES.organizer }, ORGANIZER_ROLES)).toBe(true);
    expect(hasRole({ role: ROLES.admin }, ORGANIZER_ROLES)).toBe(true);
  });

  it('administrar usuarios es solo para admins', () => {
    expect(hasRole({ role: ROLES.organizer }, ADMIN_ROLES)).toBe(false);
    expect(hasRole({ role: ROLES.admin }, ADMIN_ROLES)).toBe(true);
  });
});
