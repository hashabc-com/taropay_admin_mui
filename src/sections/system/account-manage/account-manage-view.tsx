import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';
import { deleteAccount, updateDisabledStatus } from 'src/api/system';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useAccountList } from './hooks';
import { type IAccountType } from './types';
import { PasswordDialog } from './password-dialog';
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
    async (row: IAccountType, checked: boolean) => {
      const disableStatus = checked ? 0 : 1;
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

// -- Row Actions Menu --
function AccountRowActions({
  row,
  onEdit,
  onPassword,
  onStatusToggle,
  onDelete,
}: {
  row: IAccountType;
  onEdit: (row: IAccountType) => void;
  onPassword: (row: IAccountType) => void;
  onStatusToggle: (row: IAccountType, checked: boolean) => void;
  onDelete: (row: IAccountType) => void;
}) {
  const { t } = useLanguage();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onEdit(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:pen-bold" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onPassword(row);
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:lock-password-bold" />
          </ListItemIcon>
          <ListItemText>{t('system.accountManage.changePassword')}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ListItemIcon>
            <Iconify icon="solar:toggle-on-bold" />
          </ListItemIcon>
          <ListItemText>{t('common.status')}</ListItemText>
          <Switch
            size="small"
            checked={row.disabledStatus === 0}
            onChange={(e) => {
              setAnchor(null);
              onStatusToggle(row, e.target.checked);
            }}
          />
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onDelete(row);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Iconify icon="solar:trash-bin-trash-bold" color="inherit" />
          </ListItemIcon>
          <ListItemText>{t('common.delete')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
