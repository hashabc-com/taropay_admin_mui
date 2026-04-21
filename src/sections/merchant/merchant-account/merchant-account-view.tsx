import type { GridPaginationModel } from '@mui/x-data-grid';
import type { MerchantUser } from 'src/api/merchant-user';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { autoLoginMerchantUser, updateMerchantUserStatus } from 'src/api/merchant-user';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

import { STATUS_MAP, useMerchantUserList } from './hooks';
import { UnbindGoogleDialog } from './unbind-google-dialog';
import { MerchantAccountSearch } from './merchant-account-search';
import { MerchantAccountRowActions } from './merchant-account-row-actions';
import { EditMerchantAccountDialog } from './edit-merchant-account-dialog';

// ----------------------------------------------------------------------

export function MerchantAccountView() {
  const { list, totalRecord, isLoading, mutate, params } = useMerchantUserList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();
  const { t } = useLanguage();

  // -- dialog states --
  const [currentUser, setCurrentUser] = useState<MerchantUser | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [unbindGoogleDialogOpen, setUnbindGoogleDialogOpen] = useState(false);

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

  // -- row action handlers --
  const handleEdit = useCallback((user: MerchantUser) => {
    setCurrentUser(user);
    setEditDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (user: MerchantUser) => {
      const newStatus = user.status === 0 ? 1 : 0;
      withGoogleAuth(async () => {
        const res = await updateMerchantUserStatus({ id: user.id, status: newStatus });
        if (res.code == 200) {
          toast.success(t('common.operationSuccess'));
          mutate();
        } else {
          toast.error(res.message || t('common.operationFailed'));
        }
      });
    },
    [withGoogleAuth, mutate, t]
  );

  const handleUnbindGoogle = useCallback((user: MerchantUser) => {
    setCurrentUser(user);
    setUnbindGoogleDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  const isProduction = import.meta.env.MODE === 'production';

  const handleAutoLogin = useCallback(
    (user: MerchantUser) => {
      withGoogleAuth(async (gauthKey) => {
        const res = await autoLoginMerchantUser(user.account, gauthKey);
        if (res.code == 200) {
          const baseUrl = isProduction
            ? 'https://merchant.taropay.com'
            : 'https://merchant-test.taropay.com';
          window.open(`${baseUrl}?token=${res.result}`, '_blank');
        } else {
          toast.error(res.result || t('merchantAccount.autoLoginFailed'));
        }
      });
    },
    [withGoogleAuth, isProduction, t]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<MerchantUser>([
        {
          field: 'account',
          headerName: t('merchantAccount.account'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'accountName',
          headerName: t('merchantAccount.accountName'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'email',
          headerName: t('merchantAccount.email'),
          flex: 1,
          minWidth: 180,
          tooltip: true,
        },
        {
          field: 'customerNames',
          headerName: t('merchantAccount.bindMerchants'),
          flex: 2,
          minWidth: 200,
          tooltip: true,
        },
        {
          field: 'status',
          headerName: t('merchantAccount.status'),
          flex: 1,
          minWidth: 80,
          renderCell: ({ value }) => {
            const info = STATUS_MAP[value as string];
            return info ? (
              <Chip label={info.label} color={info.color} size="small" variant="filled" />
            ) : (
              '-'
            );
          },
        },
        {
          field: 'remark',
          headerName: t('merchantAccount.remark'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'createTime',
          headerName: t('merchantAccount.createTime'),
          flex: 1,
          minWidth: 160,
          renderCell: ({ value }) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 80,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <MerchantAccountRowActions
              row={row}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onAutoLogin={handleAutoLogin}
              onUnbindGoogle={handleUnbindGoogle}
            />
          ),
        },
      ]),
    [t, handleEdit, handleToggleStatus, handleAutoLogin, handleUnbindGoogle]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">{t('merchantAccount.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setAddDialogOpen(true)}
        >
          {t('merchantAccount.addAccount')}
        </Button>
      </Stack>

      <MerchantAccountSearch />

      <DataGrid
        rows={list}
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

      {googleAuthDialog}

      {/* Add dialog */}
      <EditMerchantAccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        merchantUser={null}
        isAdd
        onSuccess={handleSuccess}
      />

      {/* Edit dialog */}
      <EditMerchantAccountDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        merchantUser={currentUser}
        isAdd={false}
        onSuccess={handleSuccess}
      />

      {/* Unbind Google */}
      <UnbindGoogleDialog
        open={unbindGoogleDialogOpen}
        onOpenChange={setUnbindGoogleDialogOpen}
        user={currentUser}
        onSuccess={handleSuccess}
      />
    </DashboardContent>
  );
}
