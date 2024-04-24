import { z } from 'zod'
import 'dotenv/config'

const processEnvSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('3001')
    .transform((val) => Number(val)),
  FRONTEND_ORIGIN: z.string(),
  REDIRECT_URI: z.string(),
  COOKIE_SECRET: z.string().min(20),
  // Each provider has to be configured individually
  // This example supports Microsoft and Google
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  GOOGLE_OID_CONFIG_ENDPOINT: z.string(),
  MICROSOFT_OAUTH_CLIENT_ID: z.string(),
  MICROSOFT_OAUTH_CLIENT_SECRET: z.string(),
  MICROSOFT_OID_CONFIG_ENDPOINT: z.string(),
})
const typedProcessEnv = processEnvSchema.parse(process.env)

const providers: {
  [key: string]: {
    clientId: string
    clientSecret: string
    configEndpoint: string
  }
} = {
  google: {
    clientId: typedProcessEnv.GOOGLE_OAUTH_CLIENT_ID,
    clientSecret: typedProcessEnv.GOOGLE_OAUTH_CLIENT_SECRET,
    configEndpoint: typedProcessEnv.GOOGLE_OID_CONFIG_ENDPOINT,
  },
  microsoft: {
    clientId: typedProcessEnv.MICROSOFT_OAUTH_CLIENT_ID,
    clientSecret: typedProcessEnv.MICROSOFT_OAUTH_CLIENT_SECRET,
    configEndpoint: typedProcessEnv.MICROSOFT_OID_CONFIG_ENDPOINT,
  },
}
export const config = {
  port: typedProcessEnv.PORT,
  frontendOrigin: typedProcessEnv.FRONTEND_ORIGIN,
  redirectUri: typedProcessEnv.REDIRECT_URI,
  cookieSecret: typedProcessEnv.COOKIE_SECRET,
  providers,
}
