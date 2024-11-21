import type { APIResponse, FormattedAPIResponse } from "@/types";
import redis, { generateMeta, getCacheKey } from "../redis";
import rateLimit from "../rate-limiter";
import fetchRetry from "../fetch-retry";
import { formatter } from "../query-formatter";
import { REDIS_EXPIRATION_TIME } from "@/consts";

const apiKey = import.meta.env.XIVAPI_KEY;
const endpoint = `https://beta.xivapi.com/api/1/search?sheets=Action&fields=Name,Icon&transient=Description@as(html)&limit=20&api_key=${apiKey}&query=ClassJobCategory.Name=`;

async function fetchAndStoreData(
  actionJob: string,
  cursor?: string,
  page: number = 1,
) {
  try {
    const cursorEndpoint = cursor ? `&cursor=${cursor}` : "";
    const endpointUrl =
      endpoint + `"${actionJob.toUpperCase()}"` + cursorEndpoint;
    const res = await fetchRetry(endpointUrl);

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data: APIResponse = await res.json();
    const formattedData = formatter.formatResponse(
      actionJob,
      page + 1,
      data.results,
    );
    const cacheKey = getCacheKey("actions", actionJob, page);
    await redis.set(cacheKey, JSON.stringify(formattedData), {
      ex: REDIS_EXPIRATION_TIME,
    });

    if (data.next) {
      void fetchAndStoreData(actionJob, data.next, page + 1);
    }
  } catch (error) {
    console.error(`Error fetching ${actionJob}:`, error);
    throw error;
  }
}

export async function getActions(
  actionJob: string,
  page: number = 1,
): Promise<FormattedAPIResponse> {
  await rateLimit();
  const cacheKey = getCacheKey("actions", actionJob, page);

  try {
    let cachedData: FormattedAPIResponse | null = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for ${cacheKey}`);
      // Check if cachedData is already an object
      if (typeof cachedData === "object" && cachedData !== null) {
        return cachedData as FormattedAPIResponse;
      }
      // If it's a string, try to parse it
      if (typeof cachedData === "string") {
        try {
          return JSON.parse(cachedData) as FormattedAPIResponse;
        } catch (parseError) {
          console.error(
            `Error parsing cached data for ${cacheKey}:`,
            parseError,
          );
        }
      }
    }

    console.log(`Cache miss for ${cacheKey}, fetching from API`);
    await fetchAndStoreData(actionJob);
    // Try to get data from Redis again
    cachedData = await redis.get(cacheKey);
    // Generate meta redis store for the content type
    await generateMeta("actions", actionJob, cacheKey);

    if (!cachedData) {
      throw new Error(`No data found for ${actionJob}`);
    }
    return cachedData;
  } catch (error) {
    console.error(`Error fetching ${actionJob}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Helper function to preload next page
export async function preloadNextPage(
  actionJob: string,
  page: number,
): Promise<void> {
  try {
    const nextCacheKey = getCacheKey("actions", actionJob, page);
    const exists = await redis.exists(nextCacheKey);

    if (!exists) {
      // Trigger fetch but don't await it
      getActions(actionJob, page).catch(console.error);
    }
  } catch (error) {
    console.error(`Error preloading next page for ${actionJob}:`, error);
  }
}
