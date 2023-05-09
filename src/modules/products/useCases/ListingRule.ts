import { Injectable } from '@nestjs/common';

@Injectable()
export class ListingRule {
  execute() {
    const now = new Date();
    const month = now.toLocaleString('pt-br', {
      month: '2-digit',
    });
    const year = now.toLocaleString('pt-br', {
      year: 'numeric',
    });

    const rule = {
      // subGrupo: {
      //   eVenda: true,
      // },
      // possuiFoto: true,
      // precoVenda: {
      //   gt: 0,
      // },

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
          OR: [
            {
              periodo: 'pronta-entrega',
            },
            {
              data: {
                gte: new Date(`${year}-${month}-01T00:00`),
              },
            },
          ],
        },
      },
    };

    return rule;
  }
}
