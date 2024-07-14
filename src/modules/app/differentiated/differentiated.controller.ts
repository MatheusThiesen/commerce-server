import { GetCurrentUserId } from '@/common/decorators/get-current-user-id.decorator';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Differentiated } from './entities/differentiated.entity';
import { ApprovalDifferentiated } from './useCases/ApprovalDifferentiated';
import { GetDiscountScopeByUserId } from './useCases/GetDiscountScopeByUserId';
import { ReprovalDifferentiated } from './useCases/ReprovalDifferentiated';

@Controller('differentiated')
export class DifferentiatedController {
  constructor(
    private readonly approvalDifferentiated: ApprovalDifferentiated,
    private readonly reprovalDifferentiated: ReprovalDifferentiated,
    private readonly getDiscountScopeByUserId: GetDiscountScopeByUserId,
  ) {}

  @Post('/approval/:orderCode')
  approval(
    @Body()
    {
      tipoDesconto,
      descontoPercentual,
      descontoValor,
      motivoDiferenciado,
    }: Differentiated,
    @Param('orderCode') orderCode: number,
    @GetCurrentUserId() userId: string,
  ) {
    return this.approvalDifferentiated.execute({
      userId,
      orderCode: +orderCode,
      differentiated: {
        tipoDesconto,
        descontoPercentual,
        descontoValor,
        motivoDiferenciado,
      },
    });
  }

  @Post('/reproval/:orderCode')
  reproval(
    @Body()
    { motivoDiferenciado },
    @Param('orderCode') orderCode: number,
    @GetCurrentUserId() userId: string,
  ) {
    return this.reprovalDifferentiated.execute({
      userId,
      orderCode: +orderCode,
      reason: motivoDiferenciado,
    });
  }

  @Get('/discount-scope')
  discountScope(@GetCurrentUserId() userId: string) {
    return this.getDiscountScopeByUserId.execute({
      userId,
    });
  }
}
