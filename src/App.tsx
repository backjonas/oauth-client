import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { OAuthCallbackPage } from './pages/OAuthCallbackPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/code" element={<OAuthCallbackPage />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
