import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ConfirmDialog from '../../src/components/common/ConfirmDialog';

function renderDialog(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(
    <ConfirmDialog
      title="Revocar invitación"
      message="player1@example.com ya no va a poder participar."
      confirmLabel="Revocar"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );

  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('muestra la acción a confirmar y arranca en "Cancelar"', () => {
    renderDialog();

    expect(
      screen.getByRole('alertdialog', { name: 'Revocar invitación' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('confirma o cancela según el botón', () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.click(screen.getByRole('button', { name: 'Revocar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('se cancela con Esc', () => {
    const { onCancel } = renderDialog();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('bloquea los botones mientras se procesa', () => {
    renderDialog({ busy: true });

    expect(screen.getByRole('button', { name: 'Un momento…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
