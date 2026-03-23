import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { useWithdrawChannelDict } from './hooks';

// ----------------------------------------------------------------------

export function PaymentSummaryToolbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const channels = useWithdrawChannelDict();

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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <DatePicker
          label={t('common.startTime')}
          value={fields.startTime ? dayjs(fields.startTime) : null}
          onChange={(val: Dayjs | null) =>
            setField('startTime', val ? val.format('YYYY-MM-DD') : '')
          }
          slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
          format="YYYY-MM-DD"
        />
        <DatePicker
          label={t('common.endTime')}
          value={fields.endTime ? dayjs(fields.endTime) : null}
          onChange={(val: Dayjs | null) => setField('endTime', val ? val.format('YYYY-MM-DD') : '')}
          slotProps={{ textField: { size: 'small', sx: { width: 170 } } }}
          format="YYYY-MM-DD"
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel shrink>{t('orders.paymentSummary.paymentChannel')}</InputLabel>
          <Select
            displayEmpty
            label={t('orders.paymentSummary.paymentChannel')}
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
    </LocalizationProvider>
  );
}
