import type {
  ActionResponse,
  APIResponse,
  FormattedAPIResponse,
} from "@/types";
import redis from "../redis";
import rateLimit from "../rate-limiter";
import fetchRetry from "../fetch-retry";
import { formatter } from "../query-formatter";

const apiKey = import.meta.env.XIVAPI_KEY;
const endpoint = `https://beta.xivapi.com/api/1/search?sheets=Action&fields=Name,Icon&transient=Description@as(html)&limit=20&api_key=${apiKey}&query=ClassJobCategory.Name=`;

// Helper to generate a cache key based on job and cursor
function getCacheKey(actionJob: string, cursor?: string): string {
  if (!cursor) {
    return `actions:${actionJob}:page:1`;
  }
  return `actions:${actionJob}:page:${cursor}`;
}

export async function getActions(
  actionJob: string,
  cursor?: string,
): Promise<FormattedAPIResponse> {
  await rateLimit();
  const cacheKey = getCacheKey(actionJob, cursor);

  try {
    // Try to get data from Redis
    // const cachedData = await redis.get(cacheKey);

    // if (cachedData) {
    //   console.log(`Cache hit for ${cacheKey}`);
    //   // Check if cachedData is already an object
    //   if (typeof cachedData === "object" && cachedData !== null) {
    //     return cachedData as FormattedAPIResponse;
    //   }
    //   // If it's a string, try to parse it
    //   if (typeof cachedData === "string") {
    //     try {
    //       return JSON.parse(cachedData) as FormattedAPIResponse;
    //     } catch (parseError) {
    //       console.error(
    //         `Error parsing cached data for ${cacheKey}:`,
    //         parseError,
    //       );
    //     }
    //   }
    // }

    console.log(`Cache miss for ${cacheKey}, fetching from API`);
    const cursorEndpoint = cursor ? `&cursor=${cursor}` : "";
    const jobEndpoint =
      endpoint + `"${actionJob.toUpperCase()}"` + cursorEndpoint;
    if (!jobEndpoint) {
      throw new Error(`Invalid content type: ${actionJob}`);
    }

    const res = await fetchRetry(jobEndpoint);
    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    let data: APIResponse = await res.json();
    let results = data.results as ActionResponse[];
    results = results?.filter(
      (item) => item.fields.Name && item.transient["Description@as(html)"],
    );
    data.results = results;
    // Format the data before caching
    const formattedData = formatter.formatResponse("actions", data);

    // Store the formatted data in Redis
    // await redis.set(cacheKey, JSON.stringify(formattedData), { ex: 86400 });

    // const metaKey = `actions:${actionJob}:meta`;
    // try {
    //   const meta = await redis.get(metaKey);
    //   let existingMeta: { pages: string[] } = { pages: [] };

    //   if (meta !== null) {
    //     if (typeof meta === "string") {
    //       try {
    //         const parsedMeta = JSON.parse(meta);
    //         if (
    //           parsedMeta &&
    //           typeof parsedMeta === "object" &&
    //           Array.isArray(parsedMeta.pages)
    //         ) {
    //           existingMeta = parsedMeta;
    //         }
    //       } catch (parseError) {
    //         console.error("Error parsing meta data:", parseError);
    //       }
    //     }
    //   }

    //   if (!existingMeta.pages.includes(cacheKey)) {
    //     existingMeta.pages.push(cacheKey);
    //     await redis.set(metaKey, JSON.stringify(existingMeta), {
    //       ex: 86400,
    //     });
    //   }
    // } catch (metaError) {
    //   console.error("Error updating meta information:", metaError);
    // }

    return formattedData;
  } catch (error) {
    console.error(`Error fetching ${actionJob}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Helper function to preload next page
export async function preloadNextPage(
  actionJob: string,
  cursor: string,
): Promise<void> {
  try {
    const nextCacheKey = getCacheKey(actionJob, cursor);
    const exists = await redis.exists(nextCacheKey);

    if (!exists) {
      // Trigger fetch but don't await it
      getActions(actionJob, cursor).catch(console.error);
    }
  } catch (error) {
    console.error(`Error preloading next page for ${actionJob}:`, error);
  }
}
