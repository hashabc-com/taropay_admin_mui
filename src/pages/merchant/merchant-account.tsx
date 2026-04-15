import { CONFIG } from 'src/global-config';

import { MerchantAccountView } from 'src/sections/merchant/merchant-account';

// ----------------------------------------------------------------------

const metadata = { title: `主账号管理 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MerchantAccountView />
    </>
  );
}
