import { useState } from 'react';

const columns = 'ABCDEFGHIJ'.split('');

const shipCells = new Set([
  '2-2',
  '2-3',
  '2-4',
  '5-7',
  '6-7',
  '7-7',
  '8-3',
  '8-4',
]);

const waterCells = new Set(['3-7', '6-1']);

function DecorativeBoard() {
  return (
    <div className="bn-board" aria-hidden="true">
      <span />

      {columns.map((column) => (
        <span className="bn-coordinate" key={column}>
          {column}
        </span>
      ))}

      {Array.from({ length: 10 }, (_, rowIndex) => {
        const row = rowIndex + 1;

        return (
          <div className="bn-board-row" key={row}>
            <span className="bn-coordinate">{row}</span>

            {columns.map((column, columnIndex) => {
              const position = `${row}-${columnIndex + 1}`;
              const isHit = position === '2-3';
              const isWater = waterCells.has(position);

              const className = [
                'bn-cell',
                shipCells.has(position) ? 'bn-cell-ship' : '',
                isHit ? 'bn-cell-hit' : '',
                isWater ? 'bn-cell-water' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <span className={className} key={column}>
                  {isHit ? '×' : isWater ? '•' : ''}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function Login({ onLogin, sessionError = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (pending) {
      return;
    }

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError('Completá el correo electrónico y la contraseña.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError('Ingresá un correo electrónico válido.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await onLogin(cleanEmail, password);
    } catch (error) {
      setError(error.message || 'No se pudo iniciar sesión.');
    } finally {
      setPending(false);
    }
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setError('');
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setError('');
  }

  return (
    <main className="bn-page">
      <div className="bn-login-layout">
        <section className="bn-presentation">
          <div className="bn-brand">
            <span className="bn-brand-symbol" aria-hidden="true">
              ◎
            </span>
            <span>Batalla Naval</span>
          </div>

          <h1 className="bn-presentation-title">
            Una flota.
            <br />
            Tu estrategia.
          </h1>

          <p className="bn-presentation-description">
            Jugá, competí y conquistá
            <br />
            el próximo torneo.
          </p>

          <DecorativeBoard />
        </section>

        <section className="bn-login-card" aria-labelledby="bn-login-title">
          <p className="bn-welcome">Bienvenido a bordo</p>

          <h2 className="bn-login-title" id="bn-login-title">
            Ingresá a tu cuenta
          </h2>

          <form className="bn-form" onSubmit={handleSubmit} noValidate>
            <div className="bn-field">
              <label htmlFor="bn-email">Correo electrónico</label>

              <input
                id="bn-email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={handleEmailChange}
                aria-describedby={error ? 'bn-login-error' : undefined}
                required
              />
            </div>

            <div className="bn-field">
              <label htmlFor="bn-password">Contraseña</label>

              <input
                id="bn-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                aria-describedby={error ? 'bn-login-error' : undefined}
                required
              />
            </div>

            <p className="bn-error" id="bn-login-error" role="alert">
              {error || sessionError}
            </p>

            <button className="bn-button" type="submit" disabled={pending}>
              {pending ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>

          <p className="bn-account-note">
            Tu administrador te proporciona la cuenta.
          </p>
        </section>
      </div>
    </main>
  );
}
