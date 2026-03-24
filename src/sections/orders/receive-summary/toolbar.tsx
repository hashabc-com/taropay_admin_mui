import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { DateTimeRangePicker } from 'src/components/date-time-range-picker';

import { usePaymentChannelDict } from './hooks';

// ----------------------------------------------------------------------

export function ReceiveSummaryToolbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const channels = usePaymentChannelDict('pay_channel');

  const [fields, setFields] = useState({
    channel: searchParams.get('channel') || '',
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
  });

  const setField = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasFilters = Object.values(fields).some(Boolean);

  const handleSearch = useCallback(() => {
    const p = new URLSearchParams(searchParams);
    p.set('pageNum', '1');
    Object.entries(fields).forEach(([key, value]) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });
    setSearchParams(p);
  }, [fields, searchParams, setSearchParams]);

  const handleReset = useCallback(() => {
    setFields({ channel: '', startTime: '', endTime: '' });
    const p = new URLSearchParams();
    p.set('pageNum', '1');
    p.set('pageSize', searchParams.get('pageSize') || '10');
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <DateTimeRangePicker
        value={[
          fields.startTime ? dayjs(fields.startTime) : null,
          fields.endTime ? dayjs(fields.endTime) : null,
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
        <InputLabel shrink>{t('orders.receiveSummary.paymentChannel')}</InputLabel>
        <Select
          displayEmpty
          label={t('orders.receiveSummary.paymentChannel')}
          notched
          value={fields.channel}
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
