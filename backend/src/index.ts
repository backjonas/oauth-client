import express, { Request, Response } from 'express'
import { config } from './config.js'
import oauthRouter from './routes/oauth.js'

const app = express()

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Index')
})

app.use('/oauth', oauthRouter)

app
  .listen(config.port, () => {
    console.log('Server running on port: ', config.port)
  })
  .on('error', (error) => {
    throw new Error(error.message)
  })
