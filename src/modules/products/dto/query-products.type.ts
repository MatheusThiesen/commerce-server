export interface QueryProducts {
  page?: string;
  pagesize?: string;
  orderby?: string;
  distinct?: string;
  filters?: ItemFilter[] | string[];
  isReport?: boolean;
  search?: string;
}

export interface ItemFilter {
  name: string;
  value: string | number;
}
