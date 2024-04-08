import express, { Request, Response } from 'express'
import { config } from './config.js'

const app = express()

app.get('/', (request: Request, response: Response) => {
  response.status(200).send('Hello World')
})

app
  .listen(config.port, () => {
    console.log('Server running on port: ', config.port)
  })
  .on('error', (error) => {
    throw new Error(error.message)
  })
