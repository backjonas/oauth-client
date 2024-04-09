import express, { Request, Response } from 'express'
import { getAuthServer, getToken, introspectToken } from '../oauth/client.js'
import { getAccessTokenCookie } from '../utils.js'
import { config } from '../config.js'

const oauthRouter = express.Router()

oauthRouter.get('/login', async (_req: Request, res: Response) => {
  res.redirect(getAuthServer())
})

oauthRouter.get('/code', async (req: Request, res: Response) => {
  const code = req.query?.code
  if (!(typeof code === 'string')) {
    return res.sendStatus(400)
  }

  const token = await getToken(code)
  if (token !== undefined) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    })
  }
  res.redirect(config.frontendOrigin)
})

oauthRouter.get('/email', async (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', config.frontendOrigin)
  res.header('Access-Control-Allow-Credentials', 'true')

  const accessToken = getAccessTokenCookie(req)
  if (!(typeof accessToken === 'string')) {
    return res.sendStatus(400)
  }

  const introspectionResponse = await introspectToken(accessToken)
  const email = introspectionResponse.email
  return res.status(200).json({ email })
})

export default oauthRouter
