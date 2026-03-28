import { CONFIG } from 'src/global-config';

import { MerchantBindView } from 'src/sections/business/merchant-bind';

// ----------------------------------------------------------------------

const metadata = { title: `商务绑定列表 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MerchantBindView />
    </>
  );
}
