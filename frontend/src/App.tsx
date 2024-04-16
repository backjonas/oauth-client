import './App.css'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.API_URL || 'http://localhost:3001'

const Authorized = ({ sub }: { sub: string }) => {
  return (
    <div className="card">
      <button
        onClick={() => (window.location.href = `${API_URL}/oauth/logout`)}
      >
        Logout
      </button>
      <p>{`User logged in, identified by sub: ${sub}`}</p>
    </div>
  )
}

const Unauthorized = () => {
  return (
    <div className="card">
      <button onClick={() => (window.location.href = `${API_URL}/oauth/login`)}>
        Login
      </button>
      <p>User not logged in</p>
    </div>
  )
}

const App = () => {
  const [sub, setSub] = useState('')
  useEffect(() => {
    const fetchSub = async () => {
      const subResponse = await fetch(`${API_URL}/oauth/sub`, {
        credentials: 'include',
      })
      if (!subResponse.ok) {
        return
      }

      const responseObject = await subResponse.json()
      if ('sub' in responseObject) {
        setSub(responseObject.sub)
      }
    }
    fetchSub()
  }, [])
  return (
    <>
      <h1>OAuth 2.0 client demo</h1>
      {sub === '' ? <Unauthorized /> : <Authorized sub={sub} />}
    </>
  )
}

export default App
