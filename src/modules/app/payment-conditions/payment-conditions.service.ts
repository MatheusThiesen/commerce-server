import { Injectable } from '@nestjs/common';
import { CreatePaymentConditionDto } from './dto/create-payment-condition.dto';
import { UpdatePaymentConditionDto } from './dto/update-payment-condition.dto';
import { PaymentCondition } from './entities/payment-condition.entity';

import { StringToNumberOrUndefined } from '@/utils/StringToNumberOrUndefined.utils';
import { PrismaService } from '../../../database/prisma.service';
import { ParseCsv } from '../../../utils/ParseCsv.utils';

type ParcelProps = {
  priceTableCod: number;
  sequence: number;
  paymentCondition: number;
};

@Injectable()
export class PaymentConditionsService {
  constructor(
    private prisma: PrismaService,
    private parseCsv: ParseCsv,
    private readonly stringToNumberOrUndefined: StringToNumberOrUndefined,
  ) {}

  async createOrUpdateParcel(parcels: ParcelProps[]) {
    // Erro na criação novas parcelas
    return;

    for (const parcel of parcels) {
      const alreadyExistsParcel =
        await this.prisma.condicaoPagamentoParcela.findUnique({
          where: {
            condicaoPagamentoCodigo_sequencia_tabelaPrecoCodigo: {
              tabelaPrecoCodigo: parcel.priceTableCod,
              sequencia: parcel.sequence,
              condicaoPagamentoCodigo: parcel.paymentCondition,
            },
          },
        });

      if (!alreadyExistsParcel) {
        await this.prisma.condicaoPagamentoParcela.create({
          data: {
            tabelaPrecoCodigo: parcel.paymentCondition,
            condicaoPagamentoCodigo: parcel.paymentCondition,
            sequencia: parcel.sequence,
          },
        });
      }
    }
  }

  async create(createPaymentConditionDto: CreatePaymentConditionDto) {
    const paymentCondition = new PaymentCondition();
    Object.assign(paymentCondition, {
      ...createPaymentConditionDto,
    });

    const paymentConditionExists =
      await this.prisma.condicaoPagamento.findUnique({
        where: { codigo: createPaymentConditionDto.codigo },
      });

    if (paymentConditionExists) {
      throw new Error('Payment Condition already exists');
    }

    const created = await this.prisma.condicaoPagamento.create({
      data: {
        codigo: createPaymentConditionDto.codigo,
        descricao: createPaymentConditionDto.descricao,
        valorMinimo: createPaymentConditionDto.valorMinimo,
        quantidade: createPaymentConditionDto.quantidade,
        eAtivo: createPaymentConditionDto.eAtivo,
      },
    });

    await this.createOrUpdateParcel(
      createPaymentConditionDto.parcelas.map((parcel) => ({
        priceTableCod: parcel.tabelaPreco,
        sequence: parcel.sequencia,
        paymentCondition: createPaymentConditionDto.codigo,
      })),
    );

    return created;
  }

  async findOne(codigo: number) {
    const paymentCondition = await this.prisma.condicaoPagamento.findUnique({
      select: { codigo: true, descricao: true },
      where: { codigo },
    });
    if (!paymentCondition) {
      throw new Error('Payment Condition does not exist');
    }
    return paymentCondition;
  }

  async update(
    codigo: number,
    updatePaymentConditionDto: UpdatePaymentConditionDto,
  ) {
    const paymentCondition = new PaymentCondition();
    Object.assign(paymentCondition, {
      ...updatePaymentConditionDto,
    });

    await this.findOne(codigo);

    const updatedPaymentCondition = await this.prisma.condicaoPagamento.update({
      data: {
        codigo: updatePaymentConditionDto.codigo,
        descricao: updatePaymentConditionDto.descricao,
        valorMinimo: updatePaymentConditionDto.valorMinimo,
        quantidade: updatePaymentConditionDto.quantidade,
        eAtivo: updatePaymentConditionDto.eAtivo,
      },
      where: { codigo },
    });

    await this.createOrUpdateParcel(
      updatePaymentConditionDto.parcelas.map((parcel) => ({
        priceTableCod: parcel.tabelaPreco,
        sequence: parcel.sequencia,
        paymentCondition: updatePaymentConditionDto.codigo,
      })),
    );

    return updatedPaymentCondition;
  }

  async import(file: Express.Multer.File) {
    const paymentConditions = await this.parseCsv.execute(file);

    for (const paymentConditionArr of paymentConditions) {
      const [codigo, descricao, quantidade, valorMinimo, ativo] =
        paymentConditionArr;

      const paymentCondition = new PaymentCondition();
      Object.assign(paymentCondition, {
        codigo: this.stringToNumberOrUndefined.execute(codigo),
        descricao: descricao,
        quantidade: this.stringToNumberOrUndefined.execute(quantidade),
        eAtivo: Number(ativo) === 1,
        valorMinimo: this.stringToNumberOrUndefined.execute(valorMinimo),
        parcelas: [1, 2, 3, 4, 5, 6, 7, 8]
          .map((index) => {
            const parcelData = paymentConditionArr[index + 4];

            return {
              tabelaPreco: Number(parcelData),
              sequencia: index,
            };
          })
          .filter((f) => f?.tabelaPreco),
      });

      const paymentConditionExists =
        await this.prisma.condicaoPagamento.findUnique({
          where: {
            codigo: paymentCondition.codigo,
          },
        });

      try {
        if (paymentConditionExists) {
          await this.update(paymentConditionExists.codigo, paymentCondition);
        } else {
          await this.create(paymentCondition);
        }
      } catch (error) {
        console.log(error);
        console.log(paymentCondition);
      }
    }

    return;
  }
}
