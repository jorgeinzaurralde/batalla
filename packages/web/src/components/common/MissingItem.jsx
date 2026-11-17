import { Link } from 'react-router-dom';

export default function MissingItem() {
  return (
    <section className="jp-card">
      <h1>No encontramos esta vista</h1>
      <p>El torneo o la partida no está disponible.</p>

      <Link className="jp-button" to="/jugador">
        Volver al inicio
      </Link>
    </section>
  );
}
