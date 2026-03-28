import { CONFIG } from 'src/global-config';

import { BusinessMonthlySummaryView } from 'src/sections/business/monthly-summary';

// ----------------------------------------------------------------------

const metadata = { title: `商务月汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BusinessMonthlySummaryView />
    </>
  );
}
