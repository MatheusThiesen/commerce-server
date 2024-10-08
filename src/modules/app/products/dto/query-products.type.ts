export interface QueryProducts {
  page?: string;
  pagesize?: string;
  orderby?: string;
  distinct?: string;
  filters?: any[]; //ItemFilter[] | string[];
  isReport?: number;
  search?: string;
}

export interface ItemFilter {
  name: string;
  value: string | number;
}
