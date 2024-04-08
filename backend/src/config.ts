import { z } from 'zod'
import 'dotenv/config'

const processEnvSchema = z.object({
  PORT: z
    .string()
    .optional()
    .default('3001')
    .transform((val) => Number(val)),
})
const typedProcessEnv = processEnvSchema.parse(process.env)

export const config = {
  port: typedProcessEnv.PORT,
}
