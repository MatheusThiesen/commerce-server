import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

export type OrderApiErp = {
  customer: number;
  deliveryDate: string;
  payment: number;
  representative: number;
  agent: number;
  paymentLocal: number;
  orderCategory: 4 | 9;

  items: {
    price: number;
    product: number;
    quantity: number;
    stockLocation: number;
    discountAmount?: number;
  }[];

  additionalOrderData1?: {
    observationExternalOrder?: string;
  };
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
export class RequestOrderApiErp {
  constructor(private readonly httpService: HttpService) {}

  async execute(order: OrderApiErp) {
    const url =
      process.env.ERP_URL + '/api/v1/insert' + '?entity=order&organization=045';

    const response = await firstValueFrom(
      this.httpService
        .post<ResponseApiErp>(
          url,
          { payload: order },
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
