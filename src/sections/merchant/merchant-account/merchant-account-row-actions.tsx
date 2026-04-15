import type { MerchantUser } from 'src/api/merchant-user';

import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: MerchantUser;
  onEdit: (user: MerchantUser) => void;
  onToggleStatus: (user: MerchantUser) => void;
  onAutoLogin: (user: MerchantUser) => void;
};

export function MerchantAccountRowActions({ row, onEdit, onToggleStatus, onAutoLogin }: Props) {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAction = useCallback(
    (action: (user: MerchantUser) => void) => () => {
      setAnchorEl(null);
      action(row);
    },
    [row]
  );

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleAction(onEdit)}>
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction(onToggleStatus)}>
          <ListItemIcon>
            <Iconify
              icon={row.status === 0 ? 'solar:forbidden-circle-bold' : 'solar:check-circle-bold'}
            />
          </ListItemIcon>
          <ListItemText>
            {row.status === 0 ? t('merchantAccount.disable') : t('merchantAccount.enable')}
          </ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction(onAutoLogin)} disabled={row.status === 1}>
          <ListItemIcon>
            <Iconify icon="solar:login-3-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchantAccount.autoLogin')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
