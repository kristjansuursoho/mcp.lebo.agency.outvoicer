import pino, { type TransportSingleOptions } from "pino"
import { env } from "./env"

let transport: TransportSingleOptions | undefined = undefined

if (env.NODE_ENV !== "production") {
  transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname", // Removes clutter you don't need locally
    },
  }
}

export const logger = pino({
  level: env.LOG_LEVEL,
  transport,
  redact: {
    paths: [
      "authorization",
      "headers.authorization",
      "req.headers.authorization",
      "cookie",
      "headers.cookie",
      "req.headers.cookie",
      "token",
      "*.token",
      "OAUTH_SERVICE_TOKEN",
    ],
    censor: "[REDACTED]",
  },
})
