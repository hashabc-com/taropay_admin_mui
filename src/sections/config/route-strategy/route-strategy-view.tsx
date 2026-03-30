import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { addRouteStrategy, updateRouteStrategyStatus } from 'src/api/config';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { type RouteStrategy } from './types';
import { useRouteStrategyList } from './hooks';
import { RouteStrategySearch } from './route-strategy-search';
import { RouteStrategyDialog } from './route-strategy-dialog';
import { RouteStrategyRowActions } from './route-strategy-row-actions';

// ----------------------------------------------------------------------

export function RouteStrategyView() {
  const { records, totalRecord, isLoading, mutate, params } = useRouteStrategyList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- dialog state --
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogIsEdit, setDialogIsEdit] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState<RouteStrategy | null>(null);

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

  // -- handlers --
  const handleAdd = useCallback(() => {
    setCurrentStrategy(null);
    setDialogIsEdit(false);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((row: RouteStrategy) => {
    setCurrentStrategy(row);
    setDialogIsEdit(true);
    setDialogOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleDialogSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      const res = await addRouteStrategy(data);
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        setDialogOpen(false);
        mutate();
      }
    },
    [t, mutate]
  );

  const handleToggleStatus = useCallback(
    async (row: RouteStrategy) => {
      const newStatus = row.status === '0' ? '1' : '0';
      const res = await updateRouteStrategyStatus({ id: row.id, status: newStatus });
      if (res.code == 200) {
        toast.success(t('common.statusUpdateSuccess'));
        mutate();
      }
    },
    [t, mutate]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<RouteStrategy>([
        {
          field: 'customerName',
          headerName: t('config.routeStrategy.merchantName'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'paymentType',
          headerName: t('config.routeStrategy.type'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => (
            <Chip
              label={
                value === '1'
                  ? t('config.routeStrategy.payout')
                  : t('config.routeStrategy.collection')
              }
              color={value === '1' ? 'primary' : 'secondary'}
              size="small"
            />
          ),
        },
        {
          field: 'productCode',
          headerName: t('config.routeStrategy.paymentMethod'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'routeStrategy',
          headerName: t('config.routeStrategy.routeStrategy'),
          flex: 1,
          minWidth: 120,
          renderCell: ({ value }) => (
            <Chip
              label={
                value === '1'
                  ? t('config.routeStrategy.weightRoundRobin')
                  : t('config.routeStrategy.costPriority')
              }
              variant="outlined"
              size="small"
            />
          ),
        },
        {
          field: 'status',
          headerName: t('common.status'),
          flex: 1,
          minWidth: 80,
          renderCell: ({ value }) => (
            <Chip
              label={value === '0' ? t('common.enabled') : t('common.disabled')}
              color={value === '0' ? 'success' : 'error'}
              size="small"
            />
          ),
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          width: 70,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <RouteStrategyRowActions
              row={row}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
            />
          ),
        },
      ]),
    [t, handleEdit, handleToggleStatus]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('config.routeStrategy.title')}
      </Typography>

      <RouteStrategySearch onAdd={handleAdd} onRefresh={handleRefresh} />

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

      <RouteStrategyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        strategy={currentStrategy}
        isEdit={dialogIsEdit}
      />
    </DashboardContent>
  );
}
