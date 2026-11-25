import dotenv from "dotenv";

dotenv.config();

const config = {
  mongoURI: process.env.MONGO_URI,
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
export default config;