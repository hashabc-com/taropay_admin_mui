import { CONFIG } from 'src/global-config';

import { MerchantRequestView } from 'src/sections/logs/merchant-request';

// ----------------------------------------------------------------------

const metadata = { title: `商户请求日志 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MerchantRequestView />
    </>
  );
}
