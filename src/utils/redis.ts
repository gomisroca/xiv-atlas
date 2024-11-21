import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

export function getCacheKey(
  classification: string,
  type: string,
  page: number,
): string {
  return `${classification}:${type}:page:${page}`;
}

export async function generateMeta(
  classification: string,
  type: string,
  cacheKey: string,
) {
  const metaKey = `${classification}:${type}:meta`;
  try {
    const meta = await redis.get(metaKey);
    let existingMeta: { pages: string[] } = { pages: [] };

    if (meta !== null) {
      if (typeof meta === "string") {
        try {
          const parsedMeta = JSON.parse(meta);
          if (
            parsedMeta &&
            typeof parsedMeta === "object" &&
            Array.isArray(parsedMeta.pages)
          ) {
            existingMeta = parsedMeta;
          }
        } catch (parseError) {
          console.error("Error parsing meta data:", parseError);
        }
      }
    }

    if (!existingMeta.pages.includes(cacheKey)) {
      existingMeta.pages.push(cacheKey);
      await redis.set(metaKey, JSON.stringify(existingMeta), {
        ex: 120, //86400,
      });
    }
  } catch (metaError) {
    console.error("Error updating meta information:", metaError);
  }
}
