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

  private formatItem(raw: any): Item | null {
    if (
      !raw.fields.Name ||
      !raw.fields.Icon.path ||
      raw.fields.Name.length === 0 ||
      raw.fields.Icon.path === "ui/icon/000000/000000.tex"
    ) {
      return null;
    }
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

  private formatQuest(raw: any): Quest | null {
    if (
      !raw.fields.Name ||
      !raw.fields.Icon.path ||
      raw.fields.Name.length === 0 ||
      raw.fields.Icon.path === "ui/icon/000000/000000.tex"
    ) {
      return null;
    }
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      banner: getIconUrl(raw.fields.Icon.path),
      expansion: raw.fields.Expansion.fields.Name,
      location: raw.fields.PlaceName.fields.Name,
      npc: raw.fields.IssuerStart.fields?.Singular,
      category: raw.fields.JournalGenre.fields.Name,
    };
  }

  private formatInstance(raw: any): Instance | null {
    if (
      !raw.fields.Name ||
      !raw.fields.Image.path ||
      raw.fields.Name.length === 0
    ) {
      return null;
    }
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      description: raw.transient.Description,
      banner: getIconUrl(raw.fields.Image.path),
      levelRequired: raw.fields.ClassJobLevelRequired,
      levelSync: raw.fields.ClassJobLevelSync,
      category: raw.fields.ContentType.Name,
    };
  }

  private formatAction(raw: any): Action | null {
    if (
      !raw.fields.Name ||
      !raw.fields.Icon.path ||
      raw.fields.Name.length === 0 ||
      raw.fields.Icon.path === "ui/icon/000000/000000.tex"
    ) {
      return null;
    }
    return {
      id: raw.row_id,
      name: raw.fields.Name,
      description: raw.transient["Description@as(html)"],
      icon: getIconUrl(raw.fields.Icon.path),
    };
  }

  public formatResponse(
    contentType: string,
    nextPage: number,
    response: APIResponse["results"],
  ): FormattedAPIResponse {
    const formatters = {
      achievements: this.formatAchievement,
      other_items: this.formatItem,
      head_items: this.formatItem,
      pld_items: this.formatItem,
      war_items: this.formatItem,
      drk_items: this.formatItem,
      gnb_items: this.formatItem,
      whm_items: this.formatItem,
      sch_items: this.formatItem,
      ast_items: this.formatItem,
      sge_items: this.formatItem,
      mnk_items: this.formatItem,
      drg_items: this.formatItem,
      nin_items: this.formatItem,
      sam_items: this.formatItem,
      rpr_items: this.formatItem,
      vpr_items: this.formatItem,
      brd_items: this.formatItem,
      mch_items: this.formatItem,
      dnc_items: this.formatItem,
      blm_items: this.formatItem,
      smn_items: this.formatItem,
      rdm_items: this.formatItem,
      pct_items: this.formatItem,
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
      next: nextPage,
      results:
        response
          .map((item) => formatter.bind(this)(item))
          .filter((item) => item !== null) || [],
    };
  }
}

export const formatter = new XIVAPIFormatter();
