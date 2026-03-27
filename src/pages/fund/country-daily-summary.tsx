import { CONFIG } from 'src/global-config';

import { CountryDailySummaryView } from 'src/sections/fund/country-daily-summary';

// ----------------------------------------------------------------------

const metadata = { title: `国家每日汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CountryDailySummaryView />
    </>
  );
}
