import { CONFIG } from 'src/global-config';

import { PaymentChannelView } from 'src/sections/config/payment-channel';

// ----------------------------------------------------------------------

const metadata = { title: `支付通道配置 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <PaymentChannelView />
    </>
  );
}
