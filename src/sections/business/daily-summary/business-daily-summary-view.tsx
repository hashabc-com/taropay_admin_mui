import type { BusinessDailySummaryRecord } from './hooks';

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useBusinessDailySummary } from './hooks';
import { BusinessDailySummarySearch } from './business-daily-summary-search';

// ----------------------------------------------------------------------

export function BusinessDailySummaryView() {
  const { records, totalRecord, isLoading } = useBusinessDailySummary();
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
      processColumns<BusinessDailySummaryRecord>([
        {
          field: 'businessName',
          headerName: t('business.dailySummary.businessAccount'),
          flex: 1,
          minWidth: 130,
          tooltip: true,
        },
        { field: 'localTime', headerName: t('business.dailySummary.date'), flex: 1, minWidth: 110 },
        {
          field: 'inBills',
          headerName: t('business.dailySummary.collectionCount'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'inAmount',
          headerName: t('business.dailySummary.collectionAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'inAmountService',
          headerName: t('business.dailySummary.collectionFee'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'inAmountProfit',
          headerName: t('business.dailySummary.inAmountProfit'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'outBills',
          headerName: t('business.dailySummary.payoutCount'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'outAmount',
          headerName: t('business.dailySummary.paymentAmount'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'outAmountService',
          headerName: t('business.dailySummary.payoutFee'),
          flex: 1,
          minWidth: 120,
        },
        {
          field: 'outAmountProfit',
          headerName: t('business.dailySummary.outAmountProfit'),
          flex: 1,
          minWidth: 100,
        },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('business.dailySummary.title')}
      </Typography>

      <BusinessDailySummarySearch />

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
