import { createRoot } from 'react-dom/client';

import './styles/index.css';
import App from './app/App.jsx';
import './styles/retro.css'; // se puede borrar si no nos adaptamos

createRoot(document.getElementById('root')).render(<App />);
