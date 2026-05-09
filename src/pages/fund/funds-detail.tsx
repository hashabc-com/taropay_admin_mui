import { CONFIG } from 'src/global-config';

import { FundsDetailView } from 'src/sections/fund/funds-detail';

// ----------------------------------------------------------------------

const metadata = { title: `商户资金流水 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <FundsDetailView />
    </>
  );
}
