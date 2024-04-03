import { useSearchParams, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getToken } from '../oauth/client'

export const OAuthCallbackPage = () => {
  const [params] = useSearchParams()
  const code = params.get('code')
  const state = params.get('state')
  const [token, setToken] = useState<string | undefined>('')

  // TODO: Check state === previously stored state
  if (code === null) {
    return <Navigate to="/" replace={true} />
  }

  useEffect(() => {
    const asyncTokenFunction = async () => {
      const fetchedToken = await getToken(code)

      // TODO: Persist token securely
      if (fetchedToken !== undefined) {
        localStorage.setItem('access_token', fetchedToken)
      }

      setToken(fetchedToken)
    }
    asyncTokenFunction()
  }, [])
  return token === '' ? (
    <h1>Code callback</h1>
  ) : (
    <Navigate to="/" replace={true} />
  )
}
