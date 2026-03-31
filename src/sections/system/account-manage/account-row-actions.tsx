import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { type IAccountType } from './types';

// ----------------------------------------------------------------------

type Props = {
  row: IAccountType;
  onEdit: (row: IAccountType) => void;
  onPassword: (row: IAccountType) => void;
  onStatusToggle: (row: IAccountType) => void;
  onDelete: (row: IAccountType) => void;
};

export function AccountRowActions({ row, onEdit, onPassword, onStatusToggle, onDelete }: Props) {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAction = useCallback(
    (action: (r: IAccountType) => void) => () => {
      setAnchorEl(null);
      action(row);
    },
    [row]
  );

  const isEnabled = row.disabledStatus === 0;

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

        <MenuItem onClick={handleAction(onPassword)}>
          <ListItemIcon>
            <Iconify icon="solar:lock-password-bold" />
          </ListItemIcon>
          <ListItemText>{t('system.accountManage.changePassword')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={handleAction(onStatusToggle)}
          sx={{ color: isEnabled ? 'error.main' : 'success.main' }}
        >
          <ListItemIcon>
            <Iconify icon={isEnabled ? 'solar:power-bold' : 'solar:play-bold'} color="inherit" />
          </ListItemIcon>
          <ListItemText>{isEnabled ? t('common.disable') : t('common.enable')}</ListItemText>
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleAction(onDelete)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" color="inherit" />
          </ListItemIcon>
          <ListItemText>{t('common.delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
