import type { MerchantDailySummaryRecord } from './hooks';

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useMerchantDailySummary } from './hooks';
import { MerchantDailySummarySearch } from './merchant-daily-summary-search';

// ----------------------------------------------------------------------

export function MerchantDailySummaryView() {
  const { records, totalRecord, isLoading } = useMerchantDailySummary();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const paginationModel: GridPaginationModel = useMemo(() => {
    const pageNum = Number(searchParams.get('pageNum')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    return { page: pageNum - 1, pageSize };
  }, [searchParams]);

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      const p = new URLSearchParams(searchParams);
      p.set('pageNum', String(model.page + 1));
      p.set('pageSize', String(model.pageSize));
      setSearchParams(p);
    },
    [searchParams, setSearchParams]
  );

  const columns = useMemo(
    () =>
      processColumns<MerchantDailySummaryRecord>([
        {
          field: 'companyName',
          headerName: t('common.merchant'),
          flex: 1,
          tooltip: true,
        },
        { field: 'localTime', headerName: t('common.date'), flex: 1, minWidth: 120 },
        {
          field: 'inBills',
          headerName: `${t('logs.riskControl.payin')}${t('fund.merchantDailySummary.successOrders')}`,
          flex: 1,
        },
        {
          field: 'inAmount',
          headerName: t('fund.merchantDailySummary.collectionAmount'),
          flex: 1,
        },
        {
          field: 'inAmountService',
          headerName: t('fund.merchantDailySummary.collectionFee'),
          flex: 1,
        },
        {
          field: 'inAmountProfit',
          headerName: t('fund.merchantDailySummary.collectionProfit'),
          flex: 1,
        },
        {
          field: 'outBills',
          headerName: `${t('logs.riskControl.payout')}${t('fund.merchantDailySummary.successOrders')}`,
          flex: 1,
        },
        {
          field: 'outAmount',
          headerName: t('fund.merchantDailySummary.paymentAmount'),
          flex: 1,
        },
        {
          field: 'outAmountService',
          headerName: t('fund.merchantDailySummary.paymentFee'),
          flex: 1,
        },
        {
          field: 'outAmountProfit',
          headerName: t('fund.merchantDailySummary.paymentProfit'),
          flex: 1,
        },
        { field: 'rechargeAmoubt', headerName: t('common.recharge'), flex: 1 },
        { field: 'withdrawAmount', headerName: t('common.withdrawal'), flex: 1 },
        {
          field: 'settlementAmount',
          headerName: t('fund.merchantDailySummary.finalSettlement'),
          flex: 1,
        },
        { field: 'availableAmount', headerName: t('common.balance'), flex: 1 },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('fund.merchantDailySummary.title')}
      </Typography>

      <MerchantDailySummarySearch />

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
        getRowHeight={() => 'auto'}
        sx={[dataGridSx, { '& .MuiDataGrid-cell': { py: 1 } }]}
      />
    </DashboardContent>
  );
}
