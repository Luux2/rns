import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {PlayerProvider} from "./context/PlayerContext.tsx";

createRoot(document.getElementById('root')!).render(
    <PlayerProvider>
    <App />
    </PlayerProvider>
)
