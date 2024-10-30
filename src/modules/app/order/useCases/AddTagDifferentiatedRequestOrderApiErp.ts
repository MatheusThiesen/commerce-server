import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

export type OrderApiErp = {
  orderCode: number;
};

export type ResponseApiErp = {
  content: [
    {
      code: number;
    },
  ];
  status: {
    message: string;
    code: number;
  };
};

@Injectable()
export class AddTagDifferentiatedRequestOrderApiErp {
  constructor(private readonly httpService: HttpService) {}

  async execute(order: OrderApiErp) {
    const url =
      process.env.ERP_URL + '/api/v1/alter' + '?entity=order&organization=045';

    const response = await firstValueFrom(
      this.httpService
        .post<ResponseApiErp>(
          url,
          {
            payload: {
              code: order.orderCode,
              destacadores: [
                {
                  active: true,
                  tag: 'BLQALT',
                },
              ],
            },
          },
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

    return response;
  }
}
