export const login = () => {
  const authServer = 'https://accounts.google.com/o/oauth2/v2'
  const clientId = import.meta.env.VITE_CLIENT_ID!
  const scope = 'openid%20email'
  const redirectUri = 'http://localhost:3000/code'
  const state = 'placeholder_state'
  const nonce = '0394852-3190485-2490358'
  const hd = 'localhost:3000'

  window.location.href =
    authServer +
    '/auth' +
    '?response_type=code' +
    '&client_id=' +
    clientId +
    '&scope=' +
    scope +
    '&redirect_uri=' +
    redirectUri +
    '&state=' +
    state +
    '&nonce=' +
    nonce +
    '&hd=' +
    hd
}

export const getToken = async (code: string): Promise<string | undefined> => {
  const authServer = 'https://oauth2.googleapis.com/token'
  const client_id = import.meta.env.VITE_CLIENT_ID!
  const client_secret = import.meta.env.VITE_CLIENT_SECRET!
  const redirect_uri = 'http://localhost:3000/code'
  const grant_type = 'authorization_code'

  try {
    const authResponse = await fetch(authServer, {
      method: 'POST',
      body: new URLSearchParams({
        client_id,
        client_secret,
        redirect_uri,
        grant_type,
        code,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    return (await authResponse.json()).access_token
  } catch (error) {
    console.error(error)
    return undefined
  }
}
