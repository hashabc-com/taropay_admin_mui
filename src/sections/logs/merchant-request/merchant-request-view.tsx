import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { type MerchantRequest } from './types';
import { useMerchantRequestList } from './hooks';
import { MerchantRequestSearch } from './merchant-request-search';
import { MerchantRequestDetailDialog } from './merchant-request-detail-dialog';

// ----------------------------------------------------------------------

export function MerchantRequestView() {
  const { records, totalRecord, isLoading, params } = useMerchantRequestList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- detail dialog --
  const [detailRecord, setDetailRecord] = useState<MerchantRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((row: MerchantRequest) => {
    setDetailRecord(row);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetailRecord(null), 300);
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

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<MerchantRequest>([
        {
          field: 'transactionType',
          minWidth: 80,
          headerName: t('logs.merchantRequest.transactionType'),
          flex: 1,
          renderCell: ({ value }) => {
            const labels: Record<string, string> = {
              P: t('logs.merchantRequest.payment'),
              L: t('logs.merchantRequest.lending'),
            };
            return labels[value as string] ?? value ?? '-';
          },
        },
        {
          field: 'referenceno',
          minWidth: 200,
          headerName: t('logs.merchantRequest.referenceno'),
          flex: 1,
          align: 'left',
          tooltip: (cellParams) =>
            cellParams.row.transactionType === 'P'
              ? cellParams.row.referenceno || '-'
              : cellParams.row.transactionReferenceNo || '-',
        },
        {
          field: 'transId',
          minWidth: 200,
          headerName: t('logs.merchantRequest.transId'),
          flex: 1,
          align: 'left',
          tooltip: (cellParams) =>
            cellParams.row.transactionType === 'P'
              ? cellParams.row.transId || '-'
              : cellParams.row.transactionid || '-',
        },
        {
          field: 'paymentCompany',
          minWidth: 100,
          headerName: t('logs.merchantRequest.paymentCompany'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'userName',
          minWidth: 100,
          headerName: t('logs.merchantRequest.userName'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'mobile',
          minWidth: 150,
          headerName: t('logs.merchantRequest.mobile'),
          flex: 1,
          align: 'left',
          tooltip: true,
        },
        { field: 'amount', headerName: t('logs.merchantRequest.amount'), flex: 1, minWidth: 100 },
        {
          field: 'serviceAmount',
          headerName: t('logs.merchantRequest.serviceAmount'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'createTime',
          headerName: t('logs.merchantRequest.createTime'),
          minWidth: 150,
          flex: 1,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ row }) => (
            <Chip
              label={t('logs.merchantRequest.viewDetail')}
              size="small"
              color="primary"
              variant="outlined"
              clickable
              onClick={() => handleViewDetail(row)}
            />
          ),
        },
      ]),
    [t, handleViewDetail]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('logs.merchantRequest.title')}
      </Typography>

      <MerchantRequestSearch />

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

      <MerchantRequestDetailDialog
        open={detailOpen}
        onClose={handleCloseDetail}
        record={detailRecord}
      />
    </DashboardContent>
  );
}
