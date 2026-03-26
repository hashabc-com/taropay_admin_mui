// ----------------------------------------------------------------------

export type RiskControlRecord = {
  id: number;
  ruleName?: string;
  ruleId?: string;
  customerName?: string;
  businessType?: string; // PAY_PAYIN | PAY_PAYOUT
  businessId?: string;
  actionCode?: string; // REJECT | ALARM | BLOCK
  reason?: string;
  requestParams?: string;
  responseParams?: string;
  createTime?: string;
  localTime?: string;
};
