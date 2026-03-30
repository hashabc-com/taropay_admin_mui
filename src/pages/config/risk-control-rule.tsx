import { CONFIG } from 'src/global-config';

import { RiskControlRuleView } from 'src/sections/config/risk-control-rule';

// ----------------------------------------------------------------------

const metadata = { title: `风控规则配置 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <RiskControlRuleView />
    </>
  );
}
