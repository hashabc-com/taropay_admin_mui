import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { ORDER_STATUS_MAP } from './types';

// ----------------------------------------------------------------------

export function OrderListToolbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  // Local state mirrors URL params for controlled inputs
  const [fields, setFields] = useState({
    referenceno: searchParams.get('referenceno') || '',
    transId: searchParams.get('transId') || '',
    mobile: searchParams.get('mobile') || '',
    userName: searchParams.get('userName') || '',
    status: searchParams.get('status') || '',
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
  });

  const setField = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasFilters = Object.values(fields).some(Boolean);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    // Reset to page 1
    params.set('pageNum', '1');

    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  }, [fields, searchParams, setSearchParams]);

  const handleReset = useCallback(() => {
    setFields({
      referenceno: '',
      transId: '',
      mobile: '',
      userName: '',
      status: '',
      startTime: '',
      endTime: '',
    });
    const params = new URLSearchParams();
    params.set('pageNum', '1');
    params.set('pageSize', searchParams.get('pageSize') || '10');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
        {/* Date range */}
        <DateTimePicker
          label={t('common.startTime')}
          value={fields.startTime ? dayjs(fields.startTime) : null}
          onChange={(val: Dayjs | null) =>
            setField('startTime', val ? val.format('YYYY-MM-DD HH:mm:ss') : '')
          }
          slotProps={{
            textField: { size: 'small', sx: { width: 235 } },
          }}
          format="YYYY-MM-DD HH:mm:ss"
        />
        <DateTimePicker
          label={t('common.endTime')}
          value={fields.endTime ? dayjs(fields.endTime) : null}
          onChange={(val: Dayjs | null) =>
            setField('endTime', val ? val.format('YYYY-MM-DD HH:mm:ss') : '')
          }
          slotProps={{
            textField: { size: 'small', sx: { width: 235 } },
          }}
          format="YYYY-MM-DD HH:mm:ss"
        />

        {/* Search inputs */}
        <TextField
          size="small"
          placeholder={t('orders.receiveOrders.merchantOrderNo')}
          value={fields.referenceno}
          onChange={(e) => setField('referenceno', e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 160 }}
        />
        <TextField
          size="small"
          placeholder={t('orders.receiveOrders.platformOrderNo')}
          value={fields.transId}
          onChange={(e) => setField('transId', e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 160 }}
        />
        <TextField
          size="small"
          placeholder={t('orders.receiveOrders.mobile')}
          value={fields.mobile}
          onChange={(e) => setField('mobile', e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 140 }}
        />
        <TextField
          size="small"
          placeholder={t('signIn.username')}
          value={fields.userName}
          onChange={(e) => setField('userName', e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ width: 130 }}
        />

        {/* Status select */}
        <FormControl size="small" sx={{ width: 130 }}>
          <InputLabel shrink>{t('orders.receiveOrders.status')}</InputLabel>
          <Select
            displayEmpty
            label={t('orders.receiveOrders.status')}
            notched
            value={fields.status}
            onChange={(e) => setField('status', e.target.value)}
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
              }
              return ORDER_STATUS_MAP[selected]?.label || selected;
            }}
          >
            {Object.entries(ORDER_STATUS_MAP).map(([key, { label }]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Buttons */}
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
