import { Injectable } from '@nestjs/common';

export interface FieldsProps {
  name: string;
  type: 'string' | 'number';
  exact?: boolean;
}

@Injectable()
export class SearchFilter {
  execute(search: string, fields: FieldsProps[]) {
    const OR = [];

    if (!search) return [];

    for (const field of fields) {
      if (field.type === 'number') {
        if (!isNaN(Number(search)))
          OR.push({
            [field.name]: Number(search),
          });
      } else {
        if (field?.exact) {
          OR.push({
            [field.name]: String(search),
          });
        } else {
          OR.push({
            [field.name]: {
              mode: 'insensitive',
              contains: search,
            },
          });
        }
      }
    }

    return { OR };
  }
}
