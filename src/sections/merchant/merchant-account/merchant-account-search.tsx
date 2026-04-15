import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { FIELD_KEYS, STATUS_MAP } from './hooks';

// ----------------------------------------------------------------------

export function MerchantAccountSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset } = useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <TextField
        size="small"
        label={t('merchantAccount.account')}
        value={values.account}
        onChange={(e) => setField('account', e.target.value)}
        sx={{ width: 200 }}
      />
      <TextField
        select
        size="small"
        label={t('merchantAccount.status')}
        value={values.status}
        onChange={(e) => setField('status', e.target.value)}
        sx={{ width: 150 }}
      >
        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
          <MenuItem key={key} value={key}>
            {label}
          </MenuItem>
        ))}
      </TextField>

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
