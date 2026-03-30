import { CONFIG } from 'src/global-config';

import { RouteStrategyView } from 'src/sections/config/route-strategy';

// ----------------------------------------------------------------------

const metadata = { title: `路由策略配置 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <RouteStrategyView />
    </>
  );
}
