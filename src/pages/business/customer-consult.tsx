import { CONFIG } from 'src/global-config';

import { CustomerConsultView } from 'src/sections/business/customer-consult';

// ----------------------------------------------------------------------

const metadata = { title: `咨询列表 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <CustomerConsultView />
    </>
  );
}
