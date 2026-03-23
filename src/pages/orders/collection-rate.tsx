import { CONFIG } from 'src/global-config';

import { CollectionRateView } from 'src/sections/orders/collection-rate';

// ----------------------------------------------------------------------

const metadata = { title: `代收成功率 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CollectionRateView />
    </>
  );
}
