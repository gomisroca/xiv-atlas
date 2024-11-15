import type { APIResponse } from "@/types";
import redis from "../redis";
import rateLimit from "../rate-limiter";
import fetchRetry from "../fetch-retry";

export async function getAchievements(page: number = 1): Promise<APIResponse> {
  await rateLimit();
  const cacheKey = `achievements_page_${page}`;

  try {
    // Try to get data from Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for page ${page}`);
      // Check if cachedData is already an object
      if (typeof cachedData === "object" && cachedData !== null) {
        return cachedData as APIResponse;
      }
      // If it's a string, try to parse it
      if (typeof cachedData === "string") {
        try {
          return JSON.parse(cachedData) as APIResponse;
        } catch (parseError) {
          console.error(
            `Error parsing cached data for page ${page}:`,
            parseError,
          );
          // If parsing fails, we'll fetch fresh data
        }
      }
    }

    console.log(`Cache miss for page ${page}, fetching from API`);
    const apiKey = import.meta.env.XIVAPI_KEY;
    const res = await fetchRetry(
      `https://xivapi.com/achievement?language=en&snake_case=1&key=${apiKey}&page=${page}`,
    );

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data: APIResponse = await res.json();

    // Store the data in Redis with an expiration of 1 day (86400 seconds)
    await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 });

    return data;
  } catch (error) {
    console.error(`Error fetching achievements for page ${page}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}
