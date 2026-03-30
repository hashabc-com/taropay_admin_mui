import { CONFIG } from 'src/global-config';

import { RoleManageView } from 'src/sections/system/role-manage';

// ----------------------------------------------------------------------

const metadata = { title: `角色管理 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <RoleManageView />
    </>
  );
}
