import useSWR from 'swr';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { useCountries } from 'src/hooks/use-countries';

import { getMerchantList } from 'src/api/common';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { type Merchant, useMerchantStore } from 'src/stores/merchant-store';

import { CurrencySelector } from './currency-selector';
import { compactSelectSx, selectorGroupSx } from './styles';

// ----------------------------------------------------------------------

export function CountryMerchantSelector() {
  const { t } = useLanguage();
  const { selectedCountry, setSelectedCountry, setRates } = useCountryStore();
  const { selectedMerchant, setSelectedMerchant } = useMerchantStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch countries via shared hook
  const { countries } = useCountries();

  // Fetch merchants via SWR
  const { data: merchantsData } = useSWR(
    selectedCountry?.code ? ['merchants', selectedCountry.code] : null,
    () => getMerchantList(),
    { revalidateOnFocus: false }
  );

  const merchants = useMemo<Merchant[]>(
    () => (merchantsData?.result || []) as Merchant[],
    [merchantsData]
  );

  // ---------- handlers ----------
  const handleCountryChange = useCallback(
    async (countryId: string) => {
      const country = countries.find((c) => String(c.id) === countryId);
      if (!country) return;

      // 先同步更新 Zustand + URL，UI 立即响应
      setSelectedCountry(country);
      setSelectedMerchant(null);

      const params = new URLSearchParams();
      params.set('pageNum', '1');
      params.set('pageSize', searchParams.get('pageSize') || '10');
      setSearchParams(params);

      // 异步拉取汇率（不影响 SWR key）
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${country.currency}`);
        const data = await response.json();
        if (data.result === 'success' && data.rates) {
          setRates(data.rates);
        }
      } catch {
        toast.error(t('common.fetchRateFailed'));
      }
    },
    [countries, setRates, setSelectedCountry, setSelectedMerchant, searchParams, setSearchParams, t]
  );

  // Auto-select first country
  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      handleCountryChange(String(countries[0].id));
    }
  }, [countries, handleCountryChange, selectedCountry]);

  const handleMerchantChange = useCallback(
    (value: Merchant | null) => {
      setSelectedMerchant(value);

      // 切换/清空商户时清空 URL 筛选参数，避免残留筛选条件
      if (Array.from(searchParams.keys()).length > 0) {
        setSearchParams(new URLSearchParams());
      }
    },
    [setSelectedMerchant, searchParams, setSearchParams]
  );

  // ---------- render ----------
  return (
    <Box sx={selectorGroupSx}>
      {/* Country */}
      <Select
        size="small"
        value={selectedCountry ? String(selectedCountry.id) : ''}
        onChange={(e) => handleCountryChange(e.target.value)}
        MenuProps={{ disableAutoFocus: true }}
        sx={{ ...compactSelectSx, minWidth: 90 }}
      >
        {/*
         * 当 countries 还未加载完但 selectedCountry 已从 persist 恢复时，
         * 注入一个隐藏占位 MenuItem，避免 MUI Select out-of-range 警告。
         */}
        {selectedCountry && !countries.some((c) => String(c.id) === String(selectedCountry.id)) && (
          <MenuItem
            key={selectedCountry.id}
            value={String(selectedCountry.id)}
            sx={{ display: 'none' }}
          >
            {t(`common.countrys.${selectedCountry.code}`, selectedCountry.country)}
          </MenuItem>
        )}
        {countries.map((c) => (
          <MenuItem key={c.id} value={String(c.id)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                component="img"
                src={`/assets/images/flag/${c.code}.svg`}
                alt={c.code}
                sx={{ width: 18, height: 18 }}
                onError={(e: any) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {t(`common.countrys.${c.code}`, c.country)}
            </Box>
          </MenuItem>
        ))}
      </Select>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ my: 0.75, display: { xs: 'none', sm: 'flex' } }}
      />

      {/* Currency — hidden on mobile to save header space */}
      <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <CurrencySelector />
      </Box>

      <Divider
        orientation="vertical"
        flexItem
        sx={{ my: 0.75, display: { xs: 'none', md: 'flex' } }}
      />

      {/* Merchant */}
      <Autocomplete
        size="small"
        disabled={!selectedCountry}
        options={merchants}
        value={selectedMerchant}
        onChange={(_, value) => handleMerchantChange(value)}
        getOptionLabel={(option) => option.companyName || ''}
        isOptionEqualToValue={(option, value) => String(option.appid) === String(value.appid)}
        filterOptions={(options, { inputValue }) => {
          const keyword = inputValue.trim().toLowerCase();
          if (!keyword) return options;
          return options.filter(
            (o) =>
              o.companyName?.toLowerCase().includes(keyword) ||
              String(o.appid).toLowerCase().includes(keyword)
          );
        }}
        noOptionsText={t('common.noData', '暂无数据')}
        sx={{
          minWidth: 160,
          maxWidth: 220,
          display: { xs: 'none', md: 'flex' },
          '& .MuiOutlinedInput-root': {
            py: '0 !important',
            pl: '8px !important',
          },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '& .MuiAutocomplete-input': {
            typography: 'body2',
            fontWeight: 400,
            py: '6px !important',
          },
        }}
        renderInput={(params) => (
          <TextField {...params} placeholder={selectedMerchant ? '' : t('common.allMerchants')} />
        )}
      />
    </Box>
  );
}
