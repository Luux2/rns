import './App.css'
import {HelmetProvider} from "react-helmet-async";
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import {IndexScreen} from './pages/IndexScreen.tsx'

function App() {

  return (
      <HelmetProvider>
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={<IndexScreen/>}/>
            </Routes>
        </BrowserRouter>
      </HelmetProvider>
  )
}

export default App
