import { CONFIG } from 'src/global-config';

import { PaymentSummaryView } from 'src/sections/orders/payment-summary';

// ----------------------------------------------------------------------

const metadata = { title: `付款汇总 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PaymentSummaryView />
    </>
  );
}
