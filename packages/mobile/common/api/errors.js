// La API explica sus errores 400 en inglés (sección 6.5 de la letra).
// Cada service indica qué mostrar en español según la operación, en vez de
// depender del texto exacto que devuelve el servidor.
//
// messages: { [estado HTTP]: mensaje | (error) => mensaje }
export async function withMessages(request, messages) {
  try {
    return await request;
  } catch (error) {
    const entry = messages[error.status];

    if (!entry) {
      throw error;
    }

    const message = typeof entry === 'function' ? entry(error) : entry;
    const translated = new Error(message, { cause: error });
    translated.status = error.status;

    throw translated;
  }
}
