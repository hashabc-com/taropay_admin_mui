import { CONFIG } from 'src/global-config';

import { AccountSettlementView } from 'src/sections/fund/account-settlement';

// ----------------------------------------------------------------------

const metadata = { title: `账户结算 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountSettlementView />
    </>
  );
}
