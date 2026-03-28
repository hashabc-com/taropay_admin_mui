import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

export function CustomerConsultSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <>
      <TextField
        size="small"
        placeholder={t('business.customerConsult.contactPerson')}
        value={values.contactPerson}
        onChange={(e) => setField('contactPerson', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />

      <TextField
        size="small"
        placeholder={t('business.customerConsult.phone')}
        value={values.phone}
        onChange={(e) => setField('phone', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
      />

      <TextField
        size="small"
        placeholder={t('business.customerConsult.email')}
        value={values.email}
        onChange={(e) => setField('email', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 180 }}
      />

      <TextField
        size="small"
        placeholder={t('business.customerConsult.company')}
        value={values.company}
        onChange={(e) => setField('company', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 160 }}
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
    </>
  );
}
