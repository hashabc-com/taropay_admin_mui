import type { Order } from './types';

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: Order;
  onNotify: (row: Order, status: number) => void;
  onUpdateStatus: (row: Order) => void;
  onViewDetail: (row: Order) => void;
};

export function OrderRowActions({ row, onNotify, onUpdateStatus, onViewDetail }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
        {row.status !== '0' && (
          <MenuItem
            onClick={() => {
              onUpdateStatus(row);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:refresh-bold" />
            </ListItemIcon>
            <ListItemText>更新状态</ListItemText>
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onNotify(row, 0);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          </ListItemIcon>
          <ListItemText>成功通知</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onNotify(row, 2);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>失败通知</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            onViewDetail(row);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:info-circle-bold" />
          </ListItemIcon>
          <ListItemText>查看详情</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
