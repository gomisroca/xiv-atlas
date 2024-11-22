import type { FormattedContent } from "@/types";
import {
  isAchievement,
  isAction,
  isInstance,
  isItem,
  isQuest,
} from "./type-guards";

export function getBanner(item: FormattedContent): string | undefined {
  if (isQuest(item) || isInstance(item)) {
    return item.banner;
  }
  return undefined;
}

export function getIcon(item: FormattedContent): string | undefined {
  if (isAchievement(item) || isItem(item) || isAction(item)) {
    return item.icon;
  }
  return undefined;
}

export function getDescription(item: FormattedContent): string | undefined {
  if (
    isAchievement(item) ||
    isItem(item) ||
    isInstance(item) ||
    isAction(item)
  ) {
    return item.description;
  }
  return undefined;
}

interface QuestUtils {
  location: string;
  npc: string;
}
export function getQuestUtils(item: FormattedContent): QuestUtils | undefined {
  if (isQuest(item)) {
    return {
      location: item.location,
      npc: item.npc,
    };
  }
  return undefined;
}

interface InstanceUtils {
  levelRequired: number;
  levelSync: number;
}
export function getInstanceUtils(
  item: FormattedContent,
): InstanceUtils | undefined {
  if (isInstance(item)) {
    return {
      levelRequired: item.levelRequired,
      levelSync: item.levelSync,
    };
  }
  return undefined;
}

interface ItemUtils {
  category: string;
  hq: boolean;
  itemLevel: number;
  equipLevel: number;
  rarity: number;
  materiaSlotCount: number;
  glamour: boolean;
  unique: boolean;
  stats: object;
}
export function getItemUtils(item: FormattedContent): ItemUtils | undefined {
  if (isItem(item)) {
    return {
      category: item.category,
      hq: item.hq,
      itemLevel: item.itemLevel,
      equipLevel: item.equipLevel,
      rarity: item.rarity,
      materiaSlotCount: item.materiaSlotCount,
      glamour: item.glamour,
      unique: item.unique,
      stats: item.stats,
    };
  }
  return undefined;
}

interface AchievementUtils {
  category: string;
  title: {
    masculine: string;
    feminine: string;
  };
}
export function getAchievementUtils(
  item: FormattedContent,
): AchievementUtils | undefined {
  if (isAchievement(item)) {
    return {
      category: item.category,
      title: item.title,
    };
  }
  return undefined;
}
