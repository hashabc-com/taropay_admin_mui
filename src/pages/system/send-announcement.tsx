import { CONFIG } from 'src/global-config';

import { SendAnnouncementView } from 'src/sections/system/send-announcement';

// ----------------------------------------------------------------------

const metadata = { title: `发送公告 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <SendAnnouncementView />
    </>
  );
}
