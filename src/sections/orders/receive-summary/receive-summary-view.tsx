import { toast } from 'sonner';
import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { prepareExportReceive } from 'src/api/order';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { ReceiveSummaryToolbar } from './toolbar';
import { useReceiveSummaryList, type ReceiveSummaryRow } from './hooks';

// ----------------------------------------------------------------------

export function ReceiveSummaryView() {
  const { rows, totalRecord, totals, isLoading, params } = useReceiveSummaryList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

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

  // -- export --
  const handleExport = useCallback(async () => {
    try {
      const res = await prepareExportReceive({
        startTime: params.startTime,
        endTime: params.endTime,
      });
      if (res.code == 200) {
        toast.success(t('common.exportTaskCreated'));
      } else {
        toast.error(res.message || t('common.exportFailed'));
      }
    } catch {
      toast.error(t('common.exportFailed'));
    }
  }, [params.startTime, params.endTime, t]);

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<ReceiveSummaryRow>([
        {
          field: 'companyName',
          headerName: t('orders.receiveSummary.merchant'),
          sortable: false,
          flex: 1,
        },
        {
          field: 'paymentCompany',
          headerName: t('orders.receiveSummary.paymentChannel'),
          sortable: false,
          flex: 1,
          renderCell: ({ value }) =>
            value ? <Chip label={value} size="small" variant="outlined" /> : '-',
        },
        {
          field: 'dealTime',
          headerName: t('orders.receiveSummary.transactionTime'),
          sortable: false,
          flex: 1,
        },
        {
          field: 'billCount',
          headerName: t('orders.receiveSummary.orderCount'),
          sortable: false,
          flex: 1,
        },
        {
          field: 'amount',
          headerName: t('orders.receiveSummary.amount'),
          sortable: false,
          flex: 1,
        },
        {
          field: 'serviceAmount',
          headerName: t('orders.receiveSummary.serviceFee'),
          sortable: false,
          flex: 1,
        },
        {
          field: 'totalAmount',
          headerName: t('orders.receiveSummary.totalAmount'),
          sortable: false,
          flex: 1,
        },
      ]),
    [t]
  );

  // -- summary row appended to data --
  const dataWithSummary = useMemo(() => {
    if (!totals.orderTotal && !totals.amountTotal) return rows;
    return [
      ...rows,
      {
        id: -1,
        companyName: t('common.total'),
        paymentCompany: '',
        dealTime: '',
        billCount: totals.orderTotal ?? '',
        amount: totals.amountTotal ?? '',
        serviceAmount: totals.amountServiceTotal ?? '',
        totalAmount: totals.totalAmountTotal ?? '',
      } as ReceiveSummaryRow,
    ];
  }, [rows, totals, t]);

  return (
    <DashboardContent maxWidth="xl">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('orders.receiveSummary.title')}</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="solar:export-bold" />}
          onClick={handleExport}
        >
          {t('common.export')}
        </Button>
      </Box>

      <ReceiveSummaryToolbar />

      <DataGrid
        rows={dataWithSummary}
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
    </DashboardContent>
  );
}
