export interface QueryClients {
  page?: string;
  pagesize?: string;
  orderby?: string;
  filters?: any[]; //ItemFilter[] | string[];
  search?: string;
}

export interface ItemFilter {
  name: string;
  value: string | number;
}
