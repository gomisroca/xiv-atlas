export interface Pagination {
  page: number;
  page_next: number | null;
  page_prev: number | null;
  page_total: number;
  results: number;
  results_per_page: number;
  results_total: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  patch: string;
}

export interface Quest {
  id: number;
  name: string;
  icon: string;
  expansion: string;
  location: {
    area: string;
    region: string;
  };
  issuer: string;
  genre: string;
}

export interface Instance {
  id: number;
  name: string;
  icon: string;
  contentType: string;
  banner: string;
}

export interface Item {
  id: number;
  name: string;
  description: string;
  icon: string;
  jobCategory: string;
  itemKind: string;
}
export interface APIResponse {
  pagination: Pagination;
  results: Achievement[] | null;
}

type FormattedContent = Achievement | Quest | Instance | Item;

export interface FormattedAPIResponse {
  pagination: Pagination;
  results: FormattedContent[];
}
