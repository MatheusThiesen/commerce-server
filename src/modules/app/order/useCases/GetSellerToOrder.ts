import { PrismaService } from '@/database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { catchError, firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

export type GetSellerToOrderProps = {
  clientCode: number;
  brandCode: number;
};

export type ResponseSellerToOrderProps = {
  vendedorCodigo: number;
  prepostoCodigo: number;
};

export type ResponseApiErp = {
  content?: [
    {
      entryDate: string;
      representative: number;
    },
  ];
  status?: {
    message: string;
    code: number;
  };
};

@Injectable()
export class GetSellerToOrder {
  readonly MAX_DAYS = 180;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async execute({
    clientCode,
    brandCode,
  }: GetSellerToOrderProps): Promise<ResponseSellerToOrderProps> {
    const url = new URL(process.env.ERP_URL + '/api/v1/get-one');

    url.searchParams.set('entity', 'order');
    url.searchParams.set('fields', 'entryDate');
    url.searchParams.set('extraFields', 'representative');
    url.searchParams.set('sort', 'entryDate,DESC');
    url.searchParams.set('organization', '045');
    url.searchParams.set(
      'search',
      `items.product.brand.code EQ ${brandCode} AND customer.code EQ ${clientCode}`,
    );

    let response = await firstValueFrom(
      this.httpService
        .post<ResponseApiErp>(
          url.toString(),
          {},
          {
            headers: { Authorization: `Bearer ${process.env.ERP_TOKEN}` },
          },
        )
        .pipe(
          catchError((error) => {
            throw error;
          }),
        ),
    );

    if (
      !response?.data?.content?.[0]?.representative ||
      !response?.data?.content?.[0]?.entryDate
    ) {
      url.searchParams.set('organization', '018');
      response = await firstValueFrom(
        this.httpService
          .post<ResponseApiErp>(
            url.toString(),
            {},
            {
              headers: { Authorization: `Bearer ${process.env.ERP_TOKEN}` },
            },
          )
          .pipe(
            catchError((error) => {
              throw error;
            }),
          ),
      );
    }

    if (
      !response?.data?.content?.[0]?.representative ||
      !response?.data?.content?.[0]?.entryDate
    ) {
      return null;
    }

    const lastOrderDate = dayjs(
      response?.data?.content?.[0].entryDate,
      'DD/MM/YYYY',
    );
    const isWithinLastDays =
      dayjs().diff(lastOrderDate, 'day') <= this.MAX_DAYS;

    if (isWithinLastDays) {
      let prepostoCodigo = undefined;
      const alreadyExistsSeller = await this.prisma.vendedor.findFirst({
        select: { codigo: true, tipoVendedor: true, cnpj: true },
        where: {
          codigo: Number(response?.data?.content?.[0].representative),
          eAtivo: true,
        },
      });
      if (!alreadyExistsSeller) {
        throw new BadRequestException('Vendedor invalido');
      }
      if (alreadyExistsSeller.tipoVendedor === 'Preposto') {
        const findAgent = await this.prisma.vendedor.findFirst({
          select: {
            codigo: true,
          },
          where: {
            tipoVendedor: {
              not: 'Preposto',
            },
          },
        });

        prepostoCodigo = findAgent.codigo;
      }

      return {
        vendedorCodigo: alreadyExistsSeller.codigo,
        prepostoCodigo: prepostoCodigo,
      };
    }
  }
}
