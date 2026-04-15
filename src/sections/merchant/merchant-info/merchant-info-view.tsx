import type { GridPaginationModel } from '@mui/x-data-grid';
import type { MerchantInfo } from 'src/api/merchant';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { updateCustomer } from 'src/api/merchant';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { dataGridSx, processColumns } from 'src/components/data-grid';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog';

import { useMerchantInfoList } from './hooks';
import { AddIpDialog } from './add-ip-dialog';
import { BindTgDialog } from './bind-tg-dialog';
import { UnbindKeyDialog } from './unbind-key-dialog';
import { RateConfigDialog } from './rate-config-dialog';
import { MerchantInfoSearch } from './merchant-info-search';
import { MerchantRowActions } from './merchant-row-actions';
import { EditMerchantDialog } from './edit-merchant-dialog';
import { ChangePasswordDialog } from './change-password-dialog';

// ----------------------------------------------------------------------

export function MerchantInfoView() {
  const { merchants, totalRecord, isLoading, mutate, params } = useMerchantInfoList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { dialog: googleAuthDialog, withGoogleAuth } = useGoogleAuthDialog();
  const { t } = useLanguage();
  const selectedCountry = useCountryStore((s) => s.selectedCountry);

  // -- dialog states --
  const [currentMerchant, setCurrentMerchant] = useState<MerchantInfo | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [unbindKeyDialogOpen, setUnbindKeyDialogOpen] = useState(false);
  const [addIpDialogOpen, setAddIpDialogOpen] = useState(false);
  const [bindTgDialogOpen, setBindTgDialogOpen] = useState(false);
  const [rateConfigDialogOpen, setRateConfigDialogOpen] = useState(false);

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

  // -- copy secret key --
  const handleCopySecretKey = useCallback(
    async (secretKey: string) => {
      try {
        await navigator.clipboard.writeText(secretKey);
        toast.success(t('merchant.info.secretKeyCopied'));
      } catch {
        toast.error(t('merchant.info.copyFailed'));
      }
    },
    [t]
  );

  // -- row action handlers --
  const handleEdit = useCallback((merchant: MerchantInfo) => {
    setCurrentMerchant(merchant);
    setEditDialogOpen(true);
  }, []);

  const handleChangePassword = useCallback((merchant: MerchantInfo) => {
    setCurrentMerchant(merchant);
    setPasswordDialogOpen(true);
  }, []);

  const handleToggleStatus = useCallback(
    (merchant: MerchantInfo) => {
      const newStatus = merchant.status === 0 ? 1 : 0;
      withGoogleAuth(async (gauthKey) => {
        const res = await updateCustomer({
          ...merchant,
          status: newStatus,
          gauthKey,
        });
        if (res.code == 200) {
          toast.success(t('common.statusUpdateSuccess'));
          mutate();
        } else {
          toast.error(res.message || t('common.statusUpdateFailed'));
        }
      });
    },
    [withGoogleAuth, mutate, t]
  );

  const handleUnbindKey = useCallback((merchant: MerchantInfo) => {
    setCurrentMerchant(merchant);
    setUnbindKeyDialogOpen(true);
  }, []);

  const handleBindIp = useCallback((merchant: MerchantInfo) => {
    setCurrentMerchant(merchant);
    setAddIpDialogOpen(true);
  }, []);

  const handleBindTgGroup = useCallback((merchant: MerchantInfo) => {
    setCurrentMerchant(merchant);
    setBindTgDialogOpen(true);
  }, []);

  const handleRateConfig = useCallback((merchant: MerchantInfo) => {
    setCurrentMerchant(merchant);
    setRateConfigDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    mutate();
  }, [mutate]);

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<MerchantInfo>([
        {
          field: 'account',
          headerName: t('merchant.info.account'),
          flex: 1,
          tooltip: true,
          minWidth: 120,
        },
        {
          field: 'companyName',
          headerName: t('merchant.info.merchantName'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'country',
          headerName: t('merchant.info.country'),
          flex: 1,
          renderCell: () => selectedCountry?.country || '-',
        },
        {
          field: 'appid',
          headerName: t('merchant.info.merchantId'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'secretKey',
          headerName: t('merchant.info.systemPublicKey'),
          flex: 2,
          minWidth: 300,
          sortable: false,
          renderCell: ({ row }) => (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%' }}>
              <Tooltip title={row.secretKey} placement="top">
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleCopySecretKey(row.secretKey)}
                >
                  {row.secretKey}
                </Typography>
              </Tooltip>
              <IconButton size="small" onClick={() => handleCopySecretKey(row.secretKey)}>
                <Iconify icon="solar:copy-bold" width={16} />
              </IconButton>
            </Stack>
          ),
        },
        {
          field: 'status',
          headerName: t('merchant.info.status'),
          flex: 1,
          minWidth: 80,
          renderCell: ({ value }) => {
            const isEnabled = value === 0;
            return (
              <Chip
                label={isEnabled ? t('merchant.info.enable') : t('merchant.info.disable')}
                color={isEnabled ? 'success' : 'error'}
                size="small"
                variant="filled"
              />
            );
          },
        },
        {
          field: 'createTime',
          headerName: t('merchant.info.createTime'),
          flex: 1,
          minWidth: 160,
          renderCell: ({ value }) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <MerchantRowActions
              row={row}
              onEdit={handleEdit}
              onChangePassword={handleChangePassword}
              onToggleStatus={handleToggleStatus}
              onUnbindKey={handleUnbindKey}
              onBindIp={handleBindIp}
              onBindTgGroup={handleBindTgGroup}
              onRateConfig={handleRateConfig}
            />
          ),
        },
      ]),
    [
      t,
      selectedCountry,
      handleCopySecretKey,
      handleEdit,
      handleChangePassword,
      handleToggleStatus,
      handleUnbindKey,
      handleBindIp,
      handleBindTgGroup,
      handleRateConfig,
    ]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">{t('merchant.info.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setAddDialogOpen(true)}
        >
          {t('merchant.info.addMerchant')}
        </Button>
      </Stack>

      <MerchantInfoSearch />

      <DataGrid
        rows={merchants}
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

      {/* Add Merchant Dialog */}
      <EditMerchantDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        merchant={null}
        isAdd
        onSuccess={handleSuccess}
      />

      {/* Edit Merchant Dialog */}
      <EditMerchantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        merchant={currentMerchant}
        isAdd={false}
        onSuccess={handleSuccess}
      />

      {/* Change Password */}
      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        merchant={currentMerchant}
        onSuccess={handleSuccess}
      />

      {/* Unbind Google Key */}
      <UnbindKeyDialog
        open={unbindKeyDialogOpen}
        onOpenChange={setUnbindKeyDialogOpen}
        merchant={currentMerchant}
        onSuccess={handleSuccess}
      />

      {/* Add IP */}
      <AddIpDialog
        open={addIpDialogOpen}
        onOpenChange={setAddIpDialogOpen}
        merchant={currentMerchant}
        onSuccess={handleSuccess}
      />

      {/* Bind TG Group */}
      <BindTgDialog
        open={bindTgDialogOpen}
        onOpenChange={setBindTgDialogOpen}
        merchant={currentMerchant}
        onSuccess={handleSuccess}
      />

      {/* Rate Config */}
      <RateConfigDialog
        open={rateConfigDialogOpen}
        onOpenChange={setRateConfigDialogOpen}
        merchant={currentMerchant}
        onSuccess={handleSuccess}
      />
    </DashboardContent>
  );
}
