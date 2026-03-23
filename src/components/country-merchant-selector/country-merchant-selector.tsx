import useSWR from 'swr';
import { toast } from 'sonner';
import { useMemo, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { getCountryList, getMerchantList } from 'src/api/common';
import { type Country, useCountryStore } from 'src/stores/country-store';
import { type Merchant, useMerchantStore } from 'src/stores/merchant-store';

import { Iconify } from 'src/components/iconify';

import { CurrencySelector } from './currency-selector';

// ----------------------------------------------------------------------

export function CountryMerchantSelector() {
  const { selectedCountry, setSelectedCountry, setRates } = useCountryStore();
  const { selectedMerchant, setSelectedMerchant } = useMerchantStore();

  // Fetch countries via SWR
  const { data: countriesData } = useSWR('countries', () => getCountryList(), {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000,
  });

  const countries = useMemo<Country[]>(
    () => (countriesData?.result || countriesData?.data || []) as Country[],
    [countriesData]
  );

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

      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${country.currency}`);
        const data = await response.json();
        if (data.result === 'success' && data.rates) {
          setRates(data.rates);
        }
      } catch {
        toast.error('获取汇率失败');
      }

      setSelectedCountry(country);
      setSelectedMerchant(null);
    },
    [countries, setRates, setSelectedCountry, setSelectedMerchant]
  );

  // Auto-select first country
  useEffect(() => {
    if (!selectedCountry && countries.length > 0) {
      handleCountryChange(String(countries[0].id));
    }
  }, [countries, handleCountryChange, selectedCountry]);

  const handleMerchantChange = (merchantId: string) => {
    const m = merchants.find((item) => String(item.appid) === merchantId) || null;
    setSelectedMerchant(m);
  };

  // ---------- render ----------
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Country */}
      <TextField
        select
        size="small"
        value={selectedCountry ? String(selectedCountry.id) : ''}
        onChange={(e) => handleCountryChange(e.target.value)}
        sx={{ minWidth: 130 }}
        slotProps={{ inputLabel: { shrink: true } }}
        label="国家"
      >
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
              {c.code}
            </Box>
          </MenuItem>
        ))}
      </TextField>

      {/* Currency */}
      <CurrencySelector />

      <Divider
        orientation="vertical"
        flexItem
        sx={{ mx: 0.5, display: { xs: 'none', md: 'flex' } }}
      />

      {/* Merchant */}
      <FormControl
        size="small"
        disabled={!selectedCountry}
        sx={{ minWidth: 150, display: { xs: 'none', md: 'flex' } }}
      >
        <InputLabel shrink>商户</InputLabel>
        <Select
          displayEmpty
          notched
          label="商户"
          value={selectedMerchant?.appid ? String(selectedMerchant.appid) : ''}
          onChange={(e) => handleMerchantChange(e.target.value)}
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: '#aaa' }}>请选择商户</span>;
            }
            const m = merchants.find((item) => String(item.appid) === selected);
            return m?.companyName || selected;
          }}
          endAdornment={
            selectedMerchant ? (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMerchant(null);
                }}
                sx={{ mr: 1.5 }}
              >
                <Iconify
                  icon="solar:close-circle-bold"
                  width={18}
                  sx={{ color: 'text.disabled' }}
                />
              </IconButton>
            ) : null
          }
        >
          {merchants.map((m) => (
            <MenuItem key={m.appid} value={String(m.appid)}>
              {m.companyName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
