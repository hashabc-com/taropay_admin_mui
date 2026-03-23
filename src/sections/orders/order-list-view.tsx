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
  const handleNotify = useCallback(async (record: Order, status: number) => {
    try {
      const res = await payOutNotify({ transId: record.transId, status });
      if (res.code == 200) {
        toast.success('操作成功');
      } else {
        toast.error(res.message || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    }
  }, []);

  const handleUpdateStatus = useCallback(
    (record: Order) => {
      withGoogleAuth(async (gauthKey) => {
        const fd = new FormData();
        fd.append('referenceno', record.referenceno);
        fd.append('transId', record.transId);
        fd.append('gauthKey', gauthKey);
        const res = await updateStatus(fd);
        if (res.code == 200) {
          toast.success('状态更新成功');
          mutate();
        } else {
          toast.error(res.message || '状态更新失败');
        }
      });
    },
    [withGoogleAuth, mutate]
  );

  // -- columns --
  const columns: GridColDef<Order>[] = useMemo(
    () => [
      {
        field: 'companyName',
        headerName: '商户',
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
        headerName: '创建/完成时间',
        width: 170,
        renderCell: ({ row }) => {
          const finish = row.status === '2' ? row.updateTime : row.localPaymentDate;
          return (
            <Stack sx={{ py: 0.5, fontSize: 12, color: 'text.secondary' }}>
              <span>{row.localTime || '-'}</span>
              <span>{finish || '-'}</span>
            </Stack>
          );
        },
      },
      {
        field: 'referenceno',
        headerName: '三方/平台/商户单号',
        width: 200,
        headerClassName: 'align-left',
        cellClassName: 'align-left',
        renderCell: ({ row }) => (
          <Stack
            sx={{
              py: 0.5,
              fontFamily: 'monospace',
              fontSize: 12,
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
        headerName: '手机号',
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
        headerName: '用户名',
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
        headerName: '产品',
        width: 100,
        renderCell: ({ value }) =>
          value ? <Chip label={value} size="small" variant="outlined" /> : '-',
      },
      { field: 'paymentCompany', headerName: '渠道', width: 100 },
      { field: 'amount', headerName: '订单金额', width: 110 },
      { field: 'realAmount', headerName: '实际金额', width: 110 },
      { field: 'serviceAmount', headerName: '手续费', width: 110 },
      {
        field: 'status',
        headerName: '状态',
        width: 110,
        renderCell: ({ value }) => {
          const info = ORDER_STATUS_MAP[value as string];
          if (!info) return value;
          return <Chip label={info.label} color={info.color} size="small" variant="filled" />;
        },
      },
      {
        field: 'actions',
        headerName: '操作',
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
    [handleNotify, handleUpdateStatus, handleViewDetail]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        收款订单明细
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
