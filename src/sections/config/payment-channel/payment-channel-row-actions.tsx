import { useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { type PaymentChannel } from './types';

// ----------------------------------------------------------------------

type Props = {
  row: PaymentChannel;
  onEdit: (row: PaymentChannel) => void;
  onToggleStatus: (row: PaymentChannel) => void;
  onRateConfig: (row: PaymentChannel) => void;
  onSubChannels: (row: PaymentChannel) => void;
  onQueryBalance: (row: PaymentChannel) => void;
};

export function PaymentChannelRowActions({
  row,
  onEdit,
  onToggleStatus,
  onRateConfig,
  onSubChannels,
  onQueryBalance,
}: Props) {
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

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} disableAutoFocus>
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
            <Iconify icon={row.channelStatus === 1 ? 'solar:power-bold' : 'solar:play-bold'} />
          </ListItemIcon>
          <ListItemText>
            {row.channelStatus === 1
              ? t('config.paymentChannel.pauseChannel')
              : t('config.paymentChannel.enableChannel')}
          </ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onRateConfig(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:dollar-bold" />
          </ListItemIcon>
          <ListItemText>{t('config.paymentChannel.rateConfig')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onSubChannels(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:list-bold" />
          </ListItemIcon>
          <ListItemText>{t('config.paymentChannel.manageSubChannels')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            onQueryBalance(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:refresh-bold" />
          </ListItemIcon>
          <ListItemText>{t('config.paymentChannel.queryBalance')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
