import type { MerchantBindRecord } from './hooks';

import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type MerchantBindAction = 'bind' | 'rate';

type Props = {
  row: MerchantBindRecord;
  onAction: (action: MerchantBindAction, row: MerchantBindRecord) => void;
};

export function MerchantBindRowActions({ row, onAction }: Props) {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAction = useCallback(
    (action: MerchantBindAction) => () => {
      setAnchorEl(null);
      onAction(action, row);
    },
    [row, onAction]
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
        <MenuItem onClick={handleAction('bind')}>
          <ListItemIcon>
            <Iconify icon="solar:link-bold" />
          </ListItemIcon>
          <ListItemText>{t('business.merchantBind.bindMerchant')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAction('rate')}>
          <ListItemIcon>
            <Iconify icon="solar:dollar-bold" />
          </ListItemIcon>
          <ListItemText>{t('merchant.info.rateConfig')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
