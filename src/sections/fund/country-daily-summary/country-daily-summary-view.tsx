import type { CountryDailySummaryRecord } from './hooks';

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useCountryDailySummary } from './hooks';
import { CountryDailySummarySearch } from './country-daily-summary-search';

// ----------------------------------------------------------------------

export function CountryDailySummaryView() {
  const { records, totalRecord, isLoading } = useCountryDailySummary();
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
      processColumns<CountryDailySummaryRecord>([
        {
          field: 'countryName',
          headerName: t('common.country'),
          flex: 1,
          tooltip: true,
          minWidth: 120,
        },
        { field: 'localTime', headerName: t('common.date'), flex: 1, minWidth: 120 },
        {
          field: 'inBills',
          headerName: `${t('logs.riskControl.payin')}${t('fund.countryDailySummary.successOrders')}`,
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'inAmount',
          headerName: t('fund.countryDailySummary.collectionAmount'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'inAmountService',
          headerName: t('fund.countryDailySummary.collectionFee'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'inAmountProfit',
          headerName: t('fund.countryDailySummary.collectionProfit'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'outBills',
          headerName: `${t('logs.riskControl.payout')}${t('fund.countryDailySummary.successOrders')}`,
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'outAmount',
          headerName: t('fund.countryDailySummary.paymentAmount'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'outAmountService',
          headerName: t('fund.countryDailySummary.paymentFee'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'outAmountProfit',
          headerName: t('fund.countryDailySummary.paymentProfit'),
          flex: 1,
          minWidth: 100,
        },
        { field: 'rechargeAmount', headerName: t('common.recharge'), flex: 1, minWidth: 100 },
        { field: 'withdrawAmount', headerName: t('common.withdrawal'), flex: 1, minWidth: 100 },
        {
          field: 'settlementAmount',
          headerName: t('fund.countryDailySummary.finalSettlement'),
          flex: 1,
          minWidth: 100,
        },
        { field: 'availableAmount', headerName: t('common.balance'), flex: 1, minWidth: 100 },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('fund.countryDailySummary.title')}
      </Typography>

      <CountryDailySummarySearch />

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
