import { CONFIG } from 'src/global-config';

import { AccountManageView } from 'src/sections/system/account-manage';

// ----------------------------------------------------------------------

const metadata = { title: `账户管理 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountManageView />
    </>
  );
}
