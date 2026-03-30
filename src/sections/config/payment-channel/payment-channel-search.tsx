import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useCountries } from 'src/hooks/use-countries';
import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

type PaymentChannelSearchProps = {
  onAdd: () => void;
};

export function PaymentChannelSearch({ onAdd }: PaymentChannelSearchProps) {
  const { t } = useLanguage();
  const { countries } = useCountries();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <FormControl size="small" sx={{ width: 160 }}>
        <InputLabel shrink>{t('common.country')}</InputLabel>
        <Select
          displayEmpty
          label={t('common.country')}
          notched
          value={values.country}
          onChange={(e) => setField('country', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return t(`common.countrys.${sel}`) || sel;
          }}
        >
          {countries.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              {t(`common.countrys.${c.code}`) || c.code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder={t('config.paymentChannel.channelCode')}
        value={values.channelCode}
        onChange={(e) => setField('channelCode', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 180 }}
      />

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

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="contained"
        size="small"
        onClick={onAdd}
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {t('config.paymentChannel.addChannel')}
      </Button>
    </Box>
  );
}
