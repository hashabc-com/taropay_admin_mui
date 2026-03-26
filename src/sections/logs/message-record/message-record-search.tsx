import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

interface MessageRecordSearchProps {
  onAdd?: () => void;
}

export function MessageRecordSearch({ onAdd }: MessageRecordSearchProps) {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <TextField
        size="small"
        placeholder={t('logs.messageRecord.messageId')}
        value={values.messageId}
        onChange={(e) => setField('messageId', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 170 }}
      />
      <TextField
        size="small"
        placeholder={t('logs.messageRecord.businessId')}
        value={values.correlationId}
        onChange={(e) => setField('correlationId', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 170 }}
      />
      <TextField
        size="small"
        placeholder={t('logs.messageRecord.queueName')}
        value={values.queueName}
        onChange={(e) => setField('queueName', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 170 }}
      />
      <TextField
        size="small"
        placeholder={t('logs.messageRecord.consumerService')}
        value={values.consumerService}
        onChange={(e) => setField('consumerService', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />

      <FormControl size="small" sx={{ width: 130 }}>
        <InputLabel shrink>{t('logs.messageRecord.consumeStatus')}</InputLabel>
        <Select
          displayEmpty
          label={t('logs.messageRecord.consumeStatus')}
          notched
          value={values.consumeStatus}
          onChange={(e) => setField('consumeStatus', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            const labels: Record<string, string> = {
              '0': t('logs.messageRecord.statusFailed'),
              '1': t('logs.messageRecord.statusSuccess'),
              '2': t('logs.messageRecord.statusRetrying'),
            };
            return labels[sel] || sel;
          }}
        >
          <MenuItem value="0">{t('logs.messageRecord.statusFailed')}</MenuItem>
          <MenuItem value="1">{t('logs.messageRecord.statusSuccess')}</MenuItem>
          <MenuItem value="2">{t('logs.messageRecord.statusRetrying')}</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        size="small"
        onClick={handleSearch}
        startIcon={<Iconify icon="eva:search-fill" />}
      >
        {t('common.search')}
      </Button>

      {hasFilters && (
        <Button
          variant="outlined"
          size="small"
          onClick={handleReset}
          startIcon={<Iconify icon="solar:close-circle-bold" />}
        >
          {t('common.reset')}
        </Button>
      )}

      {onAdd && (
        <Button
          variant="contained"
          size="small"
          onClick={onAdd}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          {t('logs.messageRecord.addMessage')}
        </Button>
      )}
    </Box>
  );
}
