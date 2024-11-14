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
  icon: string;
}

export interface APIResponse {
  pagination: Pagination;
  results: Achievement[] | null;
}
