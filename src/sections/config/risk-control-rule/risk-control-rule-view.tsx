import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { deleteRuleConfig } from 'src/api/config';
import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';
import { useGoogleAuthDialog } from 'src/components/google-auth-dialog/use-google-auth-dialog';

import { useRuleConfigList } from './hooks';
import { RuleEditDialog } from './rule-edit-dialog';
import { RiskControlRuleSearch } from './risk-control-rule-search';
import { SCENE_CODE_MAP, type RuleConfig, ACTION_CODE_MAP } from './types';

// ----------------------------------------------------------------------

export function RiskControlRuleView() {
  const { records, totalRecord, isLoading, mutate, params } = useRuleConfigList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const { dialog: gauthDialog, withGoogleAuth } = useGoogleAuthDialog();

  // -- dialog state --
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const [currentRule, setCurrentRule] = useState<RuleConfig | null>(null);

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
    setCurrentRule(null);
    setIsAdd(true);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((row: RuleConfig) => {
    setCurrentRule(row);
    setIsAdd(false);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    (row: RuleConfig) => {
      withGoogleAuth(async (gauthKey) => {
        const res = await deleteRuleConfig({ id: row.id, gauthKey });
        if (res.code == 200) {
          toast.success(t('common.deleteSuccess'));
          mutate();
        }
      });
    },
    [withGoogleAuth, t, mutate]
  );

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<RuleConfig>([
        {
          field: 'id',
          headerName: 'ID',
          width: 70,
        },
        {
          field: 'ruleName',
          headerName: t('config.riskControlRule.ruleName'),
          flex: 1,
          minWidth: 120,
          tooltip: true,
        },
        {
          field: 'ruleDesc',
          headerName: t('config.riskControlRule.ruleDescription'),
          flex: 1,
          minWidth: 150,
          tooltip: true,
        },
        {
          field: 'sceneCode',
          headerName: t('config.riskControlRule.ruleScene'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const label = SCENE_CODE_MAP[value]?.[lang] || value;
            return <Chip label={label} variant="outlined" size="small" />;
          },
        },
        {
          field: 'conditionExpr',
          headerName: t('config.riskControlRule.conditionExpression'),
          flex: 1.5,
          minWidth: 180,
          tooltip: true,
        },
        {
          field: 'actionCode',
          headerName: t('config.riskControlRule.actionCode'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const label = ACTION_CODE_MAP[value]?.[lang] || value;
            return <Chip label={label} size="small" />;
          },
        },
        {
          field: 'priority',
          headerName: t('config.riskControlRule.priority'),
          width: 80,
        },
        {
          field: 'status',
          headerName: t('common.status'),
          width: 80,
          renderCell: ({ value }) => (
            <Chip
              label={value === 1 ? t('common.enabled') : t('common.disabled')}
              color={value === 1 ? 'success' : 'error'}
              size="small"
            />
          ),
        },
        {
          field: 'createTime',
          headerName: t('common.createTime'),
          flex: 1,
          minWidth: 150,
        },
        {
          field: 'actions',
          headerName: t('common.action'),
          width: 70,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <RiskControlRuleRowActions row={row} onEdit={handleEdit} onDelete={handleDelete} />
          ),
        },
      ]),
    [t, lang, handleEdit, handleDelete]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('config.riskControlRule.title')}
      </Typography>

      <RiskControlRuleSearch onAdd={handleAdd} />

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

      <RuleEditDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        rule={currentRule}
        isAdd={isAdd}
        onSuccess={() => mutate()}
      />

      {gauthDialog}
    </DashboardContent>
  );
}

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
// -- inline row actions (lightweight) --
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

function RiskControlRuleRowActions({
  row,
  onEdit,
  onDelete,
}: {
  row: RuleConfig;
  onEdit: (row: RuleConfig) => void;
  onDelete: (row: RuleConfig) => void;
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
          <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            onDelete(row);
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>
    </>
  );
}
