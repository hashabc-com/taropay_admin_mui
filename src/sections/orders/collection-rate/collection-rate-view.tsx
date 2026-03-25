import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { CollectionRateSearch } from './collection-rate-search';
import { useCollectionRateList, type CollectionRateRow } from './hooks';

// ----------------------------------------------------------------------

export function CollectionRateView() {
  const { rows, totalRecord, totals, isLoading, params } = useCollectionRateList();
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

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<CollectionRateRow>([
        {
          field: 'companyName',
          headerName: t('orders.collectionRate.merchant'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'paymentCompany',
          headerName: t('orders.collectionRate.paymentChannel'),
          flex: 1,
          sortable: false,
          renderCell: ({ value }) =>
            value ? <Chip label={value} size="small" variant="outlined" /> : '-',
        },
        {
          field: 'pickupCenter',
          headerName: t('orders.collectionRate.paymentType'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'dealTime',
          headerName: t('orders.collectionRate.transactionTime'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'billCount',
          headerName: t('orders.collectionRate.totalOrders'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'successBillCount',
          headerName: t('orders.collectionRate.successOrders'),
          flex: 1,
          sortable: false,
        },
        {
          field: 'successRate',
          headerName: t('orders.collectionRate.successRate'),
          flex: 1,
          sortable: false,
        },
      ]),
    [t]
  );

  // -- summary row appended to data --
  const dataWithSummary = useMemo(() => {
    if (!totals.allOrder && !totals.successOrder) return rows;
    return [
      ...rows,
      {
        id: -1,
        companyName: t('common.total'),
        paymentCompany: '',
        pickupCenter: '',
        dealTime: '',
        billCount: totals.allOrder ?? '',
        successBillCount: totals.successOrder ?? '',
        successRate: totals.successRate ?? '',
      } as CollectionRateRow,
    ];
  }, [rows, totals, t]);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('orders.collectionRate.title')}
      </Typography>

      <CollectionRateSearch />

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
