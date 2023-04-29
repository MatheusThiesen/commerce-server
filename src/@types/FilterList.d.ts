export type FilterListProps = {
  label: string;
  name: string;
  data: ItemFilter[];
};
type ItemFilter = {
  name: string;
  value: number | string;
};
