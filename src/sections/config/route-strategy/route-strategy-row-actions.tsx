import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { type RouteStrategy } from './types';

// ----------------------------------------------------------------------

type Props = {
  row: RouteStrategy;
  onEdit: (row: RouteStrategy) => void;
  onToggleStatus: (row: RouteStrategy) => void;
};

export function RouteStrategyRowActions({ row, onEdit, onToggleStatus }: Props) {
  const { t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            onEdit(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onToggleStatus(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon={row.status === '0' ? 'solar:power-bold' : 'solar:play-bold'} />
          </ListItemIcon>
          <ListItemText>
            {row.status === '0' ? t('common.disable') : t('common.enable')}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
