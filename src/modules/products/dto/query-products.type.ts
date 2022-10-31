export interface QueryProducts {
  page?: string;
  pagesize?: string;
  orderby?: string;
  filters?: ItemFilter[] | string[];
}

export interface ItemFilter {
  name: string;
  value: string | number;
}
