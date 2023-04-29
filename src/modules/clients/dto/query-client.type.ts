export interface QueryClients {
  page?: string;
  pagesize?: string;
  orderby?: string;
  filters?: ItemFilter[] | string[];
}

export interface ItemFilter {
  name: string;
  value: string | number;
}
