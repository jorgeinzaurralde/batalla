import { useEffect, useRef } from 'react';

import './confirmDialog.css';

// Pide confirmación antes de una acción que no se puede deshacer.
// Reemplaza al window.confirm del navegador, con el estilo de la app.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const cancelButton = useRef(null);

  // El foco arranca en "Cancelar", la opción segura.
  useEffect(() => {
    cancelButton.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape' && !busy) {
        // Para que el modal de atrás no se cierre también.
        event.stopImmediatePropagation();
        onCancel();
      }
    }

    // En captura, para atender Esc antes que el modal de atrás.
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [busy, onCancel]);

  function handleBackdrop(event) {
    if (event.target === event.currentTarget && !busy) {
      onCancel();
    }
  }

  return (
    <div className="confirm-backdrop" onMouseDown={handleBackdrop}>
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>

        <div className="confirm-actions">
          <button
            ref={cancelButton}
            className="jp-button jp-button-secondary"
            type="button"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            className="jp-button confirm-danger"
            type="button"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Un momento…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
