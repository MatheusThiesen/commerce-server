import { Injectable } from '@nestjs/common';

@Injectable()
export class ListingRule {
  execute() {
    const rule = {
      marca: {
        eVenda: true,
      },
      grupo: {
        eVenda: true,
      },
      eAtivo: true,
      locaisEstoque: {
        some: {
          quantidade: {
            gt: 0,
          },
          eAtivo: true,
        },
      },
    };

    return rule;
  }
}
