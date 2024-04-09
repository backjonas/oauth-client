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
  OID_CONFIG_ENDPOINT: z.string(),
  FRONTEND_ORIGIN: z.string(),
  REDIRECT_URI: z.string(),
  COOKIE_SECRET: z.string().min(20),
})
const typedProcessEnv = processEnvSchema.parse(process.env)

export const config = {
  port: typedProcessEnv.PORT,
  oauthClientId: typedProcessEnv.OAUTH_CLIENT_ID,
  oauthClientSecret: typedProcessEnv.OAUTH_CLIENT_SECRET,
  oidConfigEndpoint: typedProcessEnv.OID_CONFIG_ENDPOINT,
  frontendOrigin: typedProcessEnv.FRONTEND_ORIGIN,
  redirectUri: typedProcessEnv.REDIRECT_URI,
  cookieSecret: typedProcessEnv.COOKIE_SECRET,
}
