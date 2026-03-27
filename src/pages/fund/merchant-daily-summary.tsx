import { CONFIG } from 'src/global-config';

import { MerchantDailySummaryView } from 'src/sections/fund/merchant-daily-summary';

// ----------------------------------------------------------------------

const metadata = { title: `商户每日汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MerchantDailySummaryView />
    </>
  );
}
