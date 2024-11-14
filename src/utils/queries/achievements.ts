import type { APIResponse } from "@/types";

export async function getAchievements(page: number = 1) {
  const apiKey = import.meta.env.XIVAPI_KEY;
  const res = await fetch(
    `https://xivapi.com/achievement?language=en&snake_case=1&key=${apiKey}&page=${page}`,
  );
  const data: APIResponse = await res.json();
  return data;
}
