import { config } from '../config.js'

export interface TokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
}

export interface IntrospectionResponse {
  azp: string
  aud: string
  sub: number
  scope: string
  exp: number
  expires_in: number
  email: string
  email_verified: boolean
  access_type: string
}

export const getAuthServer = () => {
  const clientId = config.oauthClientId
  const scope = 'openid%20email'
  const redirectUri = config.redirectUri
  const state = 'placeholder_state'
  const nonce = '0394852-3190485-2490358'

  return (
    `${config.authServer}/auth` +
    '?response_type=code' +
    `&client_id=${clientId}` +
    `&scope=${scope}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}` +
    `&nonce=${nonce}`
  )
}

export const getToken = async (code: string): Promise<string | undefined> => {
  const client_id = config.oauthClientId
  const client_secret = config.oauthClientSecret
  const redirect_uri = config.redirectUri
  const grant_type = 'authorization_code'

  try {
    const authResponse = await fetch(`${config.authServer}/token`, {
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
    if (!authResponse.ok) {
      console.error(await authResponse.json())
      return undefined
    }
    const responseObject = (await authResponse.json()) as TokenResponse
    return responseObject.access_token
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const introspectToken = async (
  token: string
): Promise<IntrospectionResponse> => {
  const authResponse = await fetch(
    `${config.introspectionServer}/tokeninfo?access_token=${token}`
  )
  return (await authResponse.json()) as IntrospectionResponse
}
