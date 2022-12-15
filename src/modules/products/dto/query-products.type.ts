export interface QueryProducts {
  page?: string;
  pagesize?: string;
  orderby?: string;
  distinct?: string;
  filters?: ItemFilter[] | string[];
  isReport?: boolean;
}

export interface ItemFilter {
  name: string;
  value: string | number;
}
