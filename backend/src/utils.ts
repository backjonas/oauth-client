import { Request } from 'express'

export const getAccessTokenCookie = (req: Request) => {
  const cookieHeader = req.headers?.cookie
  if (!cookieHeader) {
    return undefined
  }

  const cookieList = cookieHeader.split(`;`).map((c) => c.trim())
  const accessTokenCookie = cookieList.find((cookie) =>
    cookie.startsWith('access_token')
  )
  return accessTokenCookie?.split('=')[1]
}
