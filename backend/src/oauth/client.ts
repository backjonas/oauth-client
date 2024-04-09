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

export const getAuthServer = async () => {
  const endpoint = await getEndpoint('authorization_endpoint')
  if (endpoint === undefined) {
    return undefined
  }

  const clientId = config.oauthClientId
  const scope = 'openid%20email'
  const redirectUri = config.redirectUri
  const state = 'placeholder_state'
  const nonce = '0394852-3190485-2490358'

  return (
    endpoint +
    '?response_type=code' +
    `&client_id=${clientId}` +
    `&scope=${scope}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}` +
    `&nonce=${nonce}`
  )
}

export const getToken = async (code: string): Promise<string | undefined> => {
  const endpoint = await getEndpoint('token_endpoint')
  if (endpoint === undefined) {
    return undefined
  }
  const client_id = config.oauthClientId
  const client_secret = config.oauthClientSecret
  const redirect_uri = config.redirectUri
  const grant_type = 'authorization_code'

  try {
    const authResponse = await fetch(endpoint, {
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
      console.error(authResponse)
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
): Promise<IntrospectionResponse | undefined> => {
  const endpoint = await getEndpoint('userinfo_endpoint')
  if (endpoint === undefined) {
    return undefined
  }

  const authResponse = await fetch(`${endpoint}?access_token=${token}`)
  if (!authResponse.ok) {
    return undefined
  }

  return (await authResponse.json()) as IntrospectionResponse
}

const getEndpoint = async (endpoint: string): Promise<string | undefined> => {
  const endpointResponse = await fetch(config.oidConfigEndpoint)
  if (!endpointResponse.ok) {
    return undefined
  }
  const endpointObject = (await endpointResponse.json()) as {
    [key: string]: string
  }
  return endpointObject[endpoint]
}
