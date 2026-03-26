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

export function MerchantRequestSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <TextField
        size="small"
        placeholder={t('logs.merchantRequest.transactionId')}
        value={values.transactionId}
        onChange={(e) => setField('transactionId', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 240 }}
      />

      <FormControl size="small" sx={{ width: 150 }}>
        <InputLabel shrink>{t('logs.merchantRequest.transactionType')}</InputLabel>
        <Select
          displayEmpty
          label={t('logs.merchantRequest.transactionType')}
          notched
          value={values.transactionType}
          onChange={(e) => setField('transactionType', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            const labels: Record<string, string> = {
              P: t('logs.merchantRequest.payment'),
              L: t('logs.merchantRequest.lending'),
            };
            return labels[sel] || sel;
          }}
        >
          <MenuItem value="P">{t('logs.merchantRequest.payment')}</MenuItem>
          <MenuItem value="L">{t('logs.merchantRequest.lending')}</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: 150 }}>
        <InputLabel shrink>{t('logs.merchantRequest.status')}</InputLabel>
        <Select
          displayEmpty
          label={t('logs.merchantRequest.status')}
          notched
          value={values.status}
          onChange={(e) => setField('status', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            const labels: Record<string, string> = {
              '0': t('logs.merchantRequest.statusSuccess'),
              '1': t('logs.merchantRequest.statusProcessing'),
              '2': t('logs.merchantRequest.statusFailed'),
            };
            return labels[sel] || sel;
          }}
        >
          <MenuItem value="0">{t('logs.merchantRequest.statusSuccess')}</MenuItem>
          <MenuItem value="1">{t('logs.merchantRequest.statusProcessing')}</MenuItem>
          <MenuItem value="2">{t('logs.merchantRequest.statusFailed')}</MenuItem>
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
    </Box>
  );
}
