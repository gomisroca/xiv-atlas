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
