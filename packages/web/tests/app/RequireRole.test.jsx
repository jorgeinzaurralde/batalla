import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ADMIN_ROLES } from '../../src/app/roles';
import RequireRole from '../../src/components/common/RequireRole';

function renderFor(role) {
  render(
    <MemoryRouter>
      <RequireRole user={{ role }} roles={ADMIN_ROLES}>
        <h1>Administrar usuarios</h1>
      </RequireRole>
    </MemoryRouter>
  );
}

describe('RequireRole', () => {
  it('muestra la pantalla a quien tiene el rol', () => {
    renderFor('admin');

    expect(
      screen.getByRole('heading', { name: 'Administrar usuarios' })
    ).toBeInTheDocument();
  });

  it('a los demás les muestra que la vista no existe', () => {
    renderFor('player');

    expect(
      screen.queryByRole('heading', { name: 'Administrar usuarios' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'No encontramos esta vista' })
    ).toBeInTheDocument();
  });
});
