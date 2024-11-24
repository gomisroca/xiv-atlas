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
  return (
    typeof item === "object" &&
    item !== null &&
    "itemLevel" in item &&
    typeof item.itemLevel === "number" &&
    "equipLevel" in item &&
    typeof item.equipLevel === "number" &&
    "rarity" in item &&
    typeof item.rarity === "number" &&
    "materiaSlotCount" in item &&
    typeof item.materiaSlotCount === "number" &&
    "icon" in item &&
    typeof item.icon === "string" &&
    "description" in item &&
    typeof item.description === "string"
  );
}

export function isQuest(item: FormattedContent): item is Quest {
  return (
    typeof item === "object" &&
    item !== null &&
    "banner" in item &&
    typeof item.banner === "string" &&
    "expansion" in item &&
    typeof item.expansion === "string" &&
    "location" in item &&
    typeof item.location === "string" &&
    "npc" in item &&
    typeof item.npc === "string"
  );
}

export function isInstance(item: FormattedContent): item is Instance {
  return (
    typeof item === "object" &&
    item !== null &&
    "levelRequired" in item &&
    typeof item.levelRequired === "number" &&
    "levelSync" in item &&
    typeof item.levelSync === "number" &&
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
