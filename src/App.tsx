import './App.css'
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import IndexScreen from './pages/IndexScreen.tsx'
import TournamentScreen from "./pages/TournamentScreen.tsx";

function App() {

  return (
      <HelmetProvider>
        <BrowserRouter basename="/rns/">
            <Routes>
                <Route index path="/" element={<IndexScreen/>}/>
                <Route path="/turnering" element={<TournamentScreen/>}/>
            </Routes>
        </BrowserRouter>
      </HelmetProvider>
  )
}

export default App
