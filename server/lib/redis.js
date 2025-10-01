import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export let client = null;

if (process.env.ENABLE_REDIS !== "false") {
  client = new Redis(process.env.UPSTASH_REDIS_URL);
  console.log("🔌Redis Connected Successfully");
} else {
  console.log(" Redis is disabled via environment variable.");
}
