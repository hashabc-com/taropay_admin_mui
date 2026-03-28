import type { MerchantBindRecord } from './hooks';

import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useMerchantBindList } from './hooks';
import { RateConfigDialog } from './rate-config-dialog';
import { MerchantBindSearch } from './merchant-bind-search';
import { BindMerchantDialog } from './bind-merchant-dialog';
import { MerchantBindRowActions, type MerchantBindAction } from './merchant-bind-row-actions';

// ----------------------------------------------------------------------

export function MerchantBindView() {
  const { records, totalRecord, isLoading, mutate } = useMerchantBindList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // Dialog states
  const [currentRow, setCurrentRow] = useState<MerchantBindRecord | null>(null);
  const [openDialog, setOpenDialog] = useState<MerchantBindAction | null>(null);

  const handleAction = useCallback((action: MerchantBindAction, row: MerchantBindRecord) => {
    setCurrentRow(row);
    setOpenDialog(action);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(null);
    setCurrentRow(null);
  }, []);

  const handleSuccess = useCallback(() => {
    handleCloseDialog();
    mutate();
  }, [handleCloseDialog, mutate]);

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
      processColumns<MerchantBindRecord>([
        {
          field: 'account',
          headerName: t('business.merchantBind.businessAccount'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'userName',
          headerName: t('business.merchantBind.businessUserName'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'disabledStatus',
          headerName: t('common.status'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => (
            <Typography variant="body2" sx={{ color: value === 0 ? 'success.main' : 'error.main' }}>
              {value === 0
                ? t('business.merchantBind.enabled')
                : t('business.merchantBind.disabled')}
            </Typography>
          ),
        },
        { field: 'phone', headerName: t('common.phone'), flex: 1, minWidth: 130, tooltip: true },
        {
          field: 'createTime',
          headerName: t('business.merchantBind.createTime'),
          flex: 1,
          minWidth: 160,
          renderCell: ({ value }) =>
            value ? String(value).replace('T', ' ').substring(0, 19) : '-',
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 100,
          sortable: false,
          renderCell: ({ row }) => <MerchantBindRowActions row={row} onAction={handleAction} />,
        },
      ]),
    [t, handleAction]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('business.merchantBind.title')}
      </Typography>

      <MerchantBindSearch />

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

      <BindMerchantDialog
        open={openDialog === 'bind'}
        business={currentRow}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />

      <RateConfigDialog
        open={openDialog === 'rate'}
        business={currentRow}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
      />
    </DashboardContent>
  );
}
