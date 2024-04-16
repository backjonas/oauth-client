import express, { Request, Response } from 'express'
import { randomBytes } from 'crypto'
import base64url from 'base64url'

import {
  IdTokenInformation,
  generateCodeChallenge,
  getAuthServer,
  getToken,
  introspectToken,
  refreshToken,
  revokeToken,
} from '../oauth/client.js'
import { config } from '../config.js'

const oauthRouter = express.Router()

oauthRouter.get('/login', async (_req: Request, res: Response) => {
  const state = randomBytes(20).toString('hex')
  const codeVerifier = base64url(randomBytes(32))
  const codeChallenge = generateCodeChallenge(codeVerifier)

  const authServer = await getAuthServer(state, codeChallenge)
  if (authServer === undefined) {
    return res.sendStatus(500)
  }
  res.cookie('state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    signed: true,
    maxAge: 60 * 1000,
  })

  res.cookie('code_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    signed: true,
    maxAge: 60 * 1000,
  })

  res.redirect(authServer)
})

oauthRouter.get('/code', async (req: Request, res: Response) => {
  const code = req.query?.code
  const codeVerifier = req.signedCookies?.code_verifier
  if (typeof code !== 'string' || typeof codeVerifier !== 'string') {
    return res.sendStatus(400)
  }

  const codeState = req.query?.state
  const cookieState = req.signedCookies['state'] as string | undefined
  if (
    typeof codeState !== 'string' ||
    typeof cookieState !== 'string' ||
    codeState === '' ||
    codeState !== cookieState
  ) {
    return res.sendStatus(403)
  }
  const token = await getToken(code, codeVerifier)
  if (token !== undefined) {
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      signed: true,
      maxAge: token.expires_in * 1000,
    })

    res.cookie('refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      signed: true,
    })
  }

  res.redirect(config.frontendOrigin)
})

oauthRouter.get('/logout', async (req: Request, res: Response) => {
  const accessToken = req.signedCookies['access_token']
  if (!(typeof accessToken === 'string')) {
    return res.sendStatus(400)
  }

  const revocationResponse = await revokeToken(accessToken)
  if (!revocationResponse) {
    return res.sendStatus(500)
  }

  res.clearCookie('access_token')
  res.redirect(config.frontendOrigin)
})

oauthRouter.get('/sub', async (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', config.frontendOrigin)
  res.header('Access-Control-Allow-Credentials', 'true')

  // No access_token provided, ignore request
  const accessToken = req.signedCookies['access_token']
  if (typeof accessToken !== 'string') {
    return res.sendStatus(200)
  }

  // Call userinfo endpoint to get information about the token
  const introspectionResponse = await introspectToken(accessToken)
  if (introspectionResponse !== undefined) {
    const sub = introspectionResponse.sub
    return res.status(200).json({ sub })
  }

  // Introspection failed due to an expired or otherwise invalid access token
  // Attempt to refresh the access token if a refresh token exists
  const refresh_token = req.signedCookies['refresh_token']
  if (typeof refresh_token !== 'string') {
    res.clearCookie('access_token')
    return res.sendStatus(401)
  }

  const tokenRefreshResponse = await refreshToken(refresh_token)
  if (tokenRefreshResponse === undefined) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res.sendStatus(401)
  }

  res.cookie('access_token', tokenRefreshResponse.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    signed: true,
    maxAge: tokenRefreshResponse.expires_in * 1000,
  })

  const decodedIdToken = JSON.parse(
    Buffer.from(
      tokenRefreshResponse.id_token.split('.')[1],
      'base64'
    ).toString()
  ) as IdTokenInformation

  if (decodedIdToken !== undefined) {
    const sub = decodedIdToken.sub
    return res.status(200).json({ sub })
  }

  return res.sendStatus(401)
})

export default oauthRouter
