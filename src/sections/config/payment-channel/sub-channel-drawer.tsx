import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import {
  addSubChannel,
  deleteSubChannel,
  getSubChannelList,
  updateSubChannelStatus,
} from 'src/api/config';

import { Iconify } from 'src/components/iconify';

import { type PaymentChannel, type PaymentSubChannel } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  channel: PaymentChannel | null;
};

export function SubChannelDrawer({ open, onClose, channel }: Props) {
  const { t } = useLanguage();
  const { mutate: globalMutate } = useSWRConfig();
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [form, setForm] = useState({
    subChannelCode: '',
    subChannelName: '',
    subChannelStatus: 1,
    type: 2,
  });

  const swrKey = useMemo(
    () => (open && channel ? ['sub-channels', channel.channelCode] : null),
    [open, channel]
  );

  const { data: subChannels, isLoading } = useSWR(
    swrKey,
    () => getSubChannelList({ channelCode: channel!.channelCode }),
    { revalidateOnFocus: false }
  );

  const list: PaymentSubChannel[] = (subChannels?.result || []) as PaymentSubChannel[];

  const refresh = useCallback(() => {
    if (swrKey) globalMutate(swrKey);
  }, [swrKey, globalMutate]);

  useEffect(() => {
    if (!open) {
      setAddOpen(false);
      setForm({ subChannelCode: '', subChannelName: '', subChannelStatus: 1, type: 2 });
    }
  }, [open]);

  const handleAdd = useCallback(async () => {
    if (!channel) return;
    setAddLoading(true);
    try {
      const res = await addSubChannel({
        channelCode: channel.channelCode,
        country: channel.country || undefined,
        ...form,
      });
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        setAddOpen(false);
        setForm({ subChannelCode: '', subChannelName: '', subChannelStatus: 1, type: 2 });
        refresh();
      }
    } finally {
      setAddLoading(false);
    }
  }, [channel, form, t, refresh]);

  const handleDelete = useCallback(
    async (id: number) => {
      const res = await deleteSubChannel({ id });
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        refresh();
      }
    },
    [t, refresh]
  );

  const handleToggleStatus = useCallback(
    async (sub: PaymentSubChannel) => {
      const newStatus = sub.subChannelStatus === 1 ? 2 : 1;
      const res = await updateSubChannelStatus({ id: sub.id, subChannelStatus: newStatus });
      if (res.code == 200) {
        toast.success(t('common.statusUpdateSuccess'));
        refresh();
      }
    },
    [t, refresh]
  );

  const getStatusChip = (status: number) => {
    const map: Record<number, { label: string; color: 'success' | 'warning' | 'error' }> = {
      1: { label: t('config.paymentChannel.statusNormal'), color: 'success' },
      2: { label: t('config.paymentChannel.statusMaintenance'), color: 'warning' },
      3: { label: t('config.paymentChannel.statusPaused'), color: 'error' },
    };
    const cfg = map[status] || { label: '-', color: 'default' as const };
    return <Chip label={cfg.label} color={cfg.color} size="small" variant="filled" />;
  };

  const getTypeChip = (type: number) =>
    type === 1 ? (
      <Chip label={t('config.paymentChannel.payout')} color="primary" size="small" />
    ) : (
      <Chip label={t('config.paymentChannel.collection')} color="success" size="small" />
    );

  return (
    <>
      <Drawer open={open} onClose={onClose} anchor="right" PaperProps={{ sx: { width: 640 } }}>
        {channel && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('config.paymentChannel.subChannelManagement')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {channel.channelName} ({channel.channelCode})
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setAddOpen(true)}
              sx={{ mb: 2 }}
            >
              {t('config.paymentChannel.addSubChannel')}
            </Button>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('config.paymentChannel.subChannelCode')}</TableCell>
                    <TableCell>{t('config.paymentChannel.subChannelName')}</TableCell>
                    <TableCell>{t('config.paymentChannel.subChannelType')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('common.action')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                        {t('config.paymentChannel.noSubChannels')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    list.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 'body2.fontSize' }}>
                          {sub.subChannelCode}
                        </TableCell>
                        <TableCell>{sub.subChannelName}</TableCell>
                        <TableCell>{getTypeChip(sub.type)}</TableCell>
                        <TableCell>{getStatusChip(sub.subChannelStatus)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {(sub.subChannelStatus === 1 || sub.subChannelStatus === 2) && (
                              <IconButton size="small" onClick={() => handleToggleStatus(sub)}>
                                <Iconify
                                  icon={
                                    sub.subChannelStatus === 1
                                      ? 'solar:power-bold'
                                      : 'solar:play-bold'
                                  }
                                  sx={{
                                    color:
                                      sub.subChannelStatus === 1 ? 'error.main' : 'success.main',
                                  }}
                                />
                              </IconButton>
                            )}
                            <IconButton size="small" onClick={() => handleDelete(sub.id)}>
                              <Iconify
                                icon="solar:trash-bin-trash-bold"
                                sx={{ color: 'error.main' }}
                              />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Drawer>

      {/* Add sub-channel dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('config.paymentChannel.addSubChannel')}</DialogTitle>
        <DialogContent dividers sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            size="small"
            label={t('config.paymentChannel.subChannelCode')}
            value={form.subChannelCode}
            onChange={(e) => setForm((p) => ({ ...p, subChannelCode: e.target.value }))}
          />
          <TextField
            size="small"
            label={t('config.paymentChannel.subChannelName')}
            value={form.subChannelName}
            onChange={(e) => setForm((p) => ({ ...p, subChannelName: e.target.value }))}
          />
          <FormControl size="small">
            <InputLabel>{t('config.paymentChannel.subChannelType')}</InputLabel>
            <Select
              label={t('config.paymentChannel.subChannelType')}
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: Number(e.target.value) }))}
            >
              <MenuItem value={1}>{t('config.paymentChannel.payout')}</MenuItem>
              <MenuItem value={2}>{t('config.paymentChannel.collection')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              label={t('common.status')}
              value={form.subChannelStatus}
              onChange={(e) => setForm((p) => ({ ...p, subChannelStatus: Number(e.target.value) }))}
            >
              <MenuItem value={1}>{t('config.paymentChannel.statusNormal')}</MenuItem>
              <MenuItem value={2}>{t('config.paymentChannel.statusMaintenance')}</MenuItem>
              <MenuItem value={3}>{t('config.paymentChannel.statusPaused')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setAddOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={addLoading || !form.subChannelCode || !form.subChannelName}
            startIcon={addLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {addLoading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
