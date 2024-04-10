import express, { Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import { config } from './config.js'
import oauthRouter from './routes/oauth.js'

const app = express()

app.use(cookieParser(config.cookieSecret))

app.use('/oauth', oauthRouter)

app
  .listen(config.port, () => {
    console.log('Server running on port: ', config.port)
  })
  .on('error', (error) => {
    throw new Error(error.message)
  })
