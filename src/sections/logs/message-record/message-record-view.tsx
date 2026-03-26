import { useSearchParams } from 'react-router';
import { useMemo, useState, useCallback } from 'react';

import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { DataGrid, type GridPaginationModel } from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { useLanguage } from 'src/context/language-provider';

import { dataGridSx, processColumns } from 'src/components/data-grid';

import { type MessageRecord } from './types';
import { useMessageRecordList } from './hooks';
import { AddMessageDialog } from './add-message-dialog';
import { MessageDetailDialog } from './message-detail-dialog';
import { MessageRecordSearch } from './message-record-search';

// ----------------------------------------------------------------------

const CONSUME_STATUS_COLOR: Record<number, 'error' | 'success' | 'warning' | 'default'> = {
  0: 'error',
  1: 'success',
  2: 'warning',
  3: 'default',
};

export function MessageRecordView() {
  const { records, totalRecord, isLoading, mutate, params } = useMessageRecordList();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // -- detail dialog --
  const [detailRecord, setDetailRecord] = useState<MessageRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((row: MessageRecord) => {
    setDetailRecord(row);
    setDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetailRecord(null), 300);
  }, []);

  // -- add dialog --
  const [addOpen, setAddOpen] = useState(false);

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

  // -- columns --
  const columns = useMemo(
    () =>
      processColumns<MessageRecord>([
        { field: 'id', headerName: 'ID', flex: 1 },
        {
          field: 'messageId',
          headerName: t('logs.messageRecord.messageId'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'messageType',
          headerName: t('logs.messageRecord.messageType'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'correlationId',
          headerName: t('logs.messageRecord.businessId'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'queueName',
          headerName: t('logs.messageRecord.queueName'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'exchangeName',
          headerName: t('logs.messageRecord.exchangeName'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'routingKey',
          headerName: t('logs.messageRecord.routingKey'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'consumerService',
          headerName: t('logs.messageRecord.consumerService'),
          flex: 1,
          tooltip: true,
        },
        {
          field: 'consumeStatus',
          headerName: t('logs.messageRecord.consumeStatus'),
          flex: 1,
          renderCell: ({ value }) => {
            if (value == null) return '-';
            const statusLabels: Record<number, string> = {
              0: t('logs.messageRecord.statusFailed'),
              1: t('logs.messageRecord.statusSuccess'),
              2: t('logs.messageRecord.statusRetrying'),
              3: t('logs.messageRecord.initStatus'),
            };
            return (
              <Chip
                label={statusLabels[value as number] ?? value}
                color={CONSUME_STATUS_COLOR[value as number] ?? 'default'}
                size="small"
                variant="outlined"
              />
            );
          },
        },
        {
          field: 'retryCount',
          headerName: t('logs.messageRecord.retryCount'),
          flex: 1,
          renderCell: ({ value }) => value ?? 0,
        },
        { field: 'consumeTime', headerName: t('logs.messageRecord.consumeTime'), flex: 1 },
        {
          field: 'actions',
          headerName: t('common.action'),
          flex: 1,
          minWidth: 100,
          sortable: false,
          filterable: false,
          renderCell: ({ row }) => (
            <Chip
              label={t('logs.messageRecord.viewDetail')}
              size="small"
              color="primary"
              variant="outlined"
              clickable
              onClick={() => handleViewDetail(row)}
            />
          ),
        },
      ]),
    [t, handleViewDetail]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('logs.messageRecord.title')}
      </Typography>

      <MessageRecordSearch onAdd={() => setAddOpen(true)} />

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

      <MessageDetailDialog open={detailOpen} onClose={handleCloseDetail} record={detailRecord} />

      <AddMessageDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={() => mutate()} />
    </DashboardContent>
  );
}
