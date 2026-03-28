import { CONFIG } from 'src/global-config';

import { BusinessDailySummaryView } from 'src/sections/business/daily-summary';

// ----------------------------------------------------------------------

const metadata = { title: `商务日汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BusinessDailySummaryView />
    </>
  );
}
