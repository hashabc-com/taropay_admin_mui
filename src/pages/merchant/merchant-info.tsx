import { CONFIG } from 'src/global-config';

import { MerchantInfoView } from 'src/sections/merchant/merchant-info';

// ----------------------------------------------------------------------

const metadata = { title: `商户信息 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MerchantInfoView />
    </>
  );
}
