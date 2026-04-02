import type { MerchantInfo } from 'src/api/merchant';

import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type MerchantRowActionsProps = {
  row: MerchantInfo;
  onEdit: (merchant: MerchantInfo) => void;
  onChangePassword: (merchant: MerchantInfo) => void;
  onToggleStatus: (merchant: MerchantInfo) => void;
  onUnbindKey: (merchant: MerchantInfo) => void;
  onBindIp: (merchant: MerchantInfo) => void;
  onBindTgGroup: (merchant: MerchantInfo) => void;
  onRateConfig: (merchant: MerchantInfo) => void;
  onAutoLogin: (merchant: MerchantInfo) => void;
};

export function MerchantRowActions({
  row,
  onEdit,
  onChangePassword,
  onToggleStatus,
  onUnbindKey,
  onBindIp,
  onBindTgGroup,
  onRateConfig,
  onAutoLogin,
}: MerchantRowActionsProps) {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAction = useCallback(
    (action: (merchant: MerchantInfo) => void) => () => {
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
        disableAutoFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleAction(onEdit)}>
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction(onChangePassword)}>
          <ListItemIcon>
            <Iconify icon="solar:key-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.changePassword')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleAction(onToggleStatus)}
          sx={{ color: row.status === 0 ? 'error.main' : 'success.main' }}
        >
          <ListItemIcon>
            <Iconify
              icon={row.status === 0 ? 'solar:power-bold' : 'solar:play-bold'}
              color="inherit"
            />
          </ListItemIcon>
          <ListItemText>
            {row.status === 0 ? t('merchant.info.disable') : t('merchant.info.enable')}
          </ListItemText>
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleAction(onUnbindKey)}>
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.unbindSecretKey')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction(onBindIp)}>
          <ListItemIcon>
            <Iconify icon="solar:global-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.bindIp')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction(onBindTgGroup)}>
          <ListItemIcon>
            <Iconify icon="solar:users-group-rounded-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.bindTgGroup')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction(onRateConfig)}>
          <ListItemIcon>
            <Iconify icon="solar:dollar-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.rateConfig')}</ListItemText>
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleAction(onAutoLogin)} disabled={row.status === 1}>
          <ListItemIcon>
            <Iconify icon="solar:login-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.autoLogin')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
