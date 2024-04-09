import express, { Request, Response } from 'express'
import { randomBytes } from 'crypto'

import { getAuthServer, getToken, introspectToken } from '../oauth/client.js'
import { config } from '../config.js'

const oauthRouter = express.Router()

oauthRouter.get('/login', async (_req: Request, res: Response) => {
  const state = randomBytes(20).toString('hex')
  const authServer = await getAuthServer(state)
  if (authServer === undefined) {
    return res.sendStatus(500)
  }
  res.cookie('state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    signed: true,
    maxAge: 60*1000,
  })

  res.redirect(authServer)
})

oauthRouter.get('/code', async (req: Request, res: Response) => {
  const code = req.query?.code
  if (typeof code !== 'string') {
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
    // TODO: Revoke code
    return res.sendStatus(403)
  }
  const token = await getToken(code)
  if (token !== undefined) {
    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      signed: true,
      maxAge: token.expires_in * 1000,
    })
  }
  res.redirect(config.frontendOrigin)
})

oauthRouter.get('/email', async (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', config.frontendOrigin)
  res.header('Access-Control-Allow-Credentials', 'true')

  const accessToken = req.signedCookies['access_token']
  if (!(typeof accessToken === 'string')) {
    return res.sendStatus(400)
  }

  const introspectionResponse = await introspectToken(accessToken)
  if (introspectionResponse === undefined) {
    res.clearCookie('access_token')
    return res.sendStatus(401)
  }

  const email = introspectionResponse.email
  return res.status(200).json({ email })
})

export default oauthRouter
