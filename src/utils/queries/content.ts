import type { APIResponse, FormattedAPIResponse } from "@/types";
import redis, { generateMeta, getCacheKey } from "../redis";
import rateLimit from "../rate-limiter";
import fetchRetry from "../fetch-retry";
import { formatter } from "../query-formatter";
import { REDIS_EXPIRATION_TIME } from "../../consts";

const apiKey = import.meta.env.XIVAPI_KEY;
const contentTypeEndpoints = {
  achievements: `https://beta.xivapi.com/api/1/search?sheets=Achievement&query=Points>0&fields=Name,Icon,Description,Points,Title.Feminine,Title.Masculine,AchievementCategory.AchievementKind.Name&limit=20&api_key=${apiKey}`,

  other_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Other"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  head_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Head"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,

  pld_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Gladiator's Arm" ItemUICategory.Name="Shield"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  war_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Marauder's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  drk_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Dark Knight's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  gnb_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Gunbreaker's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  whm_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="One–handed Conjurer's Arm" ItemUICategory.Name="Two–handed Conjurer's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  sch_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Scholar's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  ast_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Astrologian's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  sge_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Sage's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  mnk_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Pugilist's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  drg_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Lancer's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  nin_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Rogue's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  sam_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Samurai's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  rpr_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Reaper's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  vpr_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Viper's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  brd_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Archer's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  mch_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Machinist's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  dnc_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Dancer's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  blm_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="One–handed Thaumaturge's Arm" ItemUICategory.Name="Two–handed Thaumaturge's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  smn_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Arcanist's Grimoire"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  rdm_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Red Mage's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,
  pct_items: `https://beta.xivapi.com/api/1/search?sheets=Item&query=ItemUICategory.Name="Pictomancer's Arm"&fields=Name,Description,Icon,ItemUICategory.Name,BaseParam,BaseParamValue,CanBeHq,ClassJobCategory.Name,ClassJobRepair.Name,LevelItem,LevelEquip,Rarity,MateriaSlotCount,IsGlamorous,IsUnique&limit=20&api_key=${apiKey}`,

  arr_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="A Realm Reborn"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  hw_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Heavensward"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  sb_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Stormblood"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  shb_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Shadowbringers"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  ew_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Endwalker"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,
  dt_quests: `https://beta.xivapi.com/api/1/search?sheets=Quest&query=Expansion.Name="Dawntrail"&fields=Expansion.Name,Icon,PlaceName.Name,IssuerStart.Singular,JournalGenre.Name,Name&limit=20&api_key=${apiKey}`,

  dungeons: `https://beta.xivapi.com/api/1/search?sheets=ContentFinderCondition&fields=Name,ContentType.Name,Image,ClassJobLevelRequired,ClassJobLevelSync&transient=Description&query=ContentType.Name="Dungeons"&limit=20&api_key=${apiKey}`,
  raids: `https://beta.xivapi.com/api/1/search?sheets=ContentFinderCondition&fields=Name,ContentType.Name,Image,ClassJobLevelRequired,ClassJobLevelSync&transient=Description&query=ContentType.Name="Raids"&limit=20&api_key=${apiKey}`,
  trials: `https://beta.xivapi.com/api/1/search?sheets=ContentFinderCondition&fields=Name,ContentType.Name,Image,ClassJobLevelRequired,ClassJobLevelSync&transient=Description&query=ContentType.Name="Trials"&limit=20&api_key=${apiKey}`,
};

async function fetchAndStoreData(
  contentType: string,
  cursor?: string,
  page: number = 1,
) {
  try {
    const cursorEndpoint = cursor ? `&cursor=${cursor}` : "";
    const endpoint =
      contentTypeEndpoints[contentType as keyof typeof contentTypeEndpoints];
    const endpointUrl = endpoint + cursorEndpoint;
    const res = await fetchRetry(endpointUrl);

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data: APIResponse = await res.json();
    const formattedData = formatter.formatResponse(
      contentType,
      page + 1,
      data.results,
    );
    const cacheKey = getCacheKey("content", contentType, page);
    await redis.set(cacheKey, JSON.stringify(formattedData), {
      ex: REDIS_EXPIRATION_TIME,
    });

    if (data.next) {
      void fetchAndStoreData(contentType, data.next, page + 1);
    }
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
}

export async function getContent(
  contentType: string,
  page: number = 1,
): Promise<FormattedAPIResponse> {
  await rateLimit();
  const cacheKey = getCacheKey("content", contentType, page);

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
    await fetchAndStoreData(contentType);
    // Try to get data from Redis again
    cachedData = await redis.get(cacheKey);
    // Generate meta redis store for the content type
    await generateMeta("content", contentType, cacheKey);

    if (!cachedData) {
      throw new Error(`No data found for ${contentType}`);
    }
    return cachedData;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

// Helper function to preload next page
export async function preloadNextPage(
  contentType: string,
  page: number,
): Promise<void> {
  try {
    const nextCacheKey = getCacheKey("content", contentType, page);
    const exists = await redis.exists(nextCacheKey);

    if (!exists) {
      // Trigger fetch but don't await it
      getContent(contentType, page).catch(console.error);
    }
  } catch (error) {
    console.error(`Error preloading next page for ${contentType}:`, error);
  }
}
