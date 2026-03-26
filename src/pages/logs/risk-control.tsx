import { CONFIG } from 'src/global-config';

import { RiskControlView } from 'src/sections/logs/risk-control';

// ----------------------------------------------------------------------

const metadata = { title: `风控规则记录 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <RiskControlView />
    </>
  );
}
