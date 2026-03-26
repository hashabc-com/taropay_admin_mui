import type { IconButtonProps } from '@mui/material/IconButton';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { _mock } from 'src/_mock';
import { useAuthStore } from 'src/stores';

import { CustomPopover } from 'src/components/custom-popover';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps;

export function AccountPopover({ sx, ...other }: AccountPopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const userInfo = useAuthStore((s) => s.userInfo);
  const account = useAuthStore((s) => s.permissions?.user?.account);

  const displayName = userInfo?.name ?? 'User';

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={_mock.image.avatar(24)}
        displayName={displayName}
        sx={sx}
        {...other}
      />

      <CustomPopover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        slotProps={{ paper: { sx: { p: 0, width: 200 } } }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>

          {account && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
              {account}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <SignOutButton
            size="medium"
            variant="text"
            onClose={onClose}
            sx={{ display: 'block', textAlign: 'left' }}
          />
        </Box>
      </CustomPopover>
    </>
  );
}
