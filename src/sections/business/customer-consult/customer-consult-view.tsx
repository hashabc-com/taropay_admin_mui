import type { CustomerConsultRecord } from './hooks';

import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useCustomerConsultList } from './hooks';
import { FollowUpDrawer } from './follow-up-drawer';
import { AddCustomerDialog } from './add-customer-dialog';
import { CustomerConsultSearch } from './customer-consult-search';

// ----------------------------------------------------------------------

const STATUS_COLORS: Record<string, 'info' | 'warning' | 'success' | 'error'> = {
  NEW: 'info',
  FOLLOWING: 'warning',
  DEAL: 'success',
  LOST: 'error',
};

const LEVEL_COLORS: Record<string, 'error' | 'warning' | 'default'> = {
  A: 'error',
  B: 'warning',
  C: 'default',
};

export function CustomerConsultView() {
  const { records, totalRecord, isLoading, mutate } = useCustomerConsultList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [addOpen, setAddOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerConsultRecord | null>(null);

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

  const columns: GridColDef[] = useMemo(
    () =>
      processColumns<CustomerConsultRecord>([
        {
          field: 'contactPerson',
          headerName: t('business.customerConsult.contactPerson'),
          flex: 1,
          minWidth: 100,
          tooltip: true,
        },
        {
          field: 'phone',
          headerName: t('business.customerConsult.phone'),
          flex: 1,
          minWidth: 140,
          renderCell: ({ row }) => (row.phone ? `+${row.countryCode} ${row.phone}` : '-'),
        },
        {
          field: 'country',
          headerName: t('business.customerConsult.country'),
          flex: 1,
          minWidth: 80,
        },
        {
          field: 'email',
          headerName: t('business.customerConsult.email'),
          flex: 1,
          minWidth: 180,
          tooltip: true,
        },
        {
          field: 'company',
          headerName: t('business.customerConsult.company'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'source',
          headerName: t('business.customerConsult.source'),
          flex: 1,
          minWidth: 100,
        },
        {
          field: 'status',
          headerName: t('business.customerConsult.status'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => (
            <Label color={STATUS_COLORS[value] || 'default'}>
              {t(`business.customerConsult.statusValues.${value}`)}
            </Label>
          ),
        },
        {
          field: 'level',
          headerName: t('business.customerConsult.level'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) =>
            value ? (
              <Label variant="outlined" color={LEVEL_COLORS[value] || 'default'}>
                {t(`business.customerConsult.levelValues.${value}`)}
              </Label>
            ) : (
              '-'
            ),
        },
        {
          field: 'consultContent',
          headerName: t('business.customerConsult.consultContent'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'createdAt',
          headerName: t('business.customerConsult.createdAt'),
          flex: 1,
          minWidth: 150,
          renderCell: ({ value }) => {
            if (!value) return '-';
            try {
              return new Date(value).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });
            } catch {
              return value;
            }
          },
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 100,
          sortable: false,
          renderCell: ({ row }) => (
            <Button
              variant="text"
              size="small"
              onClick={() => setSelectedCustomer(row as CustomerConsultRecord)}
            >
              {t('business.customerConsult.followUp')}
            </Button>
          ),
        },
      ]),
    [t]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('business.customerConsult.title')}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <CustomerConsultSearch />
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setAddOpen(true)}
        >
          {t('business.customerConsult.addCustomer')}
        </Button>
      </Box>

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

      <AddCustomerDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => mutate()}
      />

      <FollowUpDrawer
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSuccess={() => mutate()}
      />
    </DashboardContent>
  );
}
