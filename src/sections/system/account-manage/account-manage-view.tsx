import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { deleteAccount, updateDisabledStatus } from 'src/api/system';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useAccountList } from './hooks';
import { type IAccountType } from './types';
import { PasswordDialog } from './password-dialog';
import { AccountRowActions } from './account-row-actions';
import { AccountManageSearch } from './account-manage-search';
import { AccountMutateDrawer } from './account-mutate-drawer';

// ----------------------------------------------------------------------

export function AccountManageView() {
  const { records, totalRecord, isLoading, mutate, params } = useAccountList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- drawer state --
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [currentRow, setCurrentRow] = useState<IAccountType | null>(null);

  // -- password dialog --
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdAccountId, setPwdAccountId] = useState<number | null>(null);

  // -- delete dialog --
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IAccountType | null>(null);

  // -- pagination --
  const paginationModel: GridPaginationModel = useMemo(
    () => ({ page: (Number(params.pageNum) || 1) - 1, pageSize: Number(params.pageSize) || 10 }),
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
    setCurrentRow(null);
    setIsAdd(true);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((row: IAccountType) => {
    setCurrentRow(row);
    setIsAdd(false);
    setDrawerOpen(true);
  }, []);

  const handlePasswordOpen = useCallback((row: IAccountType) => {
    setPwdAccountId(row.id);
    setPwdOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await deleteAccount({ id: deleteTarget.id });
      if (res.code == 200) {
        toast.success(t('common.deleteSuccess'));
        mutate();
      }
    } finally {
      setDeleteLoading(false);
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, t, mutate]);

  const handleStatusToggle = useCallback(
    async (row: IAccountType) => {
      const disableStatus = row.disabledStatus === 0 ? 1 : 0;
      const res = await updateDisabledStatus({ id: row.id, disableStatus });
      if (res.code == 200) {
        toast.success(t('common.updateSuccess'));
        mutate();
      }
    },
    [t, mutate]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<IAccountType>([
        {
          field: 'userName',
          headerName: t('system.accountManage.name'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'account',
          headerName: t('common.account'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'roleIds',
          headerName: t('common.role'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => value || '-',
        },
        {
          field: 'disabledStatus',
          headerName: t('common.status'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const enabled = value === 0;
            return (
              <Chip
                label={enabled ? t('common.enabled') : t('common.disabled')}
                color={enabled ? 'success' : 'default'}
                size="small"
              />
            );
          },
        },
        {
          field: 'createTime',
          headerName: t('common.createTime'),
          flex: 1,
          minWidth: 160,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          width: 70,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <AccountRowActions
              row={row}
              onEdit={handleEdit}
              onPassword={handlePasswordOpen}
              onStatusToggle={handleStatusToggle}
              onDelete={(r) => {
                setDeleteTarget(r);
                setDeleteOpen(true);
              }}
            />
          ),
        },
      ]),
    [t, handleEdit, handlePasswordOpen, handleStatusToggle]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('system.accountManage.title')}
      </Typography>

      <AccountManageSearch onAdd={handleAdd} />

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

      {/* Mutate Drawer (add / edit) */}
      <AccountMutateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={currentRow}
        isAdd={isAdd}
        onSuccess={() => mutate()}
      />

      {/* Password Dialog */}
      <PasswordDialog
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
        accountId={pwdAccountId}
        onSuccess={() => mutate()}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('common.deleteConfirmation')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('common.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
