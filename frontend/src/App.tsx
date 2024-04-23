import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { OAuthCallbackPage } from './pages/OAuthCallbackPage'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/callback/:provider" element={<OAuthCallbackPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
