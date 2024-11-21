import type {
  Achievement,
  Action,
  FormattedContent,
  Instance,
  Item,
  Quest,
} from "@/types";

export function isAchievement(item: FormattedContent): item is Achievement {
  return "title" in item && "icon" in item && "description" in item;
}

export function isItem(item: FormattedContent): item is Item {
  return "itemLevel" in item && "icon" in item && "description" in item;
}

export function isQuest(item: FormattedContent): item is Quest {
  return "banner" in item && "expansion" in item;
}

export function isInstance(item: FormattedContent): item is Instance {
  return (
    typeof item === "object" &&
    item !== null &&
    "levelRequired" in item &&
    typeof item.levelRequired === "number" &&
    "levelSync" in item &&
    typeof item.levelSync === "number" &&
    "icon" in item &&
    typeof item.icon === "string" &&
    "banner" in item &&
    typeof item.banner === "string" &&
    "description" in item &&
    typeof item.description === "string"
  );
}

export function isAction(item: FormattedContent): item is Action {
  return (
    "icon" in item &&
    "description" in item &&
    !("title" in item) &&
    !("itemLevel" in item) &&
    !("levelRequired" in item)
  );
}
