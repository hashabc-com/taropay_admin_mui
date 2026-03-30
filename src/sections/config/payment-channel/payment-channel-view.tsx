import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import {
  addPaymentChannel,
  updatePaymentChannel,
  updatePaymentChannelStatus,
  queryPaymentChannelBalance,
} from 'src/api/config';

import { dataGridSx, processColumns } from 'src/components/data-grid';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog/use-google-auth-dialog';

import { type PaymentChannel } from './types';
import { usePaymentChannelList } from './hooks';
import { SubChannelDrawer } from './sub-channel-drawer';
import { RateConfigDialog } from './rate-config-dialog';
import { PaymentChannelSearch } from './payment-channel-search';
import { PaymentChannelDialog } from './payment-channel-dialog';
import { PaymentChannelRowActions } from './payment-channel-row-actions';

// ----------------------------------------------------------------------

const STATUS_COLOR: Record<number, 'success' | 'warning' | 'error'> = {
  1: 'success',
  2: 'warning',
  3: 'error',
};

const FUND_TYPE_VARIANT: Record<number, 'filled' | 'outlined'> = {
  1: 'filled',
  2: 'filled',
  3: 'outlined',
};

export function PaymentChannelView() {
  const { records, totalRecord, isLoading, mutate, params } = usePaymentChannelList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();

  // -- dialog state --
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIsEdit, setDialogIsEdit] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<PaymentChannel | null>(null);

  // -- sub-channel drawer --
  const [subDrawerOpen, setSubDrawerOpen] = useState(false);
  const [subDrawerChannel, setSubDrawerChannel] = useState<PaymentChannel | null>(null);

  // -- rate config dialog --
  const [rateOpen, setRateOpen] = useState(false);
  const [rateChannel, setRateChannel] = useState<PaymentChannel | null>(null);

  // -- pagination --
  const paginationModel: GridPaginationModel = useMemo(
    () => ({ page: (params.pageNum || 1) - 1, pageSize: params.pageSize || 10 }),
    [params.pageNum, params.pageSize]
  );

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      const p = new URLSearchParams(searchParams);
      p.set('pageNum', String(model.page + 1));
      p.set('pageSize', String(model.pageSize));
      setSearchParams(p);
    },
    [searchParams, setSearchParams]
  );

  // -- handlers --
  const handleAdd = useCallback(() => {
    setCurrentChannel(null);
    setDialogIsEdit(false);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((row: PaymentChannel) => {
    setCurrentChannel(row);
    setDialogIsEdit(true);
    setDialogOpen(true);
  }, []);

  const handleDialogSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      const fn = dialogIsEdit ? updatePaymentChannel : addPaymentChannel;
      const res = await fn(data);
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        setDialogOpen(false);
        mutate();
      }
    },
    [dialogIsEdit, t, mutate]
  );

  const handleToggleStatus = useCallback(
    async (row: PaymentChannel) => {
      const statusMap: Record<number, number> = { 1: 3, 2: 1, 3: 1 };
      const newStatus = statusMap[row.channelStatus] || 1;
      const res = await updatePaymentChannelStatus({ id: row.id, channelStatus: newStatus });
      if (res.code == 200) {
        toast.success(t('common.statusUpdateSuccess'));
        mutate();
      }
    },
    [t, mutate]
  );

  const handleRateConfig = useCallback((row: PaymentChannel) => {
    setRateChannel(row);
    setRateOpen(true);
  }, []);

  const handleSubChannels = useCallback((row: PaymentChannel) => {
    setSubDrawerChannel(row);
    setSubDrawerOpen(true);
  }, []);

  const handleQueryBalance = useCallback(
    (row: PaymentChannel) => {
      withGoogleAuth(async (gauthKey) => {
        const res = await queryPaymentChannelBalance({
          id: row.id,
          gauthKey,
          channelCode: row.channelCode,
          country: row.country ?? '',
        });
        if (res.code == 200) {
          toast.success(t('config.paymentChannel.queryBalanceSuccess'));
          mutate();
        } else {
          toast.error(res.message || t('config.paymentChannel.queryBalanceFailed'));
        }
      });
    },
    [withGoogleAuth, t, mutate]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<PaymentChannel>([
        {
          field: 'channelCode',
          headerName: t('config.paymentChannel.channelCode'),
          flex: 1,
          minWidth: 130,
          tooltip: true,
        },
        {
          field: 'channelName',
          headerName: t('config.paymentChannel.channelName'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'balance',
          headerName: t('config.paymentChannel.balance'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'country',
          headerName: t('common.country'),
          flex: 1,
          minWidth: 80,
          renderCell: ({ value }) => (value as string) || '-',
        },
        {
          field: 'fundType',
          headerName: t('config.paymentChannel.fundType'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const v = value as number;
            const label =
              v === 1
                ? t('config.paymentChannel.collection')
                : v === 2
                  ? t('config.paymentChannel.payout')
                  : t('config.paymentChannel.both');
            return (
              <Chip
                label={label}
                size="small"
                variant={FUND_TYPE_VARIANT[v] || 'outlined'}
                color={v === 1 ? 'primary' : v === 2 ? 'secondary' : 'default'}
              />
            );
          },
        },
        {
          field: 'singleMaxAmount',
          headerName: t('config.paymentChannel.singleLimit'),
          flex: 1,
          minWidth: 130,
          renderCell: ({ row }) => {
            const min = row.singleMinAmount;
            const max = row.singleMaxAmount;
            if (!min && !max) return '-';
            return `${min?.toFixed(2) || '0.00'} - ${max?.toFixed(2) || '∞'}`;
          },
        },
        {
          field: 'dailyMaxAmount',
          headerName: t('config.paymentChannel.dailyLimit'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => (value ? (value as number).toFixed(2) : '-'),
        },
        {
          field: 'channelStatus',
          headerName: t('common.status'),
          flex: 1,
          minWidth: 80,
          renderCell: ({ value }) => {
            const v = value as number;
            const label =
              v === 1
                ? t('config.paymentChannel.statusNormal')
                : v === 2
                  ? t('config.paymentChannel.statusMaintenance')
                  : t('config.paymentChannel.statusPaused');
            return <Chip label={label} color={STATUS_COLOR[v] || 'default'} size="small" />;
          },
        },
        {
          field: 'runTimeRange',
          headerName: t('config.paymentChannel.runTimeRange'),
          flex: 1,
          minWidth: 100,
          tooltip: true,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          width: 70,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <PaymentChannelRowActions
              row={row}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onRateConfig={handleRateConfig}
              onSubChannels={handleSubChannels}
              onQueryBalance={handleQueryBalance}
            />
          ),
        },
      ]),
    [t, handleEdit, handleToggleStatus, handleRateConfig, handleSubChannels, handleQueryBalance]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('config.paymentChannel.title')}
      </Typography>

      <PaymentChannelSearch onAdd={handleAdd} />

      <DataGrid
        rows={records}
        columns={columns}
        loading={isLoading}
        rowCount={totalRecord}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50]}
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnFilter
        disableColumnMenu
        showToolbar={false}
        autoHeight
        sx={dataGridSx}
      />

      <PaymentChannelDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        channel={currentChannel}
        isEdit={dialogIsEdit}
      />

      <SubChannelDrawer
        open={subDrawerOpen}
        onClose={() => setSubDrawerOpen(false)}
        channel={subDrawerChannel}
      />

      <RateConfigDialog
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        channel={rateChannel}
        onSuccess={() => mutate()}
      />

      {googleAuthDialog}
    </DashboardContent>
  );
}
