import { config } from '../config.js'
import crypto from 'crypto'
import base64url from 'base64url'

export interface TokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
  refresh_token: string
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

export interface IdTokenInformation {
  iss: string
  azp: string
  aud: string
  sub: string
  email: string
  email_verified: boolean
  at_hash: string
  iat: number
  exp: number
}

export const getAuthServer = async (
  state: string,
  codeChallenge: string,
  provider: string
) => {
  const endpoint = await getEndpoint('authorization_endpoint', provider)
  const oauthCredentials = config.providers[provider]
  if (endpoint === undefined || oauthCredentials === undefined) {
    return undefined
  }

  const scope = provider === 'microsoft' ? 'offline_access openid' : 'openid'

  return (
    endpoint +
    '?response_type=code' +
    `&client_id=${oauthCredentials.clientId}` +
    `&scope=${scope}` +
    `&redirect_uri=${config.redirectUri}/${provider}` +
    '&access_type=offline' +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    '&code_challenge_method=S256'
  )
}

export const getToken = async (
  code: string,
  codeVerifier: string,
  provider: string
): Promise<TokenResponse | undefined> => {
  const endpoint = await getEndpoint('token_endpoint', provider)
  const configCredentials = config.providers[provider]
  if (endpoint === undefined || configCredentials === undefined) {
    return undefined
  }

  const client_id = configCredentials.clientId
  const client_secret = configCredentials.clientSecret
  const redirect_uri = `${config.redirectUri}/${provider}`
  const grant_type = 'authorization_code'
  const code_verifier = codeVerifier

  try {
    const authResponse = await fetch(endpoint, {
      method: 'POST',
      body: new URLSearchParams({
        client_id,
        client_secret,
        redirect_uri,
        grant_type,
        code,
        code_verifier,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    if (!authResponse.ok) {
      return undefined
    }
    return (await authResponse.json()) as TokenResponse
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const refreshToken = async (
  refresh_token: string,
  provider: string
): Promise<TokenResponse | undefined> => {
  const endpoint = await getEndpoint('token_endpoint', provider)
  const oauthCredentials = config.providers[provider]
  if (endpoint === undefined || oauthCredentials === undefined) {
    return undefined
  }

  const client_id = oauthCredentials.clientId
  const client_secret = oauthCredentials.clientSecret
  const grant_type = 'refresh_token'

  try {
    const authResponse = await fetch(endpoint, {
      method: 'POST',
      body: new URLSearchParams({
        client_id,
        client_secret,
        refresh_token,
        grant_type,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    if (!authResponse.ok) {
      console.error(authResponse)
      return undefined
    }
    return (await authResponse.json()) as TokenResponse
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const revokeToken = async (
  token: string,
  provider: string
): Promise<boolean> => {
  const endpoint =
    (await getEndpoint('revocation_endpoint', provider)) ??
    (await getEndpoint('end_session_endpoint', provider))
  if (endpoint === undefined) {
    return false
  }

  try {
    const revocationResponse = await fetch(endpoint, {
      method: 'POST',
      body: new URLSearchParams({
        token,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return revocationResponse.ok
  } catch (error) {
    console.error(error)
    return false
  }
}

export const introspectToken = async (
  token: string,
  provider: string
): Promise<IntrospectionResponse | undefined> => {
  const endpoint = await getEndpoint('userinfo_endpoint', provider)
  if (endpoint === undefined) {
    return undefined
  }

  const authResponse = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!authResponse.ok) {
    return undefined
  }

  return (await authResponse.json()) as IntrospectionResponse
}

const getEndpoint = async (
  endpoint: string,
  provider: string
): Promise<string | undefined> => {
  const oauthCredentials = config.providers[provider]
  if (!oauthCredentials) {
    return undefined
  }

  const endpointResponse = await fetch(oauthCredentials.configEndpoint)
  if (!endpointResponse.ok) {
    return undefined
  }
  const endpointObject = (await endpointResponse.json()) as {
    [key: string]: string
  }
  return endpointObject[endpoint]
}

export const generateCodeChallenge = (codeVerifier: string) => {
  return base64url(crypto.createHash('sha256').update(codeVerifier).digest())
}
