import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { payOutNotify, updateStatus } from 'src/api/common';
import { useLanguage } from 'src/context/language-provider';

import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

import { useOrderList, useOrderStats } from './hooks';
import { OrderStatsCards } from './order-stats-cards';
import { OrderRowActions } from './order-row-actions';
import { type Order, ORDER_STATUS_MAP } from './types';
import { OrderListToolbar } from './order-list-toolbar';
import { OrderDetailDrawer } from './order-detail-drawer';

// ----------------------------------------------------------------------

export function OrderListView() {
  const { orders, totalRecord, isLoading, mutate, params } = useOrderList();
  const { stats, isLoading: statsLoading } = useOrderStats();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();
  const { t } = useLanguage();

  // -- detail drawer --
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((row: Order) => {
    setDetailOrder(row);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    // 等滑出动画结束后再清空数据
    setTimeout(() => setDetailOrder(null), 300);
  }, []);

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

  // -- row actions --
  const handleNotify = useCallback(
    async (record: Order, status: number) => {
      try {
        const res = await payOutNotify({ transId: record.transId, status });
        if (res.code == 200) {
          toast.success(t('common.operationSuccess'));
        } else {
          toast.error(res.message || t('common.operationFailed'));
        }
      } catch {
        toast.error(t('common.operationFailed'));
      }
    },
    [t]
  );

  const handleUpdateStatus = useCallback(
    (record: Order) => {
      withGoogleAuth(async (gauthKey) => {
        const fd = new FormData();
        fd.append('referenceno', record.referenceno);
        fd.append('transId', record.transId);
        fd.append('gauthKey', gauthKey);
        const res = await updateStatus(fd);
        if (res.code == 200) {
          toast.success(t('common.statusUpdateSuccess'));
          mutate();
        } else {
          toast.error(res.message || t('common.statusUpdateFailed'));
        }
      });
    },
    [withGoogleAuth, mutate, t]
  );

  // -- columns --
  const columns: GridColDef<Order>[] = useMemo(
    () => [
      {
        field: 'companyName',
        headerName: t('orders.receiveOrders.merchant'),
        width: 120,
        renderCell: ({ value }) => (
          <Tooltip title={value || ''} arrow>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value || '-'}
            </span>
          </Tooltip>
        ),
      },
      {
        field: 'localTime',
        headerName: t('orders.receiveOrders.createTime'),
        width: 170,
        renderCell: ({ row }) => {
          const finish = row.status === '2' ? row.updateTime : row.localPaymentDate;
          return (
            <Stack sx={{ py: 0.5, color: 'text.secondary' }}>
              <span>{row.localTime || '-'}</span>
              <span>{finish || '-'}</span>
            </Stack>
          );
        },
      },
      {
        field: 'referenceno',
        headerName: t('orders.receiveOrders.thirdPartyOrderNo'),
        width: 200,
        headerClassName: 'align-left',
        cellClassName: 'align-left',
        renderCell: ({ row }) => (
          <Stack
            sx={{
              py: 0.5,
              fontFamily: 'monospace',
              color: 'text.secondary',
              width: '100%',
            }}
          >
            <span>{row.tripartiteOrder || '-'}</span>
            <span>{row.transId}</span>
            <span>{row.referenceno}</span>
          </Stack>
        ),
      },
      {
        field: 'mobile',
        headerName: t('orders.receiveOrders.mobile'),
        width: 120,
        renderCell: ({ value }) => (
          <Tooltip title={value || ''} arrow>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value || '-'}
            </span>
          </Tooltip>
        ),
      },
      {
        field: 'userName',
        headerName: t('signIn.username'),
        width: 100,
        renderCell: ({ value }) => (
          <Tooltip title={value || ''} arrow>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value || '-'}
            </span>
          </Tooltip>
        ),
      },
      {
        field: 'pickupCenter',
        headerName: t('orders.receiveOrders.product'),
        width: 100,
        renderCell: ({ value }) =>
          value ? <Chip label={value} size="small" variant="outlined" /> : '-',
      },
      { field: 'paymentCompany', headerName: t('common.channel'), width: 100 },
      { field: 'amount', headerName: t('orders.receiveOrders.orderAmount'), width: 110 },
      { field: 'realAmount', headerName: t('orders.receiveOrders.realAmount'), width: 110 },
      { field: 'serviceAmount', headerName: t('orders.receiveOrders.serviceFee'), width: 110 },
      {
        field: 'status',
        headerName: t('orders.receiveOrders.status'),
        width: 110,
        renderCell: ({ value }) => {
          const info = ORDER_STATUS_MAP[value as string];
          if (!info) return value;
          return <Chip label={info.label} color={info.color} size="small" variant="filled" />;
        },
      },
      {
        field: 'actions',
        headerName: t('orders.receiveOrders.action'),
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <OrderRowActions
            row={row}
            onNotify={handleNotify}
            onUpdateStatus={handleUpdateStatus}
            onViewDetail={handleViewDetail}
          />
        ),
      },
    ],
    [handleNotify, handleUpdateStatus, handleViewDetail, t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('orders.receiveOrders.title')}
      </Typography>

      <OrderListToolbar />

      <OrderStatsCards stats={stats} isLoading={statsLoading} />

      <DataGrid
        rows={orders}
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
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& .MuiDataGrid-columnHeader': {
            bgcolor: 'background.neutral',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            textAlign: 'center',
            width: '100%',
          },
          '& .MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'center',
          },
          '& .align-left.MuiDataGrid-columnHeader .MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'flex-start',
          },
          '& .align-left.MuiDataGrid-cell': {
            justifyContent: 'flex-start',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
        }}
      />

      {googleAuthDialog}

      <OrderDetailDrawer open={detailOpen} onClose={handleCloseDetail} order={detailOrder} />
    </DashboardContent>
  );
}
