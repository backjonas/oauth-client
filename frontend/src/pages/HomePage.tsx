import { useEffect, useState } from 'react'

const API_URL = import.meta.env.API_URL || 'http://localhost:3001'

export const HomePage = () => {
  const [email, setEmail] = useState('')
  useEffect(() => {
    const fetchEmail = async () => {
      const emailResponse = await fetch(`${API_URL}/oauth/email`, {
        credentials: 'include',
      })
      if (!emailResponse.ok) {
        return
      }

      const responseObject = await emailResponse.json()
      if ('email' in responseObject) {
        setEmail(responseObject.email)
      }
    }
    fetchEmail()
  })
  return (
    <>
      {' '}
      <h1>OAuth 2.0 client demo</h1>
      <div className="card">
        <button
          onClick={() => (window.location.href = `${API_URL}/oauth/login`)}
        >
          Login
        </button>
        <p>
          {email === ''
            ? 'User not logged in'
            : `User logged in with email: ${email}`}
        </p>
      </div>
    </>
  )
}
