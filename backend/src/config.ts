import dotenv from "dotenv";
dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecretFromEnv = process.env.JWT_SECRET?.trim();

if (nodeEnv === "production" && !jwtSecretFromEnv) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export const JWT_SECRET = jwtSecretFromEnv || "changeme-dev-only";


