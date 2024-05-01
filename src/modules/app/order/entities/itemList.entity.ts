import { WatchedList } from '@/core/entities/watched-list';
import { Item } from './item.entity';

export class ItemList extends WatchedList<Item> {
  compareItems(a: Item, b: Item): boolean {
    return a.codigo === b.codigo;
  }
}
