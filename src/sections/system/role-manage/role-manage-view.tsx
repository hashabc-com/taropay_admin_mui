import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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

import { deleteRole } from 'src/api/system';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';

import { type Role } from './types';
import { useRoleList } from './hooks';
import { RoleEditDrawer } from './role-edit-drawer';
import { RoleManageSearch } from './role-manage-search';

// ----------------------------------------------------------------------

export function RoleManageView() {
  const { records, totalRecord, isLoading, mutate, params } = useRoleList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- drawer state --
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);

  // -- delete dialog state --
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

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
    setCurrentRole(null);
    setIsAdd(true);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((row: Role) => {
    setCurrentRole(row);
    setIsAdd(false);
    setDrawerOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', deleteTarget.id.toString());
      const res = await deleteRole(formData);
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

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<Role>([
        {
          field: 'role',
          headerName: t('system.roleManage.roleName'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'createTime',
          headerName: t('common.createTime'),
          flex: 1,
          minWidth: 160,
        },
        {
          field: 'description',
          headerName: t('common.description'),
          flex: 2,
          minWidth: 200,
          tooltip: true,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          width: 70,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <RoleRowActions
              row={row}
              onEdit={handleEdit}
              onDelete={(r) => {
                setDeleteTarget(r);
                setDeleteOpen(true);
              }}
            />
          ),
        },
      ]),
    [t, handleEdit]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('system.roleManage.title')}
      </Typography>

      <RoleManageSearch onAdd={handleAdd} />

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

      <RoleEditDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        role={currentRole}
        isAdd={isAdd}
        onSuccess={() => mutate()}
      />

      {/* Delete confirmation dialog */}
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

// -- inline row actions --
function RoleRowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: Role;
  onEdit: (row: Role) => void;
  onDelete: (row: Role) => void;
}) {
  const { t } = useLanguage();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        disableAutoFocus
      >
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
