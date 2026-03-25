import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useListSearch } from 'src/hooks/use-list-search';
import { useProductDictList } from 'src/hooks/use-product-dict';
import { usePaymentChannel } from 'src/hooks/use-payment-channel';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { DateTimeRangePicker } from 'src/components/date-time-range-picker';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

export function CollectionRateSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset } = useListSearch(FIELD_KEYS);
  const channels = usePaymentChannel();
  const products = useProductDictList('payinChannel');

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <DateTimeRangePicker
        value={[
          values.startTime ? dayjs(values.startTime) : null,
          values.endTime ? dayjs(values.endTime) : null,
        ]}
        onChange={([start, end]) => {
          setField('startTime', start ? start.format('YYYY-MM-DD') : '');
          setField('endTime', end ? end.format('YYYY-MM-DD') : '');
        }}
        size="small"
        startLabel={t('common.startTime')}
        endLabel={t('common.endTime')}
      />

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel shrink>{t('orders.collectionRate.paymentType')}</InputLabel>
        <Select
          displayEmpty
          label={t('orders.collectionRate.paymentType')}
          notched
          value={values.pickupCenter}
          onChange={(e) => setField('pickupCenter', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return sel;
          }}
        >
          {products.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel shrink>{t('orders.collectionRate.paymentChannel')}</InputLabel>
        <Select
          displayEmpty
          label={t('orders.collectionRate.paymentChannel')}
          notched
          value={values.channel}
          onChange={(e) => setField('channel', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return sel;
          }}
        >
          {channels.map((ch) => (
            <MenuItem key={ch} value={ch}>
              {ch}
            </MenuItem>
          ))}
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
