import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useListSearch } from 'src/hooks/use-list-search';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { FIELD_KEYS } from './hooks';

// ----------------------------------------------------------------------

export function RiskControlSearch() {
  const { t } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <TextField
        size="small"
        placeholder={t('logs.riskControl.ruleName')}
        value={values.ruleName}
        onChange={(e) => setField('ruleName', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 200 }}
      />

      <FormControl size="small" sx={{ width: 160 }}>
        <InputLabel shrink>{t('logs.riskControl.businessType')}</InputLabel>
        <Select
          displayEmpty
          label={t('logs.riskControl.businessType')}
          notched
          value={values.businessType}
          onChange={(e) => setField('businessType', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            const labels: Record<string, string> = {
              PAY_PAYIN: t('logs.riskControl.payin'),
              PAY_PAYOUT: t('logs.riskControl.payout'),
            };
            return labels[sel] || sel;
          }}
        >
          <MenuItem value="PAY_PAYIN">{t('logs.riskControl.payin')}</MenuItem>
          <MenuItem value="PAY_PAYOUT">{t('logs.riskControl.payout')}</MenuItem>
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
