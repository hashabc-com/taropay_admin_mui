import { CONFIG } from 'src/global-config';

import { MessageRecordView } from 'src/sections/logs/message-record';

// ----------------------------------------------------------------------

const metadata = { title: `消息记录 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <MessageRecordView />
    </>
  );
}
