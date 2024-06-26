import { Controller, Get, Query } from '@nestjs/common';
import { PanelRulesService } from './rules.service';

@Controller('/panel/rules')
export class PanelRulesController {
  constructor(private readonly panelRulesService: PanelRulesService) {}

  @Get('/concept')
  findConceptAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.panelRulesService.conceptListAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }

  @Get('payment-condition')
  findPaymentConditionAll(
    @Query()
    { page = '0', pagesize = '10', search = '', orderby },
  ) {
    return this.panelRulesService.paymentConditionListAll({
      page: Number(page),
      pagesize: Number(pagesize),
      search: search,
      orderby: orderby,
    });
  }
}
