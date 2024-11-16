import type {
  Achievement,
  APIResponse,
  FormattedAPIResponse,
  Instance,
  Item,
  Quest,
} from "@/types";

class XIVAPIFormatter {
  private formatAchievement(raw: any): Achievement {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      icon: raw.icon,
      category: raw.achievement_category?.name || "",
      patch: raw.game_patch?.name || "",
    };
  }

  private formatQuest(raw: any): Quest {
    return {
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      expansion: raw.expansion?.name || "",
      location: {
        area: raw.issuer_location?.map?.place_name?.name || "",
        region: raw.issuer_location?.map?.place_name_region?.name || "",
      },
      issuer: raw.issuer_start?.name || "",
      genre: raw.journal_genre?.name || "",
    };
  }

  private formatInstance(raw: any): Instance {
    return {
      id: raw.id,
      name: raw.name,
      icon: raw.icon,
      contentType: raw.content_type || "",
      banner: raw.banner || "",
    };
  }

  private formatItem(raw: any): Item {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || "",
      icon: raw.icon,
      jobCategory: raw.class_job_category?.name || "",
      itemKind: raw.item_kind?.name || "",
    };
  }

  public formatResponse(
    contentType: string,
    response: APIResponse,
  ): FormattedAPIResponse {
    const formatters = {
      achievements: this.formatAchievement,
      quests: this.formatQuest,
      instances: this.formatInstance,
      items: this.formatItem,
    };

    const formatter = formatters[contentType as keyof typeof formatters];
    if (!formatter) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    return {
      pagination: {
        page: response.pagination.page,
        page_next: response.pagination.page_next,
        page_prev: response.pagination.page_prev,
        page_total: response.pagination.page_total,
        results: response.pagination.results,
        results_per_page: response.pagination.results_per_page,
        results_total: response.pagination.results_total,
      },
      results:
        response.results?.map((item) => formatter.bind(this)(item)) || [],
    };
  }
}

export const formatter = new XIVAPIFormatter();
