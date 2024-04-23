import { useEffect, useState } from 'react'

const API_URL = import.meta.env.API_URL || 'http://localhost:3001'

const Authorized = ({ sub, provider }: { sub: string; provider: string }) => {
  return (
    <div className="card">
      <button
        onClick={() => (window.location.href = `${API_URL}/oauth/logout`)}
      >
        Logout
      </button>
      <p>{`User logged in using ${provider}, identified by sub: ${sub}`}</p>
    </div>
  )
}

const LoginButton = ({ provider }: { provider: string }) => {
  return (
    <button
      onClick={() =>
        (window.location.href = `${API_URL}/oauth/login/${provider}`)
      }
    >
      Login with {provider}
    </button>
  )
}
const Unauthorized = () => {
  return (
    <div className="card">
      <LoginButton provider="google" />
      <LoginButton provider="microsoft" />
      <p>User not logged in</p>
    </div>
  )
}

export const HomePage = () => {
  const [user, setUser] = useState({ sub: '', provider: '' })
  useEffect(() => {
    const fetchSub = async () => {
      const subResponse = await fetch(`${API_URL}/oauth/sub`, {
        credentials: 'include',
      })
      if (!subResponse.ok) {
        return
      }

      const responseObject = await subResponse.json()
      console.log(responseObject)
      if ('sub' in responseObject && 'provider' in responseObject) {
        setUser({ sub: responseObject.sub, provider: responseObject.provider })
      }
    }
    fetchSub()
  }, [])
  return (
    <>
      <h1>OAuth 2.0 client demo</h1>
      {user.sub === '' || user.provider === '' ? (
        <Unauthorized />
      ) : (
        <Authorized {...user} />
      )}
    </>
  )
}
