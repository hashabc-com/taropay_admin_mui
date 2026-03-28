import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { useRiskControlList } from './hooks';
import { type RiskControlRecord } from './types';
import { RiskControlSearch } from './risk-control-search';
import { ParamsDetailDialog } from './params-detail-dialog';

// ----------------------------------------------------------------------

const BUSINESS_TYPE_COLOR: Record<string, 'primary' | 'secondary'> = {
  PAY_PAYIN: 'primary',
  PAY_PAYOUT: 'secondary',
};

const ACTION_CODE_COLOR: Record<string, 'error' | 'warning' | 'default'> = {
  REJECT: 'error',
  ALARM: 'warning',
  BLOCK: 'default',
};

const BUSINESS_TYPE_LABELS: Record<string, Record<string, string>> = {
  PAY_PAYIN: { zh: '代收', en: 'Collection' },
  PAY_PAYOUT: { zh: '代付', en: 'Payout' },
};

const ACTION_CODE_LABELS: Record<string, Record<string, string>> = {
  REJECT: { zh: '拒绝', en: 'Reject' },
  ALARM: { zh: '告警', en: 'Alarm' },
  BLOCK: { zh: '阻止', en: 'Block' },
};

export function RiskControlView() {
  const { records, totalRecord, isLoading, params } = useRiskControlList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useLanguage();

  // -- params detail dialog --
  const [paramsContent, setParamsContent] = useState('');
  const [paramsOpen, setParamsOpen] = useState(false);

  const handleViewParams = useCallback((text: string) => {
    setParamsContent(text);
    setParamsOpen(true);
  }, []);

  const handleCloseParams = useCallback(() => {
    setParamsOpen(false);
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

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.replace('T', ' ').substring(0, 19);
  };

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<RiskControlRecord>([
        { field: 'id', headerName: 'ID', width: 70 },
        {
          field: 'ruleName',
          headerName: t('logs.riskControl.ruleName'),
          flex: 1,
          minWidth: 80,
          tooltip: true,
        },
        {
          field: 'ruleId',
          headerName: t('logs.riskControl.ruleId'),
          flex: 1,
          minWidth: 80,
          tooltip: true,
        },
        {
          field: 'customerName',
          headerName: t('logs.riskControl.merchantName'),
          flex: 1,
          minWidth: 100,
          tooltip: true,
        },
        {
          field: 'businessType',
          headerName: t('logs.riskControl.businessType'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const label = BUSINESS_TYPE_LABELS[value as string]?.[lang] ?? (value as string);
            return (
              <Chip
                label={label}
                color={BUSINESS_TYPE_COLOR[value as string] ?? 'default'}
                size="small"
                variant="filled"
              />
            );
          },
        },
        {
          field: 'businessId',
          minWidth: 200,
          headerName: t('logs.riskControl.orderNo'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'actionCode',
          headerName: t('logs.riskControl.action'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            const label = ACTION_CODE_LABELS[value as string]?.[lang] ?? (value as string);
            return (
              <Chip
                label={label}
                color={ACTION_CODE_COLOR[value as string] ?? 'default'}
                size="small"
                variant="outlined"
              />
            );
          },
        },
        {
          field: 'reason',
          minWidth: 150,
          headerName: t('logs.riskControl.interceptReason'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'requestParams',
          headerName: t('logs.riskControl.requestParams'),
          flex: 1,
          minWidth: 100,
          renderCell: ({ value }) => {
            if (!value) return '-';
            return (
              <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={() => handleViewParams(value as string)}
              >
                {t('logs.messageRecord.viewDetail')}
              </Link>
            );
          },
        },
        {
          field: 'responseParams',
          minWidth: 100,
          headerName: t('logs.riskControl.responseParams'),
          flex: 1,
          renderCell: ({ value }) => {
            if (!value) return '-';
            return (
              <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={() => handleViewParams(value as string)}
              >
                {t('common.viewDetails')}
              </Link>
            );
          },
        },
        {
          field: 'createTime',
          minWidth: 150,
          headerName: t('logs.riskControl.createTime'),
          flex: 1,
          renderCell: ({ value }) => formatTime(value as string),
        },
        {
          field: 'localTime',
          minWidth: 150,
          headerName: t('logs.riskControl.triggerTime'),
          flex: 1,
          renderCell: ({ value }) => formatTime(value as string),
        },
      ]),
    [t, lang, handleViewParams]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('logs.riskControl.title')}
      </Typography>

      <RiskControlSearch />

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

      <ParamsDetailDialog open={paramsOpen} onClose={handleCloseParams} content={paramsContent} />
    </DashboardContent>
  );
}
