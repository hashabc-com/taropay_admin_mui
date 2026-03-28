import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

export function MerchantBindSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <TextField
        size="small"
        placeholder={t('business.merchantBind.businessUserName')}
        value={values.userName}
        onChange={(e) => setField('userName', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 200 }}
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
          startIcon={<Iconify icon="solar:restart-bold" />}
          onClick={handleReset}
        >
          {t('common.reset')}
        </Button>
      )}
    </Box>
  );
}
