import { Injectable } from '@nestjs/common';

export interface FieldsProps {
  name: string;
  type: 'string' | 'number';
  exact?: boolean;

  custom?: (search: string) => any;
}

@Injectable()
export class SearchFilter {
  execute(search: string, fields: FieldsProps[]): Array<any> {
    const OR = [];

    if (search?.length < 1) return [];

    for (const field of fields) {
      if (field.custom) {
        OR.push(field.custom(search));
      } else {
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
    }

    return OR;
  }
}
