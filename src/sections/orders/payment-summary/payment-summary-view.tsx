import { toast } from 'sonner';
import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { prepareExportPayment } from 'src/api/order';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { PaymentSummarySearch } from './payment-summary-search';
import { usePaymentSummaryList, type PaymentSummaryRow } from './hooks';

// ----------------------------------------------------------------------

export function PaymentSummaryView() {
  const { rows, totalRecord, totals, isLoading, params } = usePaymentSummaryList();
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
  const handleExport = useCallback(
    async (exportParams: { startTime?: string; endTime?: string }) => {
      try {
        const res = await prepareExportPayment(exportParams);
        if (res.code == 200) {
          toast.success(t('common.exportTaskCreated'));
        } else {
          toast.error(res.message || t('common.exportFailed'));
        }
      } catch {
        toast.error(t('common.exportFailed'));
      }
    },
    [t]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<PaymentSummaryRow>([
        {
          field: 'companyName',
          headerName: t('orders.paymentSummary.merchant'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'paymentCompany',
          headerName: t('orders.paymentSummary.paymentChannel'),
          flex: 1,
          sortable: false,
          renderCell: ({ value }) =>
            value ? <Chip label={value} size="small" variant="outlined" /> : '-',
        },
        {
          field: 'dealTime',
          headerName: t('orders.paymentSummary.transactionTime'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'billCount',
          headerName: t('orders.paymentSummary.orderCount'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'amount',
          headerName: t('orders.paymentSummary.amount'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'serviceAmount',
          headerName: t('orders.paymentSummary.serviceFee'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'totalAmount',
          headerName: t('orders.paymentSummary.totalAmount'),
          flex: 1,
          sortable: false,
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
      } as PaymentSummaryRow,
    ];
  }, [rows, totals, t]);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('orders.paymentSummary.title')}
      </Typography>

      <PaymentSummarySearch onExport={handleExport} />

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
