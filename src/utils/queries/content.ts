import type { APIResponse, FormattedAPIResponse } from "@/types";
import redis from "../redis";
import rateLimit from "../rate-limiter";
import fetchRetry from "../fetch-retry";
import { formatter } from "../query-formatter";

const apiKey = import.meta.env.XIVAPI_KEY;
const contentTypeEndpoints = {
  achievements: `https://beta.xivapi.com/api/1/search?sheets=Achievement&query=Points>0&fields=Name,Icon,Description,Points,Title.Feminine,Title.Masculine,AchievementCategory.AchievementKind.Name&limit=20&api_key=${apiKey}`,

  other_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Other"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  head_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Head"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,

  arr_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="A Realm Reborn"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  hw_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Heavensward"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  sb_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Stormblood"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  shb_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Shadowbringers"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  ew_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Endwalker"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  dt_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Dawntrail"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,

  dungeons: `https://beta.xivapi.com/api/1/search?sheets=ContentFinderCondition&fields=Icon,Name,ContentType.Name,Image,ClassJobLevelRequired,ClassJobLevelSync,Transient.Description&query=ContentType.Name="Dungeons"&limit=20&api_key=${apiKey}`,
  raids: `https://beta.xivapi.com/api/1/search?sheets=ContentFinderCondition&fields=Icon,Name,ContentType.Name,Image,ClassJobLevelRequired,ClassJobLevelSync,Transient.Description&query=ContentType.Name="Raids"&limit=20&api_key=${apiKey}`,
  trials: `https://beta.xivapi.com/api/1/search?sheets=ContentFinderCondition&fields=Icon,Name,ContentType.Name,Image,ClassJobLevelRequired,ClassJobLevelSync,Transient.Description&query=ContentType.Name="Trials"&limit=20&api_key=${apiKey}`,
};

// Helper to generate a cache key based on type and cursor
function getCacheKey(type: string, cursor?: string): string {
  if (!cursor) {
    return `content:${type}:page:1`;
  }
  return `content:${type}:page:${cursor}`;
}

function buildApiUrl(contentType: string, cursor?: string): string {
  const baseQuery =
    contentTypeEndpoints[contentType as keyof typeof contentTypeEndpoints];
  if (!baseQuery) {
    throw new Error(`Invalid content type: ${contentType}`);
  }

  return baseQuery + (cursor ? `&cursor=${cursor}` : "");
}

export async function getContent(
  contentType: string,
  cursor?: string,
): Promise<FormattedAPIResponse> {
  await rateLimit();
  const currentPage = cursor;
  const cacheKey = getCacheKey(contentType, cursor);

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
    const endpoint = buildApiUrl(contentType, currentPage);

    const res = await fetchRetry(endpoint);
    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    let data: APIResponse = await res.json();

    // Format the data before caching
    const formattedData = formatter.formatResponse(contentType, data);
    console.log(formattedData);

    // Store the formatted data in Redis
    // await redis.set(cacheKey, JSON.stringify(formattedData), { ex: 86400 });

    // const metaKey = `actions:${contentType}:meta`;
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
    console.error(`Error fetching ${contentType}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Helper function to preload next page
export async function preloadNextPage(
  contentType: string,
  cursor: string,
): Promise<void> {
  try {
    const nextCacheKey = getCacheKey(contentType, cursor);
    const exists = await redis.exists(nextCacheKey);

    if (!exists) {
      // Trigger fetch but don't await it
      getContent(contentType, cursor).catch(console.error);
    }
  } catch (error) {
    console.error(`Error preloading next page for ${contentType}:`, error);
  }
}
