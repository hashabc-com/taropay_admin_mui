import type { Order } from './types';

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  row: Order;
  onNotify: (row: Order, status: number) => void;
  onUpdateStatus: (row: Order) => void;
  onViewDetail: (row: Order) => void;
  onViewRequestLog: (row: Order) => void;
};

export function OrderRowActions({
  row,
  onNotify,
  onUpdateStatus,
  onViewDetail,
  onViewRequestLog,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { t } = useLanguage();

  // -- notify confirm dialog --
  const [notifyConfirmOpen, setNotifyConfirmOpen] = useState(false);
  const [pendingNotifyStatus, setPendingNotifyStatus] = useState<number | null>(null);

  const handleNotifyClick = (status: number) => {
    setPendingNotifyStatus(status);
    setNotifyConfirmOpen(true);
    setAnchorEl(null);
  };

  const handleNotifyConfirm = () => {
    if (pendingNotifyStatus !== null) {
      onNotify(row, pendingNotifyStatus);
    }
    setNotifyConfirmOpen(false);
    setPendingNotifyStatus(null);
  };

  const handleNotifyCancel = () => {
    setNotifyConfirmOpen(false);
    setPendingNotifyStatus(null);
  };

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
            <ListItemText>{t('orders.paymentOrders.updateStatus')}</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => handleNotifyClick(0)}>
          <ListItemIcon>
            <Iconify icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
          </ListItemIcon>
          <ListItemText>{t('orders.paymentOrders.successNotification')}</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => handleNotifyClick(2)}>
          <ListItemIcon>
            <Iconify icon="solar:close-circle-bold" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>{t('orders.paymentOrders.failureNotification')}</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            onViewRequestLog(row);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:document-text-bold" />
          </ListItemIcon>
          <ListItemText>{t('orders.receiveOrders.requestLog')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            onViewDetail(row);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:info-circle-bold" />
          </ListItemIcon>
          <ListItemText>{t('orders.receiveOrders.orderDetails')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notify confirm dialog */}
      <Dialog open={notifyConfirmOpen} onClose={handleNotifyCancel}>
        <DialogTitle>{t('orders.paymentOrders.notifyConfirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingNotifyStatus === 0
              ? t('orders.paymentOrders.successNotifyConfirmDesc')
              : t('orders.paymentOrders.failureNotifyConfirmDesc')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNotifyCancel}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            color={pendingNotifyStatus === 0 ? 'success' : 'error'}
            onClick={handleNotifyConfirm}
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
