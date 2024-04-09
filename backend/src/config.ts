import { z } from 'zod'
import 'dotenv/config'

const processEnvSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('3001')
    .transform((val) => Number(val)),
  OAUTH_CLIENT_ID: z.string(),
  OAUTH_CLIENT_SECRET: z.string(),
  OAUTH_AUTH_SERVER: z.string(),
  OAUTH_INTROSPECTION_SERVER: z.string(),
  FRONTEND_ORIGIN: z.string(),
  REDIRECT_URI: z.string(),
})
const typedProcessEnv = processEnvSchema.parse(process.env)

export const config = {
  port: typedProcessEnv.PORT,
  oauthClientId: typedProcessEnv.OAUTH_CLIENT_ID,
  oauthClientSecret: typedProcessEnv.OAUTH_CLIENT_SECRET,
  authServer: typedProcessEnv.OAUTH_AUTH_SERVER,
  introspectionServer: typedProcessEnv.OAUTH_INTROSPECTION_SERVER,
  frontendOrigin: typedProcessEnv.FRONTEND_ORIGIN,
  redirectUri: typedProcessEnv.REDIRECT_URI,
}
