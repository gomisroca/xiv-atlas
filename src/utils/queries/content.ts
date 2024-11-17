import type { APIResponse, FormattedAPIResponse } from "@/types";
import redis from "../redis";
import rateLimit from "../rate-limiter";
import fetchRetry from "../fetch-retry";
import { formatter } from "../query-formatter";

const contentTypeEndpoints = {
  achievements:
    "achievement?columns=Icon,Name,Description,AchievementCategory.Name,GamePatch.Name&",
  quests:
    "quest?columns=Expansion.Name,Icon,IssuerLocation.Map.PlaceName.Name,IssuerLocation.Map.PlaceNameRegion.Name,IssuerStart.Name,JournalGenre.Name,Name&",
  instances: "instanceContent?columns=Icon,Name,ContentType,Banner&",
  items:
    "item?columns=ClassJobCategory.Name,Description,ItemKind.Name,Name,Icon&",
};

function generateEmptyPage(data: APIResponse): APIResponse {
  return {
    pagination: {
      page: data.pagination.page,
      page_next: null,
      page_total: data.pagination.page_total,
      page_prev: data.pagination.page_prev,
      results: 0,
      results_per_page: 100,
      results_total: data.pagination.results_total,
    },
    results: [],
  };
}

export async function getContent(
  contentType: string,
  page: number = 1,
): Promise<FormattedAPIResponse> {
  await rateLimit();
  const cacheKey = `${contentType}_page_${page}`;

  try {
    // Try to get data from Redis
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for ${contentType} page ${page}`);
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
            `Error parsing cached data for ${contentType} page ${page}:`,
            parseError,
          );
        }
      }
    }

    console.log(
      `Cache miss for ${contentType} page ${page}, fetching from API`,
    );
    const apiKey = import.meta.env.XIVAPI_KEY;
    const endpoint =
      contentTypeEndpoints[contentType as keyof typeof contentTypeEndpoints];
    if (!endpoint) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    const res = await fetchRetry(
      `https://xivapi.com/${endpoint}language=en&snake_case=1&private_key=${apiKey}&page=${page}`,
    );

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    let data: APIResponse = await res.json();

    data.results =
      data.results?.filter((content: any) => {
        return content.name !== null && content.name !== "";
      }) || [];

    if (data.results?.length === 0) {
      return formatter.formatResponse(contentType, generateEmptyPage(data));
    }

    // Format the data before caching
    const formattedData = formatter.formatResponse(contentType, data);

    // Store the formatted data in Redis
    await redis.set(cacheKey, JSON.stringify(formattedData), { ex: 86400 });

    return formattedData;
  } catch (error) {
    console.error(`Error fetching ${contentType} for page ${page}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}
