import dayjs from 'dayjs';
import { useSearchParams } from 'react-router';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useProductDictList } from 'src/hooks/use-product-dict';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { DateTimeRangePicker } from 'src/components/date-time-range-picker';

import { PAYMENT_STATUS_MAP } from './hooks';

// ----------------------------------------------------------------------

export function PaymentListToolbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const productDict = useProductDictList('payoutChannel');

  const [fields, setFields] = useState({
    refNo: searchParams.get('refNo') || '',
    transId: searchParams.get('transId') || '',
    mobile: searchParams.get('mobile') || '',
    userName: searchParams.get('userName') || '',
    accountNumber: searchParams.get('accountNumber') || '',
    status: searchParams.get('status') || '',
    pickupCenter: searchParams.get('pickupCenter') || '',
    startTime: searchParams.get('startTime') || '',
    endTime: searchParams.get('endTime') || '',
  });

  // 当外部（如国家/商户切换）重置 URL 参数时，同步本地 fields
  useEffect(() => {
    setFields({
      refNo: searchParams.get('refNo') || '',
      transId: searchParams.get('transId') || '',
      mobile: searchParams.get('mobile') || '',
      userName: searchParams.get('userName') || '',
      accountNumber: searchParams.get('accountNumber') || '',
      status: searchParams.get('status') || '',
      pickupCenter: searchParams.get('pickupCenter') || '',
      startTime: searchParams.get('startTime') || '',
      endTime: searchParams.get('endTime') || '',
    });
  }, [searchParams]);

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
    setFields({
      refNo: '',
      transId: '',
      mobile: '',
      userName: '',
      accountNumber: '',
      status: '',
      pickupCenter: '',
      startTime: '',
      endTime: '',
    });
    const p = new URLSearchParams();
    p.set('pageNum', '1');
    p.set('pageSize', searchParams.get('pageSize') || '10');
    setSearchParams(p);
  }, [searchParams, setSearchParams]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <DateTimeRangePicker
        value={[
          fields.startTime ? dayjs(fields.startTime) : null,
          fields.endTime ? dayjs(fields.endTime) : null,
        ]}
        onChange={([start, end]) => {
          setField('startTime', start ? start.format('YYYY-MM-DD HH:mm:ss') : '');
          setField('endTime', end ? end.format('YYYY-MM-DD HH:mm:ss') : '');
        }}
        showTime
        size="small"
        startLabel={t('common.startTime')}
        endLabel={t('common.endTime')}
      />

      <TextField
        size="small"
        placeholder={t('orders.paymentOrders.merchantOrderNo')}
        value={fields.refNo}
        onChange={(e) => setField('refNo', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />
      <TextField
        size="small"
        placeholder={t('orders.paymentOrders.platformOrderNo')}
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
        placeholder={t('orders.paymentOrders.receivingAccount')}
        value={fields.accountNumber}
        onChange={(e) => setField('accountNumber', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 140 }}
      />

      <FormControl size="small" sx={{ width: 130 }}>
        <InputLabel shrink>{t('orders.paymentOrders.status')}</InputLabel>
        <Select
          displayEmpty
          label={t('orders.paymentOrders.status')}
          notched
          value={fields.status}
          onChange={(e) => setField('status', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return PAYMENT_STATUS_MAP[sel]?.label || sel;
          }}
        >
          {Object.entries(PAYMENT_STATUS_MAP).map(([key, { label }]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {/* Product select */}
      <FormControl size="small" sx={{ width: 130 }}>
        <InputLabel shrink>{t('common.product')}</InputLabel>
        <Select
          displayEmpty
          label={t('common.product')}
          notched
          value={fields.pickupCenter}
          onChange={(e) => setField('pickupCenter', e.target.value)}
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            }
            return selected;
          }}
        >
          {productDict.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
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
