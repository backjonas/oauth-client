import { useParams, useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.API_URL || 'http://localhost:3001'

export const OAuthCallbackPage = () => {
  const { provider } = useParams()
  const [searchParams] = useSearchParams()
  return (
    <>
      <h1>Login confirmation</h1>
      {provider === undefined ? (
        <p>Authentication error</p>
      ) : (
        <>
          <p>Do you wish to continue authenticating using {provider}?</p>
          <button
            onClick={() =>
              (window.location.href = `${API_URL}/oauth/code/${provider}?${searchParams.toString()}`)
            }
          >
            Continue
          </button>
        </>
      )}
    </>
  )
}
