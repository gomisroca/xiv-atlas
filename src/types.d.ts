export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  title: {
    feminine: string;
    masculine: string;
  };
  category: string;
  iconSrcset?: string;
  iconAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
  bannerSrcset?: string;
  bannerAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
}

export interface Item {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  hq: boolean;
  itemLevel: number;
  equipLevel: number;
  rarity: number;
  materiaSlotCount: number;
  glamour: boolean;
  unique: boolean;
  stats: object;
  iconSrcset?: string;
  iconAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
  bannerSrcset?: string;
  bannerAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
}

export interface Quest {
  id: number;
  name: string;
  banner: string;
  expansion: string;
  location: string;
  npc: string;
  category: string;
  iconSrcset?: string;
  iconAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
  bannerSrcset?: string;
  bannerAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
}

export interface Instance {
  id: number;
  name: string;
  category: string;
  banner: string;
  levelRequired: number;
  levelSync: number;
  description: string;
  iconSrcset?: string;
  iconAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
  bannerSrcset?: string;
  bannerAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
}

export interface Action {
  id: number;
  name: string;
  description: string;
  icon: string;
  iconSrcset?: string;
  iconAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
  bannerSrcset?: string;
  bannerAttributes?: {
    width: number;
    height: number;
    loading: string;
    decoding: string;
  };
}

export interface AchievementResponse {
  row_id: number;
  fields: {
    Name: string;
    Description: string;
    Icon: {
      path: string;
    };
    Title: {
      Feminine: string;
      Masculine: string;
    };
    AchievementCategory: {
      AchievementKind: {
        Name: string;
      };
    };
  };
}

interface BaseParam {
  Name: string;
}
export interface ItemResponse {
  row_id: number;
  fields: {
    Name: string;
    Description: string;
    Icon: {
      path: string;
    };
    ItemUICategory: {
      Name: string;
    };
    BaseParam: BaseParam[];
    BaseParamValue: number[];
    CanBeHq: boolean;
    ClassJobCategory: {
      Name: string;
    };
    ClassJobRepair: {
      Name: string;
    };
    LevelItem: {
      value: number;
    };
    LevelEquip: number;
    Rarity: number;
    MateriaSlotCount: number;
    IsGlamorous: boolean;
    IsUnique: boolean;
  };
}

export interface QuestResponse {
  row_id: number;
  fields: {
    Name: string;
    Icon: {
      path: string;
    };
    Expansion: {
      Name: string;
    };
    PlaceName: {
      Name: string;
    };
    IssuerStart: {
      Singular: string;
    };
    JournalGenre: {
      Name: string;
    };
  };
}

export interface InstanceResponse {
  row_id: number;
  fields: {
    Name: string;
    ContentType: {
      Name: string;
    };
    Image: {
      path: string;
    };
    ClassJobLevelRequired: number;
    ClassJobLevelSync: number;
  };
  transient: {
    Description: string;
  };
}

export interface ActionResponse {
  row_id: number;
  fields: {
    Name: string;
    Icon: {
      path: string;
    };
  };
  transient: {
    "Description@as(html)": string;
  };
}

type ResultType =
  | ActionResponse
  | ItemResponse
  | QuestResponse
  | InstanceResponse
  | ActionResponse;
export interface APIResponse {
  next: string | undefined;
  results: ResultType[];
}

type FormattedContent = Achievement | Item | Quest | Instance | Action;

export interface FormattedAPIResponse {
  next: number | undefined;
  results: FormattedContent[];
}
