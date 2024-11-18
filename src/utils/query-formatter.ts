import type {
  Achievement,
  Action,
  APIResponse,
  FormattedAPIResponse,
  Instance,
  Item,
  Quest,
} from "@/types";

function getIconUrl(icon: string) {
  return `https://beta.xivapi.com/api/1/asset?path=${icon}&format=png`;
}

class XIVAPIFormatter {
  private formatAchievement(raw: any): Achievement {
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      description: raw.fields.Description,
      icon: getIconUrl(raw.fields.Icon.path),
      title: {
        feminine: raw.fields.Title.Feminine,
        masculine: raw.fields.Title.Masculine,
      },
      category: raw.fields.AchievementCategory.AchievementKind?.Name || "",
    };
  }

  private formatItem(raw: any): Item {
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      description: raw.fields.Description,
      icon: getIconUrl(raw.fields.Icon.path),
      category: raw.fields.ItemUICategory.Name,
      hq: raw.fields.CanBeHq,
      itemLevel: raw.fields.LevelItem.value,
      equipLevel: raw.fields.LevelEquip,
      rarity: raw.fields.Rarity,
      materiaSlotCount: raw.fields.MateriaSlotCount,
      glamour: raw.fields.IsGlamorous,
      unique: raw.fields.IsUnique,
      stats: raw.fields.BaseParam.reduce(
        (acc: { [x: string]: any }, param: { Name: string | number }) => {
          acc[param.Name] = raw.fields.BaseParamValue[param.Name];
          return acc;
        },
        {},
      ),
    };
  }

  private formatQuest(raw: any): Quest {
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      icon: getIconUrl(raw.fields.Icon.path),
      expansion: raw.fields.Expansion.Name,
      location: raw.fields.PlaceName.Name,
      npc: raw.fields.IssuerStart.Singular,
      category: raw.fields.JournalGenre.Name,
    };
  }

  private formatInstance(raw: any): Instance {
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      description: raw.fields.Transient.Description,
      icon: getIconUrl(raw.fields.Icon.path),
      banner: getIconUrl(raw.fields.Image.path),
      levelRequired: raw.fields.ClassJobLevelRequired,
      levelSync: raw.fields.ClassJobLevelSync,
      category: raw.fields.ContentType.Name,
    };
  }

  private formatAction(raw: any): Action {
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      description: raw.transient["Description@as(html)"],
      icon: getIconUrl(raw.fields.Icon.path),
    };
  }

  public formatResponse(
    contentType: string,
    response: APIResponse,
  ): FormattedAPIResponse {
    const formatters = {
      achievements: this.formatAchievement,
      other_items: this.formatItem,
      head_items: this.formatItem,
      arr_quests: this.formatQuest,
      hw_quests: this.formatQuest,
      sb_quests: this.formatQuest,
      shb_quests: this.formatQuest,
      ew_quests: this.formatQuest,
      dt_quests: this.formatQuest,
      dungeons: this.formatInstance,
      raids: this.formatInstance,
      trials: this.formatInstance,
      actions: this.formatAction,
    };

    const formatter = formatters[contentType as keyof typeof formatters];
    if (!formatter) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    return {
      next: response.next,
      results:
        response.results?.map((item) => formatter.bind(this)(item)) || [],
    };
  }
}

export const formatter = new XIVAPIFormatter();
