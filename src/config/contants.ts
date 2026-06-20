import dotenv from "dotenv";
dotenv.config();

export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 5050;
export const HOST = process.env.HOST || "localhost";
export const AUTH_TOKEN = process.env.AUTH_TOKEN || "";
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/file_system";