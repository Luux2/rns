import './App.css'
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import IndexScreen from './pages/IndexScreen.tsx'
import TournamentScreen from "./pages/TournamentScreen.tsx";
import LeaderboardScreen from "./pages/LeaderboardScreen.tsx";

function App() {

  return (
      <HelmetProvider>
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={<IndexScreen/>}/>
                <Route path="/turnering" element={<TournamentScreen/>}/>
                <Route path="/leaderboard" element={<LeaderboardScreen/>}/>
            </Routes>
        </BrowserRouter>
      </HelmetProvider>
  )
}

export default App
