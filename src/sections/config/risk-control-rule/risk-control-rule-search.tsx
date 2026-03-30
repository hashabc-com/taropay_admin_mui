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
import { SCENE_CODE_MAP } from './types';

// ----------------------------------------------------------------------

type Props = {
  onAdd: () => void;
};

export function RiskControlRuleSearch({ onAdd }: Props) {
  const { t, lang } = useLanguage();
  const { values, setField, hasFilters, handleSearch, handleReset, handleKeyDown } =
    useListSearch(FIELD_KEYS);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <TextField
        size="small"
        placeholder={t('config.riskControlRule.ruleName')}
        value={values.ruleName}
        onChange={(e) => setField('ruleName', e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: 180 }}
      />

      <FormControl size="small" sx={{ width: 160 }}>
        <InputLabel shrink>{t('config.riskControlRule.ruleScene')}</InputLabel>
        <Select
          displayEmpty
          label={t('config.riskControlRule.ruleScene')}
          notched
          value={values.sceneCode}
          onChange={(e) => setField('sceneCode', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return SCENE_CODE_MAP[sel]?.[lang] || sel;
          }}
        >
          {Object.entries(SCENE_CODE_MAP).map(([code, labels]) => (
            <MenuItem key={code} value={code}>
              {labels[lang] || code}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ width: 120 }}>
        <InputLabel shrink>{t('common.status')}</InputLabel>
        <Select
          displayEmpty
          label={t('common.status')}
          notched
          value={values.status}
          onChange={(e) => setField('status', e.target.value)}
          renderValue={(sel) => {
            if (!sel) return <span style={{ color: '#aaa' }}>{t('common.pleaseSelect')}</span>;
            return sel === '1' ? t('common.enabled') : t('common.disabled');
          }}
        >
          <MenuItem value="1">{t('common.enabled')}</MenuItem>
          <MenuItem value="0">{t('common.disabled')}</MenuItem>
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

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="contained"
        size="small"
        color="primary"
        onClick={onAdd}
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {t('config.riskControlRule.addRule')}
      </Button>
    </Box>
  );
}
