import MissingItem from './MissingItem';
import { hasRole } from '../../app/roles';

// Muestra la pantalla solo si el usuario tiene alguno de los roles indicados.
export default function RequireRole({ user, roles, children }) {
  return hasRole(user, roles) ? children : <MissingItem />;
}
