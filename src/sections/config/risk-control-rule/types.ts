// ----------------------------------------------------------------------

export type RuleConfig = {
  id: number;
  ruleName: string;
  ruleDesc?: string;
  sceneCode: string;
  conditionExpr: string;
  actionCode: string;
  priority: number;
  status: number; // 0: 禁用, 1: 启用
  actionParams?: string;
  createTime?: string;
  updateTime?: string;
};

export const SCENE_CODE_MAP: Record<string, Record<string, string>> = {
  PAY_PAYOUT: { zh: '代付', en: 'Payout' },
  PAY_PAYIN: { zh: '代收', en: 'Collection' },
};

export const ACTION_CODE_MAP: Record<string, Record<string, string>> = {
  ALARM: { zh: '告警', en: 'Alarm' },
  BLOCK: { zh: '拦截', en: 'Block' },
  AUDIT: { zh: '审核', en: 'Audit' },
  REJECT: { zh: '拒绝', en: 'Reject' },
};
