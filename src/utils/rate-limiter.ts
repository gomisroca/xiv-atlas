import redis from "./redis";

async function rateLimit() {
  const key = "rate_limit";
  const maxRequests = 30; // 30 requests per second
  const refillRate = 30; // Refill 30 tokens per second
  const refillInterval = 1000; // 1 second in milliseconds

  const now = Date.now();
  const [tokens, lastRefill] = (await redis.mget(
    key,
    `${key}_last_refill`,
  )) as [string, string];
  const currentTokens = parseInt(tokens || "30");
  const lastRefillTime = parseInt(lastRefill || "0");

  const elapsedTime = now - lastRefillTime;
  const newTokens = Math.min(
    maxRequests,
    currentTokens + Math.floor(elapsedTime / refillInterval) * refillRate,
  );

  if (newTokens < 1) {
    throw new Error("Rate limit exceeded");
  }

  await redis.mset({
    [key]: newTokens - 1,
    [`${key}_last_refill`]: now,
  });
}

export default rateLimit;
